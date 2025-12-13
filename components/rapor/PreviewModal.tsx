'use client';

import { useState, useEffect } from 'react';
import { X, FileText, Loader2, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PreviewModalProps {
  nis: string;
  cabang: string;
  tahunAjaran: string;
  semester: string;
  kelas: string;
  asrama: string;
  onClose: () => void;
  onViewDetail: () => void;
  onGenerate: () => void;
}

interface PreviewData {
  santri: any;
  habitCount: number;
  kegiatanCount: number;
  hasCatatan: boolean;
  foto_url: string;
}

export default function PreviewModal({
  nis,
  cabang,
  tahunAjaran,
  semester,
  kelas,
  asrama,
  onClose,
  onViewDetail,
  onGenerate,
}: PreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PreviewData | null>(null);

  useEffect(() => {
    fetchPreviewData();
  }, [nis]);

  const fetchPreviewData = async () => {
    setLoading(true);
    try {
      // Fetch santri
      const { data: santriData } = await supabase
        .from('data_siswa_keasramaan')
        .select('*')
        .eq('nis', nis)
        .single();

      // Count habit tracker entries
      const { data: habitData } = await supabase
        .from('formulir_habit_tracker_keasramaan')
        .select('id')
        .eq('nis', nis)
        .eq('tahun_ajaran', tahunAjaran)
        .eq('semester', semester);

      // Count kegiatan
      const { data: kegiatanData } = await supabase
        .from('rapor_kegiatan_keasramaan')
        .select('id')
        .eq('cabang', cabang)
        .eq('tahun_ajaran', tahunAjaran)
        .eq('semester', semester)
        .eq('kelas', kelas)
        .in('asrama', [asrama, 'Semua']);

      // Check catatan
      const { data: catatanData } = await supabase
        .from('rapor_catatan_keasramaan')
        .select('id')
        .eq('nis', nis)
        .eq('tahun_ajaran', tahunAjaran)
        .eq('semester', semester)
        .single();

      setData({
        santri: santriData,
        habitCount: habitData?.length || 0,
        kegiatanCount: kegiatanData?.length || 0,
        hasCatatan: !!catatanData,
        foto_url: santriData?.foto || '',
      });
    } catch (error) {
      console.error('Error fetching preview data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Preview Rapor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">Memuat data...</p>
            </div>
          ) : data ? (
            <>
              {/* Foto Santri */}
              <div className="text-center mb-6">
                <FotoSantri foto={data.foto_url} nama={data.santri?.nama_siswa || ''} size="large" />
                <h3 className="text-lg font-bold text-gray-800">{data.santri?.nama_siswa}</h3>
                <p className="text-sm text-gray-600">{nis}</p>
              </div>

              {/* Info Dasar */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="text-sm text-gray-600 mb-1">Semester</div>
                <div className="font-semibold text-gray-800">{semester} {tahunAjaran}</div>
              </div>

              {/* Status Checklist */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">📋 Data Pribadi</span>
                  <span className="text-green-600 font-semibold">✅ Lengkap</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">📊 Habit Tracker</span>
                  {data.habitCount > 0 ? (
                    <span className="text-green-600 font-semibold">✅ {data.habitCount} entry</span>
                  ) : (
                    <span className="text-red-600 font-semibold">❌ Kosong</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">📷 Kegiatan</span>
                  {data.kegiatanCount >= 6 ? (
                    <span className="text-green-600 font-semibold">✅ {data.kegiatanCount}/6</span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">⚠️ {data.kegiatanCount}/6</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">📝 Catatan Musyrif</span>
                  {data.hasCatatan ? (
                    <span className="text-green-600 font-semibold">✅ Ada</span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">⚠️ Kosong</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onViewDetail}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  📄 Lihat Detail Lengkap
                </button>
                <button
                  onClick={onGenerate}
                  className="flex-1 px-4 py-3 bg-linear-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-colors"
                >
                  Generate
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Data tidak ditemukan
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Component untuk menampilkan foto santri
function FotoSantri({ foto, nama, size = 'medium' }: { foto: string; nama: string; size?: 'medium' | 'large' }) {
  const [fotoUrl, setFotoUrl] = useState<string>('');
  const sizeClass = size === 'large' ? 'w-24 h-24' : 'w-16 h-16';

  useEffect(() => {
    if (foto) {
      if (foto.startsWith('http')) {
        setFotoUrl(foto);
      } else {
        const { data } = supabase.storage.from('foto-siswa').getPublicUrl(foto);
        if (data?.publicUrl) {
          setFotoUrl(data.publicUrl);
        }
      }
    }
  }, [foto]);

  if (fotoUrl) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden bg-gray-200 mx-auto mb-3`}>
        <img
          src={fotoUrl}
          alt={nama}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3`}>
      <User className={size === 'large' ? 'w-12 h-12' : 'w-8 h-8'} />
    </div>
  );
}
