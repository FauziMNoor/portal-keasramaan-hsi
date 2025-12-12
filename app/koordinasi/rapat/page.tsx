'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Users, Plus, Calendar, Clock, FileText, Edit, Trash2, X, AlertCircle, CheckCircle } from 'lucide-react';

interface Rapat {
  id: string;
  cabang: string;
  tanggal: string;
  waktu: string;
  jenis_rapat: string;
  agenda: string;
  tempat: string;
  notulen: string | null;
  created_at: string;
}

interface Kehadiran {
  id: string;
  rapat_id: string;
  nama_musyrif: string;
  status_kehadiran: string;
  keterangan: string | null;
}

export default function RapatKoordinasiPage() {
  const [rapatList, setRapatList] = useState<Rapat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showKehadiranModal, setShowKehadiranModal] = useState(false);
  const [selectedRapat, setSelectedRapat] = useState<Rapat | null>(null);
  const [kehadiranList, setKehadiranList] = useState<Kehadiran[]>([]);
  const [cabangList, setCabangList] = useState<string[]>([]);

  // Filters
  const [filterCabang, setFilterCabang] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterPeriode, setFilterPeriode] = useState('upcoming');

  useEffect(() => {
    fetchCabangList();
  }, []);

  useEffect(() => {
    if (filterCabang) {
      fetchRapat();
    }
  }, [filterCabang, filterJenis, filterPeriode]);

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
        if (!filterCabang) {
          setFilterCabang(cabangNames[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching cabang:', error);
    }
  };

  const fetchRapat = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ cabang: filterCabang });
      if (filterJenis) params.append('jenis', filterJenis);
      if (filterPeriode) params.append('periode', filterPeriode);

      const response = await fetch(`/api/kpi/rapat?${params}`);
      const result = await response.json();

      if (result.success) {
        setRapatList(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching rapat:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKehadiran = async (rapatId: string) => {
    try {
      const response = await fetch(`/api/kpi/rapat/kehadiran?rapat_id=${rapatId}`);
      const result = await response.json();
      if (result.success) {
        setKehadiranList(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching kehadiran:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus rapat ini?')) return;

    try {
      const response = await fetch(`/api/kpi/rapat?id=${id}`, { method: 'DELETE' });
      const result = await response.json();

      if (result.success) {
        alert('✅ Rapat berhasil dihapus');
        fetchRapat();
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error: any) {
      alert('❌ Terjadi kesalahan: ' + error.message);
    }
  };

  const openKehadiranModal = (rapat: Rapat) => {
    setSelectedRapat(rapat);
    fetchKehadiran(rapat.id);
    setShowKehadiranModal(true);
  };

  const getJenisRapatBadge = (jenis: string) => {
    const badges: Record<string, string> = {
      'mingguan': 'bg-blue-100 text-blue-800',
      'bulanan': 'bg-purple-100 text-purple-800',
      'evaluasi': 'bg-orange-100 text-orange-800',
      'koordinasi': 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[jenis] || 'bg-gray-100 text-gray-800'}`}>
        {jenis.charAt(0).toUpperCase() + jenis.slice(1)}
      </span>
    );
  };

  const isPastRapat = (tanggal: string) => {
    return new Date(tanggal) < new Date();
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Rapat Koordinasi
        </h1>
        <p className="text-gray-600 mt-1">
          Kelola jadwal rapat dan kehadiran musyrif
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informasi</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Kehadiran Rapat:</strong> Mempengaruhi KPI Koordinasi (40%)</li>
          <li>• <strong>Jenis Rapat:</strong> Mingguan, Bulanan, Evaluasi, Koordinasi</li>
          <li>• <strong>Input Kehadiran:</strong> Wajib diisi setelah rapat selesai</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Buat Rapat Baru
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cabang</label>
            <select
              value={filterCabang}
              onChange={(e) => setFilterCabang(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {cabangList.map((cabang) => (
                <option key={cabang} value={cabang}>{cabang}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Rapat</label>
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Jenis</option>
              <option value="mingguan">Mingguan</option>
              <option value="bulanan">Bulanan</option>
              <option value="evaluasi">Evaluasi</option>
              <option value="koordinasi">Koordinasi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
            <select
              value={filterPeriode}
              onChange={(e) => setFilterPeriode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="all">Semua</option>
            </select>
          </div>
        </div>
      </div>

      {/* List Rapat */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            Loading...
          </div>
        ) : rapatList.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            Tidak ada rapat
          </div>
        ) : (
          rapatList.map((rapat) => (
            <div key={rapat.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPastRapat(rapat.tanggal) ? 'bg-gray-100' : 'bg-green-100'}`}>
                    <Users className={`w-6 h-6 ${isPastRapat(rapat.tanggal) ? 'text-gray-600' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{rapat.agenda}</h3>
                    <p className="text-sm text-gray-600">{rapat.cabang}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getJenisRapatBadge(rapat.jenis_rapat)}
                  {isPastRapat(rapat.tanggal) && (
                    <span className="text-xs text-gray-500">Past</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(rapat.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{rapat.waktu}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>{rapat.tempat}</span>
                </div>
              </div>

              {rapat.notulen && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Notulen:</strong> {rapat.notulen}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => openKehadiranModal(rapat)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Kehadiran
                </button>
                <button
                  onClick={() => handleDelete(rapat.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddRapatModal onClose={() => setShowAddModal(false)} onSuccess={fetchRapat} defaultCabang={filterCabang} />
      )}

      {showKehadiranModal && selectedRapat && (
        <KehadiranModal
          rapat={selectedRapat}
          kehadiranList={kehadiranList}
          onClose={() => {
            setShowKehadiranModal(false);
            setSelectedRapat(null);
          }}
          onSuccess={() => {
            fetchKehadiran(selectedRapat.id);
            fetchRapat();
          }}
        />
      )}
      </main>
    </div>
  );
}


// Modal Components
function AddRapatModal({ onClose, onSuccess, defaultCabang }: { onClose: () => void; onSuccess: () => void; defaultCabang: string }) {
  const [formData, setFormData] = useState({
    cabang: defaultCabang,
    tanggal: '',
    waktu: '',
    jenis_rapat: 'mingguan',
    agenda: '',
    tempat: '',
    notulen: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      if (!formData.tanggal || !formData.waktu || !formData.agenda || !formData.tempat) {
        setError('Mohon lengkapi semua field yang wajib diisi');
        return;
      }

      const response = await fetch('/api/kpi/rapat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Rapat berhasil dibuat');
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Buat Rapat Baru</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cabang <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.cabang}
              onChange={(e) => setFormData({ ...formData, cabang: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="Pusat">Pusat</option>
              <option value="Sukabumi">Sukabumi</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waktu <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.waktu}
                onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Rapat <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.jenis_rapat}
              onChange={(e) => setFormData({ ...formData, jenis_rapat: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="mingguan">Mingguan</option>
              <option value="bulanan">Bulanan</option>
              <option value="evaluasi">Evaluasi</option>
              <option value="koordinasi">Koordinasi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agenda <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              placeholder="Contoh: Evaluasi Bulanan Desember 2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tempat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.tempat}
              onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
              placeholder="Contoh: Ruang Rapat Lantai 2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notulen (Optional)
            </label>
            <textarea
              value={formData.notulen}
              onChange={(e) => setFormData({ ...formData, notulen: e.target.value })}
              rows={3}
              placeholder="Isi notulen rapat..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={submitting}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
          >
            {submitting ? 'Submitting...' : 'Buat Rapat'}
          </button>
        </div>
      </div>
    </div>
  );
}


function KehadiranModal({
  rapat,
  kehadiranList,
  onClose,
  onSuccess,
}: {
  rapat: Rapat;
  kehadiranList: Kehadiran[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [musyrifList, setMusyrifList] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    nama_musyrif: '',
    status_kehadiran: 'hadir',
    keterangan: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMusyrifList();
  }, []);

  const fetchMusyrifList = async () => {
    try {
      const response = await fetch(`/api/musyrif?cabang=${rapat.cabang}`);
      const result = await response.json();
      if (result.success) {
        setMusyrifList(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching musyrif:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (!formData.nama_musyrif) {
        alert('Mohon pilih musyrif');
        return;
      }

      const response = await fetch('/api/kpi/rapat/kehadiran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rapat_id: rapat.id,
          ...formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Kehadiran berhasil ditambahkan');
        setFormData({ nama_musyrif: '', status_kehadiran: 'hadir', keterangan: '' });
        onSuccess();
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (err: any) {
      alert('❌ Terjadi kesalahan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'hadir': 'bg-green-100 text-green-800',
      'izin': 'bg-yellow-100 text-yellow-800',
      'sakit': 'bg-orange-100 text-orange-800',
      'alpha': 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Kehadiran Rapat</h3>
            <p className="text-sm text-gray-600">{rapat.agenda}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Input Kehadiran */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">Tambah Kehadiran</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={formData.nama_musyrif}
              onChange={(e) => setFormData({ ...formData, nama_musyrif: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih Musyrif</option>
              {musyrifList.map((musyrif) => (
                <option key={musyrif.nama_musyrif} value={musyrif.nama_musyrif}>
                  {musyrif.nama_musyrif}
                </option>
              ))}
            </select>

            <select
              value={formData.status_kehadiran}
              onChange={(e) => setFormData({ ...formData, status_kehadiran: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="hadir">Hadir</option>
              <option value="izin">Izin</option>
              <option value="sakit">Sakit</option>
              <option value="alpha">Alpha</option>
            </select>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {submitting ? 'Adding...' : 'Tambah'}
            </button>
          </div>
        </div>

        {/* List Kehadiran */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Daftar Kehadiran ({kehadiranList.length})</h4>
          {kehadiranList.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Belum ada data kehadiran</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {kehadiranList.map((kehadiran) => (
                <div key={kehadiran.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{kehadiran.nama_musyrif}</p>
                    {kehadiran.keterangan && (
                      <p className="text-xs text-gray-600">{kehadiran.keterangan}</p>
                    )}
                  </div>
                  {getStatusBadge(kehadiran.status_kehadiran)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
