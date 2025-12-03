'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  Calendar,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PerizinanStats {
  total_perizinan: number;
  pending: number;
  approved: number;
  rejected: number;
  belum_pulang: number;
  sudah_pulang: number;
  terlambat: number;
  total_perpanjangan: number;
  avg_durasi: number;
}

interface KeperluanStats {
  keperluan: string;
  jumlah: number;
  persentase: number;
  [key: string]: string | number;
}

interface TrendData {
  bulan: string;
  total: number;
  approved: number;
  rejected: number;
  [key: string]: string | number;
}

interface CabangStats {
  cabang: string;
  total: number;
  belum_pulang: number;
  sudah_pulang: number;
  terlambat: number;
  [key: string]: string | number;
}

export default function DashboardPerizinanPage() {
  const [stats, setStats] = useState<PerizinanStats | null>(null);
  const [keperluanStats, setKeperluanStats] = useState<KeperluanStats[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [cabangStats, setCabangStats] = useState<CabangStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cabang: '',
    tahun: new Date().getFullYear().toString(),
  });
  const [cabangList, setCabangList] = useState<any[]>([]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchMasterData = async () => {
    const { data: cabang } = await supabase
      .from('cabang_keasramaan')
      .select('*')
      .eq('status', 'aktif');

    setCabangList(cabang || []);
  };

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      let query = supabase.from('perizinan_kepulangan_keasramaan').select('*');

      if (filters.cabang) query = query.eq('cabang', filters.cabang);
      if (filters.tahun) {
        const startDate = `${filters.tahun}-01-01`;
        const endDate = `${filters.tahun}-12-31`;
        query = query.gte('tanggal_pengajuan', startDate).lte('tanggal_pengajuan', endDate);
      }

      const { data: perizinanData, error } = await query;

      if (error) throw error;

      // Calculate stats
      const total = perizinanData?.length || 0;
      const pending = perizinanData?.filter(p => p.status === 'pending').length || 0;
      const approved = perizinanData?.filter(p => p.status === 'approved_kepsek').length || 0;
      const rejected = perizinanData?.filter(p => p.status === 'rejected').length || 0;
      const belum_pulang = perizinanData?.filter(p => p.status_kepulangan === 'belum_pulang').length || 0;
      const sudah_pulang = perizinanData?.filter(p => p.status_kepulangan === 'sudah_pulang').length || 0;
      const terlambat = perizinanData?.filter(p => p.status_kepulangan === 'terlambat').length || 0;
      const total_perpanjangan = perizinanData?.filter(p => p.is_perpanjangan === true).length || 0;
      const avg_durasi = perizinanData?.reduce((sum, p) => sum + (p.durasi_hari || 0), 0) / total || 0;

      setStats({
        total_perizinan: total,
        pending,
        approved,
        rejected,
        belum_pulang,
        sudah_pulang,
        terlambat,
        total_perpanjangan,
        avg_durasi: Math.round(avg_durasi * 10) / 10,
      });

      // Keperluan stats
      const keperluanGroup = (perizinanData || []).reduce((acc: any, p: any) => {
        const keperluan = p.keperluan || 'Lainnya';
        acc[keperluan] = (acc[keperluan] || 0) + 1;
        return acc;
      }, {});

      const keperluanArray = Object.entries(keperluanGroup).map(([keperluan, jumlah]) => ({
        keperluan,
        jumlah: jumlah as number,
        persentase: Math.round(((jumlah as number) / total) * 100),
      }));

      keperluanArray.sort((a, b) => b.jumlah - a.jumlah);
      setKeperluanStats(keperluanArray);

      // Trend data (per bulan)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const trendByMonth = monthNames.map((bulan, index) => {
        const monthData = (perizinanData || []).filter((p: any) => {
          const month = new Date(p.tanggal_pengajuan).getMonth();
          return month === index;
        });

        return {
          bulan,
          total: monthData.length,
          approved: monthData.filter((p: any) => p.status === 'approved_kepsek').length,
          rejected: monthData.filter((p: any) => p.status === 'rejected').length,
        };
      });

      setTrendData(trendByMonth);

      // Cabang stats
      const cabangGroup = (perizinanData || []).reduce((acc: any, p: any) => {
        const cabang = p.cabang || 'Tidak Ada Cabang';
        if (!acc[cabang]) {
          acc[cabang] = {
            cabang,
            total: 0,
            belum_pulang: 0,
            sudah_pulang: 0,
            terlambat: 0,
          };
        }
        acc[cabang].total++;
        if (p.status_kepulangan === 'belum_pulang') acc[cabang].belum_pulang++;
        if (p.status_kepulangan === 'sudah_pulang') acc[cabang].sudah_pulang++;
        if (p.status_kepulangan === 'terlambat') acc[cabang].terlambat++;
        return acc;
      }, {});

      const cabangArray = Object.values(cabangGroup) as CabangStats[];
      cabangArray.sort((a, b) => b.total - a.total);
      setCabangStats(cabangArray);

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    primary: '#3b82f6',    // blue-500
    success: '#10b981',    // green-500
    warning: '#f59e0b',    // amber-500
    danger: '#ef4444',     // red-500
    purple: '#8b5cf6',     // purple-500
    teal: '#14b8a6',       // teal-500
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Memuat data dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard Perizinan Kepulangan</h1>
                <p className="text-sm sm:text-base text-gray-600">Analisis dan statistik perizinan kepulangan santri</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cabang</label>
                  <select
                    value={filters.cabang}
                    onChange={(e) => setFilters({ ...filters, cabang: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Semua Cabang</option>
                    {cabangList.map((c) => (
                      <option key={c.id} value={c.nama_cabang}>{c.nama_cabang}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tahun</label>
                  <select
                    value={filters.tahun}
                    onChange={(e) => setFilters({ ...filters, tahun: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[2024, 2025, 2026, 2027].map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards - Row 1: Status Perizinan */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Status Perizinan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Perizinan */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold">{stats?.total_perizinan || 0}</span>
                </div>
                <h3 className="text-sm font-medium opacity-90">Total Perizinan</h3>
              </div>

              {/* Pending */}
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold">{stats?.pending || 0}</span>
                </div>
                <h3 className="text-sm font-medium opacity-90">Menunggu Approval</h3>
              </div>

              {/* Approved */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold">{stats?.approved || 0}</span>
                </div>
                <h3 className="text-sm font-medium opacity-90">Disetujui</h3>
              </div>

              {/* Rejected */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold">{stats?.rejected || 0}</span>
                </div>
                <h3 className="text-sm font-medium opacity-90">Ditolak</h3>
              </div>
            </div>
          </div>

          {/* Stats Cards - Row 2: Status Kepulangan */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Status Kepulangan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Belum Pulang */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold">{stats?.belum_pulang || 0}</span>
                </div>
                <h3 className="text-sm font-medium opacity-90">Belum Pulang</h3>
              </div>

              {/* Sudah Pulang */}
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold">{stats?.sudah_pulang || 0}</span>
                </div>
                <h3 className="text-sm font-medium opacity-90">Sudah Pulang</h3>
              </div>

              {/* Terlambat */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold">{stats?.terlambat || 0}</span>
                </div>
                <h3 className="text-sm font-medium opacity-90">Terlambat</h3>
              </div>

              {/* Perpanjangan */}
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold">{stats?.total_perpanjangan || 0}</span>
                </div>
                <h3 className="text-sm font-medium opacity-90">Perpanjangan</h3>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Trend Perizinan per Bulan */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Trend Perizinan per Bulan</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="bulan" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    name="Total"
                    dot={{ fill: COLORS.primary, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="approved"
                    stroke={COLORS.success}
                    strokeWidth={2}
                    name="Disetujui"
                    dot={{ fill: COLORS.success, r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rejected"
                    stroke={COLORS.danger}
                    strokeWidth={2}
                    name="Ditolak"
                    dot={{ fill: COLORS.danger, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Distribusi Keperluan */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Distribusi Keperluan</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={keperluanStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ keperluan, persentase }) => `${keperluan}: ${persentase}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="jumlah"
                  >
                    {keperluanStats.map((entry, index) => {
                      const colors = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.purple, COLORS.teal];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* Status Kepulangan per Cabang */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Status Kepulangan per Cabang</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cabangStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="cabang" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="belum_pulang" fill={COLORS.purple} name="Belum Pulang" />
                  <Bar dataKey="sudah_pulang" fill={COLORS.success} name="Sudah Pulang" />
                  <Bar dataKey="terlambat" fill={COLORS.danger} name="Terlambat" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Informasi Ringkasan</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Rata-rata Durasi Izin</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.avg_durasi || 0} Hari</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Tingkat Approval</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.total_perizinan ? Math.round((stats.approved / stats.total_perizinan) * 100) : 0}%
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Tingkat Keterlambatan</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.total_perizinan ? Math.round((stats.terlambat / stats.total_perizinan) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

