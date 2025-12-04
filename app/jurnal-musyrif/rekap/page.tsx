'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Calendar, Users, FileText, Download, Eye } from 'lucide-react';

interface RekapData {
  id: string;
  tanggal: string;
  nama_musyrif: string;
  cabang: string;
  kelas: string;
  asrama: string;
  tahun_ajaran: string;
  semester: string;
  sesi_nama: string;
  jadwal_waktu: string;
  kegiatan_deskripsi: string;
  status_terlaksana: boolean;
  catatan: string;
}

export default function RekapJurnalMusyrifPage() {
  const [rekapList, setRekapList] = useState<RekapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    tanggal_start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    tanggal_end: new Date().toISOString().split('T')[0],
    nama_musyrif: '',
    cabang: '',
    kelas: '',
    asrama: '',
  });
  const [musyrifList, setMusyrifList] = useState<string[]>([]);
  const [cabangList, setCabangList] = useState<string[]>([]);
  const [showDetail, setShowDetail] = useState<string | null>(null);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchRekap();
  }, [filters]);

  const fetchFilters = async () => {
    const { data: musyrif } = await supabase
      .from('formulir_jurnal_musyrif_keasramaan')
      .select('nama_musyrif, cabang')
      .order('nama_musyrif');

    if (musyrif) {
      const uniqueMusyrif = [...new Set(musyrif.map(m => m.nama_musyrif))];
      const uniqueCabang = [...new Set(musyrif.map(m => m.cabang))];
      setMusyrifList(uniqueMusyrif);
      setCabangList(uniqueCabang);
    }
  };

  const fetchRekap = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('formulir_jurnal_musyrif_keasramaan')
        .select(`
          *,
          sesi:sesi_jurnal_musyrif_keasramaan(nama_sesi),
          jadwal:jadwal_jurnal_musyrif_keasramaan(jam_mulai, jam_selesai),
          kegiatan:kegiatan_jurnal_musyrif_keasramaan(deskripsi_kegiatan)
        `)
        .gte('tanggal', filters.tanggal_start)
        .lte('tanggal', filters.tanggal_end)
        .order('tanggal', { ascending: false })
        .order('nama_musyrif');

      if (filters.nama_musyrif) query = query.eq('nama_musyrif', filters.nama_musyrif);
      if (filters.cabang) query = query.eq('cabang', filters.cabang);
      if (filters.kelas) query = query.eq('kelas', filters.kelas);
      if (filters.asrama) query = query.eq('asrama', filters.asrama);

      const { data, error } = await query;

      if (error) throw error;

      const formatted = (data || []).map((item: any) => ({
        id: item.id,
        tanggal: item.tanggal,
        nama_musyrif: item.nama_musyrif,
        cabang: item.cabang,
        kelas: item.kelas,
        asrama: item.asrama,
        tahun_ajaran: item.tahun_ajaran,
        semester: item.semester,
        sesi_nama: item.sesi?.nama_sesi || '-',
        jadwal_waktu: item.jadwal ? `${item.jadwal.jam_mulai}-${item.jadwal.jam_selesai}` : '-',
        kegiatan_deskripsi: item.kegiatan?.deskripsi_kegiatan || '-',
        status_terlaksana: item.status_terlaksana,
        catatan: item.catatan || '',
      }));

      setRekapList(formatted);
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal memuat data rekap');
    } finally {
      setLoading(false);
    }
  };

  const groupByMusyrifAndDate = () => {
    const grouped: { [key: string]: RekapData[] } = {};
    rekapList.forEach(item => {
      const key = `${item.nama_musyrif}_${item.tanggal}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return grouped;
  };

  const calculateStats = (items: RekapData[]) => {
    const total = items.length;
    const terlaksana = items.filter(i => i.status_terlaksana).length;
    const rate = total > 0 ? Math.round((terlaksana / total) * 100) : 0;
    return { total, terlaksana, rate };
  };

  const exportToCSV = () => {
    const headers = ['Tanggal', 'Musyrif', 'Cabang', 'Kelas', 'Asrama', 'Sesi', 'Waktu', 'Kegiatan', 'Status', 'Catatan'];
    const rows = rekapList.map(item => [
      item.tanggal,
      item.nama_musyrif,
      item.cabang,
      item.kelas,
      item.asrama,
      item.sesi_nama,
      item.jadwal_waktu,
      item.kegiatan_deskripsi,
      item.status_terlaksana ? 'Terlaksana' : 'Tidak',
      item.catatan
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap-jurnal-musyrif-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const grouped = groupByMusyrifAndDate();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Rekap Jurnal Musyrif</h1>
                  <p className="text-gray-600">Lihat hasil inputan jurnal harian musyrif</p>
                </div>
              </div>
              <button
                onClick={exportToCSV}
                disabled={rekapList.length === 0}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                <input
                  type="date"
                  value={filters.tanggal_start}
                  onChange={(e) => setFilters({ ...filters, tanggal_start: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
                <input
                  type="date"
                  value={filters.tanggal_end}
                  onChange={(e) => setFilters({ ...filters, tanggal_end: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Musyrif</label>
                <select
                  value={filters.nama_musyrif}
                  onChange={(e) => setFilters({ ...filters, nama_musyrif: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Semua Musyrif</option>
                  {musyrifList.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cabang</label>
                <select
                  value={filters.cabang}
                  onChange={(e) => setFilters({ ...filters, cabang: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Semua Cabang</option>
                  {cabangList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                <input
                  type="text"
                  value={filters.kelas}
                  onChange={(e) => setFilters({ ...filters, kelas: e.target.value })}
                  placeholder="Contoh: Kelas 7"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asrama</label>
                <input
                  type="text"
                  value={filters.asrama}
                  onChange={(e) => setFilters({ ...filters, asrama: e.target.value })}
                  placeholder="Contoh: Asrama A"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Ditemukan <span className="font-bold text-green-600">{rekapList.length}</span> data jurnal
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data...</p>
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada data jurnal pada periode ini</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([key, items]) => {
                const stats = calculateStats(items);
                const firstItem = items[0];
                return (
                  <div key={key} className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white">{firstItem.nama_musyrif}</h3>
                        <p className="text-green-100 text-sm">
                          {firstItem.tanggal} • {firstItem.cabang} • {firstItem.kelas} • {firstItem.asrama}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-2xl">{stats.rate}%</div>
                        <div className="text-green-100 text-sm">{stats.terlaksana}/{stats.total} Kegiatan</div>
                      </div>
                    </div>
                    <div className="p-6">
                      <button
                        onClick={() => setShowDetail(showDetail === key ? null : key)}
                        className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-4"
                      >
                        <Eye className="w-4 h-4" />
                        {showDetail === key ? 'Sembunyikan Detail' : 'Lihat Detail'}
                      </button>
                      
                      {showDetail === key && (
                        <div className="space-y-3">
                          {items.filter(item => item.status_terlaksana).map((item, idx) => (
                            <div key={item.id} className="bg-green-50 border border-green-200 rounded-xl p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                  {idx + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                                      {item.sesi_nama}
                                    </span>
                                    <span className="text-xs text-gray-600">{item.jadwal_waktu}</span>
                                  </div>
                                  <p className="text-sm text-gray-800 mb-2">{item.kegiatan_deskripsi}</p>
                                  {item.catatan && (
                                    <div className="bg-white border border-green-200 rounded-lg p-2 mt-2">
                                      <p className="text-xs text-gray-600"><span className="font-semibold">Catatan:</span> {item.catatan}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
