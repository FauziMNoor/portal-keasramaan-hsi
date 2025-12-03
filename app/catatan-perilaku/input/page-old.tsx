'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Save, AlertCircle, Award } from 'lucide-react';

interface DataSiswa {
  id: string;
  nama_siswa: string;
  nis: string;
  cabang: string;
  kelas: string;
  asrama: string;
  kepala_asrama: string;
  musyrif: string;
}

interface Kategori {
  id: string;
  nama_kategori: string;
  poin: number;
  deskripsi: string;
}

export default function InputCatatanPage() {
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [tipe, setTipe] = useState<'pelanggaran' | 'kebaikan'>('pelanggaran');
  const [tahunAjaranList, setTahunAjaranList] = useState<any[]>([]);
  const [semesterList, setSemesterList] = useState<any[]>([]);
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [asramaList, setAsramaList] = useState<any[]>([]);
  const [musyrifList, setMusyrifList] = useState<any[]>([]);
  const [siswaList, setSiswaList] = useState<DataSiswa[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);

  const [filters, setFilters] = useState({
    tahun_ajaran: '',
    semester: '',
    cabang: '',
    kelas: '',
    asrama: '',
    musyrif: '',
  });

  const [formData, setFormData] = useState({
    nis: '',
    kategori_id: '',
    deskripsi_tambahan: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchMasterData();
    fetchUserName();
  }, []);

  useEffect(() => {
    fetchKategori();
  }, [tipe]);

  useEffect(() => {
    if (filters.cabang && filters.kelas) {
      fetchSiswa();
    } else {
      setSiswaList([]);
    }
  }, [filters]);

  // Reset musyrif ketika asrama berubah
  useEffect(() => {
    if (filters.asrama) {
      // Cek apakah musyrif yang dipilih masih valid untuk asrama ini
      const validMusyrif = musyrifList.find(
        (m) => m.nama_musyrif === filters.musyrif &&
          m.asrama === filters.asrama &&
          m.cabang === filters.cabang &&
          m.kelas === filters.kelas
      );

      if (!validMusyrif && filters.musyrif) {
        setFilters((prev) => ({ ...prev, musyrif: '' }));
      }
    }
  }, [filters.asrama, filters.cabang, filters.kelas, musyrifList]);

  const fetchUserName = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUserName(data.user.nama);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchMasterData = async () => {
    const [tahunAjaran, semester, cabang, kelas, asrama, musyrif] = await Promise.all([
      supabase.from('tahun_ajaran_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('semester_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('cabang_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('kelas_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('asrama_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('musyrif_keasramaan').select('*').eq('status', 'aktif'),
    ]);

    setTahunAjaranList(tahunAjaran.data || []);
    setSemesterList(semester.data || []);
    setCabangList(cabang.data || []);
    setKelasList(kelas.data || []);
    setAsramaList(asrama.data || []);
    setMusyrifList(musyrif.data || []);
  };

  const fetchKategori = async () => {
    const table = tipe === 'pelanggaran'
      ? 'kategori_pelanggaran_keasramaan'
      : 'kategori_kebaikan_keasramaan';

    const { data } = await supabase
      .from(table)
      .select('*')
      .eq('status', 'aktif')
      .order('nama_kategori');

    setKategoriList(data || []);
  };

  const fetchSiswa = async () => {
    setLoading(true);
    let query = supabase
      .from('data_siswa_keasramaan')
      .select('*')
      .eq('cabang', filters.cabang)
      .eq('kelas', filters.kelas);

    if (filters.asrama) query = query.eq('asrama', filters.asrama);
    if (filters.musyrif) query = query.eq('musyrif', filters.musyrif);

    const { data, error } = await query.order('nama_siswa', { ascending: true });

    if (error) {
      console.error('Error:', error);
    } else {
      setSiswaList(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tanggal || !filters.tahun_ajaran || !filters.semester || !formData.nis || !formData.kategori_id) {
      alert('Mohon lengkapi semua field yang wajib diisi!');
      return;
    }

    setSaving(true);

    try {
      const siswa = siswaList.find(s => s.nis === formData.nis);
      const kategori = kategoriList.find(k => k.id === formData.kategori_id);

      if (!siswa || !kategori) {
        throw new Error('Data siswa atau kategori tidak ditemukan');
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
        kategori_id: kategori.id,
        nama_kategori: kategori.nama_kategori,
        poin: kategori.poin,
        deskripsi_tambahan: formData.deskripsi_tambahan,
        dicatat_oleh: userName,
        tahun_ajaran: filters.tahun_ajaran,
        semester: filters.semester,
      };

      const { error } = await supabase
        .from('catatan_perilaku_keasramaan')
        .insert([dataToInsert]);

      if (error) throw error;

      alert('✅ Catatan berhasil disimpan!');

      // Reset form
      setFormData({
        nis: '',
        kategori_id: '',
        deskripsi_tambahan: '',
      });
    } catch (error: any) {
      console.error('Error:', error);
      alert('❌ Gagal menyimpan: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedKategori = kategoriList.find(k => k.id === formData.kategori_id);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Input Catatan Perilaku</h1>
            <p className="text-gray-600">Catat pelanggaran dan kebaikan santri</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTipe('pelanggaran')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${tipe === 'pelanggaran'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              <AlertCircle className="w-5 h-5 inline mr-2" />
              Pelanggaran
            </button>
            <button
              onClick={() => setTipe('kebaikan')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${tipe === 'kebaikan'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Award className="w-5 h-5 inline mr-2" />
              Kebaikan
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-6">
            {/* Filter Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Data</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tahun Ajaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={filters.tahun_ajaran}
                    onChange={(e) => setFilters({ ...filters, tahun_ajaran: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Tahun Ajaran</option>
                    {tahunAjaranList.map((ta) => (
                      <option key={ta.id} value={ta.tahun_ajaran}>
                        {ta.tahun_ajaran}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={filters.semester}
                    onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Semester</option>
                    {semesterList.map((sem) => (
                      <option key={sem.id} value={sem.semester}>
                        {sem.semester}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cabang <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={filters.cabang}
                    onChange={(e) => setFilters({ ...filters, cabang: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Cabang</option>
                    {cabangList.map((lok) => (
                      <option key={lok.id} value={lok.nama_cabang}>
                        {lok.nama_cabang}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kelas <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={filters.kelas}
                    onChange={(e) => setFilters({ ...filters, kelas: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Kelas</option>
                    {kelasList.map((kls) => (
                      <option key={kls.id} value={kls.nama_kelas}>
                        {kls.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asrama</label>
                  <select
                    value={filters.asrama}
                    onChange={(e) => setFilters({ ...filters, asrama: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Asrama</option>
                    {asramaList
                      .filter((a) => a.nama_cabang === filters.cabang && a.kelas === filters.kelas)
                      .map((asr) => (
                        <option key={asr.id} value={asr.nama_asrama}>
                          {asr.nama_asrama}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Musyrif/ah</label>
                  <select
                    value={filters.musyrif}
                    onChange={(e) => setFilters({ ...filters, musyrif: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!filters.asrama}
                  >
                    <option value="">{filters.asrama ? 'Semua Musyrif/ah' : 'Pilih Asrama Dulu'}</option>
                    {musyrifList
                      .filter((m) =>
                        m.cabang === filters.cabang &&
                        m.kelas === filters.kelas &&
                        (filters.asrama ? m.asrama === filters.asrama : true)
                      )
                      .map((mus) => (
                        <option key={mus.id} value={mus.nama_musyrif}>
                          {mus.nama_musyrif}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {siswaList.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  Ditemukan <span className="font-bold text-blue-600">{siswaList.length}</span> santri
                </div>
              )}
            </div>

            <hr />

            {/* Form Input */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Data {tipe === 'pelanggaran' ? 'Pelanggaran' : 'Kebaikan'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Santri <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={siswaList.length === 0}
                  >
                    <option value="">
                      {siswaList.length === 0 ? 'Pilih filter dulu' : 'Pilih Santri'}
                    </option>
                    {siswaList.map((siswa) => (
                      <option key={siswa.nis} value={siswa.nis}>
                        {siswa.nama_siswa} - {siswa.nis}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori {tipe === 'pelanggaran' ? 'Pelanggaran' : 'Kebaikan'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.kategori_id}
                    onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {kategoriList.map((kategori) => (
                      <option key={kategori.id} value={kategori.id}>
                        {kategori.nama_kategori} ({kategori.poin > 0 ? '+' : ''}{kategori.poin} poin)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedKategori && (
                  <div className={`p-4 rounded-lg ${tipe === 'pelanggaran' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{selectedKategori.nama_kategori}</p>
                        <p className="text-sm text-gray-600">{selectedKategori.deskripsi}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-lg font-bold ${tipe === 'pelanggaran' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                        {selectedKategori.poin > 0 ? '+' : ''}{selectedKategori.poin}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Tambahan
                  </label>
                  <textarea
                    value={formData.deskripsi_tambahan}
                    onChange={(e) => setFormData({ ...formData, deskripsi_tambahan: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Tambahkan keterangan detail jika diperlukan..."
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full flex items-center justify-center gap-2 ${tipe === 'pelanggaran'
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                } text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50`}
            >
              <Save className="w-5 h-5" />
              {saving ? 'Menyimpan...' : 'Simpan Catatan'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
