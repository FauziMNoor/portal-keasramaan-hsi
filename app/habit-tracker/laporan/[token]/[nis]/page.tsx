'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, User, Edit, Church, Heart, Clock, Sparkles } from 'lucide-react';

interface SantriData {
  nis: string;
  nama_siswa: string;
  kelas: string;
  asrama: string;
  cabang: string;
  musyrif: string;
  foto?: string;
}

interface HabitStats {
  ubudiyah: { total: number; max: number; percentage: number; trend: number };
  akhlaq: { total: number; max: number; percentage: number; trend: number };
  kedisiplinan: { total: number; max: number; percentage: number; trend: number };
  kebersihan: { total: number; max: number; percentage: number; trend: number };
}

interface ChartData {
  labels: string[];
  ubudiyah: number[];
  akhlaq: number[];
  kedisiplinan: number[];
  kebersihan: number[];
}

export default function DashboardWaliSantriPage() {
  const params = useParams();
  const token = params.token as string;
  const nis = params.nis as string;

  const [santri, setSantri] = useState<SantriData | null>(null);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fotoUrl, setFotoUrl] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'semester'>('month');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'ubudiyah' | 'akhlaq' | 'kedisiplinan' | 'kebersihan' | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [indikatorMap, setIndikatorMap] = useState<{ [key: string]: { [nilai: number]: string } }>({});
  const [activeSemester, setActiveSemester] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      await fetchActiveSemester();
      await fetchIndikator();
      await fetchData();
    };
    init();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const fetchActiveSemester = async () => {
    try {
      const { data, error } = await supabase
        .from('semester_keasramaan')
        .select('*')
        .eq('status', 'aktif')
        .single();

      if (data) {
        console.log('Active semester:', data);
        setActiveSemester(data);
      } else {
        console.log('No active semester found');
        setActiveSemester(null);
      }
    } catch (error) {
      console.error('Error fetching active semester:', error);
      setActiveSemester(null);
    }
  };

  const fetchIndikator = async () => {
    const { data, error } = await supabase
      .from('indikator_keasramaan')
      .select('*');

    if (data) {
      const map: { [key: string]: { [nilai: number]: string } } = {};
      data.forEach((ind) => {
        const fieldName = ind.nama_indikator
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/,/g, '')
          .replace(/&/g, '')
          .replace(/-/g, '_')
          .replace(/__+/g, '_');

        if (!map[fieldName]) {
          map[fieldName] = {};
        }
        map[fieldName][ind.nilai_angka] = ind.deskripsi;
      });
      setIndikatorMap(map);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch santri data
      const { data: santriData, error: santriError } = await supabase
        .from('data_siswa_keasramaan')
        .select('*')
        .eq('nis', nis)
        .single();

      if (santriError) throw santriError;
      setSantri(santriData);

      // Load foto
      if (santriData.foto) {
        if (santriData.foto.startsWith('http')) {
          setFotoUrl(santriData.foto);
        } else {
          const { data: urlData } = supabase.storage.from('foto-siswa').getPublicUrl(santriData.foto);
          if (urlData?.publicUrl) {
            setFotoUrl(urlData.publicUrl);
          }
        }
      }

      // Fetch habit tracker data based on period
      let query = supabase
        .from('formulir_habit_tracker_keasramaan')
        .select('*')
        .eq('nis', nis);

      if (selectedPeriod === 'month') {
        // 30 hari terakhir
        const date = new Date();
        date.setDate(date.getDate() - 30);
        const startDate = date.toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0];
        query = query.gte('tanggal', startDate).lte('tanggal', endDate);
      } else {
        // Semester aktif - gunakan filter semester dan tahun ajaran (SAMA seperti di rekap)
        if (activeSemester) {
          // Ambil tahun ajaran aktif
          const { data: tahunAjaranData } = await supabase
            .from('tahun_ajaran_keasramaan')
            .select('tahun_ajaran')
            .eq('status', 'aktif')
            .single();

          if (tahunAjaranData) {
            query = query
              .ilike('semester', activeSemester.semester)
              .ilike('tahun_ajaran', tahunAjaranData.tahun_ajaran);
          }
        }
      }

      const { data: habitData, error: habitError } = await query.order('tanggal', { ascending: true });

      if (habitError) throw habitError;

      // Calculate stats
      if (habitData && habitData.length > 0) {
        calculateStats(habitData);
        prepareChartData(habitData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    const latest = data[data.length - 1];
    const previous = data.length > 1 ? data[data.length - 2] : null;

    // Helper function untuk menghitung rata-rata (SAMA PERSIS seperti di rekap)
    const avg = (records: any[], field: string): number => {
      const values = records.map(r => parseFloat(r[field]) || 0).filter(v => v > 0);
      if (values.length === 0) return 0;
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    };

    // Hitung rata-rata untuk setiap indikator (SAMA PERSIS seperti di rekap)
    const avgUbudiyah = {
      shalat_fardhu_berjamaah: avg(data, 'shalat_fardhu_berjamaah'),
      tata_cara_shalat: avg(data, 'tata_cara_shalat'),
      qiyamul_lail: avg(data, 'qiyamul_lail'),
      shalat_sunnah: avg(data, 'shalat_sunnah'),
      puasa_sunnah: avg(data, 'puasa_sunnah'),
      tata_cara_wudhu: avg(data, 'tata_cara_wudhu'),
      sedekah: avg(data, 'sedekah'),
      dzikir_pagi_petang: avg(data, 'dzikir_pagi_petang'),
    };

    const avgAkhlaq = {
      etika_dalam_tutur_kata: avg(data, 'etika_dalam_tutur_kata'),
      etika_dalam_bergaul: avg(data, 'etika_dalam_bergaul'),
      etika_dalam_berpakaian: avg(data, 'etika_dalam_berpakaian'),
      adab_sehari_hari: avg(data, 'adab_sehari_hari'),
    };

    const avgKedisiplinan = {
      waktu_tidur: avg(data, 'waktu_tidur'),
      pelaksanaan_piket_kamar: avg(data, 'pelaksanaan_piket_kamar'),
      disiplin_halaqah_tahfidz: avg(data, 'disiplin_halaqah_tahfidz'),
      perizinan: avg(data, 'perizinan'),
      belajar_malam: avg(data, 'belajar_malam'),
      disiplin_berangkat_ke_masjid: avg(data, 'disiplin_berangkat_ke_masjid'),
    };

    const avgKebersihan = {
      kebersihan_tubuh_berpakaian_berpenampilan: avg(data, 'kebersihan_tubuh_berpakaian_berpenampilan'),
      kamar: avg(data, 'kamar'),
      ranjang_dan_almari: avg(data, 'ranjang_dan_almari'),
    };

    // Calculate totals (SAMA PERSIS seperti di rekap)
    const total_ubudiyah = Object.values(avgUbudiyah).reduce((sum, val) => sum + val, 0);
    const total_akhlaq = Object.values(avgAkhlaq).reduce((sum, val) => sum + val, 0);
    const total_kedisiplinan = Object.values(avgKedisiplinan).reduce((sum, val) => sum + val, 0);
    const total_kebersihan = Object.values(avgKebersihan).reduce((sum, val) => sum + val, 0);

    // Calculate percentages (SAMA PERSIS seperti di rekap)
    const persentase_ubudiyah = Math.min(100, (total_ubudiyah / 28) * 100);
    const persentase_akhlaq = Math.min(100, (total_akhlaq / 12) * 100);
    const persentase_kedisiplinan = Math.min(100, (total_kedisiplinan / 21) * 100);
    const persentase_kebersihan = Math.min(100, (total_kebersihan / 9) * 100);

    // Calculate trend
    const prevTotal_ubudiyah = previous ? ['shalat_fardhu_berjamaah', 'tata_cara_shalat', 'qiyamul_lail', 'shalat_sunnah', 'puasa_sunnah', 'tata_cara_wudhu', 'sedekah', 'dzikir_pagi_petang'].reduce((sum, field) => sum + (parseInt(previous[field]) || 0), 0) : total_ubudiyah;
    const trend_ubudiyah = previous ? ((total_ubudiyah - prevTotal_ubudiyah) / prevTotal_ubudiyah) * 100 : 0;

    const prevTotal_akhlaq = previous ? ['etika_dalam_tutur_kata', 'etika_dalam_bergaul', 'etika_dalam_berpakaian', 'adab_sehari_hari'].reduce((sum, field) => sum + (parseInt(previous[field]) || 0), 0) : total_akhlaq;
    const trend_akhlaq = previous ? ((total_akhlaq - prevTotal_akhlaq) / prevTotal_akhlaq) * 100 : 0;

    const prevTotal_kedisiplinan = previous ? ['waktu_tidur', 'pelaksanaan_piket_kamar', 'disiplin_halaqah_tahfidz', 'perizinan', 'belajar_malam', 'disiplin_berangkat_ke_masjid'].reduce((sum, field) => sum + (parseInt(previous[field]) || 0), 0) : total_kedisiplinan;
    const trend_kedisiplinan = previous ? ((total_kedisiplinan - prevTotal_kedisiplinan) / prevTotal_kedisiplinan) * 100 : 0;

    const prevTotal_kebersihan = previous ? ['kebersihan_tubuh_berpakaian_berpenampilan', 'kamar', 'ranjang_dan_almari'].reduce((sum, field) => sum + (parseInt(previous[field]) || 0), 0) : total_kebersihan;
    const trend_kebersihan = previous ? ((total_kebersihan - prevTotal_kebersihan) / prevTotal_kebersihan) * 100 : 0;

    setStats({
      ubudiyah: {
        total: Math.round(total_ubudiyah),
        max: 28,
        percentage: Math.round(persentase_ubudiyah),
        trend: Math.round(trend_ubudiyah * 10) / 10
      },
      akhlaq: {
        total: Math.round(total_akhlaq),
        max: 12,
        percentage: Math.round(persentase_akhlaq),
        trend: Math.round(trend_akhlaq * 10) / 10
      },
      kedisiplinan: {
        total: Math.round(total_kedisiplinan),
        max: 21,
        percentage: Math.round(persentase_kedisiplinan),
        trend: Math.round(trend_kedisiplinan * 10) / 10
      },
      kebersihan: {
        total: Math.round(total_kebersihan),
        max: 9,
        percentage: Math.round(persentase_kebersihan),
        trend: Math.round(trend_kebersihan * 10) / 10
      }
    });

    // Store latest data for detail view
    setDetailData(latest);
  };

  const handleCardClick = (category: 'ubudiyah' | 'akhlaq' | 'kedisiplinan' | 'kebersihan') => {
    setSelectedCategory(category);
    setShowDetailModal(true);
  };

  const getPredikat = (totalAsrama: number) => {
    // Logika sama dengan halaman rekap (max 70)
    let label = 'Maqbul';
    if (totalAsrama > 65) label = 'Mumtaz';
    else if (totalAsrama > 60) label = 'Jayyid Jiddan';
    else if (totalAsrama > 50) label = 'Jayyid';
    else if (totalAsrama > 30) label = 'Dhaif';
    
    // Warna berdasarkan predikat
    if (label === 'Mumtaz') return { label, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' };
    if (label === 'Jayyid Jiddan') return { label, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-700' };
    if (label === 'Jayyid') return { label, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-700' };
    if (label === 'Dhaif') return { label, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50', textColor: 'text-red-700' };
    return { label, color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' };
  };

  const getDetailItems = () => {
    if (!detailData || !selectedCategory) return [];

    const categories = {
      ubudiyah: [
        { label: 'Shalat Fardhu Berjamaah', field: 'shalat_fardhu_berjamaah', max: 3 },
        { label: 'Tata Cara Shalat', field: 'tata_cara_shalat', max: 3 },
        { label: 'Qiyamul Lail', field: 'qiyamul_lail', max: 3 },
        { label: 'Shalat Sunnah', field: 'shalat_sunnah', max: 3 },
        { label: 'Puasa Sunnah', field: 'puasa_sunnah', max: 5 },
        { label: 'Tata Cara Wudhu', field: 'tata_cara_wudhu', max: 3 },
        { label: 'Sedekah', field: 'sedekah', max: 4 },
        { label: 'Dzikir Pagi Petang', field: 'dzikir_pagi_petang', max: 4 },
      ],
      akhlaq: [
        { label: 'Etika Tutur Kata', field: 'etika_dalam_tutur_kata', max: 3 },
        { label: 'Etika Bergaul', field: 'etika_dalam_bergaul', max: 3 },
        { label: 'Etika Berpakaian', field: 'etika_dalam_berpakaian', max: 3 },
        { label: 'Adab Sehari-hari', field: 'adab_sehari_hari', max: 3 },
      ],
      kedisiplinan: [
        { label: 'Waktu Tidur', field: 'waktu_tidur', max: 4 },
        { label: 'Piket Kamar', field: 'pelaksanaan_piket_kamar', max: 3 },
        { label: 'Halaqah Tahfidz', field: 'disiplin_halaqah_tahfidz', max: 3 },
        { label: 'Perizinan', field: 'perizinan', max: 3 },
        { label: 'Belajar Malam', field: 'belajar_malam', max: 4 },
        { label: 'Berangkat Masjid', field: 'disiplin_berangkat_ke_masjid', max: 4 },
      ],
      kebersihan: [
        { label: 'Kebersihan Tubuh & Pakaian', field: 'kebersihan_tubuh_berpakaian_berpenampilan', max: 3 },
        { label: 'Kamar', field: 'kamar', max: 3 },
        { label: 'Ranjang & Almari', field: 'ranjang_dan_almari', max: 3 },
      ],
    };

    return categories[selectedCategory].map(item => ({
      ...item,
      value: parseInt(detailData[item.field]) || 0,
      percentage: Math.round(((parseInt(detailData[item.field]) || 0) / item.max) * 100)
    }));
  };

  const prepareChartData = (data: any[]) => {
    const labels = data.map(d => {
      const date = new Date(d.tanggal);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const calculateTotals = (fields: string[]) => {
      return data.map(d => fields.reduce((sum, field) => sum + (parseInt(d[field]) || 0), 0));
    };

    setChartData({
      labels,
      ubudiyah: calculateTotals(['shalat_fardhu_berjamaah', 'tata_cara_shalat', 'qiyamul_lail', 'shalat_sunnah', 'puasa_sunnah', 'tata_cara_wudhu', 'sedekah', 'dzikir_pagi_petang']),
      akhlaq: calculateTotals(['etika_dalam_tutur_kata', 'etika_dalam_bergaul', 'etika_dalam_berpakaian', 'adab_sehari_hari']),
      kedisiplinan: calculateTotals(['waktu_tidur', 'pelaksanaan_piket_kamar', 'disiplin_halaqah_tahfidz', 'perizinan', 'belajar_malam', 'disiplin_berangkat_ke_masjid']),
      kebersihan: calculateTotals(['kebersihan_tubuh_berpakaian_berpenampilan', 'kamar', 'ranjang_dan_almari'])
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  if (!santri) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Data Tidak Ditemukan</h1>
          <p className="text-gray-600">NIS tidak ditemukan dalam sistem.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-8">
      {/* Header Profile */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 pt-8 pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt={santri.nama_siswa}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-xl">
                  <User className="w-10 h-10 text-purple-500" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">{santri.nama_siswa}</h1>
              <p className="text-blue-100 text-sm">{santri.kelas} • {santri.asrama}</p>
              {santri.musyrif && (
                <p className="text-blue-200 text-xs mt-1">Musyrif/ah: {santri.musyrif}</p>
              )}
              {stats && (() => {
                const totalAsrama = stats.ubudiyah.total + stats.akhlaq.total + stats.kedisiplinan.total + stats.kebersihan.total;
                const predikat = getPredikat(totalAsrama);
                return (
                  <div className="mt-2 inline-block bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-white text-xs font-medium">{predikat.label}</span>
                  </div>
                );
              })()}
            </div>
            <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <Edit className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-2xl p-1">
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-all ${selectedPeriod === 'month'
                ? 'bg-white text-blue-600 shadow-lg'
                : 'text-white hover:bg-white/10'
                }`}
            >
              30 Hari
            </button>
            <button
              onClick={() => setSelectedPeriod('semester')}
              className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-all ${selectedPeriod === 'semester'
                ? 'bg-white text-blue-600 shadow-lg'
                : 'text-white hover:bg-white/10'
                }`}
            >
              {activeSemester ? `Semester ${activeSemester.angka}` : 'Semester'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-2xl mx-auto px-4 -mt-16">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats && (
            <>
              {/* Ubudiyah */}
              <StatCard
                icon={Church}
                title="Ubudiyah"
                value={stats.ubudiyah.total}
                max={stats.ubudiyah.max}
                percentage={stats.ubudiyah.percentage}
                trend={stats.ubudiyah.trend}
                color="blue"
                onClick={() => handleCardClick('ubudiyah')}
              />

              {/* Akhlaq */}
              <StatCard
                icon={Heart}
                title="Akhlaq"
                value={stats.akhlaq.total}
                max={stats.akhlaq.max}
                percentage={stats.akhlaq.percentage}
                trend={stats.akhlaq.trend}
                color="green"
                onClick={() => handleCardClick('akhlaq')}
              />

              {/* Kedisiplinan */}
              <StatCard
                icon={Clock}
                title="Kedisiplinan"
                value={stats.kedisiplinan.total}
                max={stats.kedisiplinan.max}
                percentage={stats.kedisiplinan.percentage}
                trend={stats.kedisiplinan.trend}
                color="orange"
                onClick={() => handleCardClick('kedisiplinan')}
              />

              {/* Kebersihan */}
              <StatCard
                icon={Sparkles}
                title="Kebersihan"
                value={stats.kebersihan.total}
                max={stats.kebersihan.max}
                percentage={stats.kebersihan.percentage}
                trend={stats.kebersihan.trend}
                color="purple"
                onClick={() => handleCardClick('kebersihan')}
              />
            </>
          )}
        </div>

        {/* Chart - Area Chart Style */}
        {chartData && (
          <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">Periode Pertumbuhan</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></span>
                    Periode Ini: {chartData.labels.length}
                  </span>
                  <span className="ml-2 sm:ml-3 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-300 rounded-full"></span>
                    Periode Lalu: 0
                  </span>
                </p>
              </div>
              <select className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white">
                <option>{new Date().getFullYear()}/{new Date().getFullYear() + 1}</option>
              </select>
            </div>

            {/* Area Chart */}
            <div className="relative h-56 sm:h-64">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-gray-400">
                <span>60</span>
                <span>45</span>
                <span>30</span>
                <span>15</span>
                <span>0</span>
              </div>

              {/* Chart area */}
              <div className="ml-8 h-full relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-t border-gray-100"></div>
                  ))}
                </div>

                {/* Area chart with SVG */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  {/* Create area path */}
                  <path
                    d={(() => {
                      if (!chartData || chartData.labels.length === 0) return '';

                      const maxVal = 70; // Total max value
                      const points = chartData.labels.map((_, i) => {
                        const total = (chartData.ubudiyah[i] || 0) + (chartData.akhlaq[i] || 0) + (chartData.kedisiplinan[i] || 0) + (chartData.kebersihan[i] || 0);
                        const x = (i / Math.max(chartData.labels.length - 1, 1)) * 100;
                        const y = 100 - ((total / maxVal) * 100);
                        return { x, y };
                      });

                      if (points.length === 0) return '';

                      // Start path
                      let path = `M 0,100 L ${points[0].x},${points[0].y}`;

                      // Add points
                      for (let i = 1; i < points.length; i++) {
                        path += ` L ${points[i].x},${points[i].y}`;
                      }

                      // Close path
                      path += ` L 100,100 Z`;
                      return path;
                    })()}
                    fill="url(#areaGradient)"
                  />

                  {/* Line on top */}
                  <polyline
                    points={(() => {
                      if (!chartData || chartData.labels.length === 0) return '';

                      const maxVal = 70;
                      return chartData.labels.map((_, i) => {
                        const total = (chartData.ubudiyah[i] || 0) + (chartData.akhlaq[i] || 0) + (chartData.kedisiplinan[i] || 0) + (chartData.kebersihan[i] || 0);
                        const x = (i / Math.max(chartData.labels.length - 1, 1)) * 100;
                        const y = 100 - ((total / maxVal) * 100);
                        return `${x},${y}`;
                      }).join(' ');
                    })()}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="0.5"
                  />
                </svg>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-gray-500 pt-2 overflow-hidden">
                  {chartData.labels.map((label, i) => {
                    // Tampilkan label dengan interval untuk menghindari tumpang tindih
                    const totalLabels = chartData.labels.length;
                    const showLabel = totalLabels <= 10 || i % Math.ceil(totalLabels / 10) === 0 || i === totalLabels - 1;
                    
                    return (
                      <span 
                        key={i} 
                        className="text-center flex-shrink-0" 
                        style={{ 
                          width: `${100 / chartData.labels.length}%`,
                          opacity: showLabel ? 1 : 0
                        }}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {showDetailModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 p-5 rounded-t-3xl">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    {selectedCategory === 'ubudiyah' && <Church className="w-5 h-5 text-white" />}
                    {selectedCategory === 'akhlaq' && <Heart className="w-5 h-5 text-white" />}
                    {selectedCategory === 'kedisiplinan' && <Clock className="w-5 h-5 text-white" />}
                    {selectedCategory === 'kebersihan' && <Sparkles className="w-5 h-5 text-white" />}
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedCategory === 'ubudiyah' && 'Detail Ubudiyah'}
                    {selectedCategory === 'akhlaq' && 'Detail Akhlaq'}
                    {selectedCategory === 'kedisiplinan' && 'Detail Kedisiplinan'}
                    {selectedCategory === 'kebersihan' && 'Detail Kebersihan'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <span className="text-white text-xl">×</span>
                </button>
              </div>
              <p className="text-blue-100 text-xs ml-11">Rincian penilaian per indikator</p>
            </div>

            <div className="p-6 space-y-3">
              {getDetailItems().map((item, index) => {
                const deskripsi = indikatorMap[item.field]?.[item.value] || '';

                return (
                  <div key={index} className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-gray-800">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-800">{item.percentage}%</span>
                        <span className="text-xs text-gray-500">({item.value}/{item.max})</span>
                      </div>
                    </div>

                    {/* Deskripsi nilai */}
                    {deskripsi && (
                      <div className="mb-2 text-xs text-gray-500 italic">
                        {deskripsi}
                      </div>
                    )}

                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${selectedCategory === 'ubudiyah' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                          selectedCategory === 'akhlaq' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                            selectedCategory === 'kedisiplinan' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                              'bg-gradient-to-r from-purple-500 to-purple-600'
                          }`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-sm rounded-xl shadow-lg transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: IconComponent, title, value, max, percentage, trend, color, onClick }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number;
  max: number;
  percentage: number;
  trend: number;
  color: 'blue' | 'green' | 'orange' | 'purple';
  onClick: () => void;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
  };

  const bgClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    orange: 'bg-orange-50',
    purple: 'bg-purple-50',
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
  };

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-left w-full"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-10 h-10 ${bgClasses[color]} rounded-xl flex items-center justify-center`}>
          <IconComponent className={`w-5 h-5 ${iconColorClasses[color]}`} />
        </div>
        <span className="text-sm font-semibold text-gray-600">{title}</span>
      </div>

      <div className="mb-2">
        <div className="text-3xl font-bold text-gray-800">
          {percentage}<span className="text-xl text-gray-500">%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mb-2">
        <div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="text-xs text-gray-400 text-center">
        Tap untuk detail
      </div>
    </button>
  );
}
