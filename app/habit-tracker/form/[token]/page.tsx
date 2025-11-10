'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Save, CheckCircle } from 'lucide-react';

interface TokenData {
  nama_musyrif: string;
  cabang?: string;
  lokasi?: string; // backward compatibility
  kelas: string;
  asrama: string;
  is_active: boolean;
}

interface DataSiswa {
  id: string;
  nama_siswa: string;
  nis: string;
  kepala_asrama: string;
  foto: string;
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
  const [logoSekolah, setLogoSekolah] = useState<string>('');
  const [alreadyInputToday, setAlreadyInputToday] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    validateToken();
    fetchMasterData();
    fetchLogoSekolah();
  }, [token]);

  useEffect(() => {
    if (siswaList.length > 0 && tanggal) {
      checkTodayInput();
    }
  }, [siswaList, tanggal]);

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

  const fetchLogoSekolah = async () => {
    try {
      const { data, error } = await supabase
        .from('identitas_sekolah_keasramaan')
        .select('logo')
        .limit(1)
        .single();

      if (error) {
        console.warn('Logo fetch error (using fallback emoji):', error.message);
        return;
      }

      console.log('Logo data:', data);

      if (data?.logo) {
        // Jika URL lengkap, gunakan langsung
        if (data.logo.startsWith('http')) {
          console.log('Using direct URL:', data.logo);
          setLogoSekolah(data.logo);
        } else {
          // Jika path storage, ambil public URL
          const { data: urlData } = supabase.storage.from('logos').getPublicUrl(data.logo);
          console.log('Public URL:', urlData?.publicUrl);
          if (urlData?.publicUrl) {
            setLogoSekolah(urlData.publicUrl);
          }
        }
      } else {
        console.log('No logo found in database');
      }
    } catch (err) {
      console.warn('Logo fetch failed (using fallback emoji):', err);
    }
  };

  const fetchSiswa = async (token: TokenData) => {
    const cabangValue = token.cabang || token.lokasi; // backward compatibility
    const { data, error } = await supabase
      .from('data_siswa_keasramaan')
      .select('*')
      .eq('cabang', cabangValue)
      .eq('kelas', token.kelas)
      .eq('asrama', token.asrama)
      .eq('musyrif', token.nama_musyrif)
      .order('nama_siswa', { ascending: true });

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

  const checkTodayInput = async () => {
    try {
      const { data, error } = await supabase
        .from('formulir_habit_tracker_keasramaan')
        .select('nis')
        .eq('tanggal', tanggal)
        .eq('musyrif', tokenData?.nama_musyrif)
        .in('nis', siswaList.map(s => s.nis));

      if (error) throw error;

      const inputtedNIS = data?.map(d => d.nis) || [];
      setAlreadyInputToday(inputtedNIS);

      // Show warning if there are students not yet inputted
      const notInputted = siswaList.filter(s => !inputtedNIS.includes(s.nis));
      setShowWarning(notInputted.length > 0);
    } catch (error) {
      console.error('Error checking today input:', error);
    }
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

    // Validasi: Cek apakah ada field yang kosong
    const emptyFields: string[] = [];
    siswaList.forEach((siswa) => {
      const data = habitData[siswa.nis] || {};
      const requiredFields = [
        'shalat_fardhu_berjamaah', 'tata_cara_shalat', 'qiyamul_lail', 'shalat_sunnah',
        'puasa_sunnah', 'tata_cara_wudhu', 'sedekah', 'dzikir_pagi_petang',
        'etika_dalam_tutur_kata', 'etika_dalam_bergaul', 'etika_dalam_berpakaian', 'adab_sehari_hari',
        'waktu_tidur', 'pelaksanaan_piket_kamar', 'disiplin_halaqah_tahfidz', 'perizinan',
        'belajar_malam', 'disiplin_berangkat_ke_masjid',
        'kebersihan_tubuh_berpakaian_berpenampilan', 'kamar', 'ranjang_dan_almari'
      ];

      const hasEmptyField = requiredFields.some(field => !data[field] || data[field] === '');
      if (hasEmptyField) {
        emptyFields.push(siswa.nama_siswa);
      }
    });

    if (emptyFields.length > 0) {
      const confirm = window.confirm(
        `⚠️ PERINGATAN!\n\n` +
        `Ada ${emptyFields.length} santri yang datanya belum lengkap:\n\n` +
        `${emptyFields.slice(0, 5).join('\n')}` +
        `${emptyFields.length > 5 ? `\n... dan ${emptyFields.length - 5} lainnya` : ''}\n\n` +
        `Apakah Anda yakin ingin menyimpan dengan data yang belum lengkap?\n\n` +
        `Klik OK untuk tetap simpan, atau Cancel untuk melengkapi data terlebih dahulu.`
      );

      if (!confirm) {
        return;
      }
    }

    setSaving(true);
    setSuccess(false);

    try {
      const dataToInsert = siswaList.map((siswa) => {
        const { nis: _, ...habitFields } = habitData[siswa.nis] || {};
        return {
          tanggal,
          nama_siswa: siswa.nama_siswa,
          nis: siswa.nis,
          kelas: tokenData?.kelas,
          kepas: siswa.kepala_asrama,
          musyrif: tokenData?.nama_musyrif,
          asrama: tokenData?.asrama,
          cabang: tokenData?.cabang || tokenData?.lokasi, // backward compatibility
          semester,
          tahun_ajaran: tahunAjaran,
          ...habitFields,
        };
      });

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
      
      // Refresh check today input
      await checkTodayInput();
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
      className="w-full px-3 py-2.5 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 px-3 sm:p-8">
      <div className="max-w-4xl mx-auto">
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
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-1">Habit Tracker</h1>
            <p className="text-base sm:text-lg text-gray-500">HSI Boarding School</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 mb-5 border border-blue-100">
            <div className="grid grid-cols-2 gap-3 text-sm sm:text-base">
              <div className="flex items-start gap-2">
                <span className="text-2xl">👤</span>
                <div>
                  <span className="text-gray-500 text-xs block">Musyrif/ah</span>
                  <p className="font-bold text-gray-800">{tokenData.nama_musyrif}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-2xl">📍</span>
                <div>
                  <span className="text-gray-500 text-xs block">Cabang</span>
                  <p className="font-bold text-gray-800">{tokenData.cabang || tokenData.lokasi}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-2xl">🎓</span>
                <div>
                  <span className="text-gray-500 text-xs block">Kelas</span>
                  <p className="font-bold text-gray-800">{tokenData.kelas}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-2xl">🏠</span>
                <div>
                  <span className="text-gray-500 text-xs block">Asrama</span>
                  <p className="font-bold text-gray-800">{tokenData.asrama}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Banner - Santri Belum Diinput */}
          {showWarning && alreadyInputToday.length < siswaList.length && (
            <div className="mb-5 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">!</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-yellow-900 text-lg mb-1">
                    ⚠️ Peringatan: Ada Santri yang Belum Diinput!
                  </h3>
                  <p className="text-yellow-800 text-sm mb-2">
                    Tanggal <span className="font-bold">{new Date(tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-bold text-lg">{alreadyInputToday.length}</span>
                      <span className="text-gray-600">Sudah diinput</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-bold text-lg">{siswaList.length - alreadyInputToday.length}</span>
                      <span className="text-gray-600">Belum diinput</span>
                    </div>
                  </div>
                  <p className="text-yellow-700 text-xs mt-2 italic">
                    💡 Pastikan semua santri sudah diinput untuk menghindari data yang NULL/kosong
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {alreadyInputToday.length === siswaList.length && siswaList.length > 0 && (
            <div className="mb-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">✓</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-green-900 text-lg mb-1">
                    ✅ Semua Santri Sudah Diinput!
                  </h3>
                  <p className="text-green-800 text-sm">
                    Tanggal <span className="font-bold">{new Date(tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span> - 
                    <span className="font-bold ml-1">{siswaList.length} santri</span> sudah lengkap
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

          <div className="mt-4 flex items-center justify-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
            <span className="text-lg">👥</span>
            {siswaList.length} Santri
          </div>
        </div>

        {/* Form untuk setiap siswa */}
        {siswaList.map((siswa, index) => (
          <div key={siswa.nis} className="bg-white rounded-2xl shadow-lg p-5 mb-4 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-100">
              <div className="flex items-center gap-3">
                <FotoSiswa foto={siswa.foto} nama={siswa.nama_siswa} />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{siswa.nama_siswa}</h3>
                  <p className="text-xs text-gray-500">NIS: {siswa.nis}</p>
                </div>
              </div>
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                #{index + 1}
              </span>
            </div>

            {/* UBUDIYAH */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-200">
                <span className="text-2xl">🕌</span>
                <h4 className="font-bold text-base text-blue-700 uppercase">Ubudiyah</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-200">
                <span className="text-2xl">💚</span>
                <h4 className="font-bold text-base text-green-700 uppercase">Akhlaq</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-orange-200">
                <span className="text-2xl">⏰</span>
                <h4 className="font-bold text-base text-orange-700 uppercase">Kedisiplinan</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-200">
                <span className="text-2xl">✨</span>
                <h4 className="font-bold text-base text-purple-700 uppercase">Kebersihan & Kerapian</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
        <div className="sticky bottom-4 bg-white rounded-2xl shadow-2xl p-4 border border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={saving || !tanggal || !tahunAjaran || !semester}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-5 rounded-2xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] text-lg"
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
                <span>Simpan {siswaList.length} Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Component untuk menampilkan foto siswa
function FotoSiswa({ foto, nama }: { foto: string; nama: string }) {
  const [fotoUrl, setFotoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadFoto();
  }, [foto]);

  const loadFoto = async () => {
    if (!foto) {
      setLoading(false);
      return;
    }

    try {
      // Jika sudah berupa URL lengkap, gunakan langsung
      if (foto.startsWith('http')) {
        setFotoUrl(foto);
        setLoading(false);
        return;
      }

      // Jika path dari storage, ambil public URL
      const { data } = supabase.storage.from('foto-siswa').getPublicUrl(foto);

      if (data?.publicUrl) {
        setFotoUrl(data.publicUrl);
      }
    } catch (err) {
      console.error('Error loading foto:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center animate-pulse">
        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (fotoUrl && !error) {
    return (
      <img
        src={fotoUrl}
        alt={nama}
        onError={() => setError(true)}
        className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 shadow-md"
      />
    );
  }

  // Fallback ke avatar dengan initial
  return (
    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
      {nama.charAt(0).toUpperCase()}
    </div>
  );
}
