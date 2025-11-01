'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Link as LinkIcon, Copy, RefreshCw, Eye, EyeOff, FileText, Plus } from 'lucide-react';

interface TokenWaliSantri {
  id: string;
  nama_token: string;
  keterangan: string;
  token: string;
  is_active: boolean;
  created_at: string;
}

export default function LaporanWaliSantriPage() {
  const [tokens, setTokens] = useState<TokenWaliSantri[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nama_token: '',
    keterangan: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('token_wali_santri_keasramaan')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error:', error);
    } else {
      setTokens(data || []);
    }
    setLoading(false);
  };

  const generateRandomToken = () => {
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const token = generateRandomToken();
      
      const { error } = await supabase
        .from('token_wali_santri_keasramaan')
        .insert([{
          nama_token: formData.nama_token,
          keterangan: formData.keterangan,
          token: token,
          is_active: true,
        }]);

      if (error) throw error;

      alert('Token berhasil dibuat!');
      setShowModal(false);
      resetForm();
      fetchTokens();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Gagal membuat token: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('token_wali_santri_keasramaan')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error:', error);
      alert('Gagal update status');
    } else {
      fetchTokens();
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/habit-tracker/laporan/${token}`;
    navigator.clipboard.writeText(link);
    alert('Link berhasil dicopy!');
  };

  const getFormLink = (token: string) => {
    return `${window.location.origin}/habit-tracker/laporan/${token}`;
  };

  const resetForm = () => {
    setFormData({
      nama_token: '',
      keterangan: '',
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Laporan Wali Santri</h1>
              <p className="text-gray-600">Generate dan kelola link laporan untuk wali santri</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Buat Token Baru
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
              Memuat data...
            </div>
          ) : tokens.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <p className="text-gray-500 mb-4">Belum ada token. Klik tombol di atas untuk membuat.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">No</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Nama Token</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Keterangan</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Link Laporan</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map((token, index) => (
                      <tr key={token.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-4 text-gray-700">{index + 1}</td>
                        <td className="px-6 py-4 text-gray-800 font-medium">{token.nama_token}</td>
                        <td className="px-6 py-4 text-gray-700">{token.keterangan || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={getFormLink(token.token)}
                              readOnly
                              className="flex-1 px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg"
                            />
                            <button
                              onClick={() => copyLink(token.token)}
                              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                              title="Copy Link"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <a
                              href={getFormLink(token.token)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                              title="Buka Link"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              token.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {token.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleActive(token.id, token.is_active)}
                            className={`p-2 rounded-lg transition-colors ${
                              token.is_active
                                ? 'bg-red-100 hover:bg-red-200 text-red-600'
                                : 'bg-green-100 hover:bg-green-200 text-green-600'
                            }`}
                            title={token.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {token.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">📱 Cara Menggunakan:</h3>
            <ol className="list-decimal list-inside space-y-2 text-green-700">
              <li>Klik "Buat Token Baru" untuk membuat link universal</li>
              <li>Beri nama token (contoh: "Link Wali Santri 2024/2025")</li>
              <li>Copy link dan sebarkan ke semua wali santri via WhatsApp/broadcast</li>
              <li>Wali santri buka link di HP dan input NIS anak mereka</li>
              <li>Dashboard laporan akan menampilkan perkembangan santri sesuai NIS</li>
              <li>Satu link bisa digunakan oleh semua wali santri</li>
              <li>Nonaktifkan token jika tidak ingin digunakan lagi (misal: ganti semester)</li>
            </ol>
          </div>
        </div>
      </main>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Buat Token Baru</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Token *
                </label>
                <input
                  type="text"
                  value={formData.nama_token}
                  onChange={(e) => setFormData({ ...formData, nama_token: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Contoh: Link Wali Santri 2024/2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keterangan (Opsional)
                </label>
                <textarea
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Contoh: Link untuk semester ganjil, berlaku sampai Desember 2024"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                >
                  {formLoading ? 'Membuat...' : 'Buat Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
