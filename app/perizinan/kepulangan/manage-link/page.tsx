'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Link as LinkIcon, Copy, Plus, Trash2, Eye, EyeOff, Edit2, X, Save } from 'lucide-react';

interface Token {
  id: string;
  nama_token: string;
  deskripsi: string;
  token: string;
  cabang: string;
  is_active: boolean;
  created_at: string;
}

export default function ManageLinkPerizinan() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama_token: '',
    deskripsi: '',
    cabang: '',
  });
  const [cabangList, setCabangList] = useState<any[]>([]);

  useEffect(() => {
    fetchTokens();
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    const { data } = await supabase
      .from('cabang_keasramaan')
      .select('*')
      .eq('status', 'aktif');
    
    setCabangList(data || []);
  };

  const fetchTokens = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('token_perizinan_keasramaan')
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

    try {
      if (editingId) {
        const { error } = await supabase
          .from('token_perizinan_keasramaan')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        alert('Token berhasil diupdate!');
      } else {
        const { error } = await supabase
          .from('token_perizinan_keasramaan')
          .insert([{
            ...formData,
            token: generateRandomToken(),
            is_active: true,
          }]);

        if (error) throw error;
        alert('Token berhasil dibuat!');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        nama_token: '',
        deskripsi: '',
        cabang: '',
      });
      fetchTokens();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Gagal menyimpan: ' + error.message);
    }
  };

  const handleEdit = (token: Token) => {
    setFormData({
      nama_token: token.nama_token,
      deskripsi: token.deskripsi || '',
      cabang: token.cabang || '',
    });
    setEditingId(token.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus token ini?')) return;

    try {
      const { error } = await supabase
        .from('token_perizinan_keasramaan')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Token berhasil dihapus!');
      fetchTokens();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Gagal menghapus: ' + error.message);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('token_perizinan_keasramaan')
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
    const link = `${window.location.origin}/perizinan/kepulangan/form/${token}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link)
        .then(() => {
          alert('✅ Link berhasil dicopy!');
        })
        .catch((err) => {
          console.error('Clipboard error:', err);
          fallbackCopyTextToClipboard(link);
        });
    } else {
      fallbackCopyTextToClipboard(link);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert('✅ Link berhasil dicopy!');
      } else {
        alert('❌ Gagal copy link. Silakan copy manual.');
      }
    } catch (err) {
      console.error('Fallback copy error:', err);
      alert('❌ Gagal copy link. Silakan copy manual.');
    }

    document.body.removeChild(textArea);
  };

  const getFormLink = (token: string) => {
    return `${window.location.origin}/perizinan/kepulangan/form/${token}`;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Kelola Link Perizinan</h1>
              <p className="text-gray-600">Generate link untuk wali santri mengajukan izin kepulangan</p>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({
                  nama_token: '',
                  deskripsi: '',
                  cabang: '',
                });
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Buat Token Baru
            </button>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingId ? 'Edit' : 'Buat'} Token
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Token <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nama_token}
                      onChange={(e) => setFormData({ ...formData, nama_token: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Misal: Link Perizinan Semester Ganjil 2024/2025"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Nama/label untuk mengidentifikasi token ini</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Deskripsi penggunaan token (opsional)"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cabang (Opsional)
                    </label>
                    <select
                      value={formData.cabang}
                      onChange={(e) => setFormData({ ...formData, cabang: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Semua Cabang</option>
                      {cabangList.map((c) => (
                        <option key={c.id} value={c.cabang}>
                          {c.cabang}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Jika dipilih, link hanya bisa digunakan untuk santri dari cabang ini
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all"
                    >
                      <Save className="w-4 h-4" />
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
              Memuat data...
            </div>
          ) : tokens.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
              Belum ada token. Klik "Buat Token Baru" untuk membuat.
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">No</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Nama Token</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Cabang</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Link</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map((token, index) => (
                      <tr key={token.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3 text-gray-700">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-gray-800 font-medium">{token.nama_token}</p>
                            {token.deskripsi && (
                              <p className="text-xs text-gray-500 mt-1">{token.deskripsi}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(token.created_at).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 text-sm">
                          {token.cabang ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              📍 {token.cabang}
                            </span>
                          ) : (
                            <span className="text-gray-400">Semua Cabang</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={getFormLink(token.token)}
                              readOnly
                              className="flex-1 px-3 py-1 text-xs bg-gray-100 border border-gray-300 rounded-lg"
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
                        <td className="px-4 py-3 text-center">
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
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
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
                            <button
                              onClick={() => handleEdit(token)}
                              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
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
            </div>
          )}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">📱 Cara Menggunakan:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>Klik "Buat Token Baru" dan isi nama token (misal: Link Perizinan Semester Ganjil)</li>
              <li>Pilih cabang jika ingin membatasi untuk cabang tertentu, atau biarkan kosong untuk semua cabang</li>
              <li>Copy link yang dihasilkan dengan klik icon copy</li>
              <li>Bagikan link ke wali santri via WhatsApp Group, Broadcast, atau media lainnya</li>
              <li>Wali santri buka link dan langsung bisa mengajukan izin kepulangan</li>
              <li>Nonaktifkan token jika sudah tidak digunakan (misal: akhir semester)</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
