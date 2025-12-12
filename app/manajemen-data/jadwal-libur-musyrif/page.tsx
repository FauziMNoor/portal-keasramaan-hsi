'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Calendar, Plus, Download, Filter, RefreshCw, X, AlertCircle } from 'lucide-react';

interface JadwalLibur {
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
  created_at: string;
}

export default function JadwalLiburMusyrifPage() {
  const [jadwalList, setJadwalList] = useState<JadwalLibur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cabangList, setCabangList] = useState<string[]>([]);
  
  // Filters
  const [selectedCabang, setSelectedCabang] = useState('');
  const [selectedBulan, setSelectedBulan] = useState(new Date().getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState(new Date().getFullYear());
  const [selectedMusyrif, setSelectedMusyrif] = useState('');

  useEffect(() => {
    fetchCabangList();
  }, []);

  useEffect(() => {
    if (selectedCabang) {
      fetchJadwalLibur();
    }
  }, [selectedCabang, selectedBulan, selectedTahun, selectedMusyrif]);

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
        if (!selectedCabang) {
          setSelectedCabang(cabangNames[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching cabang:', error);
    }
  };

  const fetchJadwalLibur = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        cabang: selectedCabang,
        bulan: selectedBulan.toString(),
        tahun: selectedTahun.toString(),
      });
      
      if (selectedMusyrif) {
        params.append('musyrif', selectedMusyrif);
      }

      const response = await fetch(`/api/kpi/jadwal-libur?${params}`);
      const result = await response.json();

      if (result.success) {
        setJadwalList(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching jadwal libur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal libur ini?')) return;

    try {
      const response = await fetch(`/api/kpi/jadwal-libur?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('Jadwal libur berhasil dihapus');
        fetchJadwalLibur();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting jadwal:', error);
      alert('Terjadi kesalahan saat menghapus jadwal');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved_kepala_asrama': 'bg-blue-100 text-blue-800',
      'approved_kepala_sekolah': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
    };
    
    const labels: Record<string, string> = {
      'pending': 'Pending',
      'approved_kepala_asrama': 'Approved Kepala Asrama',
      'approved_kepala_sekolah': 'Approved',
      'rejected': 'Rejected',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getJenisLiburBadge = (jenis: string) => {
    const badges: Record<string, string> = {
      'rutin': 'bg-purple-100 text-purple-800',
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

  // Modal Components
  function GenerateJadwalModal({ onClose, onSuccess, cabangList }: { onClose: () => void; onSuccess: () => void; cabangList: string[] }) {
    const [formData, setFormData] = useState({
      cabang: selectedCabang,
      bulan: selectedBulan,
      tahun: selectedTahun,
    });
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
      try {
        setGenerating(true);
        setError('');

        const response = await fetch('/api/kpi/jadwal-libur/generate-rutin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.success) {
          alert(`✅ Berhasil generate ${result.data.total_generated} jadwal libur rutin`);
          onSuccess();
          onClose();
        } else {
          setError(result.error || 'Terjadi kesalahan');
        }
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan');
      } finally {
        setGenerating(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Generate Jadwal Rutin</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> Sistem akan membagi musyrif menjadi 2 grup dan generate jadwal libur Sabtu-Ahad secara bergantian (2 pekan sekali).
            </p>
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
                Cabang
              </label>
              <select
                value={formData.cabang}
                onChange={(e) => setFormData({ ...formData, cabang: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {cabangList.map((cabang) => (
                  <option key={cabang} value={cabang}>{cabang}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulan
              </label>
              <select
                value={formData.bulan}
                onChange={(e) => setFormData({ ...formData, bulan: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {new Date(2024, month - 1).toLocaleString('id-ID', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun
              </label>
              <select
                value={formData.tahun}
                onChange={(e) => setFormData({ ...formData, tahun: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={generating}
            >
              Batal
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
            >
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function AjukanCutiModal({ onClose, onSuccess, defaultCabang, cabangList }: { onClose: () => void; onSuccess: () => void; defaultCabang: string; cabangList: string[] }) {
    const [formData, setFormData] = useState({
      nama_musyrif: '',
      cabang: defaultCabang,
      asrama: '',
      tanggal_mulai: '',
      tanggal_selesai: '',
      jenis_libur: 'cuti',
      keterangan: '',
      musyrif_pengganti: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [musyrifList, setMusyrifList] = useState<any[]>([]);
    const [sisaCuti, setSisaCuti] = useState<number | null>(null);

    useEffect(() => {
      fetchMusyrifList();
    }, [formData.cabang]);

    useEffect(() => {
      if (formData.nama_musyrif && formData.jenis_libur === 'cuti') {
        fetchSisaCuti();
      }
    }, [formData.nama_musyrif, formData.jenis_libur]);

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

    const fetchSisaCuti = async () => {
      try {
        const tahun = new Date().getFullYear();
        const response = await fetch(`/api/kpi/cuti?musyrif=${formData.nama_musyrif}&tahun=${tahun}`);
        const result = await response.json();
        if (result.success && result.data) {
          setSisaCuti(result.data.sisa_cuti);
        }
      } catch (err) {
        console.error('Error fetching sisa cuti:', err);
      }
    };

    const handleSubmit = async () => {
      try {
        setSubmitting(true);
        setError('');

        // Validation
        if (!formData.nama_musyrif || !formData.tanggal_mulai || !formData.tanggal_selesai) {
          setError('Mohon lengkapi semua field yang wajib diisi');
          return;
        }

        const response = await fetch('/api/kpi/jadwal-libur', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.success) {
          alert(`✅ ${result.message}`);
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

    const handleMusyrifChange = (nama: string) => {
      const musyrif = musyrifList.find(m => m.nama_musyrif === nama);
      setFormData({
        ...formData,
        nama_musyrif: nama,
        asrama: musyrif?.asrama || '',
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full my-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Ajukan Cuti/Izin</h3>
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

          {formData.jenis_libur === 'cuti' && sisaCuti !== null && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Sisa Cuti:</strong> {sisaCuti} hari
              </p>
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
                Jenis <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.jenis_libur}
                onChange={(e) => setFormData({ ...formData, jenis_libur: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="cuti">Cuti</option>
                <option value="sakit">Sakit</option>
                <option value="izin">Izin</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.tanggal_mulai}
                  onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.tanggal_selesai}
                  onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Musyrif Pengganti
              </label>
              <select
                value={formData.musyrif_pengganti}
                onChange={(e) => setFormData({ ...formData, musyrif_pengganti: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Pilih Pengganti (Optional)</option>
                {musyrifList
                  .filter(m => m.nama_musyrif !== formData.nama_musyrif)
                  .map((musyrif) => (
                    <option key={musyrif.nama_musyrif} value={musyrif.nama_musyrif}>
                      {musyrif.nama_musyrif} - {musyrif.asrama}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keterangan
              </label>
              <textarea
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                rows={3}
                placeholder="Alasan cuti/izin..."
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
              {submitting ? 'Submitting...' : 'Ajukan'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Jadwal Libur Musyrif
        </h1>
        <p className="text-gray-600 mt-1">
          Kelola jadwal libur rutin, cuti, sakit, dan izin musyrif
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informasi</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Libur Rutin:</strong> Sabtu-Ahad, 2 pekan sekali (bergantian)</li>
          <li>• <strong>Cuti:</strong> Maksimal 12 hari per tahun (perlu approval)</li>
          <li>• <strong>Sakit/Izin:</strong> Sesuai kebutuhan (perlu approval)</li>
          <li>• <strong>Hari libur tidak mengurangi score KPI</strong></li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Generate Jadwal Rutin
        </button>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajukan Cuti/Izin
        </button>

        <button
          onClick={fetchJadwalLibur}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filter</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cabang
            </label>
            <select
              value={selectedCabang}
              onChange={(e) => setSelectedCabang(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {cabangList.map((cabang) => (
                <option key={cabang} value={cabang}>{cabang}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bulan
            </label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {new Date(2024, month - 1).toLocaleString('id-ID', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun
            </label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Musyrif (Optional)
            </label>
            <input
              type="text"
              value={selectedMusyrif}
              onChange={(e) => setSelectedMusyrif(e.target.value)}
              placeholder="Nama musyrif..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading...
          </div>
        ) : jadwalList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Tidak ada jadwal libur untuk periode ini
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Musyrif
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asrama
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pengganti
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jadwalList.map((jadwal) => (
                  <tr key={jadwal.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {jadwal.nama_musyrif}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {jadwal.asrama}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(jadwal.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(jadwal.tanggal_selesai).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getJenisLiburBadge(jadwal.jenis_libur)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {jadwal.musyrif_pengganti || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getStatusBadge(jadwal.status)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDelete(jadwal.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Generate Jadwal Rutin */}
      {showGenerateModal && (
        <GenerateJadwalModal
          onClose={() => setShowGenerateModal(false)}
          onSuccess={fetchJadwalLibur}
          cabangList={cabangList}
        />
      )}

      {/* Modal Ajukan Cuti/Izin */}
      {showAddModal && (
        <AjukanCutiModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchJadwalLibur}
          defaultCabang={selectedCabang}
          cabangList={cabangList}
        />
      )}
      </main>
    </div>
  );
}
