'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { BarChart3, Calendar, Users, CheckCircle, TrendingUp, Clock } from 'lucide-react';

interface DashboardStats {
  totalJurnal: number;
  totalMusyrif: number;
  completionRate: number;
  todayJurnal: number;
}

interface MusyrifStats {
  nama_musyrif: string;
  total_kegiatan: number;
  kegiatan_terlaksana: number;
  completion_rate: number;
}

export default function DashboardJurnalMusyrifPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJurnal: 0,
    totalMusyrif: 0,
    completionRate: 0,
    todayJurnal: 0,
  });
  const [musyrifStats, setMusyrifStats] = useState<MusyrifStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch total jurnal
      const { data: jurnalData, count: totalJurnal } = await supabase
        .from('formulir_jurnal_musyrif_keasramaan')
        .select('*', { count: 'exact' })
        .gte('tanggal', dateRange.start)
        .lte('tanggal', dateRange.end);

      // Fetch today's jurnal
      const today = new Date().toISOString().split('T')[0];
      const { count: todayJurnal } = await supabase
        .from('formulir_jurnal_musyrif_keasramaan')
        .select('*', { count: 'exact' })
        .eq('tanggal', today);

      // Fetch unique musyrif
      const { data: musyrifData } = await supabase
        .from('formulir_jurnal_musyrif_keasramaan')
        .select('nama_musyrif')
        .gte('tanggal', dateRange.start)
        .lte('tanggal', dateRange.end);

      const uniqueMusyrif = [...new Set(musyrifData?.map(m => m.nama_musyrif) || [])];

      // Calculate completion rate
      const totalKegiatan = jurnalData?.length || 0;
      const kegiatanTerlaksana = jurnalData?.filter(j => j.status_terlaksana).length || 0;
      const completionRate = totalKegiatan > 0 ? (kegiatanTerlaksana / totalKegiatan) * 100 : 0;

      setStats({
        totalJurnal: totalJurnal || 0,
        totalMusyrif: uniqueMusyrif.length,
        completionRate: Math.round(completionRate),
        todayJurnal: todayJurnal || 0,
      });

      // Fetch musyrif stats
      const musyrifStatsData: MusyrifStats[] = [];
      for (const musyrif of uniqueMusyrif) {
        const { data } = await supabase
          .from('formulir_jurnal_musyrif_keasramaan')
          .select('status_terlaksana')
          .eq('nama_musyrif', musyrif)
          .gte('tanggal', dateRange.start)
          .lte('tanggal', dateRange.end);

        const total = data?.length || 0;
        const terlaksana = data?.filter(d => d.status_terlaksana).length || 0;
        const rate = total > 0 ? (terlaksana / total) * 100 : 0;

        musyrifStatsData.push({
          nama_musyrif: musyrif,
          total_kegiatan: total,
          kegiatan_terlaksana: terlaksana,
          completion_rate: Math.round(rate),
        });
      }

      setMusyrifStats(musyrifStatsData.sort((a, b) => b.completion_rate - a.completion_rate));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Jurnal Musyrif</h1>
                <p className="text-gray-600">Monitoring aktivitas harian musyrif</p>
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-semibold text-gray-700">Periode:</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full sm:w-auto">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                />
                <span className="text-gray-500 text-center sm:inline">—</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-xs sm:text-sm font-medium">Total Jurnal</span>
                    <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalJurnal}</p>
                  <p className="text-xs text-gray-500 mt-1">Kegiatan tercatat</p>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-xs sm:text-sm font-medium">Musyrif Aktif</span>
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalMusyrif}</p>
                  <p className="text-xs text-gray-500 mt-1">Musyrif yang input</p>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-xs sm:text-sm font-medium">Completion Rate</span>
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.completionRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">Kegiatan terlaksana</p>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 border-l-4 border-orange-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-xs sm:text-sm font-medium">Jurnal Hari Ini</span>
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.todayJurnal}</p>
                  <p className="text-xs text-gray-500 mt-1">Kegiatan hari ini</p>
                </div>
              </div>

              {/* Musyrif Performance Table */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 sm:px-6 py-3 sm:py-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Performa Musyrif</h2>
                  <p className="text-purple-100 text-xs sm:text-sm">Berdasarkan completion rate</p>
                </div>

                {/* Mobile Card View */}
                <div className="block lg:hidden">
                  {musyrifStats.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      Belum ada data jurnal pada periode ini
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {musyrifStats.map((musyrif, idx) => (
                        <div key={musyrif.nama_musyrif} className="p-4 hover:bg-gray-50">
                          <div className="flex items-start gap-3 mb-3">
                            <span className={`flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                              idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                              idx === 1 ? 'bg-gray-100 text-gray-700' :
                              idx === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{musyrif.nama_musyrif}</h3>
                              <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                                <span>Total: <strong className="text-gray-900">{musyrif.total_kegiatan}</strong></span>
                                <span>•</span>
                                <span>Selesai: <strong className="text-green-600">{musyrif.kegiatan_terlaksana}</strong></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className={`h-2.5 rounded-full transition-all ${
                                      musyrif.completion_rate >= 80 ? 'bg-green-500' :
                                      musyrif.completion_rate >= 60 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${musyrif.completion_rate}%` }}
                                  />
                                </div>
                                <span className="text-sm font-bold text-gray-700 min-w-[45px] text-right">{musyrif.completion_rate}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Musyrif</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Kegiatan</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Terlaksana</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {musyrifStats.map((musyrif, idx) => (
                        <tr key={musyrif.nama_musyrif} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                              idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                              idx === 1 ? 'bg-gray-100 text-gray-700' :
                              idx === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{musyrif.nama_musyrif}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-900">{musyrif.total_kegiatan}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-900">{musyrif.kegiatan_terlaksana}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    musyrif.completion_rate >= 80 ? 'bg-green-500' :
                                    musyrif.completion_rate >= 60 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${musyrif.completion_rate}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-700">{musyrif.completion_rate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {musyrifStats.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      Belum ada data jurnal pada periode ini
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
