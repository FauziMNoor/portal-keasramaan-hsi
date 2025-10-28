'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import StatsCards from './components/StatsCards';
import FilterSection from './components/FilterSection';
import TopSantriChart from './components/TopSantriChart';
import SantriTable from './components/SantriTable';
import { Filter as FilterIcon } from 'lucide-react';

export default function DashboardHabitTrackerPage() {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  const [filters, setFilters] = useState({
    tahun_ajaran: '',
    semester: '',
    lokasi: '',
    asrama: '',
    musyrif: '',
  });

  const [masterData, setMasterData] = useState({
    tahunAjaranList: [] as string[],
    semesterList: [] as string[],
    lokasiList: [] as string[],
    asramaList: [] as string[],
    musyrifList: [] as string[],
  });

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    const { data } = await supabase
      .from('formulir_habit_tracker_keasramaan')
      .select('tahun_ajaran, semester, lokasi, asrama, musyrif');

    if (data) {
      setMasterData({
        tahunAjaranList: [...new Set(data.map(d => d.tahun_ajaran).filter(Boolean))],
        semesterList: [...new Set(data.map(d => d.semester).filter(Boolean))],
        lokasiList: [...new Set(data.map(d => d.lokasi).filter(Boolean))],
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

      if (filters.lokasi) query = query.ilike('lokasi', filters.lokasi);
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

      return {
        ...student,
        rata_rata: total,
        predikat,
        trend: 'stable' as 'up' | 'down' | 'stable',
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
    const totalSantriDisiplin = santriList.filter(s => s.rata_rata / 70 > 0.357).length; // > 2.5 average per indicator
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

    // Musyrif terbaik (yang punya santri paling banyak dengan nilai baik)
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
      santriList,
    };
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Dashboard Habit Tracker</h1>
            <p className="text-gray-600">Monitoring dan analisis habit tracker santri</p>
          </div>

          {/* Filter Section */}
          <FilterSection 
            filters={filters}
            setFilters={setFilters}
            masterData={masterData}
            onLoad={loadDashboard}
            loading={loading}
          />

          {/* Stats Cards */}
          {dashboardData && <StatsCards data={dashboardData.stats} />}

          {/* Charts */}
          {dashboardData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <TopSantriChart data={dashboardData.topSantri} />
            </div>
          )}

          {/* Table */}
          {dashboardData && <SantriTable data={dashboardData.santriList} />}
        </div>
      </main>
    </div>
  );
}
