'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, FileText, Edit2, Trash2, X, Save, Calendar, MapPin, Phone, User as UserIcon } from 'lucide-react';

interface Perizinan {
  id: string;
  nis: string;
  nama_siswa: string;
  kelas: string;
  asrama: string;
  cabang: string;
  tanggal_pengajuan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  durasi_hari: number;
  alasan: string;
  keperluan: string;
  alamat_tujuan: string;
  no_hp_wali: string;
  status: string;
  approved_by_kepas: string | null;
  approved_at_kepas: string | null;
  catatan_kepas: string | null;
  approved_by_kepsek: string | null;
  approved_at_kepsek: string | null;
  catatan_kepsek: string | null;
}

export default function ApprovalPerizinan() {
  const [perizinanList, setPerizinanList] = useState<Perizinan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerizinan, setSelectedPerizinan] = useState<Perizinan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'view'>('view');
  const [catatan, setCatatan] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [userCabang, setUserCabang] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form data untuk edit
  const [editFormData, setEditFormData] = useState({
    tanggal_mulai: '',
    tanggal_selesai: '',
    keperluan: '',
    alasan: '',
    alamat_tujuan: '',
    no_hp_wali: '',
  });

  useEffect(() => {
    fetchUserInfo();
    fetchPerizinan();
  }, [filterStatus]);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.user?.role || '');
        setUserName(data.user?.nama_lengkap || data.user?.nama || '');
        
        if (data.user?.role === 'kepala_asrama') {
          setUserCabang(data.user?.cabang || '');
        }
      }
    } catch (error) {
      console.error('Fetch user error:', error);
    }
  };

  const fetchPerizinan = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('perizinan_kepulangan_keasramaan')
        .select('*')
        .order('tanggal_pengajuan', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      if (userRole === 'kepala_asrama' && userCabang) {
        query = query.eq('cabang', userCabang);
      }

      const { data } = await query;

      if (data) {
        setPerizinanList(data);
      }
    } catch (err) {
      console.error('Error fetching perizinan:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (perizinan: Perizinan, action: 'approve' | 'reject' | 'view') => {
    setSelectedPerizinan(perizinan);
    setActionType(action);
    setCatatan('');
    setShowModal(true);
  };

  const openEditModal = (perizinan: Perizinan) => {
    setSelectedPerizinan(perizinan);
    setEditFormData({
      tanggal_mulai: perizinan.tanggal_mulai,
      tanggal_selesai: perizinan.tanggal_selesai,
      keperluan: perizinan.keperluan,
      alasan: perizinan.alasan,
      alamat_tujuan: perizinan.alamat_tujuan,
      no_hp_wali: perizinan.no_hp_wali,
    });
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!selectedPerizinan) return;

    try {
      const { error } = await supabase
        .from('perizinan_kepulangan_keasramaan')
        .update(editFormData)
        .eq('id', selectedPerizinan.id);

      if (error) throw error;

      alert('✅ Data perizinan berhasil diupdate!');
      setShowEditModal(false);
      fetchPerizinan();
    } catch (err: any) {
      alert('❌ Gagal update: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('⚠️ Yakin ingin menghapus perizinan ini? Data tidak dapat dikembalikan!')) return;

    try {
      const { error } = await supabase
        .from('perizinan_kepulangan_keasramaan')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('✅ Perizinan berhasil dihapus!');
      fetchPerizinan();
    } catch (err: any) {
      alert('❌ Gagal menghapus: ' + err.message);
    }
  };

  const handleApproval = async () => {
    if (!selectedPerizinan) return;

    const isKepas = userRole === 'kepala_asrama';
    const isKepsek = userRole === 'admin' || userRole === 'kepala_sekolah';

    let updateData: any = {};

    if (isKepas) {
      if (actionType === 'approve') {
        updateData = {
          status: 'approved_kepas',
          approved_by_kepas: userName,
          approved_at_kepas: new Date().toISOString(),
          catatan_kepas: catatan,
        };
      } else {
        updateData = {
          status: 'rejected',
          approved_by_kepas: userName,
          approved_at_kepas: new Date().toISOString(),
          catatan_kepas: catatan,
        };
      }
    } else if (isKepsek) {
      if (actionType === 'approve') {
        updateData = {
          status: 'approved_kepsek',
          approved_by_kepsek: userName,
          approved_at_kepsek: new Date().toISOString(),
          catatan_kepsek: catatan,
        };
      } else {
        updateData = {
          status: 'rejected',
          approved_by_kepsek: userName,
          approved_at_kepsek: new Date().toISOString(),
          catatan_kepsek: catatan,
        };
      }
    }

    try {
      const { error } = await supabase
        .from('perizinan_kepulangan_keasramaan')
        .update(updateData)
        .eq('id', selectedPerizinan.id);

      if (error) throw error;

      alert(`✅ Perizinan berhasil ${actionType === 'approve' ? 'disetujui' : 'ditolak'}`);
      setShowModal(false);
      fetchPerizinan();
    } catch (err: any) {
      alert('❌ Gagal memproses: ' + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Menunggu Kepas' },
      approved_kepas: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Menunggu Kepsek' },
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

  const canApprove = (perizinan: Perizinan) => {
    if (userRole === 'kepala_asrama' && perizinan.status === 'pending') return true;
    if ((userRole === 'admin' || userRole === 'kepala_sekolah') && perizinan.status === 'approved_kepas') return true;
    return false;
  };

  const canEdit = (perizinan: Perizinan) => {
    // Kepala Asrama dan Kepala Sekolah bisa edit perizinan yang belum disetujui penuh
    if (userRole === 'kepala_asrama' || userRole === 'kepala_sekolah' || userRole === 'admin') {
      return perizinan.status !== 'approved_kepsek';
    }
    return false;
  };

  const canDelete = (perizinan: Perizinan) => {
    // Hanya Kepala Sekolah/Admin yang bisa delete
    if (userRole === 'kepala_sekolah' || userRole === 'admin') {
      return true;
    }
    return false;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Approval Perizinan Kepulangan</h1>
            <p className="text-gray-600">Kelola persetujuan izin kepulangan santri</p>
          </div>

          {/* Filter */}
          <div className="mb-6 flex gap-3 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Menunggu Kepas
            </button>
            <button
              onClick={() => setFilterStatus('approved_kepas')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterStatus === 'approved_kepas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Menunggu Kepsek
            </button>
            <button
              onClick={() => setFilterStatus('approved_kepsek')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterStatus === 'approved_kepsek'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Disetujui
            </button>
          </div>

          {/* List */}
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
                  <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold">Santri</th>
                      <th className="text-left py-4 px-6 font-semibold">Tanggal</th>
                      <th className="text-left py-4 px-6 font-semibold">Durasi</th>
                      <th className="text-left py-4 px-6 font-semibold">Keperluan</th>
                      <th className="text-center py-4 px-6 font-semibold">Status</th>
                      <th className="text-center py-4 px-6 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perizinanList.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-800">{item.nama_siswa}</div>
                          <div className="text-xs text-gray-500">{item.nis} • {item.kelas}</div>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <div>{new Date(item.tanggal_mulai).toLocaleDateString('id-ID')}</div>
                          <div className="text-xs text-gray-500">
                            s/d {new Date(item.tanggal_selesai).toLocaleDateString('id-ID')}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm font-semibold">{item.durasi_hari} hari</td>
                        <td className="py-4 px-6 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {item.keperluan}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            {canApprove(item) && (
                              <>
                                <button
                                  onClick={() => openModal(item, 'approve')}
                                  className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                                  title="Setujui"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openModal(item, 'reject')}
                                  className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                                  title="Tolak"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => openModal(item, 'view')}
                              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                              title="Lihat Detail"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            {canEdit(item) && (
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-600 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete(item) && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Detail/Approval */}
      {showModal && selectedPerizinan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Detail Perizinan</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">NIS</label>
                    <p className="text-gray-800">{selectedPerizinan.nis}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Nama</label>
                    <p className="text-gray-800">{selectedPerizinan.nama_siswa}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Kelas</label>
                    <p className="text-gray-800">{selectedPerizinan.kelas}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Asrama</label>
                    <p className="text-gray-800">{selectedPerizinan.asrama}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Cabang</label>
                    <p className="text-gray-800">{selectedPerizinan.cabang}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Durasi</label>
                    <p className="text-gray-800">{selectedPerizinan.durasi_hari} hari</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Tanggal Mulai</label>
                    <p className="text-gray-800">
                      {new Date(selectedPerizinan.tanggal_mulai).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Tanggal Selesai</label>
                    <p className="text-gray-800">
                      {new Date(selectedPerizinan.tanggal_selesai).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Keperluan Perizinan</label>
                  <p className="text-gray-800">{selectedPerizinan.keperluan}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Alasan</label>
                  <p className="text-gray-800">{selectedPerizinan.alasan}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Alamat Tujuan</label>
                  <p className="text-gray-800">{selectedPerizinan.alamat_tujuan}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">No. HP Wali</label>
                  <p className="text-gray-800">{selectedPerizinan.no_hp_wali}</p>
                </div>
              </div>

              {canApprove(selectedPerizinan) && actionType !== 'view' && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Tambahkan catatan jika diperlukan"
                  />
                </div>
              )}

              <div className="flex gap-3">
                {canApprove(selectedPerizinan) && actionType !== 'view' && (
                  <button
                    onClick={handleApproval}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                      actionType === 'approve'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {actionType === 'approve' ? 'Setujui' : 'Tolak'}
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {showEditModal && selectedPerizinan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Edit Perizinan</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <strong>Info:</strong> Anda sedang mengedit perizinan untuk <strong>{selectedPerizinan.nama_siswa}</strong> ({selectedPerizinan.nis})
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Mulai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={editFormData.tanggal_mulai}
                      onChange={(e) => setEditFormData({ ...editFormData, tanggal_mulai: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Selesai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={editFormData.tanggal_selesai}
                      onChange={(e) => setEditFormData({ ...editFormData, tanggal_selesai: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Keperluan Perizinan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.keperluan}
                    onChange={(e) => setEditFormData({ ...editFormData, keperluan: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Keperluan</option>
                    <option value="Keperluan Keluarga">Keperluan Keluarga</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Acara Keluarga">Acara Keluarga</option>
                    <option value="Urusan Penting">Urusan Penting</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Alasan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={editFormData.alasan}
                    onChange={(e) => setEditFormData({ ...editFormData, alasan: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Alasan izin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Alamat Tujuan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={editFormData.alamat_tujuan}
                    onChange={(e) => setEditFormData({ ...editFormData, alamat_tujuan: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Alamat tujuan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    No. HP Wali <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={editFormData.no_hp_wali}
                    onChange={(e) => setEditFormData({ ...editFormData, no_hp_wali: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleEdit}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
