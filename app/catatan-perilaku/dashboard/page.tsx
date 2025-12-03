'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, Users, Award, AlertCircle, BarChart3, Target, Trophy } from 'lucide-react';

interface RekapSiswa {
  nis: string;
  nama_siswa: string;
  cabang: string;
  kelas: string;
  asrama: string;
  total_pelanggaran: number;
  total_kebaikan: number;
  total_poin: number;
}

interface LevelDampakStats {
  nama_level: string;
  jumlah: number;
  total_poin: number;
  persentase: number;
}

export default function DashboardPage() {
  const [rekapList, setRekapList] = useState<RekapSiswa[]>([]);
  const [levelDampakStats, setLevelDampakStats] = useState<LevelDampakStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cabang: '',
    kelas: '',
    asrama: '',
  });
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [asramaList, setAsramaList] = useState<any[]>([]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchRekap();
  }, [filters]);

  const fetchMasterData = async () => {
    const [cabang, kelas, asrama] = await Promise.all([
      supabase.from('cabang_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('kelas_keasramaan').select('*').eq('status', 'aktif'),
      supabase.from('asrama_keasramaan').select('*').eq('status', 'aktif'),
    ]);

    setCabangList(cabang.data || []);
    setKelasList(kelas.data || []);
    setAsramaList(asrama.data || []);
  };

  const fetchRekap = async () => {
    setLoading(true);

    try {
      let query = supabase.from('catatan_perilaku_keasramaan').select('*');

      if (filters.cabang) query = query.eq('cabang', filters.cabang);
      if (filters.kelas) query = query.eq('kelas', filters.kelas);
      if (filters.asrama) query = query.eq('asrama', filters.asrama);

      const { data: catatanData, error } = await query;

      if (error) throw error;

      // Group by siswa
      const grouped = (catatanData || []).reduce((acc: any, catatan: any) => {
        if (!acc[catatan.nis]) {
          acc[catatan.nis] = {
            nis: catatan.nis,
            nama_siswa: catatan.nama_siswa,
            cabang: catatan.cabang,
            kelas: catatan.kelas,
            asrama: catatan.asrama,
            total_pelanggaran: 0,
            total_kebaikan: 0,
            total_poin: 0,
          };
        }

        if (catatan.tipe === 'pelanggaran') {
          acc[catatan.nis].total_pelanggaran++;
        } else {
          acc[catatan.nis].total_kebaikan++;
        }
        acc[catatan.nis].total_poin += catatan.poin;

        return acc;
      }, {});

      const rekapArray = Object.values(grouped) as RekapSiswa[];
      rekapArray.sort((a, b) => b.total_poin - a.total_poin);

      setRekapList(rekapArray);

      // Calculate level dampak stats
      const pelanggaranData = (catatanData || []).filter((c: any) => c.tipe === 'pelanggaran' && c.level_dampak);
      const levelStats: { [key: string]: { jumlah: number; total_poin: number } } = {};

      pelanggaranData.forEach((catatan: any) => {
        const level = catatan.level_dampak || 'Tidak Ada Level';
        if (!levelStats[level]) {
          levelStats[level] = { jumlah: 0, total_poin: 0 };
        }
        levelStats[level].jumlah++;
        levelStats[level].total_poin += Math.abs(catatan.poin);
      });

      const totalPelanggaran = pelanggaranData.length;
      const levelStatsArray: LevelDampakStats[] = Object.entries(levelStats).map(([nama_level, stats]) => ({
        nama_level,
        jumlah: stats.jumlah,
        total_poin: stats.total_poin,
        persentase: totalPelanggaran > 0 ? Math.round((stats.jumlah / totalPelanggaran) * 100) : 0,
      }));

      // Sort by jumlah descending
      levelStatsArray.sort((a, b) => b.jumlah - a.jumlah);
      setLevelDampakStats(levelStatsArray);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSiswa = rekapList.length;
  const totalPelanggaran = rekapList.reduce((sum, s) => sum + s.total_pelanggaran, 0);
  const totalKebaikan = rekapList.reduce((sum, s) => sum + s.total_kebaikan, 0);
  const totalPoin = rekapList.reduce((sum, s) => sum + s.total_poin, 0);

  const top5Terbaik = rekapList.slice(0, 5);
  const top5Terburuk = [...rekapList].reverse().slice(0, 5);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header - Golden Vibrant */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* Icon */}
              <div className="shrink-0 mx-auto sm:mx-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-600" strokeWidth={2} />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                  Dashboard Catatan Perilaku
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-yellow-100 mb-3 sm:mb-4">
                  Monitoring dan Analisis Komprehensif Perilaku Santri
                </p>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm">
                    <Target className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                    <span className="text-yellow-50">Real-time Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                    <span className="text-yellow-50">Performance Tracking</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm">
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                    <span className="text-yellow-50">Comprehensive Insights</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters - Clean Modern */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Filter Dashboard</h2>
                <p className="text-xs text-gray-500">Pilih kriteria untuk menyaring data</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cabang</label>
                <select
                  value={filters.cabang}
                  onChange={(e) => setFilters({ ...filters, cabang: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:bg-white transition-all text-gray-700 font-medium"
                >
                  <option value="">Semua Cabang</option>
                  {cabangList.map((c) => (
                    <option key={c.id} value={c.nama_cabang}>
                      {c.nama_cabang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
                <select
                  value={filters.kelas}
                  onChange={(e) => setFilters({ ...filters, kelas: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:bg-white transition-all text-gray-700 font-medium"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Asrama</label>
                <select
                  value={filters.asrama}
                  onChange={(e) => setFilters({ ...filters, asrama: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:bg-white transition-all text-gray-700 font-medium"
                >
                  <option value="">Semua Asrama</option>
                  {asramaList
                    .filter((a: any) => !filters.cabang || (a.nama_cabang || a.cabang) === filters.cabang)
                    .filter((a: any) => !filters.kelas || a.kelas === filters.kelas)
                    .map((a: any) => (
                      <option key={a.id} value={a.nama_asrama || a.asrama}>
                        {a.nama_asrama || a.asrama}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards - Consistent Style with Yellow Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Santri */}
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold">{totalSiswa}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Total Santri</h3>
            </div>

            {/* Total Pelanggaran */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold">{totalPelanggaran}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Total Pelanggaran</h3>
            </div>

            {/* Total Kebaikan */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold">{totalKebaikan}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Total Kebaikan</h3>
            </div>

            {/* Total Poin */}
            <div className={`${totalPoin >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'} rounded-2xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl transition-all hover:scale-105`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {totalPoin >= 0 ? (
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </div>
                <span className="text-2xl sm:text-3xl font-bold">{totalPoin > 0 ? '+' : ''}{totalPoin}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Total Poin</h3>
            </div>
          </div>

          {/* Level Dampak Breakdown - Eye Catching Section */}
          {levelDampakStats.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Level Dampak</h2>
                  <p className="text-sm text-gray-500">Distribusi pelanggaran berdasarkan tingkat keseriusan</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {levelDampakStats.map((level, index) => {
                  // Dynamic colors based on level name
                  let gradientClass = 'from-gray-500 to-gray-600';
                  let iconBg = 'bg-gray-100';
                  let iconColor = 'text-gray-600';

                  if (level.nama_level.toLowerCase().includes('ringan')) {
                    gradientClass = 'from-yellow-400 to-yellow-500';
                    iconBg = 'bg-yellow-50';
                    iconColor = 'text-yellow-600';
                  } else if (level.nama_level.toLowerCase().includes('sedang')) {
                    gradientClass = 'from-orange-500 to-orange-600';
                    iconBg = 'bg-orange-50';
                    iconColor = 'text-orange-600';
                  } else if (level.nama_level.toLowerCase().includes('berat')) {
                    gradientClass = 'from-red-500 to-red-600';
                    iconBg = 'bg-red-50';
                    iconColor = 'text-red-600';
                  } else if (level.nama_level.toLowerCase().includes('sangat')) {
                    gradientClass = 'from-purple-600 to-red-700';
                    iconBg = 'bg-purple-50';
                    iconColor = 'text-purple-700';
                  }

                  return (
                    <div key={index} className="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                      {/* Percentage Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${gradientClass} text-white shadow-md`}>
                          {level.persentase}%
                        </span>
                      </div>

                      {/* Icon */}
                      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <AlertCircle className={`w-6 h-6 ${iconColor}`} strokeWidth={2.5} />
                      </div>

                      {/* Level Name */}
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{level.nama_level}</h3>

                      {/* Stats */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Jumlah:</span>
                          <span className="text-lg font-bold text-gray-800">{level.jumlah}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Total Poin:</span>
                          <span className="text-sm font-bold text-red-600">-{level.total_poin}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-500`}
                            style={{ width: `${level.persentase}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top 5 - Premium Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 Terbaik */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Top 5 Santri Terbaik</h2>
                  <p className="text-sm text-gray-500">Peringkat berdasarkan total poin</p>
                </div>
              </div>
              {top5Terbaik.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Belum ada data</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {top5Terbaik.map((siswa, index) => (
                    <div key={siswa.nis} className="group flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-xl border border-green-200 hover:shadow-lg hover:border-green-300 transition-all duration-300">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-md group-hover:scale-110 transition-transform ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                        index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                            'bg-gradient-to-br from-green-500 to-emerald-500'
                        }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate text-base">{siswa.nama_siswa}</p>
                        <p className="text-sm text-gray-500">{siswa.kelas} • {siswa.asrama}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold text-green-600">+{siswa.total_poin}</p>
                        <p className="text-xs text-gray-500 font-medium">{siswa.total_kebaikan} kebaikan</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top 5 Perlu Perhatian */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingDown className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Top 5 Perlu Perhatian</h2>
                  <p className="text-sm text-gray-500">Santri dengan poin terendah</p>
                </div>
              </div>
              {top5Terburuk.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Belum ada data</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {top5Terburuk.map((siswa, index) => (
                    <div key={siswa.nis} className="group flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 via-pink-50 to-red-50 rounded-xl border border-red-200 hover:shadow-lg hover:border-red-300 transition-all duration-300">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center font-bold text-white shrink-0 shadow-md group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate text-base">{siswa.nama_siswa}</p>
                        <p className="text-sm text-gray-500">{siswa.kelas} • {siswa.asrama}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold text-red-600">{siswa.total_poin}</p>
                        <p className="text-xs text-gray-500 font-medium">{siswa.total_pelanggaran} pelanggaran</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Full Table */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data...</p>
            </div>
          ) : rekapList.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-gray-500">
              Belum ada data catatan perilaku
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">Rank</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">Nama Santri</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">Cabang/Kelas</th>
                        <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wide">Pelanggaran</th>
                        <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wide">Kebaikan</th>
                        <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wide">Total Poin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rekapList.map((siswa, index) => (
                        <tr key={siswa.nis} className="hover:bg-yellow-50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm shadow-sm ${index < 3
                                ? 'bg-gradient-to-br from-yellow-500 to-yellow-700 text-white'
                                : 'bg-gray-100 text-gray-600'
                                }`}>
                                {index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-gray-800 text-base">{siswa.nama_siswa}</p>
                              <p className="text-xs text-gray-500 font-medium">{siswa.nis}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="font-semibold text-gray-700">{siswa.cabang}</p>
                              <p className="text-gray-500">{siswa.kelas}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-bold">
                              {siswa.total_pelanggaran}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                              {siswa.total_kebaikan}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-4 py-2 rounded-lg text-base font-bold shadow-sm ${siswa.total_poin >= 0
                              ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                              : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700'
                              }`}>
                              {siswa.total_poin > 0 ? '+' : ''}{siswa.total_poin}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {rekapList.map((siswa, index) => (
                  <div key={siswa.nis} className="bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-lg transition-all">
                    {/* Header with Rank and Name */}
                    <div className="flex items-start gap-3 mb-3 pb-3 border-b border-gray-100">
                      <span className={`inline-flex items-center justify-center w-12 h-12 rounded-lg font-bold text-base shadow-sm shrink-0 ${index < 3
                        ? 'bg-gradient-to-br from-yellow-500 to-yellow-700 text-white'
                        : 'bg-gray-100 text-gray-600'
                        }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-base truncate">{siswa.nama_siswa}</p>
                        <p className="text-xs text-gray-500 font-medium">{siswa.nis}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold text-gray-700">{siswa.cabang}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{siswa.kelas}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Pelanggaran</p>
                        <span className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-bold">
                          {siswa.total_pelanggaran}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Kebaikan</p>
                        <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                          {siswa.total_kebaikan}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Total Poin</p>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm ${siswa.total_poin >= 0
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                          : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700'
                          }`}>
                          {siswa.total_poin > 0 ? '+' : ''}{siswa.total_poin}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
