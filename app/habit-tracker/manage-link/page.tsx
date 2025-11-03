'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Link as LinkIcon, Copy, RefreshCw, Eye, EyeOff, MapPin, Building2 } from 'lucide-react';

interface TokenMusyrif {
  id: string;
  musyrif_id: string;
  nama_musyrif: string;
  cabang?: string;
  lokasi?: string; // backward compatibility
  kelas: string;
  asrama: string;
  token: string;
  is_active: boolean;
}

export default function ManageLinkPage() {
  const [tokens, setTokens] = useState<TokenMusyrif[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('token_musyrif_keasramaan')
      .select('*')
      .order('nama_musyrif', { ascending: true });

    if (error) {
      console.error('Error:', error);
    } else {
      setTokens(data || []);
    }
    setLoading(false);
  };

  const generateAllTokens = async () => {
    if (!confirm('Generate token untuk semua musyrif/ah aktif?')) return;

    setGenerating(true);
    try {
      // Ambil semua musyrif aktif
      const { data: musyrifList, error: fetchError } = await supabase
        .from('musyrif_keasramaan')
        .select('*')
        .eq('status', 'aktif');

      if (fetchError) throw fetchError;

      // Ambil token yang sudah ada
      const { data: existingTokens } = await supabase
        .from('token_musyrif_keasramaan')
        .select('musyrif_id');

      const existingMusyrifIds = new Set(
        (existingTokens || []).map((t) => t.musyrif_id)
      );

      // Filter hanya musyrif yang belum punya token
      const newMusyrif = (musyrifList || []).filter(
        (m) => !existingMusyrifIds.has(m.id)
      );

      if (newMusyrif.length === 0) {
        alert('Semua musyrif/ah sudah memiliki token!');
        setGenerating(false);
        return;
      }

      // Generate token untuk musyrif baru
      const tokensToInsert = newMusyrif.map((musyrif) => ({
        musyrif_id: musyrif.id,
        nama_musyrif: musyrif.nama_musyrif,
        lokasi: musyrif.cabang, // Use 'lokasi' column instead of 'cabang'
        kelas: musyrif.kelas,
        asrama: musyrif.asrama,
        token: generateRandomToken(),
        is_active: true,
      }));

      // Insert ke database
      const { error: insertError } = await supabase
        .from('token_musyrif_keasramaan')
        .insert(tokensToInsert);

      if (insertError) throw insertError;

      alert(`Berhasil generate ${tokensToInsert.length} token baru!`);
      fetchTokens();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Gagal generate token: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const generateRandomToken = () => {
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('token_musyrif_keasramaan')
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
    const link = `${window.location.origin}/habit-tracker/form/${token}`;
    
    // Try modern clipboard API first
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
      // Fallback for older browsers or non-secure contexts
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
    return `${window.location.origin}/habit-tracker/form/${token}`;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Kelola Link Formulir</h1>
              <p className="text-gray-600">Generate dan kelola link formulir untuk musyrif/ah</p>
            </div>
            <button
              onClick={generateAllTokens}
              disabled={generating}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Generating...' : 'Generate Semua Token'}
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
              Memuat data...
            </div>
          ) : tokens.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <p className="text-gray-500 mb-4">Belum ada token. Klik tombol di atas untuk generate.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">No</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Nama Musyrif/ah</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Cabang</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Kelas</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Asrama</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Link Formulir</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map((token, index) => (
                      <tr key={token.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-4 text-gray-700">{index + 1}</td>
                        <td className="px-6 py-4 text-gray-800 font-medium">{token.nama_musyrif}</td>
                        <td className="px-6 py-4 text-gray-700">{token.cabang || token.lokasi || '-'}</td>
                        <td className="px-6 py-4 text-gray-700">{token.kelas}</td>
                        <td className="px-6 py-4 text-gray-700">{token.asrama}</td>
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

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">📱 Cara Menggunakan:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>Klik tombol "Generate Semua Token" untuk membuat link untuk semua musyrif/ah</li>
              <li>Copy link dan kirim ke musyrif/ah via WhatsApp/Telegram</li>
              <li>Musyrif/ah buka link di HP dan langsung bisa input formulir</li>
              <li>Data siswa otomatis terfilter sesuai asrama musyrif/ah</li>
              <li>Nonaktifkan link jika tidak ingin musyrif/ah input lagi</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
