'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Save, CheckCircle } from 'lucide-react';

interface TokenData {
  nama_musyrif: string;
  lokasi: string;
  kelas: string;
  asrama: string;
  is_active: boolean;
}

interface DataSiswa {
  id: string;
  nama: string;
  nis: string;
  kepala_asrama: string;
}

interface HabitData {
  nis: string;
  [key: string]: string;
}

export default function FormMusyrifPage() {
  const params = useParams();
  const token = params.token as string;

  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [siswaList, setSiswaList] = useState<DataSiswa[]>([]);
  const [habitData, setHabitData] = useState<{ [nis: string]: HabitData }>({});
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [tahunAjaran, setTahunAjaran] = useState('');
  const [semester, setSemester] = useState('');
  const [tahunAjaranList, setTahunAjaranList] = useState<any[]>([]);
  const [semesterList, setSemesterList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    validateToken();
    fetchMasterData();
  }, [token]);

  const validateToken = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('token_musyrif_keasramaan')
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
    fetchSiswa(data);
  };

  const fetchMasterData = async () => {
    const [tahunAjaran, semester] = await Promise.all([
      supabase.from('tahun_ajaran_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('semester_keasramaan').select('*').eq('status', 'aktif'),
    ]);

    setTahunAjaranList(tahunAjaran.data || []);
    setSemesterList(semester.data || []);
  };

  const fetchSiswa = async (token: TokenData) => {
    const { data, error } = await supabase
      .from('data_siswa_keasramaan')
      .select('*')
      .eq('lokasi', token.lokasi)
      .eq('kelas', token.kelas)
      .eq('asrama', token.asrama)
      .eq('musyrif', token.nama_musyrif)
      .order('nama', { ascending: true });

    if (error) {
      console.error('Error:', error);
    } else {
      setSiswaList(data || []);
      const initialData: { [nis: string]: HabitData } = {};
      (data || []).forEach((siswa) => {
        initialData[siswa.nis] = { nis: siswa.nis };
      });
      setHabitData(initialData);
    }
    setLoading(false);
  };

  const updateHabitData = (nis: string, field: string, value: string) => {
    setHabitData((prev) => ({
      ...prev,
      [nis]: {
        ...prev[nis],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!tanggal || !tahunAjaran || !semester) {
      alert('Tanggal, Tahun Ajaran, dan Semester harus diisi!');
      return;
    }

    setSaving(true);
    setSuccess(false);

    try {
      const dataToInsert = siswaList.map((siswa) => ({
        tanggal,
        nama_santri: siswa.nama,
        nis: siswa.nis,
        kelas: tokenData?.kelas,
        kepas: siswa.kepala_asrama,
        musyrif: tokenData?.nama_musyrif,
        asrama: tokenData?.asrama,
        lokasi: tokenData?.lokasi,
        semester,
        tahun_ajaran: tahunAjaran,
        ...habitData[siswa.nis],
      }));

      const { error } = await supabase
        .from('formulir_habit_tracker_keasramaan')
        .insert(dataToInsert);

      if (error) throw error;

      setSuccess(true);
      alert(`✅ Berhasil menyimpan ${dataToInsert.length} data!`);
      
      // Reset form
      const initialData: { [nis: string]: HabitData } = {};
      siswaList.forEach((siswa) => {
        initialData[siswa.nis] = { nis: siswa.nis };
      });
      setHabitData(initialData);
    } catch (error: any) {
      console.error('Error:', error);
      alert('❌ Gagal menyimpan: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const renderDropdown = (nis: string, field: string, maxValue: number) => (
    <select
      value={habitData[nis]?.[field] || ''}
      onChange={(e) => updateHabitData(nis, field, e.target.value)}
      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    >
      <option value="">-</option>
      {Array.from({ length: maxValue }, (_, i) => i + 1).map((val) => (
        <option key={val} value={val}>
          {val}
        </option>
      ))}
    </select>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-4 px-2 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4">
          <div className="text-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Habit Tracker</h1>
            <p className="text-sm sm:text-base text-gray-600">HSI Boarding School</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Musyrif:</span>
                <p className="font-semibold text-gray-800">{tokenData.nama_musyrif}</p>
              </div>
              <div>
                <span className="text-gray-600">Lokasi:</span>
                <p className="font-semibold text-gray-800">{tokenData.lokasi}</p>
              </div>
              <div>
                <span className="text-gray-600">Kelas:</span>
                <p className="font-semibold text-gray-800">{tokenData.kelas}</p>
              </div>
              <div>
                <span className="text-gray-600">Asrama:</span>
                <p className="font-semibold text-gray-800">{tokenData.asrama}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun Ajaran <span className="text-red-500">*</span>
              </label>
              <select
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

          <div className="mt-3 text-sm text-gray-600 text-center">
            📊 {siswaList.length} Santri
          </div>
        </div>

        {/* Form untuk setiap siswa */}
        {siswaList.map((siswa, index) => (
          <div key={siswa.nis} className="bg-white rounded-xl shadow-md p-4 mb-3">
            <div className="flex items-center justify-between mb-3 pb-3 border-b">
              <div>
                <h3 className="font-bold text-gray-800">{siswa.nama}</h3>
                <p className="text-xs text-gray-500">NIS: {siswa.nis}</p>
              </div>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                #{index + 1}
              </span>
            </div>

            {/* UBUDIYAH */}
            <div className="mb-4">
              <h4 className="font-semibold text-sm text-blue-700 mb-2 uppercase">🕌 Ubudiyah</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Shalat Fardhu (1-3)</label>
                  {renderDropdown(siswa.nis, 'shalat_fardhu_berjamaah', 3)}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Tata Cara Shalat (1-3)</label>
                  {renderDropdown(siswa.nis, 'tata_cara_shalat', 3)}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Qiyamul Lail (1-3)</label>
                  {renderDropdown(siswa.nis, 'qiyamul_lail', 3)}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Shalat Sunnah (1-3)</label>
                  {renderDropdown(siswa.nis, 'shalat_sunnah', 3)}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Puasa Sunnah (1-5)</label>
                  {renderDropdown(siswa.nis, 'puasa_sunnah', 5)}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Tata Cara Wudhu (1-3)</label>
                  {renderDropdown(siswa.nis, 'tata_cara_wudhu', 3)}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Sedekah (1-4)</label>
                  {renderDropdown(siswa.nis, 'sedekah', 4)}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Dzikir Pagi Petang (1-4)</label>
                  {renderDropdown(siswa.nis, 'dzikir_pagi_petang', 4)}
                </div>
              </div>
            </div>

            {/* AKHLAQ */}
            <div className="mb-4">
              <h4 className="font-semibold text-sm text-green-700 mb-2 uppercase">💚 Akhlaq</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Etika Tutur Kata (1-3)</label>
                  {renderDropdown(siswa.nis, 'etika_dalam_tutur_kata', 3)}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Etika Bergaul (1-3)</label>
                  {renderDropdown(siswa.nis, 'etika_dalam_bergaul', 3)}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Etika Berpakaian (1-3)</label>
                  {renderDropdown(siswa.nis, 'etika_dalam_berpakaian', 3)}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Adab Sehari-hari (1-3)</label>
                  {renderDropdown(siswa.nis, 'adab_sehari_hari', 3)}
                </div>
              </div>
            </div>

            {/* KEDISIPLINAN */}
            <div className="mb-4">
              <h4 className="font-semibold text-sm text-orange-700 mb-2 uppercase">⏰ Kedisiplinan</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Waktu Tidur (1-4)</label>
                  {renderDropdown(siswa.nis, 'waktu_tidur', 4)}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Piket Kamar (1-3)</label>
                  {renderDropdown(siswa.nis, 'pelaksanaan_piket_kamar', 3)}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Halaqah Tahfidz (1-3)</label>
                  {renderDropdown(siswa.nis, 'disiplin_halaqah_tahfidz', 3)}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Perizinan (1-3)</label>
                  {renderDropdown(siswa.nis, 'perizinan', 3)}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Belajar Malam (1-4)</label>
                  {renderDropdown(siswa.nis, 'belajar_malam', 4)}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Berangkat Masjid (1-4)</label>
                  {renderDropdown(siswa.nis, 'disiplin_berangkat_ke_masjid', 4)}
                </div>
              </div>
            </div>

            {/* KEBERSIHAN */}
            <div>
              <h4 className="font-semibold text-sm text-purple-700 mb-2 uppercase">✨ Kebersihan & Kerapian</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Kebersihan Tubuh (1-3)</label>
                  {renderDropdown(siswa.nis, 'kebersihan_tubuh_berpakaian_berpenampilan', 3)}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Kamar (1-3)</label>
                  {renderDropdown(siswa.nis, 'kamar', 3)}
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-600">Ranjang & Almari (1-3)</label>
                  {renderDropdown(siswa.nis, 'ranjang_dan_almari', 3)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Submit Button */}
        <div className="sticky bottom-4 bg-white rounded-xl shadow-lg p-4">
          <button
            onClick={handleSubmit}
            disabled={saving || !tanggal || !tahunAjaran || !semester}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Menyimpan...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Berhasil Disimpan!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Simpan {siswaList.length} Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
