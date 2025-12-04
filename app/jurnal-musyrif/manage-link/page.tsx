'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Plus, Link as LinkIcon, Copy, Trash2, Eye, EyeOff, X, Save } from 'lucide-react';

interface TokenLink {
  id: string;
  token: string;
  cabang: string;
  is_active: boolean;
  created_at: string;
}

export default function ManageLinkJurnalMusyrifPage() {
  const [tokenList, setTokenList] = useState<TokenLink[]>([]);
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    cabang: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [tokens, cabang] = await Promise.all([
      supabase.from('token_jurnal_musyrif_keasramaan').select('*').order('created_at', { ascending: false }),
      supabase.from('cabang_keasramaan').select('*').eq('status', 'aktif'),
    ]);
    setTokenList(tokens.data || []);
    setCabangList(cabang.data || []);
    setLoading(false);
  };

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cabang) {
      alert('Cabang harus dipilih!');
      return;
    }

    // Check if link for this cabang already exists
    const existing = tokenList.find(t => t.cabang === formData.cabang);
    if (existing) {
      alert('⚠️ Link untuk cabang ini sudah ada!\n\nSilakan gunakan link yang sudah ada atau hapus link lama terlebih dahulu.');
      return;
    }

    try {
      const token = generateToken();
      const { error } = await supabase.from('token_jurnal_musyrif_keasramaan').insert([{
        token,
        cabang: formData.cabang,
        is_active: true,
      }]);

      if (error) throw error;
      alert('✅ Link berhasil dibuat!');
      setShowModal(false);
      setFormData({ cabang: '' });
      fetchData();
    } catch (error: any) {
      alert('❌ Gagal: ' + error.message);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await supabase.from('token_jurnal_musyrif_keasramaan').update({ is_active: !currentStatus }).eq('id', id);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus link ini?')) return;
    await supabase.from('token_jurnal_musyrif_keasramaan').delete().eq('id', id);
    alert('✅ Link berhasil dihapus!');
    fetchData();
  };

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/jurnal-musyrif/form/${token}`;
    navigator.clipboard.writeText(link);
    alert('✅ Link berhasil disalin!');
  };

  const getFormLink = (token: string) => {
    return `${window.location.origin}/jurnal-musyrif/form/${token}`;
  };



  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-3 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2">Kelola Link Jurnal Musyrif</h1>
              <p className="text-xs sm:text-base text-gray-600">Generate link untuk input jurnal musyrif via token</p>
            </div>
            <button
              onClick={() => {
                setShowModal(true);
                setFormData({ cabang: '' });
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl shadow-lg transition-all text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Buat Token Baru</span>
              <span className="sm:hidden">Buat Token</span>
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm sm:text-base text-gray-600">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-3">
                {tokenList.map((token, idx) => (
                  <div key={token.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-500">#{idx + 1}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            token.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {token.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-2">{token.cabang}</h3>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 break-all block">
                          .../{token.token.substring(0, 12)}...
                        </code>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleCopyLink(token.token)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-all"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                      <a
                        href={getFormLink(token.token)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg text-sm font-medium transition-all"
                      >
                        <LinkIcon className="w-4 h-4" />
                        Buka
                      </a>
                      <button
                        onClick={() => handleToggleActive(token.id, token.is_active)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          token.is_active 
                            ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' 
                            : 'text-green-600 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {token.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(token.id)}
                        className="px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {tokenList.length === 0 && (
                  <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500 text-sm">
                    Belum ada link. Klik "Buat Link" untuk membuat link pertama.
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cabang</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tokenList.map((token, idx) => (
                        <tr key={token.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">{token.cabang}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={getFormLink(token.token)}
                                readOnly
                                className="flex-1 px-3 py-1 text-xs bg-gray-100 border border-gray-300 rounded-lg"
                              />
                              <button
                                onClick={() => handleCopyLink(token.token)}
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
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              token.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {token.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
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
                                {token.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  {tokenList.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      Belum ada link. Klik "Buat Link Baru" untuk membuat link pertama.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-3">📱 Cara Menggunakan:</h3>
            <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-blue-700">
              <li>Klik "Buat Token Baru" dan pilih cabang</li>
              <li>Link akan dibuat untuk semua musyrif di cabang tersebut</li>
              <li>Copy link dan kirim ke musyrif via WhatsApp/Telegram</li>
              <li>Musyrif buka link, pilih nama mereka sendiri, dan input jurnal harian</li>
              <li>Nonaktifkan token jika tidak ingin digunakan lagi</li>
            </ol>
          </div>
        </div>
      </main>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Buat Token
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Cabang <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.cabang}
                  onChange={(e) => setFormData({ cabang: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  required
                >
                  <option value="">Pilih Cabang</option>
                  {cabangList.map((c) => (
                    <option key={c.id} value={c.nama_cabang}>
                      {c.nama_cabang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">ℹ️ Informasi:</h3>
                <p className="text-xs sm:text-sm text-blue-800">
                  Link akan dibuat untuk <strong>semua musyrif</strong> di cabang ini. 
                  Musyrif akan memilih nama mereka sendiri saat membuka link.
                </p>
              </div>

              <div className="flex gap-2 sm:gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm sm:text-base"
                >
                  <Save className="w-4 h-4" />
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
