'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Save, Calendar as CalendarIcon } from 'lucide-react';

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

interface HabitData {
  nis: string;
  shalat_fardhu_berjamaah: string;
  tata_cara_shalat: string;
  qiyamul_lail: string;
  shalat_sunnah: string;
  puasa_sunnah: string;
  tata_cara_wudhu: string;
  sedekah: string;
  dzikir_pagi_petang: string;
  etika_dalam_tutur_kata: string;
  etika_dalam_bergaul: string;
  etika_dalam_berpakaian: string;
  adab_sehari_hari: string;
  waktu_tidur: string;
  pelaksanaan_piket_kamar: string;
  disiplin_halaqah_tahfidz: string;
  perizinan: string;
  belajar_malam: string;
  disiplin_berangkat_ke_masjid: string;
  kebersihan_tubuh_berpakaian_berpenampilan: string;
  kamar: string;
  ranjang_dan_almari: string;
}

export default function HabitTrackerPage() {
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [tahunAjaranList, setTahunAjaranList] = useState<any[]>([]);
  const [semesterList, setSemesterList] = useState<any[]>([]);
  const [cabangList, setLokasiList] = useState<any[]>([]);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [asramaList, setAsramaList] = useState<any[]>([]);
  const [kepalaAsramaList, setKepalaAsramaList] = useState<any[]>([]);
  const [musyrifList, setMusyrifList] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    tahun_ajaran: '',
    semester: '',
    cabang: '',
    kelas: '',
    asrama: '',
    kepas: '',
    musyrif: '',
  });

  const [siswaList, setSiswaList] = useState<DataSiswa[]>([]);
  const [habitData, setHabitData] = useState<{ [nis: string]: HabitData }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (filters.tahun_ajaran && filters.semester && filters.cabang && filters.kelas) {
      fetchSiswa();
    } else {
      setSiswaList([]);
      setHabitData({});
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

  const fetchMasterData = async () => {
    const [tahunAjaran, semester, cabang, kelas, asrama, kepas, musyrif] = await Promise.all([
      supabase.from('tahun_ajaran_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('semester_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('cabang_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('kelas_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('asrama_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('kepala_asrama_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('musyrif_keasramaan').select('*').eq('status', 'aktif'),
    ]);

    setTahunAjaranList(tahunAjaran.data || []);
    setSemesterList(semester.data || []);
    setLokasiList(cabang.data || []);
    setKelasList(kelas.data || []);
    setAsramaList(asrama.data || []);
    setKepalaAsramaList(kepas.data || []);
    setMusyrifList(musyrif.data || []);
  };

  const fetchSiswa = async () => {
    setLoading(true);
    let query = supabase
      .from('data_siswa_keasramaan')
      .select('*')
      .eq('cabang', filters.cabang)
      .eq('kelas', filters.kelas);

    if (filters.asrama) query = query.eq('asrama', filters.asrama);
    if (filters.kepas) query = query.eq('kepala_asrama', filters.kepas);
    if (filters.musyrif) query = query.eq('musyrif', filters.musyrif);

    const { data, error } = await query.order('nama_siswa', { ascending: true });

    if (error) {
      console.error('Error:', error);
    } else {
      setSiswaList(data || []);
      // Initialize habit data for each student
      const initialData: { [nis: string]: HabitData } = {};
      (data || []).forEach((siswa) => {
        initialData[siswa.nis] = {
          nis: siswa.nis,
          shalat_fardhu_berjamaah: '',
          tata_cara_shalat: '',
          qiyamul_lail: '',
          shalat_sunnah: '',
          puasa_sunnah: '',
          tata_cara_wudhu: '',
          sedekah: '',
          dzikir_pagi_petang: '',
          etika_dalam_tutur_kata: '',
          etika_dalam_bergaul: '',
          etika_dalam_berpakaian: '',
          adab_sehari_hari: '',
          waktu_tidur: '',
          pelaksanaan_piket_kamar: '',
          disiplin_halaqah_tahfidz: '',
          perizinan: '',
          belajar_malam: '',
          disiplin_berangkat_ke_masjid: '',
          kebersihan_tubuh_berpakaian_berpenampilan: '',
          kamar: '',
          ranjang_dan_almari: '',
        };
      });
      setHabitData(initialData);
    }
    setLoading(false);
  };

  const updateHabitData = (nis: string, field: keyof HabitData, value: string) => {
    setHabitData((prev) => ({
      ...prev,
      [nis]: {
        ...prev[nis],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!tanggal || !filters.tahun_ajaran || !filters.semester) {
      alert('Tanggal, Tahun Ajaran, dan Semester harus diisi!');
      return;
    }

    if (siswaList.length === 0) {
      alert('Tidak ada data siswa untuk disimpan!');
      return;
    }

    setSaving(true);

    try {
      const dataToInsert = siswaList.map((siswa) => {
        const { nis: _, ...habitFields } = habitData[siswa.nis] || {};
        return {
          tanggal,
          nama_siswa: siswa.nama_siswa,
          nis: siswa.nis,
          kelas: siswa.kelas,
          kepas: siswa.kepala_asrama,
          musyrif: siswa.musyrif,
          asrama: siswa.asrama,
          cabang: siswa.cabang,
          semester: filters.semester,
          tahun_ajaran: filters.tahun_ajaran,
          ...habitFields,
        };
      });

      const { error } = await supabase
        .from('formulir_habit_tracker_keasramaan')
        .insert(dataToInsert);

      if (error) throw error;

      alert(`Berhasil menyimpan ${dataToInsert.length} data habit tracker!`);
      
      // Reset form
      setHabitData({});
      fetchSiswa();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Gagal menyimpan data: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const renderDropdown = (nis: string, field: keyof HabitData, maxValue: number) => (
    <select
      value={habitData[nis]?.[field] || ''}
      onChange={(e) => updateHabitData(nis, field, e.target.value)}
      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">-</option>
      {Array.from({ length: maxValue }, (_, i) => i + 1).map((val) => (
        <option key={val} value={val}>
          {val}
        </option>
      ))}
    </select>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 overflow-x-auto">
        <div className="min-w-[1400px]">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Habit Tracker</h1>
            <p className="text-lg text-gray-600">HSI Boarding School</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                >
                  <option value="">Pilih Cabang</option>
                  {cabangList.map((lok) => (
                    <option key={lok.id} value={lok.cabang}>
                      {lok.cabang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  value={filters.kelas}
                  onChange={(e) => setFilters({ ...filters, kelas: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    .filter((a) => a.cabang === filters.cabang && a.kelas === filters.kelas)
                    .map((asr) => (
                      <option key={asr.id} value={asr.asrama}>
                        {asr.asrama}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kepala Asrama</label>
                <select
                  value={filters.kepas}
                  onChange={(e) => setFilters({ ...filters, kepas: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Kepala Asrama</option>
                  {kepalaAsramaList
                    .filter((k) => k.cabang === filters.cabang)
                    .map((kepas) => (
                      <option key={kepas.id} value={kepas.nama}>
                        {kepas.nama}
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

          {/* Table */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
              Memuat data siswa...
            </div>
          ) : siswaList.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
              Pilih filter untuk menampilkan data siswa
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <tr>
                      <th rowSpan={2} className="px-3 py-3 text-left font-semibold border-r border-blue-400 sticky left-0 bg-blue-500 z-10">
                        No
                      </th>
                      <th rowSpan={2} className="px-3 py-3 text-left font-semibold border-r border-blue-400 sticky left-12 bg-blue-500 z-10 min-w-[200px]">
                        Nama Santri
                      </th>
                      <th colSpan={8} className="px-3 py-2 text-center font-semibold border-r border-blue-400">
                        UBUDIYAH
                      </th>
                      <th colSpan={4} className="px-3 py-2 text-center font-semibold border-r border-blue-400">
                        AKHLAQ
                      </th>
                      <th colSpan={6} className="px-3 py-2 text-center font-semibold border-r border-blue-400">
                        KEDISIPLINAN
                      </th>
                      <th colSpan={3} className="px-3 py-2 text-center font-semibold">
                        KEBERSIHAN & KERAPIAN
                      </th>
                    </tr>
                    <tr>
                      {/* Ubudiyah */}
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Shalat Fardhu Berjamaah (1-3)</th>
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Tata Cara Shalat (1-3)</th>
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Qiyamul Lail (1-3)</th>
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Shalat Sunnah (1-3)</th>
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Puasa Sunnah (1-5)</th>
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Tata Cara Wudhu (1-3)</th>
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Sedekah (1-4)</th>
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Dzikir Pagi Petang (1-4)</th>
                      {/* Akhlaq */}
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Etika Tutur Kata (1-3)</th>
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Etika Bergaul (1-3)</th>
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Etika Berpakaian (1-3)</th>
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Adab Sehari-hari (1-3)</th>
                      {/* Kedisiplinan */}
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Waktu Tidur (1-4)</th>
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Piket Kamar (1-3)</th>
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Halaqah Tahfidz (1-3)</th>
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Perizinan (1-3)</th>
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Belajar Malam (1-4)</th>
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Berangkat Masjid (1-4)</th>
                      {/* Kebersihan */}
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Kebersihan Tubuh (1-3)</th>
                      <th className="px-2 py-2 text-xs font-medium border-r border-blue-400">Kamar (1-3)</th>
                      <th className="px-2 py-2 text-xs font-medium">Ranjang & Almari (1-3)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siswaList.map((siswa, index) => (
                      <tr key={siswa.nis} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-3 py-2 text-gray-700 border-r sticky left-0 bg-inherit">{index + 1}</td>
                        <td className="px-3 py-2 text-gray-800 font-medium border-r sticky left-12 bg-inherit">{siswa.nama_siswa}</td>
                        {/* Ubudiyah */}
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'shalat_fardhu_berjamaah', 3)}</td>
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'tata_cara_shalat', 3)}</td>
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'qiyamul_lail', 3)}</td>
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'shalat_sunnah', 3)}</td>
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'puasa_sunnah', 5)}</td>
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'tata_cara_wudhu', 3)}</td>
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'sedekah', 4)}</td>
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'dzikir_pagi_petang', 4)}</td>
                        {/* Akhlaq */}
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'etika_dalam_tutur_kata', 3)}</td>
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'etika_dalam_bergaul', 3)}</td>
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'etika_dalam_berpakaian', 3)}</td>
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'adab_sehari_hari', 3)}</td>
                        {/* Kedisiplinan */}
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'waktu_tidur', 4)}</td>
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'pelaksanaan_piket_kamar', 3)}</td>
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'disiplin_halaqah_tahfidz', 3)}</td>
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'perizinan', 3)}</td>
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'belajar_malam', 4)}</td>
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'disiplin_berangkat_ke_masjid', 4)}</td>
                        {/* Kebersihan */}
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'kebersihan_tubuh_berpakaian_berpenampilan', 3)}</td>
                        <td className="px-2 py-2 border-r">{renderDropdown(siswa.nis, 'kamar', 3)}</td>
                        <td className="px-2 py-2">{renderDropdown(siswa.nis, 'ranjang_dan_almari', 3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Menyimpan...' : `Simpan ${siswaList.length} Data Habit Tracker`}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
