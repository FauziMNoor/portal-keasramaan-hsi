'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { FileText, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import GoogleOAuthButton from '@/components/GoogleOAuthButton';

interface Santri {
  id: string;
  nama_siswa: string;
  nis: string;
  foto: string;
}

export default function GenerateRaporPage() {
  // Filter states
  const [allCabangList, setAllCabangList] = useState<string[]>([]);
  const [allTahunAjaranList, setAllTahunAjaranList] = useState<string[]>([]);
  const [allSemesterList, setAllSemesterList] = useState<string[]>([]);
  const [allKelasList, setAllKelasList] = useState<string[]>([]);
  const [allAsramaList, setAllAsramaList] = useState<any[]>([]);
  const [filteredKelasList, setFilteredKelasList] = useState<string[]>([]);
  const [filteredAsramaList, setFilteredAsramaList] = useState<string[]>([]);

  const [selectedCabang, setSelectedCabang] = useState('');
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedAsrama, setSelectedAsrama] = useState('');

  // Mode generate
  const [generateMode, setGenerateMode] = useState<'single' | 'kelas' | 'asrama'>('single');
  const [selectedSantri, setSelectedSantri] = useState('');
  const [santriList, setSantriList] = useState<Santri[]>([]);

  // Status
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Fetch filter options
  useEffect(() => {
    fetchAllFilterOptions();
    
    // Check for OAuth success/error in URL
    const params = new URLSearchParams(window.location.search);
    const oauthStatus = params.get('oauth');
    const error = params.get('error');
    const tokensParam = params.get('tokens');
    
    if (oauthStatus === 'success' && tokensParam) {
      // Save tokens to localStorage
      try {
        localStorage.setItem('google_oauth_tokens', tokensParam);
        alert('✅ Google account berhasil terkoneksi!');
        window.history.replaceState({}, '', '/rapor/generate');
        window.location.reload();
      } catch (error: any) {
        alert(`❌ Error: ${error.message}`);
      }
    } else if (error) {
      alert(`❌ OAuth error: ${error}`);
      window.history.replaceState({}, '', '/rapor/generate');
    }
  }, []);

  // Filter cascading
  useEffect(() => {
    if (selectedCabang && allAsramaList.length > 0) {
      const asramaByCabang = allAsramaList.filter(a => a.lokasi === selectedCabang);
      const kelasFromAsrama = [...new Set(asramaByCabang.map(a => a.kelas).filter(k => k))];
      setFilteredKelasList(kelasFromAsrama);

      if (selectedKelas && !kelasFromAsrama.includes(selectedKelas)) {
        setSelectedKelas('');
        setSelectedAsrama('');
      }
    } else {
      setFilteredKelasList([]);
      if (selectedCabang) {
        setSelectedKelas('');
        setSelectedAsrama('');
      }
    }
  }, [selectedCabang, allAsramaList, selectedKelas]);

  useEffect(() => {
    if (selectedCabang && selectedKelas) {
      const filtered = allAsramaList.filter(
        a => a.lokasi === selectedCabang && a.kelas === selectedKelas
      );
      setFilteredAsramaList(filtered.map(a => a.asrama));

      if (selectedAsrama && !filtered.find(a => a.asrama === selectedAsrama)) {
        setSelectedAsrama('');
      }
    } else {
      setFilteredAsramaList([]);
      setSelectedAsrama('');
    }
  }, [selectedCabang, selectedKelas, allAsramaList]);

  // Fetch santri when all filters selected
  useEffect(() => {
    if (selectedCabang && selectedKelas && selectedAsrama) {
      fetchSantri();
    } else {
      setSantriList([]);
      setSelectedSantri('');
    }
  }, [selectedCabang, selectedKelas, selectedAsrama]);

  const fetchAllFilterOptions = async () => {
    try {
      const { data: cabangData } = await supabase
        .from('cabang_keasramaan')
        .select('nama_cabang')
        .order('nama_cabang');
      setAllCabangList(cabangData?.map((item) => item.nama_cabang) || []);

      const { data: tahunData } = await supabase
        .from('tahun_ajaran_keasramaan')
        .select('tahun_ajaran')
        .eq('status', 'aktif')
        .order('tahun_ajaran', { ascending: false });
      setAllTahunAjaranList(tahunData?.map((item) => item.tahun_ajaran) || []);

      const { data: semesterData } = await supabase
        .from('semester_keasramaan')
        .select('semester')
        .eq('status', 'aktif')
        .order('angka');
      setAllSemesterList(semesterData?.map((item) => item.semester) || []);

      const { data: kelasData } = await supabase
        .from('kelas_keasramaan')
        .select('nama_kelas')
        .eq('status', 'aktif')
        .order('nama_kelas');
      setAllKelasList(kelasData?.map((item) => item.nama_kelas) || []);

      // Use data_siswa_keasramaan as primary source (more reliable)
      const { data: siswaData } = await supabase
        .from('data_siswa_keasramaan')
        .select('asrama, cabang, kelas');

      const asramaMap = new Map();
      siswaData?.forEach(d => {
        if (d.asrama && d.cabang && d.kelas) {
          const key = `${d.asrama}-${d.cabang}-${d.kelas}`;
          if (!asramaMap.has(key)) {
            asramaMap.set(key, {
              asrama: d.asrama,
              lokasi: d.cabang,
              kelas: d.kelas
            });
          }
        }
      });
      setAllAsramaList(Array.from(asramaMap.values()));
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchSantri = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('data_siswa_keasramaan')
      .select('id, nama_siswa, nis, foto')
      .eq('cabang', selectedCabang)
      .eq('kelas', selectedKelas)
      .eq('asrama', selectedAsrama)
      .order('nama_siswa');

    if (error) {
      console.error('Error fetching santri:', error);
      alert('Error fetching santri: ' + error.message);
    } else {
      console.log('Fetched santri for generate:', data);
      setSantriList(data || []);
      if (!data || data.length === 0) {
        alert('Tidak ada santri di kelas/asrama ini!');
      }
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!selectedCabang || !selectedTahunAjaran || !selectedSemester || !selectedKelas || !selectedAsrama) {
      alert('Pilih semua filter terlebih dahulu!');
      return;
    }

    if (generateMode === 'single' && !selectedSantri) {
      alert('Pilih santri terlebih dahulu!');
      return;
    }

    setGenerating(true);
    setProgress(0);
    setStatus('idle');
    setMessage('Memulai generate rapor...');

    try {
      // Get Google tokens from localStorage
      const tokensEncoded = localStorage.getItem('google_oauth_tokens');
      if (!tokensEncoded) {
        alert('❌ Google account not connected. Please connect first.');
        setGenerating(false);
        return;
      }

      const googleTokens = JSON.parse(atob(tokensEncoded));

      const payload = {
        mode: generateMode,
        cabang: selectedCabang,
        tahunAjaran: selectedTahunAjaran,
        semester: selectedSemester,
        kelas: selectedKelas,
        asrama: selectedAsrama,
        googleTokens, // Add tokens to payload
        ...(generateMode === 'single' && { nis: selectedSantri }),
      };

      setMessage('Mengambil data santri...');
      setProgress(20);

      const response = await fetch('/api/rapor/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setProgress(40);
      setMessage('Merekap habit tracker...');

      const result = await response.json();

      setProgress(60);
      setMessage('Generating Google Slides...');

      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(80);
      setMessage('Exporting to PDF...');

      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(100);

      if (result.success) {
        setStatus('success');
        if (generateMode === 'single') {
          setMessage(`✅ Rapor berhasil di-generate! Download: ${result.data.pdf_url}`);
          // Auto download
          window.open(result.data.pdf_url, '_blank');
        } else {
          setMessage(`✅ ${result.message}`);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage('❌ Gagal generate rapor: ' + error.message);
      console.error('Generate error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const isFilterComplete = selectedCabang && selectedTahunAjaran && selectedSemester && selectedKelas && selectedAsrama;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Generate Rapor</h1>
                  <p className="text-gray-600">Generate rapor santri dalam format PDF</p>
                </div>
              </div>
              <GoogleOAuthButton />
            </div>
            
            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>📌 Penting:</strong> Pastikan Google account sudah terkoneksi sebelum generate rapor. 
                File akan tersimpan di Google Drive kantor Anda.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Filter</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cabang</label>
                <select
                  value={selectedCabang}
                  onChange={(e) => setSelectedCabang(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Pilih Cabang</option>
                  {allCabangList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tahun Ajaran</label>
                <select
                  value={selectedTahunAjaran}
                  onChange={(e) => setSelectedTahunAjaran(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Pilih Tahun Ajaran</option>
                  {allTahunAjaranList.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Pilih Semester</option>
                  {allSemesterList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelas {!selectedCabang && <span className="text-xs text-gray-400">(pilih cabang dulu)</span>}
                </label>
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!selectedCabang}
                >
                  <option value="">Pilih Kelas</option>
                  {filteredKelasList.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asrama {!selectedKelas && <span className="text-xs text-gray-400">(pilih kelas dulu)</span>}
                </label>
                <select
                  value={selectedAsrama}
                  onChange={(e) => setSelectedAsrama(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!selectedCabang || !selectedKelas}
                >
                  <option value="">Pilih Asrama</option>
                  {filteredAsramaList.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {!isFilterComplete ? (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center">
              <p className="text-yellow-800 font-medium">
                Silakan pilih semua filter untuk melanjutkan
              </p>
            </div>
          ) : (
            <>
              {/* Mode Generate */}
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Mode Generate</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setGenerateMode('single')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      generateMode === 'single'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">👤</div>
                      <div className="font-semibold text-gray-800">Per Santri</div>
                      <div className="text-sm text-gray-600">Generate 1 santri</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setGenerateMode('kelas')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      generateMode === 'kelas'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">👥</div>
                      <div className="font-semibold text-gray-800">Per Kelas</div>
                      <div className="text-sm text-gray-600">Generate semua santri di kelas</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setGenerateMode('asrama')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      generateMode === 'asrama'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🏠</div>
                      <div className="font-semibold text-gray-800">Per Asrama</div>
                      <div className="text-sm text-gray-600">Generate semua santri di asrama</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Santri Selection (for single mode) */}
              {generateMode === 'single' && (
                <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Pilih Santri</h2>
                  {loading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
                      <p className="text-gray-600">Memuat data santri...</p>
                    </div>
                  ) : santriList.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Tidak ada santri di kelas/asrama ini
                    </div>
                  ) : (
                    <select
                      value={selectedSantri}
                      onChange={(e) => setSelectedSantri(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Pilih Santri</option>
                      {santriList.map((s) => (
                        <option key={s.id} value={s.nis}>
                          {s.nama_siswa} ({s.nis})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Summary */}
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Ringkasan</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Cabang</div>
                    <div className="font-semibold text-gray-800">{selectedCabang}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Tahun Ajaran</div>
                    <div className="font-semibold text-gray-800">{selectedTahunAjaran}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Semester</div>
                    <div className="font-semibold text-gray-800">{selectedSemester}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Kelas / Asrama</div>
                    <div className="font-semibold text-gray-800">{selectedKelas} / {selectedAsrama}</div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="text-sm text-gray-600">Mode Generate</div>
                  <div className="font-semibold text-gray-800">
                    {generateMode === 'single' && `Per Santri${selectedSantri ? ` - ${santriList.find(s => s.nis === selectedSantri)?.nama_siswa}` : ''}`}
                    {generateMode === 'kelas' && `Per Kelas (${santriList.length} santri)`}
                    {generateMode === 'asrama' && `Per Asrama (${santriList.length} santri)`}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <button
                  onClick={handleGenerate}
                  disabled={generating || (generateMode === 'single' && !selectedSantri)}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Generating... {progress}%
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6" />
                      Generate Rapor
                    </>
                  )}
                </button>

                {/* Status Message */}
                {message && (
                  <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
                    status === 'success' ? 'bg-green-50 text-green-800' :
                    status === 'error' ? 'bg-red-50 text-red-800' :
                    'bg-blue-50 text-blue-800'
                  }`}>
                    {status === 'success' && <CheckCircle className="w-5 h-5" />}
                    {status === 'error' && <AlertCircle className="w-5 h-5" />}
                    {status === 'idle' && <Loader2 className="w-5 h-5 animate-spin" />}
                    <span>{message}</span>
                  </div>
                )}

                {/* Info */}
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Generate rapor akan mengambil data dari:
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4">
                    <li>• Data santri</li>
                    <li>• Rekap habit tracker (semester ini)</li>
                    <li>• Kegiatan & dokumentasi yang sudah di-setup</li>
                    <li>• Mapping ke indikator penilaian</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    Output: PDF rapor (single) atau ZIP berisi multiple PDF (batch)
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
