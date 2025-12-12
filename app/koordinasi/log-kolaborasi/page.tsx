'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { HandshakeIcon, Plus, Star, Trash2, X, AlertCircle, Filter } from 'lucide-react';

interface LogKolaborasi {
  id: string;
  cabang: string;
  nama_musyrif: string;
  asrama: string;
  jenis_kolaborasi: string;
  deskripsi: string;
  kolaborator: string | null;
  tanggal: string;
  rating_kepala_asrama: number | null;
  catatan_kepala_asrama: string | null;
  created_at: string;
}

export default function LogKolaborasiPage() {
  const [logList, setLogList] = useState<LogKolaborasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogKolaborasi | null>(null);
  const [cabangList, setCabangList] = useState<string[]>([]);

  // Filters
  const [filterCabang, setFilterCabang] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterMusyrif, setFilterMusyrif] = useState('');

  useEffect(() => {
    fetchCabangList();
  }, []);

  useEffect(() => {
    if (filterCabang) {
      fetchLog();
    }
  }, [filterCabang, filterJenis, filterMusyrif]);

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

  const fetchLog = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ cabang: filterCabang });
      if (filterJenis) params.append('jenis', filterJenis);
      if (filterMusyrif) params.append('musyrif', filterMusyrif);

      const response = await fetch(`/api/kpi/kolaborasi?${params}`);
      const result = await response.json();

      if (result.success) {
        setLogList(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching log:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus log ini?')) return;

    try {
      const response = await fetch(`/api/kpi/kolaborasi?id=${id}`, { method: 'DELETE' });
      const result = await response.json();

      if (result.success) {
        alert('✅ Log berhasil dihapus');
        fetchLog();
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error: any) {
      alert('❌ Terjadi kesalahan: ' + error.message);
    }
  };

  const openRatingModal = (log: LogKolaborasi) => {
    setSelectedLog(log);
    setShowRatingModal(true);
  };

  const getJenisKolaborasiBadge = (jenis: string) => {
    const badges: Record<string, string> = {
      'koordinasi_asrama': 'bg-blue-100 text-blue-800',
      'penanganan_santri': 'bg-green-100 text-green-800',
      'kegiatan_bersama': 'bg-purple-100 text-purple-800',
      'sharing_knowledge': 'bg-orange-100 text-orange-800',
      'problem_solving': 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      'koordinasi_asrama': 'Koordinasi Asrama',
      'penanganan_santri': 'Penanganan Santri',
      'kegiatan_bersama': 'Kegiatan Bersama',
      'sharing_knowledge': 'Sharing Knowledge',
      'problem_solving': 'Problem Solving',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[jenis] || 'bg-gray-100 text-gray-800'}`}>
        {labels[jenis] || jenis}
      </span>
    );
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-xs text-gray-400">Belum dinilai</span>;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <HandshakeIcon className="w-6 h-6" />
          Log Kolaborasi
        </h1>
        <p className="text-gray-600 mt-1">
          Catat dan kelola kolaborasi antar musyrif
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informasi</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Inisiatif Kolaborasi:</strong> Mempengaruhi KPI Koordinasi (30%)</li>
          <li>• <strong>Rating:</strong> Dinilai oleh Kepala Asrama (1-5 bintang)</li>
          <li>• <strong>Jenis:</strong> Koordinasi, Penanganan Santri, Kegiatan Bersama, dll</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Log Kolaborasi
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filter</h3>
        </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kolaborasi</label>
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Jenis</option>
              <option value="koordinasi_asrama">Koordinasi Asrama</option>
              <option value="penanganan_santri">Penanganan Santri</option>
              <option value="kegiatan_bersama">Kegiatan Bersama</option>
              <option value="sharing_knowledge">Sharing Knowledge</option>
              <option value="problem_solving">Problem Solving</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Musyrif (Optional)</label>
            <input
              type="text"
              value={filterMusyrif}
              onChange={(e) => setFilterMusyrif(e.target.value)}
              placeholder="Nama musyrif..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* List Log */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            Loading...
          </div>
        ) : logList.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            Tidak ada log kolaborasi
          </div>
        ) : (
          logList.map((log) => (
            <div key={log.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <HandshakeIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{log.nama_musyrif}</h3>
                    <p className="text-sm text-gray-600">{log.asrama} - {log.cabang}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getJenisKolaborasiBadge(log.jenis_kolaborasi)}
                  <span className="text-xs text-gray-500">
                    {new Date(log.tanggal).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{log.deskripsi}</p>
              </div>

              {log.kolaborator && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Kolaborator:</strong> {log.kolaborator}
                  </p>
                </div>
              )}

              {/* Rating Section */}
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">Rating Kepala Asrama</p>
                    {renderStars(log.rating_kepala_asrama)}
                    {log.catatan_kepala_asrama && (
                      <p className="text-xs text-gray-600 mt-2">
                        <strong>Catatan:</strong> {log.catatan_kepala_asrama}
                      </p>
                    )}
                  </div>
                  {!log.rating_kepala_asrama && (
                    <button
                      onClick={() => openRatingModal(log)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                    >
                      <Star className="w-4 h-4" />
                      Beri Rating
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDelete(log.id)}
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
        <AddLogModal onClose={() => setShowAddModal(false)} onSuccess={fetchLog} defaultCabang={filterCabang} cabangList={cabangList} />
      )}

      {showRatingModal && selectedLog && (
        <RatingModal
          log={selectedLog}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedLog(null);
          }}
          onSuccess={fetchLog}
        />
      )}
      </main>
    </div>
  );
}


// Modal Components
function AddLogModal({ onClose, onSuccess, defaultCabang, cabangList }: { onClose: () => void; onSuccess: () => void; defaultCabang: string; cabangList: string[] }) {
  const [formData, setFormData] = useState({
    cabang: defaultCabang,
    nama_musyrif: '',
    asrama: '',
    jenis_kolaborasi: 'koordinasi_asrama',
    deskripsi: '',
    kolaborator: '',
    tanggal: new Date().toISOString().split('T')[0],
  });
  const [musyrifList, setMusyrifList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMusyrifList();
  }, [formData.cabang]);

  const fetchMusyrifList = async () => {
    try {
      const response = await fetch(`/api/musyrif?cabang=${formData.cabang}`);
      const result = await response.json();
      if (result.success) {
        setMusyrifList(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching musyrif:', err);
    }
  };

  const handleMusyrifChange = (nama: string) => {
    const musyrif = musyrifList.find(m => m.nama_musyrif === nama);
    setFormData({
      ...formData,
      nama_musyrif: nama,
      asrama: musyrif?.asrama || '',
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      if (!formData.nama_musyrif || !formData.deskripsi) {
        setError('Mohon lengkapi semua field yang wajib diisi');
        return;
      }

      const response = await fetch('/api/kpi/kolaborasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Log kolaborasi berhasil ditambahkan');
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
          <h3 className="text-lg font-bold text-gray-800">Tambah Log Kolaborasi</h3>
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
              {cabangList.map((cabang) => (
                <option key={cabang} value={cabang}>{cabang}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Musyrif <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.nama_musyrif}
              onChange={(e) => handleMusyrifChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Pilih Musyrif</option>
              {musyrifList.map((musyrif) => (
                <option key={musyrif.nama_musyrif} value={musyrif.nama_musyrif}>
                  {musyrif.nama_musyrif} - {musyrif.asrama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Kolaborasi <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.jenis_kolaborasi}
              onChange={(e) => setFormData({ ...formData, jenis_kolaborasi: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="koordinasi_asrama">Koordinasi Asrama</option>
              <option value="penanganan_santri">Penanganan Santri</option>
              <option value="kegiatan_bersama">Kegiatan Bersama</option>
              <option value="sharing_knowledge">Sharing Knowledge</option>
              <option value="problem_solving">Problem Solving</option>
            </select>
          </div>

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
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              rows={4}
              placeholder="Jelaskan detail kolaborasi yang dilakukan..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kolaborator (Optional)
            </label>
            <select
              value={formData.kolaborator}
              onChange={(e) => setFormData({ ...formData, kolaborator: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Pilih Kolaborator (Optional)</option>
              {musyrifList
                .filter(m => m.nama_musyrif !== formData.nama_musyrif)
                .map((musyrif) => (
                  <option key={musyrif.nama_musyrif} value={musyrif.nama_musyrif}>
                    {musyrif.nama_musyrif} - {musyrif.asrama}
                  </option>
                ))}
            </select>
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
            {submitting ? 'Submitting...' : 'Tambah Log'}
          </button>
        </div>
      </div>
    </div>
  );
}


function RatingModal({ log, onClose, onSuccess }: { log: LogKolaborasi; onClose: () => void; onSuccess: () => void }) {
  const [rating, setRating] = useState(5);
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const response = await fetch('/api/kpi/kolaborasi/rate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: log.id,
          rating_kepala_asrama: rating,
          catatan_kepala_asrama: catatan,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Rating berhasil diberikan');
        onSuccess();
        onClose();
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (err: any) {
      alert('❌ Terjadi kesalahan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Beri Rating</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Musyrif:</strong> {log.nama_musyrif}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Jenis:</strong> {log.jenis_kolaborasi}
          </p>
          <p className="text-sm text-gray-600 mt-2">{log.deskripsi}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating (1-5 bintang) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                onClick={() => setRating(i + 1)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="text-lg font-semibold text-gray-700 ml-2">{rating}/5</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catatan (Optional)
          </label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={3}
            placeholder="Berikan catatan atau feedback..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
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
            className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:bg-yellow-300"
          >
            {submitting ? 'Submitting...' : 'Beri Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}
