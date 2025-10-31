'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import StatsCards from './components/StatsCards';
import FilterSection from './components/FilterSection';
import TopSantriChart from './components/TopSantriChart';
import TrendChart from './components/TrendChart';
import SantriTable from './components/SantriTable';
import HabitTrackerStats from '@/components/HabitTrackerStats';
import { Filter as FilterIcon } from 'lucide-react';

export default function DashboardHabitTrackerPage() {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  const [filters, setFilters] = useState({
    tahun_ajaran: '',
    semester: '',
    cabang: '',
    asrama: '',
    musyrif: '',
  });

  const [masterData, setMasterData] = useState({
    tahunAjaranList: [] as string[],
    semesterList: [] as string[],
    cabangList: [] as string[],
    asramaList: [] as string[],
    musyrifList: [] as string[],
  });

  const [allHabitData, setAllHabitData] = useState<any[]>([]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  // Filter musyrif berdasarkan cabang dan asrama menggunakan useMemo
  const filteredMusyrifList = useMemo(() => {
    if (allHabitData.length === 0) return masterData.musyrifList;

    if (filters.cabang || filters.asrama) {
      const filtered = allHabitData.filter(d => {
        const matchCabang = !filters.cabang || d.cabang === filters.cabang;
        const matchAsrama = !filters.asrama || d.asrama === filters.asrama;
        return matchCabang && matchAsrama && d.musyrif;
      });
      
      return [...new Set(filtered.map(d => d.musyrif).filter(Boolean))] as string[];
    }
    
    return masterData.musyrifList;
  }, [filters.cabang, filters.asrama, allHabitData, masterData.musyrifList]);

  const fetchMasterData = async () => {
    const { data } = await supabase
      .from('formulir_habit_tracker_keasramaan')
      .select('tahun_ajaran, semester, cabang, asrama, musyrif');

    if (data) {
      setAllHabitData(data);
      
      setMasterData({
        tahunAjaranList: [...new Set(data.map(d => d.tahun_ajaran).filter(Boolean))],
        semesterList: [...new Set(data.map(d => d.semester).filter(Boolean))],
        cabangList: [...new Set(data.map(d => d.cabang).filter(Boolean))],
        asramaList: [...new Set(data.map(d => d.asrama).filter(Boolean))],
        musyrifList: [...new Set(data.map(d => d.musyrif).filter(Boolean))],
      });
    }
  };

  const loadDashboard = async () => {
    if (!filters.tahun_ajaran || !filters.semester) {
      alert('Pilih Tahun Ajaran dan Semester terlebih dahulu!');
      return;
    }

    setLoading(true);
    try {
      // Fetch data from rekap view (reuse existing logic)
      let query = supabase
        .from('formulir_habit_tracker_keasramaan')
        .select('*')
        .ilike('semester', filters.semester)
        .ilike('tahun_ajaran', filters.tahun_ajaran);

      if (filters.cabang) query = query.ilike('cabang', filters.cabang);
      if (filters.asrama) query = query.ilike('asrama', filters.asrama);
      if (filters.musyrif) query = query.ilike('musyrif', filters.musyrif);

      const { data, error } = await query;

      if (error) throw error;
      if (!data || data.length === 0) {
        alert('Tidak ada data untuk filter yang dipilih');
        setLoading(false);
        return;
      }

      // Fetch foto data
      const nisList = [...new Set(data.map(d => d.nis))];
      const { data: siswaData } = await supabase
        .from('data_siswa_keasramaan')
        .select('nis, foto')
        .in('nis', nisList);

      const fotoMap: { [nis: string]: string } = {};
      siswaData?.forEach((siswa) => {
        fotoMap[siswa.nis] = siswa.foto || '';
      });

      // Process data
      const processedData = processHabitData(data, fotoMap);
      setDashboardData(processedData);
    } catch (error: any) {
      console.error('Error:', error);
      alert('Gagal memuat dashboard: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const processHabitData = (data: any[], fotoMap: { [nis: string]: string }) => {
    // Group by NIS and calculate averages
    const groupedData: { [nis: string]: any } = {};
    const weeklyData: { [week: string]: { ubudiyah: number[]; akhlaq: number[]; kedisiplinan: number[]; kebersihan: number[] } } = {};

    data.forEach((record) => {
      if (!groupedData[record.nis]) {
        groupedData[record.nis] = {
          nama_siswa: record.nama_siswa,
          nis: record.nis,
          kelas: record.kelas,
          asrama: record.asrama,
          musyrif: record.musyrif,
          foto: fotoMap[record.nis] || '',
          records: [],
        };
      }
      groupedData[record.nis].records.push(record);

      // Group by week for trend chart
      const date = new Date(record.tanggal);
      const weekNum = Math.ceil(date.getDate() / 7);
      const weekKey = `Minggu ${weekNum}`;
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { ubudiyah: [], akhlaq: [], kedisiplinan: [], kebersihan: [] };
      }

      const ubudiyah = (parseFloat(record.shalat_fardhu_berjamaah) || 0) + (parseFloat(record.tata_cara_shalat) || 0) + 
                      (parseFloat(record.qiyamul_lail) || 0) + (parseFloat(record.shalat_sunnah) || 0) + 
                      (parseFloat(record.puasa_sunnah) || 0) + (parseFloat(record.tata_cara_wudhu) || 0) + 
                      (parseFloat(record.sedekah) || 0) + (parseFloat(record.dzikir_pagi_petang) || 0);
      
      const akhlaq = (parseFloat(record.etika_dalam_tutur_kata) || 0) + (parseFloat(record.etika_dalam_bergaul) || 0) + 
                    (parseFloat(record.etika_dalam_berpakaian) || 0) + (parseFloat(record.adab_sehari_hari) || 0);
      
      const kedisiplinan = (parseFloat(record.waktu_tidur) || 0) + (parseFloat(record.pelaksanaan_piket_kamar) || 0) + 
                          (parseFloat(record.disiplin_halaqah_tahfidz) || 0) + (parseFloat(record.perizinan) || 0) + 
                          (parseFloat(record.belajar_malam) || 0) + (parseFloat(record.disiplin_berangkat_ke_masjid) || 0);
      
      const kebersihan = (parseFloat(record.kebersihan_tubuh_berpakaian_berpenampilan) || 0) + 
                        (parseFloat(record.kamar) || 0) + (parseFloat(record.ranjang_dan_almari) || 0);

      weeklyData[weekKey].ubudiyah.push(ubudiyah);
      weeklyData[weekKey].akhlaq.push(akhlaq);
      weeklyData[weekKey].kedisiplinan.push(kedisiplinan);
      weeklyData[weekKey].kebersihan.push(kebersihan);
    });

    // Calculate statistics
    const santriList = Object.values(groupedData).map((student: any) => {
      const records = student.records;
      const count = records.length;

      // Calculate average for each category
      const avg = (field: string) => {
        const values = records.map((r: any) => parseFloat(r[field]) || 0).filter((v: number) => v > 0);
        return values.length > 0 ? values.reduce((sum: number, val: number) => sum + val, 0) / values.length : 0;
      };

      const ubudiyah = avg('shalat_fardhu_berjamaah') + avg('tata_cara_shalat') + avg('qiyamul_lail') + 
                      avg('shalat_sunnah') + avg('puasa_sunnah') + avg('tata_cara_wudhu') + 
                      avg('sedekah') + avg('dzikir_pagi_petang');
      
      const akhlaq = avg('etika_dalam_tutur_kata') + avg('etika_dalam_bergaul') + 
                    avg('etika_dalam_berpakaian') + avg('adab_sehari_hari');
      
      const kedisiplinan = avg('waktu_tidur') + avg('pelaksanaan_piket_kamar') + 
                          avg('disiplin_halaqah_tahfidz') + avg('perizinan') + 
                          avg('belajar_malam') + avg('disiplin_berangkat_ke_masjid');
      
      const kebersihan = avg('kebersihan_tubuh_berpakaian_berpenampilan') + 
                        avg('kamar') + avg('ranjang_dan_almari');

      const total = ubudiyah + akhlaq + kedisiplinan + kebersihan;

      let predikat = 'Maqbul';
      if (total > 65) predikat = 'Mumtaz';
      else if (total > 60) predikat = 'Jayyid Jiddan';
      else if (total > 50) predikat = 'Jayyid';
      else if (total > 30) predikat = 'Dhaif';

      // Calculate trend data (weekly averages)
      const sortedRecords = records.sort((a: any, b: any) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
      const trendData: number[] = [];
      
      // Group by week
      const weeklyGroups: { [key: string]: any[] } = {};
      sortedRecords.forEach((record: any) => {
        const date = new Date(record.tanggal);
        const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
        if (!weeklyGroups[weekKey]) weeklyGroups[weekKey] = [];
        weeklyGroups[weekKey].push(record);
      });

      // Calculate weekly averages
      Object.values(weeklyGroups).forEach((weekRecords: any[]) => {
        const weekAvg = weekRecords.reduce((sum, r) => {
          const u = (parseFloat(r.shalat_fardhu_berjamaah) || 0) + (parseFloat(r.tata_cara_shalat) || 0) + 
                    (parseFloat(r.qiyamul_lail) || 0) + (parseFloat(r.shalat_sunnah) || 0) + 
                    (parseFloat(r.puasa_sunnah) || 0) + (parseFloat(r.tata_cara_wudhu) || 0) + 
                    (parseFloat(r.sedekah) || 0) + (parseFloat(r.dzikir_pagi_petang) || 0);
          
          const a = (parseFloat(r.etika_dalam_tutur_kata) || 0) + (parseFloat(r.etika_dalam_bergaul) || 0) + 
                    (parseFloat(r.etika_dalam_berpakaian) || 0) + (parseFloat(r.adab_sehari_hari) || 0);
          
          const k = (parseFloat(r.waktu_tidur) || 0) + (parseFloat(r.pelaksanaan_piket_kamar) || 0) + 
                    (parseFloat(r.disiplin_halaqah_tahfidz) || 0) + (parseFloat(r.perizinan) || 0) + 
                    (parseFloat(r.belajar_malam) || 0) + (parseFloat(r.disiplin_berangkat_ke_masjid) || 0);
          
          const kb = (parseFloat(r.kebersihan_tubuh_berpakaian_berpenampilan) || 0) + 
                     (parseFloat(r.kamar) || 0) + (parseFloat(r.ranjang_dan_almari) || 0);
          
          return sum + u + a + k + kb;
        }, 0) / weekRecords.length;
        
        trendData.push(weekAvg);
      });

      // Determine trend direction
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (trendData.length >= 2) {
        const firstHalf = trendData.slice(0, Math.floor(trendData.length / 2));
        const secondHalf = trendData.slice(Math.floor(trendData.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 2) trend = 'up';
        else if (secondAvg < firstAvg - 2) trend = 'down';
      }

      return {
        ...student,
        rata_rata: total,
        predikat,
        trend,
        trendData,
        ubudiyah,
        akhlaq,
        kedisiplinan,
        kebersihan,
      };
    });

    // Sort by rata_rata
    santriList.sort((a, b) => b.rata_rata - a.rata_rata);

    // Add ranking
    santriList.forEach((santri, index) => {
      santri.ranking = index + 1;
    });

    // Calculate stats
    const totalSantri = santriList.length;
    const totalSantriDisiplin = santriList.filter(s => s.rata_rata / 70 > 0.357).length;
    const rataRataNilai = santriList.reduce((sum, s) => sum + s.rata_rata, 0) / totalSantri;

    // Asrama terbaik
    const asramaStats: { [key: string]: { total: number; count: number } } = {};
    santriList.forEach(s => {
      if (!asramaStats[s.asrama]) {
        asramaStats[s.asrama] = { total: 0, count: 0 };
      }
      asramaStats[s.asrama].total += s.rata_rata;
      asramaStats[s.asrama].count += 1;
    });

    let asramaTerbaik = { nama: '-', nilai: 0 };
    Object.entries(asramaStats).forEach(([nama, stats]) => {
      const avg = stats.total / stats.count;
      if (avg > asramaTerbaik.nilai) {
        asramaTerbaik = { nama, nilai: avg };
      }
    });

    // Musyrif terbaik
    const musyrifStats: { [key: string]: number } = {};
    santriList.forEach(s => {
      if (s.rata_rata > 50) {
        musyrifStats[s.musyrif] = (musyrifStats[s.musyrif] || 0) + 1;
      }
    });

    let musyrifTerbaik = { nama: '-', jumlahSantri: 0 };
    Object.entries(musyrifStats).forEach(([nama, jumlah]) => {
      if (jumlah > musyrifTerbaik.jumlahSantri) {
        musyrifTerbaik = { nama, jumlahSantri: jumlah };
      }
    });

    // Prepare trend data
    const trendData = Object.entries(weeklyData).map(([week, values]) => ({
      periode: week,
      ubudiyah: Math.round(values.ubudiyah.reduce((a, b) => a + b, 0) / values.ubudiyah.length),
      akhlaq: Math.round(values.akhlaq.reduce((a, b) => a + b, 0) / values.akhlaq.length),
      kedisiplinan: Math.round(values.kedisiplinan.reduce((a, b) => a + b, 0) / values.kedisiplinan.length),
      kebersihan: Math.round(values.kebersihan.reduce((a, b) => a + b, 0) / values.kebersihan.length),
    }));

    // Prepare radar data (santri terbaik vs rata-rata)
    const topSantri = santriList[0];
    const avgUbudiyah = santriList.reduce((sum, s) => sum + s.ubudiyah, 0) / totalSantri;
    const avgAkhlaq = santriList.reduce((sum, s) => sum + s.akhlaq, 0) / totalSantri;
    const avgKedisiplinan = santriList.reduce((sum, s) => sum + s.kedisiplinan, 0) / totalSantri;
    const avgKebersihan = santriList.reduce((sum, s) => sum + s.kebersihan, 0) / totalSantri;

    const radarData = {
      santriTerbaik: [
        { kategori: 'Ubudiyah', nilai: topSantri?.ubudiyah || 0, maxNilai: 28 },
        { kategori: 'Akhlaq', nilai: topSantri?.akhlaq || 0, maxNilai: 12 },
        { kategori: 'Kedisiplinan', nilai: topSantri?.kedisiplinan || 0, maxNilai: 21 },
        { kategori: 'Kebersihan', nilai: topSantri?.kebersihan || 0, maxNilai: 9 },
      ],
      rataRataKelas: [
        { kategori: 'Ubudiyah', nilai: avgUbudiyah, maxNilai: 28 },
        { kategori: 'Akhlaq', nilai: avgAkhlaq, maxNilai: 12 },
        { kategori: 'Kedisiplinan', nilai: avgKedisiplinan, maxNilai: 21 },
        { kategori: 'Kebersihan', nilai: avgKebersihan, maxNilai: 9 },
      ],
    };

    return {
      stats: {
        totalSantriDisiplin,
        totalSantri,
        persentaseDisiplin: Math.round((totalSantriDisiplin / totalSantri) * 100),
        rataRataNilai,
        asramaTerbaik,
        musyrifTerbaik,
      },
      topSantri: santriList.slice(0, 10).map(s => ({
        nama: s.nama_siswa,
        nilai: Math.round(s.rata_rata),
      })),
      trendData,
      radarData,
      santriList,
    };
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-full mx-auto">
          {/* Header - Inspired by Main Dashboard */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl shadow-xl p-8 text-white mb-8">
            <div className="flex items-start gap-6">
              {/* Icon */}
              <div className="shrink-0">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">
                  Dashboard Habit Tracker
                </h1>
                <p className="text-xl text-green-100 mb-4">
                  Monitoring dan Analisis Komprehensif
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-100">Real-time Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-green-100">Performance Tracking</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-green-100">Multi-Category Insights</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <FilterSection 
            filters={filters}
            setFilters={setFilters}
            masterData={{...masterData, musyrifList: filteredMusyrifList}}
            onLoad={loadDashboard}
            loading={loading}
          />

          {/* Stats Cards */}
          {dashboardData && <StatsCards data={dashboardData.stats} />}

          {/* Charts Section - Professional Layout */}
          {dashboardData && (
            <>
              {/* Row 1: Top Santri & Trend Chart */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                <TopSantriChart data={dashboardData.topSantri} />
                <TrendChart data={dashboardData.trendData} />
              </div>

              {/* Row 2: Statistik Input Habit Tracker */}
              <div className="mb-6">
                <HabitTrackerStats filters={filters} />
              </div>
            </>
          )}

          {/* Table */}
          {dashboardData && <SantriTable data={dashboardData.santriList} />}
        </div>
      </main>
    </div>
  );
}
