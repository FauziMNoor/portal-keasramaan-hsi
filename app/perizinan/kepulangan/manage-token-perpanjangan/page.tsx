'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Copy, Plus, Trash2, Eye, EyeOff, Check, X } from 'lucide-react';

interface TokenPerpanjangan {
  id: string;
  nama_token: string;
  deskripsi: string;
  token: string;
  cabang: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ManageTokenPerpanjanganPage() {
  const [tokens, setTokens] = useState<TokenPerpanjangan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showToken, setShowToken] = useState<{ [key: string]: boolean }>({});
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    nama_token: '',
    deskripsi: '',
    cabang: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [cabangList, setCabangList] = useState<string[]>([]);

  useEffect(() => {
    fetchCabang();
    fetchTokens();
  }, []);

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

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('token_perizinan_keasramaan')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setTokens(data);
      }
    } catch (err) {
      console.error('Error fetching tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama_token) {
      alert('❌ Nama token harus diisi');
      return;
    }

    setSubmitting(true);
    try {
      const newToken = generateToken();
      
      const { error } = await supabase
        .from('token_perizinan_keasramaan')
        .insert({
          nama_token: formData.nama_token,
          deskripsi: formData.deskripsi,
          token: newToken,
          cabang: formData.cabang || null,
          is_active: true,
        });

      if (error) throw error;

      alert('✅ Token perpanjangan berhasil dibuat!');
      setFormData({ nama_token: '', deskripsi: '', cabang: '' });
      setShowForm(false);
      fetchTokens();
    } catch (err: any) {
      alert('❌ Gagal membuat token: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('⚠️ Yakin ingin menghapus token ini?')) return;

    try {
      const { error } = await supabase
        .from('token_perizinan_keasramaan')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('✅ Token berhasil dihapus!');
      fetchTokens();
    } catch (err: any) {
      alert('❌ Gagal menghapus: ' + err.message);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('token_perizinan_keasramaan')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      alert(`✅ Token ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}!`);
      fetchTokens();
    } catch (err: any) {
      alert('❌ Gagal update: ' + err.message);
    }
  };

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getTokenLink = (token: string) => {
    return `${window.location.origin}/perizinan/kepulangan/perpanjangan/${token}`;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 p-8 pt-20 lg:pt-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Token Perpanjangan</h1>
              <p className="text-gray-600">Kelola token link untuk form perpanjangan izin</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Buat Token Baru
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Buat Token Perpanjangan Baru</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Token <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama_token}
                    onChange={(e) => setFormData({ ...formData, nama_token: e.target.value })}
                    placeholder="Contoh: Link Perpanjangan 2024/2025"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Contoh: Link untuk perpanjangan izin kepulangan santri"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cabang (Optional)
                  </label>
                  <select
                    value={formData.cabang}
                    onChange={(e) => setFormData({ ...formData, cabang: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Semua Cabang</option>
                    {cabangList.map(cabang => (
                      <option key={cabang} value={cabang}>{cabang}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Membuat...' : 'Buat Token'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tokens List */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : tokens.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Belum ada token perpanjangan. Buat token baru untuk memulai.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Nama Token</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Cabang</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Token</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Status</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map((token, index) => (
                      <tr key={token.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-800">{token.nama_token}</div>
                          <div className="text-xs text-gray-500 mt-1">{token.deskripsi}</div>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          {token.cabang ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {token.cabang}
                            </span>
                          ) : (
                            <span className="text-gray-500">Semua Cabang</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                              {showToken[token.id] ? token.token : '••••••••'}
                            </code>
                            <button
                              onClick={() => setShowToken({ ...showToken, [token.id]: !showToken[token.id] })}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title={showToken[token.id] ? 'Sembunyikan' : 'Tampilkan'}
                            >
                              {showToken[token.id] ? (
                                <EyeOff className="w-4 h-4 text-gray-600" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard(token.token)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Copy token"
                            >
                              {copiedToken === token.token ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {token.is_active ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              ✓ Aktif
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                              ✗ Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleToggleActive(token.id, token.is_active)}
                              className={`p-2 rounded-lg transition-colors ${
                                token.is_active
                                  ? 'bg-red-100 hover:bg-red-200 text-red-600'
                                  : 'bg-green-100 hover:bg-green-200 text-green-600'
                              }`}
                              title={token.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            >
                              {token.is_active ? (
                                <X className="w-4 h-4" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(token.id)}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-800 mb-3">📋 Cara Menggunakan Token Perpanjangan</h3>
            <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
              <li>Buat token baru di halaman ini</li>
              <li>Copy token yang sudah dibuat</li>
              <li>Bagikan link perpanjangan ke wali santri: <code className="bg-blue-100 px-2 py-1 rounded text-xs font-mono">/perizinan/kepulangan/perpanjangan/[TOKEN]</code></li>
              <li>Wali santri bisa akses form perpanjangan melalui link tersebut</li>
              <li>Wali santri bisa upload dokumen pendukung (surat dokter, surat keluarga, dll)</li>
              <li>Perpanjangan akan masuk ke approval queue</li>
              <li>Kepala Asrama & Kepala Sekolah bisa approve/reject perpanjangan</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
