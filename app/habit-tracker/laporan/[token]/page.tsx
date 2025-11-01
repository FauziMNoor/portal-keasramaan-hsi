'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Search, AlertCircle } from 'lucide-react';

export default function InputNISPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [nis, setNis] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [logoSekolah, setLogoSekolah] = useState<string>('');

  useEffect(() => {
    validateToken();
    fetchLogoSekolah();
  }, [token]);

  const validateToken = async () => {
    setValidating(true);
    const { data, error } = await supabase
      .from('token_wali_santri_keasramaan')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
    setValidating(false);
  };

  const fetchLogoSekolah = async () => {
    try {
      const { data } = await supabase
        .from('identitas_sekolah_keasramaan')
        .select('logo')
        .limit(1)
        .single();

      if (data?.logo) {
        if (data.logo.startsWith('http')) {
          setLogoSekolah(data.logo);
        } else {
          const { data: urlData } = supabase.storage.from('logos').getPublicUrl(data.logo);
          if (urlData?.publicUrl) {
            setLogoSekolah(urlData.publicUrl);
          }
        }
      }
    } catch (err) {
      console.warn('Logo fetch failed:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validasi NIS di database
      const { data, error } = await supabase
        .from('data_siswa_keasramaan')
        .select('nis, nama_siswa')
        .eq('nis', nis)
        .single();

      if (error || !data) {
        alert('NIS tidak ditemukan. Pastikan NIS yang Anda masukkan benar.');
        setLoading(false);
        return;
      }

      // Redirect ke dashboard
      router.push(`/habit-tracker/laporan/${token}/${nis}`);
    } catch (error: any) {
      console.error('Error:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memvalidasi link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Link Tidak Valid</h1>
          <p className="text-gray-600">Link laporan tidak valid atau sudah tidak aktif.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl mb-4 shadow-xl border-4 border-green-100">
            {logoSekolah ? (
              <img
                src={logoSekolah}
                alt="Logo Sekolah"
                className="w-20 h-20 object-contain rounded-2xl"
                onError={() => setLogoSekolah('')}
              />
            ) : (
              <span className="text-5xl">🏫</span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Laporan Keasramaan</h1>
          <p className="text-gray-600">HSI Boarding School</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Masukkan NIS</h2>
                <p className="text-sm text-gray-500">Nomor Induk Santri</p>
              </div>
            </div>

          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                NIS Santri <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all"
                placeholder="Contoh: 2024001"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !nis}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-5 rounded-2xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Memvalidasi...</span>
                </>
              ) : (
                <>
                  <Search className="w-6 h-6" />
                  <span>Lihat Laporan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Hubungi admin sekolah jika Anda mengalami kesulitan
          </p>
        </div>
      </div>
    </div>
  );
}
