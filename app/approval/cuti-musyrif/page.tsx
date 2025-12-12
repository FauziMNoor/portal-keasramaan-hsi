'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { CheckCircle, XCircle, Clock, FileText, User, Calendar, AlertCircle } from 'lucide-react';

interface PengajuanCuti {
  id: string;
  nama_musyrif: string;
  cabang: string;
  asrama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jenis_libur: string;
  keterangan: string;
  musyrif_pengganti: string;
  status: string;
  approved_by_kepala_asrama: string | null;
  approved_by_kepala_sekolah: string | null;
  rejected_by: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export default function ApprovalCutiPage() {
  const [pengajuanList, setPengajuanList] = useState<PengajuanCuti[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPengajuan, setSelectedPengajuan] = useState<PengajuanCuti | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [cabangList, setCabangList] = useState<string[]>([]);

  // Filter
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterCabang, setFilterCabang] = useState('');

  useEffect(() => {
    fetchCabangList();
  }, []);

  useEffect(() => {
    fetchPengajuan();
  }, [filterStatus, filterCabang]);

  const fetchCabangList = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase
        .from('cabang_keasramaan')
        .select('nama_cabang')
        .order('nama_cabang');
      
      if (data && data.length > 0) {
        const cabangNames = data.map(c => c.nama_cabang);
        setCabangList(cabangNames);
      }
    } catch (error) {
      console.error('Error fetching cabang:', error);
    }
  };

  const fetchPengajuan = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filterStatus) params.append('status', filterStatus);
      if (filterCabang) params.append('cabang', filterCabang);

      const response = await fetch(`/api/kpi/jadwal-libur?${params}`);
      const result = await response.json();

      if (result.success) {
        // Filter only cuti/sakit/izin (exclude rutin)
        const filtered = (result.data || []).filter(
          (item: PengajuanCuti) => item.jenis_libur !== 'rutin'
        );
        setPengajuanList(filtered);
      }
    } catch (error) {
      console.error('Error fetching pengajuan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, level: 'kepala_asrama' | 'kepala_sekolah') => {
    if (!confirm(`Apakah Anda yakin ingin menyetujui pengajuan ini sebagai ${level === 'kepala_asrama' ? 'Kepala Asrama' : 'Kepala Sekolah'}?`)) {
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('/api/kpi/jadwal-libur/approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'approve',
          level,
          approved_by: 'Current User', // TODO: Get from session
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Pengajuan berhasil disetujui');
        fetchPengajuan();
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error: any) {
      alert('❌ Terjadi kesalahan: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPengajuan) return;
    if (!rejectionReason.trim()) {
      alert('Mohon isi alasan penolakan');
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('/api/kpi/jadwal-libur/approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPengajuan.id,
          action: 'reject',
          rejected_by: 'Current User', // TODO: Get from session
          rejection_reason: rejectionReason,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Pengajuan berhasil ditolak');
        setShowRejectModal(false);
        setSelectedPengajuan(null);
        setRejectionReason('');
        fetchPengajuan();
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error: any) {
      alert('❌ Terjadi kesalahan: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'approved_kepala_asrama': { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      'approved_kepala_sekolah': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    };

    const labels: Record<string, string> = {
      'pending': 'Menunggu Approval',
      'approved_kepala_asrama': 'Approved Kepala Asrama',
      'approved_kepala_sekolah': 'Approved',
      'rejected': 'Ditolak',
    };

    const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock };
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {labels[status] || status}
      </span>
    );
  };

  const getJenisLiburBadge = (jenis: string) => {
    const badges: Record<string, string> = {
      'cuti': 'bg-blue-100 text-blue-800',
      'sakit': 'bg-orange-100 text-orange-800',
      'izin': 'bg-cyan-100 text-cyan-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[jenis] || 'bg-gray-100 text-gray-800'}`}>
        {jenis.charAt(0).toUpperCase() + jenis.slice(1)}
      </span>
    );
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Approval Cuti Musyrif
        </h1>
        <p className="text-gray-600 mt-1">
          Kelola persetujuan cuti, sakit, dan izin musyrif
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Alur Approval</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li><strong>Musyrif</strong> mengajukan cuti/izin</li>
          <li><strong>Kepala Asrama</strong> menyetujui/menolak</li>
          <li><strong>Kepala Sekolah</strong> menyetujui/menolak (final)</li>
          <li>Jika disetujui, cuti terpakai akan otomatis terupdate</li>
        </ol>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="approved_kepala_asrama">Approved Kepala Asrama</option>
              <option value="approved_kepala_sekolah">Approved</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cabang
            </label>
            <select
              value={filterCabang}
              onChange={(e) => setFilterCabang(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Cabang</option>
              {cabangList.map((cabang) => (
                <option key={cabang} value={cabang}>{cabang}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List Pengajuan */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            Loading...
          </div>
        ) : pengajuanList.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            Tidak ada pengajuan cuti/izin
          </div>
        ) : (
          pengajuanList.map((pengajuan) => (
            <div key={pengajuan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{pengajuan.nama_musyrif}</h3>
                    <p className="text-sm text-gray-600">{pengajuan.asrama} - {pengajuan.cabang}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(pengajuan.status)}
                  {getJenisLiburBadge(pengajuan.jenis_libur)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(pengajuan.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(pengajuan.tanggal_selesai).toLocaleDateString('id-ID')}
                  </span>
                  <span className="font-semibold text-blue-600">
                    ({calculateDays(pengajuan.tanggal_mulai, pengajuan.tanggal_selesai)} hari)
                  </span>
                </div>

                {pengajuan.musyrif_pengganti && (
                  <div className="text-sm text-gray-600">
                    <strong>Pengganti:</strong> {pengajuan.musyrif_pengganti}
                  </div>
                )}
              </div>

              {pengajuan.keterangan && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Keterangan:</strong> {pengajuan.keterangan}
                  </p>
                </div>
              )}

              {pengajuan.status === 'rejected' && pengajuan.rejection_reason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Alasan Penolakan:</p>
                    <p className="text-sm text-red-700">{pengajuan.rejection_reason}</p>
                    <p className="text-xs text-red-600 mt-1">Ditolak oleh: {pengajuan.rejected_by}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {pengajuan.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(pengajuan.id, 'kepala_asrama')}
                      disabled={processing}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve (Kepala Asrama)
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPengajuan(pengajuan);
                        setShowRejectModal(true);
                      }}
                      disabled={processing}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300"
                    >
                      <XCircle className="w-4 h-4" />
                      Tolak
                    </button>
                  </>
                )}

                {pengajuan.status === 'approved_kepala_asrama' && (
                  <>
                    <button
                      onClick={() => handleApprove(pengajuan.id, 'kepala_sekolah')}
                      disabled={processing}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve (Kepala Sekolah)
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPengajuan(pengajuan);
                        setShowRejectModal(true);
                      }}
                      disabled={processing}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300"
                    >
                      <XCircle className="w-4 h-4" />
                      Tolak
                    </button>
                  </>
                )}

                {pengajuan.status === 'approved_kepala_sekolah' && (
                  <div className="text-sm text-green-600 font-medium">
                    ✅ Pengajuan telah disetujui
                  </div>
                )}

                {pengajuan.status === 'rejected' && (
                  <div className="text-sm text-red-600 font-medium">
                    ❌ Pengajuan telah ditolak
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedPengajuan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tolak Pengajuan</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Anda akan menolak pengajuan dari <strong>{selectedPengajuan.nama_musyrif}</strong>
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alasan Penolakan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="Jelaskan alasan penolakan..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedPengajuan(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={processing}
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300"
              >
                {processing ? 'Processing...' : 'Tolak Pengajuan'}
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
