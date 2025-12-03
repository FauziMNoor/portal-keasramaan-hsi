'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, Users, Award, AlertCircle, BarChart3 } from 'lucide-react';

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

export default function DashboardPage() {
  const [rekapList, setRekapList] = useState<RekapSiswa[]>([]);
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
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-violet-700 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-violet-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Dashboard Catatan Perilaku</h1>
                <p className="text-base sm:text-lg text-violet-100">Rekap poin pelanggaran dan kebaikan santri</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cabang</label>
                <select
                  value={filters.cabang}
                  onChange={(e) => setFilters({ ...filters, cabang: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                <select
                  value={filters.kelas}
                  onChange={(e) => setFilters({ ...filters, kelas: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Asrama</label>
                <select
                  value={filters.asrama}
                  onChange={(e) => setFilters({ ...filters, asrama: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Semua Asrama</option>
                  {asramaList
                    .filter((a) => !filters.cabang || a.cabang === filters.cabang)
                    .filter((a) => !filters.kelas || a.kelas === filters.kelas)
                    .map((a) => (
                      <option key={a.id} value={a.asrama}>
                        {a.asrama}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-6 h-6" />
                <span className="text-3xl font-bold">{totalSiswa}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Total Santri</h3>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <AlertCircle className="w-6 h-6" />
                <span className="text-3xl font-bold">{totalPelanggaran}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Total Pelanggaran</h3>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <Award className="w-6 h-6" />
                <span className="text-3xl font-bold">{totalKebaikan}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Total Kebaikan</h3>
            </div>

            <div className={`bg-gradient-to-br ${totalPoin >= 0 ? 'from-indigo-500 to-indigo-600' : 'from-orange-500 to-orange-600'} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105`}>
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-6 h-6" />
                <span className="text-3xl font-bold">{totalPoin > 0 ? '+' : ''}{totalPoin}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Total Poin</h3>
            </div>
          </div>

          {/* Top 5 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 Terbaik */}
            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Top 5 Santri Terbaik</h2>
              </div>
              {top5Terbaik.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Belum ada data</p>
              ) : (
                <div className="space-y-3">
                  {top5Terbaik.map((siswa, index) => (
                    <div key={siswa.nis} className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-all">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                              'bg-gradient-to-br from-green-500 to-green-600'
                        }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{siswa.nama_siswa}</p>
                        <p className="text-xs text-gray-500">{siswa.kelas} - {siswa.asrama}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-green-600">+{siswa.total_poin}</p>
                        <p className="text-xs text-gray-500">{siswa.total_kebaikan} kebaikan</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top 5 Perlu Perhatian */}
            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Top 5 Perlu Perhatian</h2>
              </div>
              {top5Terburuk.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Belum ada data</p>
              ) : (
                <div className="space-y-3">
                  {top5Terburuk.map((siswa, index) => (
                    <div key={siswa.nis} className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100 hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center font-bold text-white shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{siswa.nama_siswa}</p>
                        <p className="text-xs text-gray-500">{siswa.kelas} - {siswa.asrama}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-red-600">{siswa.total_poin}</p>
                        <p className="text-xs text-gray-500">{siswa.total_pelanggaran} pelanggaran</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Full Table */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data...</p>
            </div>
          ) : rekapList.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
              Belum ada data catatan perilaku
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-violet-600 to-violet-700 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Peringkat</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Nama Santri</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Cabang/Kelas</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Pelanggaran</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Kebaikan</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Total Poin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekapList.map((siswa, index) => (
                      <tr key={siswa.nis} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold text-sm">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{siswa.nama_siswa}</p>
                          <p className="text-xs text-gray-500">{siswa.nis}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700 text-sm">
                          {siswa.cabang} - {siswa.kelas}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                            {siswa.total_pelanggaran}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            {siswa.total_kebaikan}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-bold ${siswa.total_poin >= 0
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-orange-100 text-orange-700'
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
          )}
        </div>
      </main>
    </div>
  );
}
