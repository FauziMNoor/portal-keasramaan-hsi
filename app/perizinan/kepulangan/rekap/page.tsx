'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, User, MapPin, Download, Filter } from 'lucide-react';

interface Perizinan {
  id: string;
  nis: string;
  nama_siswa: string;
  kelas: string;
  asrama: string;
  cabang: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  durasi_hari: number;
  alasan: string;
  status: string;
  approved_by_kepas: string | null;
  approved_by_kepsek: string | null;
}

export default function RekapPerizinan() {
  const [perizinanList, setPerizinanList] = useState<Perizinan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCabang, setFilterCabang] = useState('all');
  const [filterStatus, setFilterStatus] = useState('approved_kepsek');
  const [cabangList, setCabangList] = useState<string[]>([]);

  useEffect(() => {
    fetchCabang();
    fetchPerizinan();
  }, [filterCabang, filterStatus]);

  const fetchCabang = async () => {
    try {
      const { data } = await supabase
        .from('cabang_keasramaan')
        .select('cabang')
        .order('cabang');

      if (data) {
        setCabangList(data.map(item => item.cabang));
      }
    } catch (err) {
      console.error('Error fetching cabang:', err);
    }
  };

  const fetchPerizinan = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('perizinan_kepulangan_keasramaan')
        .select('*')
        .order('tanggal_mulai', { ascending: true });

      if (filterCabang !== 'all') {
        query = query.eq('cabang', filterCabang);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (data) {
        setPerizinanList(data);
      }
    } catch (err) {
      console.error('Error fetching perizinan:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysRemaining = (tanggalSelesai: string) => {
    const today = new Date();
    const endDate = new Date(tanggalSelesai);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { days: Math.abs(diffDays), status: 'overdue' };
    if (diffDays === 0) return { days: 0, status: 'today' };
    return { days: diffDays, status: 'upcoming' };
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Menunggu' },
      approved_kepas: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Disetujui Kepas' },
      approved_kepsek: { bg: 'bg-green-100', text: 'text-green-700', label: 'Disetujui' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Ditolak' },
    };

    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getDaysRemainingBadge = (tanggalSelesai: string) => {
    const { days, status } = calculateDaysRemaining(tanggalSelesai);
    
    if (status === 'overdue') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          Terlambat {days} hari
        </span>
      );
    }
    
    if (status === 'today') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
          Hari ini
        </span>
      );
    }
    
    if (days <= 3) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
          {days} hari lagi
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
        {days} hari lagi
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = ['NIS', 'Nama', 'Kelas', 'Asrama', 'Cabang', 'Tanggal Mulai', 'Tanggal Selesai', 'Durasi', 'Sisa Hari', 'Kategori', 'Alasan', 'Status'];
    
    const rows = perizinanList.map(item => {
      const { days, status } = calculateDaysRemaining(item.tanggal_selesai);
      const sisaHari = status === 'overdue' ? `-${days}` : days;
      
      return [
        item.nis,
        item.nama_siswa,
        item.kelas,
        item.asrama,
        item.cabang,
        new Date(item.tanggal_mulai).toLocaleDateString('id-ID'),
        new Date(item.tanggal_selesai).toLocaleDateString('id-ID'),
        item.durasi_hari,
        sisaHari,
        item.keperluan,
        item.alasan,
        item.status,
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rekap-perizinan-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Rekap Perizinan Kepulangan</h1>
            <p className="text-gray-600">Monitoring izin kepulangan santri dengan countdown dinamis</p>
          </div>

          {/* Filters & Export */}
          <div className="mb-6 flex flex-wrap gap-3">
            <select
              value={filterCabang}
              onChange={(e) => setFilterCabang(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Cabang</option>
              {cabangList.map(cabang => (
                <option key={cabang} value={cabang}>{cabang}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu Kepas</option>
              <option value="approved_kepas">Disetujui Kepas</option>
              <option value="approved_kepsek">Disetujui Kepsek</option>
              <option value="rejected">Ditolak</option>
            </select>

            <button
              onClick={exportToCSV}
              className="ml-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Izin</p>
                  <p className="text-3xl font-bold text-gray-800">{perizinanList.length}</p>
                </div>
                <Calendar className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktif</p>
                  <p className="text-3xl font-bold text-green-600">
                    {perizinanList.filter(p => {
                      const { status } = calculateDaysRemaining(p.tanggal_selesai);
                      return status === 'upcoming' || status === 'today';
                    }).length}
                  </p>
                </div>
                <Clock className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Terlambat</p>
                  <p className="text-3xl font-bold text-red-600">
                    {perizinanList.filter(p => {
                      const { status } = calculateDaysRemaining(p.tanggal_selesai);
                      return status === 'overdue';
                    }).length}
                  </p>
                </div>
                <Clock className="w-10 h-10 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Menunggu</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {perizinanList.filter(p => p.status === 'pending' || p.status === 'approved_kepas').length}
                  </p>
                </div>
                <User className="w-10 h-10 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : perizinanList.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Tidak ada data perizinan
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Santri</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Cabang</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Tanggal</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Durasi</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Sisa Waktu</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Keperluan</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Alasan</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perizinanList.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-800">{item.nama_siswa}</div>
                          <div className="text-xs text-gray-500">{item.nis} • {item.kelas}</div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{item.cabang}</td>
                        <td className="py-4 px-6 text-sm">
                          <div>{new Date(item.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                          <div className="text-xs text-gray-500">
                            s/d {new Date(item.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="font-semibold text-gray-800">{item.durasi_hari}</span>
                          <span className="text-xs text-gray-500"> hari</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {getDaysRemainingBadge(item.tanggal_selesai)}
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {item.keperluan}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate">
                          {item.alasan}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {getStatusBadge(item.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Keterangan Sisa Waktu:</h3>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• <span className="font-semibold">Biru:</span> Masih ada waktu lebih dari 3 hari</li>
              <li>• <span className="font-semibold">Kuning:</span> Tinggal 1-3 hari lagi</li>
              <li>• <span className="font-semibold">Orange:</span> Hari ini adalah hari terakhir</li>
              <li>• <span className="font-semibold">Merah:</span> Sudah terlambat kembali</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
