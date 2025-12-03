'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Save, CheckCircle, AlertCircle, Award } from 'lucide-react';
import MultiPhotoUpload from '@/components/MultiPhotoUpload';
import { uploadMultipleCatatanPerilakuPhotos } from '@/lib/uploadCatatanPerilaku';

interface TokenData {
  nama_token: string;
  cabang: string;
  kelas: string;
  asrama: string;
  musyrif: string;
  tipe_akses: string;
  is_active: boolean;
  require_auth: boolean;
  deskripsi: string;
}

interface MasterData {
  cabangList: any[];
  kelasList: any[];
  asramaList: any[];
}

interface DataSiswa {
  id: string;
  nama_siswa: string;
  nis: string;
  cabang: string;
  kelas: string;
  asrama: string;
  kepala_asrama: string;
  musyrif: string;
  foto: string;
}

interface KategoriPerilaku {
  id: string;
  nama_kategori: string;
  deskripsi: string;
}

interface LevelDampak {
  id: string;
  nama_level: string;
  poin: number;
  deskripsi: string;
  urutan: number;
}

// Tidak perlu interface KategoriKebaikan lagi karena sekarang menggunakan KategoriPerilaku untuk semua

export default function FormTokenPage() {
  const params = useParams();
  const token = params.token as string;

  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [siswaList, setSiswaList] = useState<DataSiswa[]>([]);
  const [allSiswaList, setAllSiswaList] = useState<DataSiswa[]>([]);
  const [kategoriPerilakuList, setKategoriPerilakuList] = useState<KategoriPerilaku[]>([]);
  const [levelDampakList, setLevelDampakList] = useState<LevelDampak[]>([]);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [tahunAjaran, setTahunAjaran] = useState('');
  const [semester, setSemester] = useState('');
  const [tahunAjaranList, setTahunAjaranList] = useState<any[]>([]);
  const [semesterList, setSemesterList] = useState<any[]>([]);
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [asramaList, setAsramaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logoSekolah, setLogoSekolah] = useState<string>('');
  const [tipe, setTipe] = useState<'pelanggaran' | 'kebaikan'>('pelanggaran');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [filters, setFilters] = useState({
    cabang: '',
    kelas: '',
    asrama: '',
  });

  const [formData, setFormData] = useState({
    nis: '',
    kategori_id: '',
    nama_pelanggaran_kebaikan: '',
    level_dampak_id: '',
    poin_kebaikan: 0,
    poin_custom: 0,
    deskripsi_tambahan: '',
  });

  const [useCustomPoin, setUseCustomPoin] = useState(false);

  // State untuk upload foto
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated || authLoading === false) {
      validateToken();
      fetchMasterData();
      fetchLogoSekolah();
      fetchKategori();
    }
  }, [token, isAuthenticated, authLoading]);

  useEffect(() => {
    if (allSiswaList.length > 0) {
      filterSiswa();
    }
  }, [filters, allSiswaList]);

  const checkAuthentication = async () => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const validateToken = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('token_catatan_perilaku_keasramaan')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      // Token benar-benar tidak valid atau tidak aktif
      setTokenData(null);
      setLoading(false);
      return;
    }

    // ✅ PENTING: Simpan tokenData dulu sebelum cek auth
    setTokenData(data);

    // Check if token requires authentication
    if (data.require_auth && !isAuthenticated) {
      // Token valid tapi butuh login - tampilkan screen "Autentikasi Diperlukan"
      setLoading(false);
      return;
    }

    // Token valid dan tidak butuh auth, atau user sudah login
    // Set tipe default based on tipe_akses
    if (data.tipe_akses === 'pelanggaran') {
      setTipe('pelanggaran');
    } else if (data.tipe_akses === 'kebaikan') {
      setTipe('kebaikan');
    }

    fetchSiswa(data);
  };

  const fetchMasterData = async () => {
    const [tahunAjaran, semester, cabang, kelas, asrama] = await Promise.all([
      supabase.from('tahun_ajaran_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('semester_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('cabang_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('kelas_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('asrama_keasramaan').select('*').eq('status', 'aktif'),
    ]);

    setTahunAjaranList(tahunAjaran.data || []);
    setSemesterList(semester.data || []);
    setCabangList(cabang.data || []);
    setKelasList(kelas.data || []);
    setAsramaList(asrama.data || []);
  };

  const fetchKategori = async () => {
    // Fetch kategori perilaku (umum untuk pelanggaran & kebaikan) dan level dampak
    const [kategoriPerilaku, levelDampak] = await Promise.all([
      supabase.from('kategori_perilaku_keasramaan').select('*').eq('status', 'aktif').order('nama_kategori'),
      supabase.from('level_dampak_keasramaan').select('*').eq('status', 'aktif').order('urutan'),
    ]);

    setKategoriPerilakuList(kategoriPerilaku.data || []);
    setLevelDampakList(levelDampak.data || []);
  };

  const fetchLogoSekolah = async () => {
    try {
      const { data, error } = await supabase
        .from('identitas_sekolah_keasramaan')
        .select('logo')
        .limit(1)
        .single();

      if (error) {
        console.warn('Logo fetch error:', error.message);
        return;
      }

      if (data?.logo) {
        if (data.logo.startsWith('http')) {
          setLogoSekolah(data.logo);
        } else {
          const { data: urlData } = supabase.storage.from('logos').getPublicUrl(data.logo);
          if (urlData?.publicUrl) {
            setLogoSekolah(urlData.publicUrl);
          }
        }
      }
    } catch (err) {
      console.warn('Logo fetch failed:', err);
    }
  };

  const fetchSiswa = async (token: TokenData) => {
    let query = supabase.from('data_siswa_keasramaan').select('*');

    // Apply token restrictions if any
    if (token.cabang) query = query.eq('cabang', token.cabang);
    if (token.kelas) query = query.eq('kelas', token.kelas);
    if (token.asrama) query = query.eq('asrama', token.asrama);
    if (token.musyrif) query = query.eq('musyrif', token.musyrif);

    const { data, error } = await query.order('nama_siswa', { ascending: true });

    if (error) {
      console.error('Error:', error);
    } else {
      setAllSiswaList(data || []);
      setSiswaList(data || []);

      // Set initial filters from token
      setFilters({
        cabang: token.cabang || '',
        kelas: token.kelas || '',
        asrama: token.asrama || '',
      });
    }
    setLoading(false);
  };

  const filterSiswa = () => {
    let filtered = [...allSiswaList];

    if (filters.cabang) {
      filtered = filtered.filter(s => s.cabang === filters.cabang);
    }
    if (filters.kelas) {
      filtered = filtered.filter(s => s.kelas === filters.kelas);
    }
    if (filters.asrama) {
      filtered = filtered.filter(s => s.asrama === filters.asrama);
    }

    setSiswaList(filtered);

    // Reset selected santri if not in filtered list
    if (formData.nis && !filtered.find(s => s.nis === formData.nis)) {
      setFormData({ ...formData, nis: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tanggal || !tahunAjaran || !semester || !formData.nis || !formData.kategori_id || !formData.nama_pelanggaran_kebaikan) {
      alert('Mohon lengkapi semua field yang wajib diisi!');
      return;
    }

    if (tipe === 'pelanggaran') {
      if (!useCustomPoin && !formData.level_dampak_id) {
        alert('Mohon pilih level dampak untuk pelanggaran!');
        return;
      }
      if (useCustomPoin && (!formData.poin_custom || formData.poin_custom >= 0)) {
        alert('Mohon masukkan poin custom yang valid (harus negatif untuk pelanggaran)!');
        return;
      }
    }

    setSaving(true);
    setSuccess(false);

    try {
      const siswa = siswaList.find(s => s.nis === formData.nis);
      const kategori = currentKategoriList.find(k => k.id === formData.kategori_id);

      if (!siswa || !kategori) {
        throw new Error('Data siswa atau kategori tidak ditemukan');
      }

      let poin = 0;
      let levelDampak = '';
      let levelDampakId = null;

      if (tipe === 'pelanggaran') {
        if (useCustomPoin) {
          // Gunakan poin custom
          poin = formData.poin_custom;
          levelDampak = 'Custom Poin';
          levelDampakId = null;
        } else {
          // Gunakan level dampak default
          const level = levelDampakList.find(l => l.id === formData.level_dampak_id);
          if (!level) throw new Error('Level dampak tidak ditemukan');
          poin = level.poin;
          levelDampak = level.nama_level;
          levelDampakId = level.id;
        }
      } else {
        poin = formData.poin_kebaikan;
      }

      // Upload foto jika ada
      let fotoPaths: string[] = [];
      if (photoFiles.length > 0) {
        try {
          fotoPaths = await uploadMultipleCatatanPerilakuPhotos(photoFiles, tipe);
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          alert('⚠️ Gagal upload foto: ' + uploadError.message + '\nCatatan akan disimpan tanpa foto.');
        }
      }

      const dataToInsert = {
        tipe,
        tanggal,
        nis: siswa.nis,
        nama_siswa: siswa.nama_siswa,
        cabang: siswa.cabang,
        kelas: siswa.kelas,
        asrama: siswa.asrama,
        kepala_asrama: siswa.kepala_asrama,
        musyrif: siswa.musyrif,
        kategori_perilaku_id: kategori.id,
        nama_kategori: kategori.nama_kategori,
        nama_pelanggaran_kebaikan: formData.nama_pelanggaran_kebaikan,
        level_dampak: levelDampak || null,
        level_dampak_id: levelDampakId,
        poin,
        deskripsi_tambahan: formData.deskripsi_tambahan,
        dicatat_oleh: currentUser?.nama || 'Unknown User',
        tahun_ajaran: tahunAjaran,
        semester,
        foto_kegiatan: fotoPaths,
      };

      const { error } = await supabase
        .from('catatan_perilaku_keasramaan')
        .insert([dataToInsert]);

      if (error) throw error;

      setSuccess(true);
      const fotoMsg = fotoPaths.length > 0 ? ` dengan ${fotoPaths.length} foto` : '';
      alert(`✅ Catatan berhasil disimpan${fotoMsg}!`);

      // Reset form
      setFormData({
        nis: '',
        kategori_id: '',
        nama_pelanggaran_kebaikan: '',
        level_dampak_id: '',
        poin_kebaikan: 0,
        poin_custom: 0,
        deskripsi_tambahan: '',
      });
      setUseCustomPoin(false);
      setPhotoFiles([]);
      setPhotoPreviews([]);
    } catch (error: any) {
      console.error('Error:', error);
      alert('❌ Gagal menyimpan: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Sekarang kategori perilaku digunakan untuk pelanggaran dan kebaikan
  const currentKategoriList = kategoriPerilakuList;
  const selectedKategori = currentKategoriList.find(k => k.id === formData.kategori_id);
  const selectedLevel = levelDampakList.find(l => l.id === formData.level_dampak_id);
  const canSwitchTipe = tokenData?.tipe_akses === 'semua';

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat formulir...</p>
        </div>
      </div>
    );
  }

  // Authentication required screen
  if (tokenData?.require_auth && !isAuthenticated) {
    // Save current URL to redirect back after login
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';
    const loginUrl = `/login?redirect=${encodeURIComponent(currentUrl)}`;

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Autentikasi Diperlukan</h1>
          <p className="text-gray-600 mb-6">Anda harus login terlebih dahulu untuk mengakses formulir ini.</p>
          <a
            href={loginUrl}
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            Login Sekarang
          </a>
          <p className="text-xs text-gray-500 mt-4">
            Token: <span className="font-mono font-semibold">{tokenData?.nama_token}</span>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Setelah login, Anda akan kembali ke halaman ini
          </p>
        </div>
      </div>
    );
  }

  // Invalid token screen
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 px-3 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-7 mb-5 border border-blue-100">
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-4 shadow-lg border-2 border-gray-100">
              {logoSekolah ? (
                <img
                  src={logoSekolah}
                  alt="Logo Sekolah"
                  className="w-16 h-16 object-contain rounded-xl"
                  onError={() => setLogoSekolah('')}
                />
              ) : (
                <span className="text-4xl">🏫</span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-1">Catatan Perilaku</h1>
            <p className="text-base sm:text-lg text-gray-500">HSI Boarding School</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 mb-5 border border-blue-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔑</span>
                <div>
                  <span className="text-xs text-gray-500 block">Nama Token</span>
                  <p className="font-bold text-gray-800">{tokenData.nama_token}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <div>
                  <span className="text-xs text-gray-500 block">Dicatat oleh</span>
                  <p className="font-bold text-gray-800">{currentUser?.nama || 'Unknown'}</p>
                </div>
              </div>
            </div>
            {tokenData.deskripsi && (
              <div className="mb-3 p-3 bg-white rounded-lg border border-blue-200">
                <p className="text-xs text-gray-500 mb-1">Deskripsi Token:</p>
                <p className="text-sm text-gray-700">{tokenData.deskripsi}</p>
              </div>
            )}
            {(tokenData.cabang || tokenData.kelas || tokenData.asrama || tokenData.musyrif) && (
              <div className="text-sm text-gray-600 space-y-1">
                <p className="text-xs text-gray-500 font-semibold mb-2">Batasan Akses:</p>
                {tokenData.cabang && <p>📍 Cabang: {tokenData.cabang}</p>}
                {tokenData.kelas && <p>🎓 Kelas: {tokenData.kelas}</p>}
                {tokenData.asrama && <p>🏠 Asrama: {tokenData.asrama}</p>}
                {tokenData.musyrif && <p>👥 Musyrif: {tokenData.musyrif}</p>}
              </div>
            )}
          </div>

          {/* Row 1: Tanggal, Tahun Ajaran, Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📚 Tahun Ajaran <span className="text-red-500">*</span>
              </label>
              <select
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
              >
                <option value="">Pilih</option>
                {tahunAjaranList.map((ta) => (
                  <option key={ta.id} value={ta.tahun_ajaran}>
                    {ta.tahun_ajaran}
                  </option>
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
              >
                <option value="">Pilih</option>
                {semesterList.map((sem) => (
                  <option key={sem.id} value={sem.semester}>
                    {sem.semester}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Kelas, Asrama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🎓 Kelas
              </label>
              <select
                value={filters.kelas}
                onChange={(e) => setFilters({ ...filters, kelas: e.target.value, asrama: '' })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                disabled={!!tokenData?.kelas}
              >
                <option value="">Semua Kelas</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.nama_kelas}>
                    {k.nama_kelas}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🏠 Asrama
              </label>
              <select
                value={filters.asrama}
                onChange={(e) => setFilters({ ...filters, asrama: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                disabled={!!tokenData?.asrama}
              >
                <option value="">Semua Asrama</option>
                {asramaList
                  .filter((a) => !filters.cabang || a.nama_cabang === filters.cabang)
                  .filter((a) => !filters.kelas || a.kelas === filters.kelas)
                  .map((a) => (
                    <option key={a.id} value={a.nama_asrama}>
                      {a.nama_asrama}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
            <span className="text-lg">👥</span>
            {siswaList.length} Santri
          </div>
        </div>

        {/* Tabs - Only show if tipe_akses is 'semua' */}
        {canSwitchTipe && (
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => {
                setTipe('pelanggaran');
                setFormData({ ...formData, kategori_id: '' });
              }}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${tipe === 'pelanggaran'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              <AlertCircle className="w-5 h-5 inline mr-2" />
              Pelanggaran
            </button>
            <button
              onClick={() => {
                setTipe('kebaikan');
                setFormData({ ...formData, kategori_id: '' });
              }}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${tipe === 'kebaikan'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Award className="w-5 h-5 inline mr-2" />
              Kebaikan
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-5 mb-4 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Input {tipe === 'pelanggaran' ? 'Pelanggaran' : 'Kebaikan'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Santri <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.nis}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                required
              >
                <option value="">Pilih Santri</option>
                {siswaList.map((siswa) => (
                  <option key={siswa.nis} value={siswa.nis}>
                    {siswa.nama_siswa} - {siswa.nis}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.kategori_id}
                onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                required
              >
                <option value="">Pilih Kategori</option>
                {currentKategoriList.map((kategori) => (
                  <option key={kategori.id} value={kategori.id}>
                    {kategori.nama_kategori}
                  </option>
                ))}
              </select>
              {selectedKategori && (
                <p className="text-xs text-gray-500 mt-1">{selectedKategori.deskripsi}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama {tipe === 'pelanggaran' ? 'Pelanggaran' : 'Kebaikan'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama_pelanggaran_kebaikan}
                onChange={(e) => setFormData({ ...formData, nama_pelanggaran_kebaikan: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                placeholder={tipe === 'pelanggaran' ? 'Misal: Terlambat Shalat Subuh' : 'Misal: Menjadi Imam Shalat Maghrib'}
                required
              />
            </div>

            {tipe === 'pelanggaran' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level Dampak <span className="text-red-500">*</span>
                </label>

                {/* Checkbox Custom Poin */}
                <div className="mb-3 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <input
                    type="checkbox"
                    id="useCustomPoin"
                    checked={useCustomPoin}
                    onChange={(e) => {
                      setUseCustomPoin(e.target.checked);
                      if (e.target.checked) {
                        // Reset level dampak jika pakai custom
                        setFormData({ ...formData, level_dampak_id: '', poin_custom: 0 });
                      } else {
                        // Reset custom poin jika pakai level dampak
                        setFormData({ ...formData, poin_custom: 0 });
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="useCustomPoin" className="text-sm text-blue-700 cursor-pointer">
                    <span className="font-semibold">Gunakan Poin Custom</span>
                    <span className="text-blue-600 ml-1">(Jika memiliki pertimbangan nilai lain)</span>
                  </label>
                </div>

                {!useCustomPoin ? (
                  <>
                    {/* Dropdown Level Dampak Default */}
                    <select
                      value={formData.level_dampak_id}
                      onChange={(e) => setFormData({ ...formData, level_dampak_id: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                      required
                    >
                      <option value="">Pilih Level Dampak</option>
                      {levelDampakList.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.nama_level} ({level.poin} poin)
                        </option>
                      ))}
                    </select>
                    {selectedLevel && (
                      <div className="mt-3 p-4 rounded-xl bg-red-50 border-2 border-red-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">{selectedLevel.nama_level}</p>
                            <p className="text-sm text-gray-600">{selectedLevel.deskripsi}</p>
                          </div>
                          <span className="px-4 py-2 rounded-full text-lg font-bold bg-red-100 text-red-700">
                            {selectedLevel.poin}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Input Custom Poin */}
                    <div className="relative">
                      <input
                        type="number"
                        value={Math.abs(formData.poin_custom)}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          // Simpan sebagai negatif untuk pelanggaran
                          setFormData({ ...formData, poin_custom: -Math.abs(value) });
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                        placeholder="Masukkan nilai poin (misal: 7, 12, 25)"
                        min="1"
                        required
                      />
                    </div>
                    {formData.poin_custom < 0 && (
                      <div className="mt-3 p-4 rounded-xl bg-red-50 border-2 border-red-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">Poin Custom</p>
                            <p className="text-sm text-gray-600">Poin yang akan diberikan berdasarkan pertimbangan Anda</p>
                          </div>
                          <span className="px-4 py-2 rounded-full text-lg font-bold bg-red-100 text-red-700">
                            {formData.poin_custom}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poin Kebaikan <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.poin_kebaikan}
                  onChange={(e) => setFormData({ ...formData, poin_kebaikan: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                  placeholder="Misal: 5, 10, 15"
                  min="1"
                  required
                />
                {formData.poin_kebaikan > 0 && (
                  <div className="mt-3 p-4 rounded-xl bg-green-50 border-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800">Poin yang akan diberikan:</p>
                      <span className="px-4 py-2 rounded-full text-lg font-bold bg-green-100 text-green-700">
                        +{formData.poin_kebaikan}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📸 Upload Foto Kegiatan <span className="text-gray-400 text-xs">(Opsional)</span>
              </label>
              <MultiPhotoUpload
                value={photoPreviews}
                onChange={(files, previews) => {
                  setPhotoFiles(files);
                  setPhotoPreviews(previews);
                }}
                maxPhotos={3}
                maxSizePerPhoto={2}
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Tambahan
              </label>
              <textarea
                value={formData.deskripsi_tambahan}
                onChange={(e) => setFormData({ ...formData, deskripsi_tambahan: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                rows={3}
                placeholder="Tambahkan keterangan detail jika diperlukan..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full mt-6 flex items-center justify-center gap-3 ${tipe === 'pelanggaran'
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
              } text-white font-bold py-5 rounded-2xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] text-lg`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Menyimpan...</span>
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-6 h-6" />
                <span>Berhasil Disimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                <span>Simpan Catatan</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
