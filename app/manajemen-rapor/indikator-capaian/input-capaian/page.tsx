'use client';

import { useState, useEffect } from 'react';
import { Save, Search, AlertCircle } from 'lucide-react';

interface Siswa {
  id: string;
  nama_siswa: string;
  nis: string;
  kelas: string;
  asrama: string;
}

interface Kategori {
  id: string;
  nama_kategori: string;
  urutan: number;
}

interface Indikator {
  id: string;
  kategori_id: string;
  nama_indikator: string;
  deskripsi: string | null;
  urutan: number;
}

interface CapaianData {
  indikator_id: string;
  nilai: string;
  deskripsi: string;
}

export default function InputCapaianPage() {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [indikatorList, setIndikatorList] = useState<Indikator[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [selectedSiswa, setSelectedSiswa] = useState<string>('');
  const [tahunAjaran, setTahunAjaran] = useState('');
  const [semester, setSemester] = useState('');
  const [searchSiswa, setSearchSiswa] = useState('');
  const [capaianData, setCapaianData] = useState<Record<string, CapaianData>>({});
  
  // Load existing capaian
  const [existingCapaian, setExistingCapaian] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchSiswa();
    fetchKategoriAndIndikator();
    
    // Set default tahun ajaran and semester
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // Determine tahun ajaran (July-June academic year)
    const academicYear = month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
    setTahunAjaran(academicYear);
    
    // Determine semester (July-Dec = Ganjil, Jan-June = Genap)
    const currentSemester = month >= 7 && month <= 12 ? 'Ganjil' : 'Genap';
    setSemester(currentSemester);
  }, []);

  useEffect(() => {
    if (selectedSiswa && tahunAjaran && semester) {
      fetchExistingCapaian();
    }
  }, [selectedSiswa, tahunAjaran, semester]);

  const fetchSiswa = async () => {
    try {
      const response = await fetch('/api/siswa');
      const result = await response.json();
      
      if (result.success) {
        setSiswaList(result.data);
      }
    } catch (error) {
      console.error('Error fetching siswa:', error);
    }
  };

  const fetchKategoriAndIndikator = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rapor/indikator/kategori');
      const result = await response.json();

      if (result.success) {
        setKategoriList(result.data);
        
        // Flatten all indikator
        const allIndikator: Indikator[] = [];
        result.data.forEach((kategori: any) => {
          if (kategori.rapor_indikator_keasramaan) {
            allIndikator.push(...kategori.rapor_indikator_keasramaan);
          }
        });
        setIndikatorList(allIndikator);
      }
    } catch (error) {
      console.error('Error fetching kategori:', error);
      alert('Terjadi kesalahan saat memuat data indikator');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingCapaian = async () => {
    try {
      const response = await fetch(
        `/api/rapor/indikator/capaian?siswa_nis=${selectedSiswa}&tahun_ajaran=${tahunAjaran}&semester=${semester}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        const existing: Record<string, any> = {};
        const capaian: Record<string, CapaianData> = {};
        
        result.data.forEach((item: any) => {
          existing[item.indikator_id] = item;
          capaian[item.indikator_id] = {
            indikator_id: item.indikator_id,
            nilai: item.nilai || '',
            deskripsi: item.deskripsi || '',
          };
        });
        
        setExistingCapaian(existing);
        setCapaianData(capaian);
      }
    } catch (error) {
      console.error('Error fetching existing capaian:', error);
    }
  };

  const handleCapaianChange = (indikator_id: string, field: 'nilai' | 'deskripsi', value: string) => {
    setCapaianData(prev => ({
      ...prev,
      [indikator_id]: {
        ...prev[indikator_id],
        indikator_id,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedSiswa || !tahunAjaran || !semester) {
      alert('Silakan pilih siswa, tahun ajaran, dan semester terlebih dahulu');
      return;
    }

    // Prepare batch data
    const batch = Object.values(capaianData)
      .filter(item => item.nilai || item.deskripsi) // Only save if there's data
      .map(item => ({
        siswa_nis: selectedSiswa,
        indikator_id: item.indikator_id,
        tahun_ajaran: tahunAjaran,
        semester: semester,
        nilai: item.nilai || null,
        deskripsi: item.deskripsi || null,
      }));

    if (batch.length === 0) {
      alert('Tidak ada data capaian yang diisi');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/rapor/indikator/capaian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Berhasil menyimpan ${result.data.length} data capaian`);
        fetchExistingCapaian(); // Reload data
      } else {
        alert(result.error || 'Gagal menyimpan data capaian');
      }
    } catch (error) {
      console.error('Error saving capaian:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const filteredSiswa = siswaList.filter(s =>
    s.nama_siswa.toLowerCase().includes(searchSiswa.toLowerCase()) ||
    s.nis.includes(searchSiswa)
  );

  const selectedSiswaData = siswaList.find(s => s.nis === selectedSiswa);

  const getIndikatorByKategori = (kategori_id: string) => {
    return indikatorList
      .filter(i => i.kategori_id === kategori_id)
      .sort((a, b) => a.urutan - b.urutan);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Input Capaian Siswa</h1>
        <p className="text-gray-600">Input data capaian indikator untuk siswa</p>
      </div>

        {/* Selection Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Siswa Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Siswa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari nama atau NIS..."
                  value={searchSiswa}
                  onChange={(e) => setSearchSiswa(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {searchSiswa && (
                <div className="mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
                  {filteredSiswa.length > 0 ? (
                    filteredSiswa.map((siswa) => (
                      <button
                        key={siswa.id}
                        onClick={() => {
                          setSelectedSiswa(siswa.nis);
                          setSearchSiswa('');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b border-gray-200 last:border-b-0"
                      >
                        <p className="font-medium text-gray-800">{siswa.nama_siswa}</p>
                        <p className="text-sm text-gray-600">NIS: {siswa.nis} • {siswa.kelas} • {siswa.asrama}</p>
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-2 text-gray-500 text-sm">Siswa tidak ditemukan</p>
                  )}
                </div>
              )}
              {selectedSiswaData && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-medium text-gray-800">{selectedSiswaData.nama_siswa}</p>
                  <p className="text-sm text-gray-600">
                    NIS: {selectedSiswaData.nis} • {selectedSiswaData.kelas} • {selectedSiswaData.asrama}
                  </p>
                </div>
              )}
            </div>

            {/* Tahun Ajaran */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahun Ajaran <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: 2024/2025"
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih Semester</option>
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
          </div>

          {selectedSiswa && tahunAjaran && semester && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">
                Siap input capaian untuk <strong>{selectedSiswaData?.nama_siswa}</strong> - {tahunAjaran} {semester}
              </p>
            </div>
          )}
        </div>

        {/* Capaian Input Form */}
        {selectedSiswa && tahunAjaran && semester && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Memuat data indikator...</p>
              </div>
            ) : (
              <>
                {kategoriList.map((kategori) => {
                  const indikatorInKategori = getIndikatorByKategori(kategori.id);
                  
                  if (indikatorInKategori.length === 0) return null;

                  return (
                    <div key={kategori.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-blue-600 text-white px-6 py-4">
                        <h2 className="text-xl font-semibold">{kategori.nama_kategori}</h2>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {indikatorInKategori.map((indikator) => (
                            <div key={indikator.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="mb-3">
                                <h3 className="font-semibold text-gray-800">{indikator.nama_indikator}</h3>
                                {indikator.deskripsi && (
                                  <p className="text-sm text-gray-600 mt-1">{indikator.deskripsi}</p>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nilai
                                  </label>
                                  <select
                                    value={capaianData[indikator.id]?.nilai || ''}
                                    onChange={(e) => handleCapaianChange(indikator.id, 'nilai', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="">Pilih Nilai</option>
                                    <option value="A">A - Sangat Baik</option>
                                    <option value="B">B - Baik</option>
                                    <option value="C">C - Cukup</option>
                                    <option value="D">D - Kurang</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Deskripsi Capaian
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Deskripsi singkat..."
                                    value={capaianData[indikator.id]?.deskripsi || ''}
                                    onChange={(e) => handleCapaianChange(indikator.id, 'deskripsi', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                              {existingCapaian[indikator.id] && (
                                <p className="text-xs text-green-600 mt-2">
                                  ✓ Data sudah tersimpan sebelumnya
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Save Button */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? 'Menyimpan...' : 'Simpan Semua Capaian'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Empty State */}
        {!selectedSiswa && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Pilih Siswa Terlebih Dahulu</h3>
            <p className="text-gray-600">Silakan pilih siswa, tahun ajaran, dan semester untuk mulai input capaian</p>
          </div>
        )}
    </>
  );
}
