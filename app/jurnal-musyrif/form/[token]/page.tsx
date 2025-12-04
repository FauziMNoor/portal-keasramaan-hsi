'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Save, CheckCircle, CheckSquare, Square, Eye, X } from 'lucide-react';

interface TokenData {
  cabang: string;
  is_active: boolean;
}

interface Sesi {
  id: string;
  nama_sesi: string;
  urutan: number;
}

interface Jadwal {
  id: string;
  sesi_id: string;
  jam_mulai: string;
  jam_selesai: string;
  urutan: number;
}

interface Kegiatan {
  id: string;
  jadwal_id: string;
  deskripsi_kegiatan: string;
  urutan: number;
}

interface FormData {
  [key: string]: {
    status_terlaksana: boolean;
  };
}

export default function FormJurnalMusyrifPage() {
  const params = useParams();
  const token = params.token as string;

  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [sesiList, setSesiList] = useState<Sesi[]>([]);
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [tahunAjaran, setTahunAjaran] = useState('');
  const [semester, setSemester] = useState('');
  const [tahunAjaranList, setTahunAjaranList] = useState<any[]>([]);
  const [semesterList, setSemesterList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logoSekolah, setLogoSekolah] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  // Musyrif selection
  const [musyrifList, setMusyrifList] = useState<any[]>([]);
  const [selectedMusyrif, setSelectedMusyrif] = useState<any>(null);

  useEffect(() => {
    validateToken();
    fetchMasterData();
    fetchLogoSekolah();
  }, [token]);

  useEffect(() => {
    if (tokenData) {
      fetchMusyrifList();
    }
  }, [tokenData]);

  useEffect(() => {
    if (selectedMusyrif) {
      fetchJurnalData();
    }
  }, [selectedMusyrif]);

  const validateToken = async () => {
    const { data, error } = await supabase
      .from('token_jurnal_musyrif_keasramaan')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      alert('Link tidak valid atau sudah tidak aktif!');
      setLoading(false);
      return;
    }

    setTokenData(data);
  };

  const fetchMasterData = async () => {
    const [tahunAjaran, semester] = await Promise.all([
      supabase.from('tahun_ajaran_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('semester_keasramaan').select('*').eq('status', 'aktif'),
    ]);
    setTahunAjaranList(tahunAjaran.data || []);
    setSemesterList(semester.data || []);
  };

  const fetchMusyrifList = async () => {
    if (!tokenData) return;
    
    const { data, error } = await supabase
      .from('musyrif_keasramaan')
      .select('*')
      .eq('cabang', tokenData.cabang)
      .eq('status', 'aktif')
      .order('nama_musyrif');

    if (error) {
      console.error('Error fetching musyrif:', error);
      setLoading(false);
    } else {
      setMusyrifList(data || []);
      setLoading(false);
    }
  };

  const fetchJurnalData = async () => {
    setLoading(true);
    const [sesi, jadwal, kegiatan] = await Promise.all([
      supabase.from('sesi_jurnal_musyrif_keasramaan').select('*').eq('status', 'aktif').order('urutan'),
      supabase.from('jadwal_jurnal_musyrif_keasramaan').select('*').order('sesi_id').order('urutan'),
      supabase.from('kegiatan_jurnal_musyrif_keasramaan').select('*').order('jadwal_id').order('urutan'),
    ]);

    setSesiList(sesi.data || []);
    setJadwalList(jadwal.data || []);
    setKegiatanList(kegiatan.data || []);

    // Initialize form data
    const initialData: FormData = {};
    (kegiatan.data || []).forEach((k) => {
      initialData[k.id] = { status_terlaksana: false };
    });
    setFormData(initialData);
    setLoading(false);
  };

  const fetchLogoSekolah = async () => {
    try {
      const { data } = await supabase.from('identitas_sekolah_keasramaan').select('logo').limit(1).single();
      if (data?.logo) {
        if (data.logo.startsWith('http')) {
          setLogoSekolah(data.logo);
        } else {
          const { data: urlData } = supabase.storage.from('logos').getPublicUrl(data.logo);
          if (urlData?.publicUrl) setLogoSekolah(urlData.publicUrl);
        }
      }
    } catch (err) {
      console.warn('Logo fetch failed:', err);
    }
  };

  const updateFormData = (kegiatanId: string, field: 'status_terlaksana', value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [kegiatanId]: {
        ...prev[kegiatanId],
        [field]: value,
      },
    }));
  };

  // Select All untuk sesi tertentu
  const handleSelectAllSesi = (sesiId: string, checked: boolean) => {
    const jadwalInSesi = jadwalList.filter(j => j.sesi_id === sesiId);
    const kegiatanInSesi = kegiatanList.filter(k => 
      jadwalInSesi.some(j => j.id === k.jadwal_id)
    );

    const newFormData = { ...formData };
    kegiatanInSesi.forEach(k => {
      newFormData[k.id] = {
        ...newFormData[k.id],
        status_terlaksana: checked,
      };
    });
    setFormData(newFormData);
  };

  // Select All untuk jadwal tertentu
  const handleSelectAllJadwal = (jadwalId: string, checked: boolean) => {
    const kegiatanInJadwal = kegiatanList.filter(k => k.jadwal_id === jadwalId);
    const newFormData = { ...formData };
    kegiatanInJadwal.forEach(k => {
      newFormData[k.id] = {
        ...newFormData[k.id],
        status_terlaksana: checked,
      };
    });
    setFormData(newFormData);
  };

  // Check if all kegiatan in sesi are checked
  const isAllSesiChecked = (sesiId: string) => {
    const jadwalInSesi = jadwalList.filter(j => j.sesi_id === sesiId);
    const kegiatanInSesi = kegiatanList.filter(k => 
      jadwalInSesi.some(j => j.id === k.jadwal_id)
    );
    return kegiatanInSesi.every(k => formData[k.id]?.status_terlaksana);
  };

  // Check if all kegiatan in jadwal are checked
  const isAllJadwalChecked = (jadwalId: string) => {
    const kegiatanInJadwal = kegiatanList.filter(k => k.jadwal_id === jadwalId);
    return kegiatanInJadwal.every(k => formData[k.id]?.status_terlaksana);
  };

  const handlePreview = () => {
    if (!selectedMusyrif) {
      alert('Silakan pilih nama Anda terlebih dahulu!');
      return;
    }
    
    if (!tanggal || !tahunAjaran || !semester) {
      alert('Tanggal, Tahun Ajaran, dan Semester harus diisi!');
      return;
    }

    // Prepare preview data - hanya yang dicentang
    const preview = kegiatanList
      .filter(kegiatan => formData[kegiatan.id]?.status_terlaksana)
      .map((kegiatan) => {
        const jadwal = jadwalList.find(j => j.id === kegiatan.jadwal_id);
        const sesi = sesiList.find(s => s.id === jadwal?.sesi_id);
        return {
          sesi_nama: sesi?.nama_sesi || '',
          jadwal_waktu: jadwal ? `${jadwal.jam_mulai} - ${jadwal.jam_selesai}` : '',
          kegiatan_deskripsi: kegiatan.deskripsi_kegiatan,
        };
      });

    if (preview.length === 0) {
      alert('⚠️ Tidak ada kegiatan yang dicentang!\n\nSilakan centang minimal 1 kegiatan yang telah dilaksanakan.');
      return;
    }

    setPreviewData(preview);
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      const dataToInsert = kegiatanList.map((kegiatan) => {
        const jadwal = jadwalList.find(j => j.id === kegiatan.jadwal_id);
        return {
          tanggal,
          nama_musyrif: selectedMusyrif.nama_musyrif,
          cabang: selectedMusyrif.cabang,
          kelas: selectedMusyrif.kelas,
          asrama: selectedMusyrif.asrama,
          tahun_ajaran: tahunAjaran,
          semester,
          sesi_id: jadwal?.sesi_id,
          jadwal_id: kegiatan.jadwal_id,
          kegiatan_id: kegiatan.id,
          status_terlaksana: formData[kegiatan.id]?.status_terlaksana || false,
          catatan: '',
        };
      });

      const { error } = await supabase.from('formulir_jurnal_musyrif_keasramaan').insert(dataToInsert);
      if (error) throw error;

      setSuccess(true);
      setShowConfirmation(false);
      
      // Reset form
      const initialData: FormData = {};
      kegiatanList.forEach((k) => {
        initialData[k.id] = { status_terlaksana: false };
      });
      setFormData(initialData);
    } catch (error: any) {
      console.error('Error:', error);
      alert('❌ Gagal menyimpan: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat formulir...</p>
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Link Tidak Valid</h1>
          <p className="text-gray-600">Link formulir tidak valid atau sudah tidak aktif.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-4 px-3 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-7 mb-5 border border-indigo-100">
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-4 shadow-lg border-2 border-gray-100">
              {logoSekolah ? (
                <img src={logoSekolah} alt="Logo" className="w-16 h-16 object-contain rounded-xl" onError={() => setLogoSekolah('')} />
              ) : (
                <span className="text-4xl">📝</span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-1">Jurnal Musyrif</h1>
            <p className="text-base sm:text-lg text-gray-500">HSI Boarding School</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 mb-5 border border-indigo-100">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👤 Pilih Nama Anda <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedMusyrif?.id || ''}
                onChange={(e) => {
                  const musyrif = musyrifList.find(m => m.id === e.target.value);
                  setSelectedMusyrif(musyrif || null);
                }}
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-base bg-white"
                required
              >
                <option value="">-- Pilih Nama Anda --</option>
                {musyrifList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama_musyrif} - {m.kelas} - {m.asrama}
                  </option>
                ))}
              </select>
            </div>

            {selectedMusyrif && (
              <div className="grid grid-cols-2 gap-3 text-sm sm:text-base pt-4 border-t border-indigo-200">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">👤</span>
                  <div>
                    <span className="text-gray-500 text-xs block">Musyrif/ah</span>
                    <p className="font-bold text-gray-800">{selectedMusyrif.nama_musyrif}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-2xl">📍</span>
                  <div>
                    <span className="text-gray-500 text-xs block">Cabang</span>
                    <p className="font-bold text-gray-800">{selectedMusyrif.cabang}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-2xl">🎓</span>
                  <div>
                    <span className="text-gray-500 text-xs block">Kelas</span>
                    <p className="font-bold text-gray-800">{selectedMusyrif.kelas}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-2xl">🏠</span>
                  <div>
                    <span className="text-gray-500 text-xs block">Asrama</span>
                    <p className="font-bold text-gray-800">{selectedMusyrif.asrama}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📚 Tahun Ajaran <span className="text-red-500">*</span>
              </label>
              <select
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-base"
              >
                <option value="">Pilih</option>
                {tahunAjaranList.map((ta) => (
                  <option key={ta.id} value={ta.tahun_ajaran}>{ta.tahun_ajaran}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📖 Semester <span className="text-red-500">*</span>
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-base"
              >
                <option value="">Pilih</option>
                {semesterList.map((sem) => (
                  <option key={sem.id} value={sem.semester}>{sem.semester}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Jurnal per Sesi - Only show if musyrif selected */}
        {!selectedMusyrif ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-center border-2 border-indigo-100">
            <div className="text-5xl sm:text-6xl mb-4">👆</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Silakan Pilih Nama Anda</h3>
            <p className="text-sm sm:text-base text-gray-600">Pilih nama Anda dari dropdown di atas untuk melanjutkan input jurnal</p>
          </div>
        ) : (
          sesiList.map((sesi) => {
          const jadwalInSesi = jadwalList.filter(j => j.sesi_id === sesi.id);
          if (jadwalInSesi.length === 0) return null;

          return (
            <div key={sesi.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-5 mb-3 sm:mb-4 border border-indigo-100">
              {/* Sesi Header with Select All */}
              <div className="flex items-center justify-between mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-indigo-100">
                <h2 className="text-lg sm:text-2xl font-bold text-indigo-700">{sesi.nama_sesi}</h2>
                <button
                  onClick={() => handleSelectAllSesi(sesi.id, !isAllSesiChecked(sesi.id))}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold rounded-lg sm:rounded-xl transition-all text-xs sm:text-base active:scale-95"
                >
                  {isAllSesiChecked(sesi.id) ? (
                    <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Square className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  <span className="hidden sm:inline">Select All</span>
                  <span className="sm:hidden">All</span>
                </button>
              </div>

              {/* Jadwal dalam Sesi */}
              {jadwalInSesi.map((jadwal) => {
                const kegiatanInJadwal = kegiatanList.filter(k => k.jadwal_id === jadwal.id);
                if (kegiatanInJadwal.length === 0) return null;

                return (
                  <div key={jadwal.id} className="mb-3 sm:mb-5 last:mb-0">
                    {/* Jadwal Header with Select All */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl mb-2 sm:mb-3">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-base sm:text-xl">⏰</span>
                        <h3 className="font-bold text-indigo-900 text-sm sm:text-base">
                          {jadwal.jam_mulai} - {jadwal.jam_selesai}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleSelectAllJadwal(jadwal.id, !isAllJadwalChecked(jadwal.id))}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-white hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition-all text-xs sm:text-sm active:scale-95"
                      >
                        {isAllJadwalChecked(jadwal.id) ? (
                          <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                        <span className="hidden sm:inline">Select All</span>
                        <span className="sm:hidden">All</span>
                      </button>
                    </div>

                    {/* Kegiatan List */}
                    <div className="space-y-2 sm:space-y-3 pl-0 sm:pl-4">
                      {kegiatanInJadwal.map((kegiatan) => (
                        <div key={kegiatan.id} className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <button
                              onClick={() => updateFormData(kegiatan.id, 'status_terlaksana', !formData[kegiatan.id]?.status_terlaksana)}
                              className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all active:scale-90 ${
                                formData[kegiatan.id]?.status_terlaksana
                                  ? 'bg-green-500 border-green-500'
                                  : 'bg-white border-gray-300 hover:border-green-500'
                              }`}
                            >
                              {formData[kegiatan.id]?.status_terlaksana && (
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              )}
                            </button>
                            <p className="flex-1 text-xs sm:text-sm text-gray-800 leading-relaxed">
                              {kegiatan.deskripsi_kegiatan}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })
        )}

        {/* Submit Button - Only show if musyrif selected */}
        {selectedMusyrif && (
          <div className="sticky bottom-3 sm:bottom-4 bg-white rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 border border-indigo-100">
            <button
              onClick={handlePreview}
              disabled={saving || !tanggal || !tahunAjaran || !semester}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3.5 sm:py-5 rounded-xl sm:rounded-2xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] text-base sm:text-lg"
            >
              <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Preview & Konfirmasi</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-xl sm:rounded-t-2xl">
              <h2 className="text-base sm:text-xl font-bold text-white">Konfirmasi Jurnal Harian</h2>
              <button
                onClick={() => setShowConfirmation(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 sm:p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {/* Info Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <h3 className="font-bold text-blue-900 mb-2 sm:mb-3 text-sm sm:text-base">Ringkasan Input:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-600">Tanggal:</span>
                    <span className="ml-2 font-medium text-gray-900">{tanggal}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Musyrif:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedMusyrif?.nama_musyrif}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tahun Ajaran:</span>
                    <span className="ml-2 font-medium text-gray-900">{tahunAjaran}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Semester:</span>
                    <span className="ml-2 font-medium text-gray-900">{semester}</span>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <span className="text-gray-600">Total Kegiatan Terlaksana:</span>
                    <span className="ml-2 font-bold text-green-600">{previewData.length} kegiatan</span>
                  </div>
                </div>
              </div>

              {/* Preview Data - Hanya yang dicentang */}
              <div className="mb-4 sm:mb-6">
                <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  Kegiatan yang Telah Dilaksanakan:
                </h3>
                <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-96 overflow-y-auto">
                  {previewData.map((item, idx) => (
                    <div key={idx} className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 text-white rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                              {item.sesi_nama}
                            </span>
                            <span className="text-xs text-gray-600">{item.jadwal_waktu}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-800 break-words">{item.kegiatan_deskripsi}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-yellow-800">
                  <span className="font-semibold">⚠️ Perhatian:</span> Pastikan semua data sudah benar. 
                  Setelah dikonfirmasi, data akan tersimpan ke database dan tidak bisa diubah.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Kembali & Edit</span>
                  <span className="sm:hidden">Kembali</span>
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 text-sm sm:text-base"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Ya, Simpan Sekarang</span>
                      <span className="sm:hidden">Simpan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Berhasil Disimpan!</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Jurnal harian Anda telah tersimpan dengan {previewData.length} kegiatan yang terlaksana.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
