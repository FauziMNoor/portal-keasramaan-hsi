'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, X, ChevronLeft, ChevronRight, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface Photo {
  id: string;
  foto_url: string;
  caption: string;
  urutan: number;
}

interface Kegiatan {
  id: string;
  nama_kegiatan: string;
  deskripsi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  scope: string;
  foto: Photo[];
}

interface GaleriData {
  siswa: {
    nis: string;
    nama_siswa: string;
    kelas: string;
    asrama: string;
    lokasi: string;
  };
  periode: {
    tahun_ajaran: string;
    semester: string;
  };
  kegiatan: Kegiatan[];
}

export default function GaleriPublikPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<GaleriData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentKegiatanPhotos, setCurrentKegiatanPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    fetchGaleriData();
  }, [token]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        nextPhoto();
      } else if (e.key === 'ArrowLeft') {
        prevPhoto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentPhotoIndex, currentKegiatanPhotos]);

  const fetchGaleriData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/rapor/galeri-publik/${token}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setData(result.data);
      } else {
        if (response.status === 404) {
          setError('Token tidak valid atau tidak ditemukan');
        } else if (response.status === 410) {
          setError('Token sudah kadaluarsa');
        } else {
          setError(result.error || 'Gagal memuat data galeri');
        }
      }
    } catch (err) {
      console.error('Error fetching galeri data:', err);
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (photos: Photo[], index: number) => {
    setCurrentKegiatanPhotos(photos);
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === currentKegiatanPhotos.length - 1 ? 0 : prev + 1
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? currentKegiatanPhotos.length - 1 : prev - 1
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getScopeLabel = (scope: string) => {
    const labels: Record<string, string> = {
      seluruh_sekolah: 'Seluruh Sekolah',
      kelas_10: 'Kelas 10',
      kelas_11: 'Kelas 11',
      kelas_12: 'Kelas 12',
      asrama_putra: 'Asrama Putra',
      asrama_putri: 'Asrama Putri',
    };
    return labels[scope] || scope;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-700 text-lg">Memuat galeri...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            Silakan hubungi admin sekolah jika Anda merasa ini adalah kesalahan.
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Data Tidak Tersedia</h1>
          <p className="text-gray-600">Tidak ada data galeri yang dapat ditampilkan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              Galeri Kegiatan Asrama
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-gray-600">
              <span className="font-semibold text-lg">{data.siswa.nama_siswa}</span>
              <span className="hidden sm:inline">•</span>
              <span>{data.siswa.nis}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              {data.siswa.kelas && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {data.siswa.kelas}
                </span>
              )}
              {data.siswa.asrama && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  {data.siswa.asrama}
                </span>
              )}
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                {data.periode.tahun_ajaran} - {data.periode.semester}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {data.kegiatan.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <ImageIcon className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Belum Ada Kegiatan
            </h3>
            <p className="text-gray-600">
              Belum ada dokumentasi kegiatan untuk periode ini.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {data.kegiatan.map((kegiatan) => (
              <div
                key={kegiatan.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Kegiatan Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                  <h2 className="text-2xl font-bold mb-2">{kegiatan.nama_kegiatan}</h2>
                  {kegiatan.deskripsi && (
                    <p className="text-blue-100 mb-3">{kegiatan.deskripsi}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(kegiatan.tanggal_mulai)} - {formatDate(kegiatan.tanggal_selesai)}
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-white/20 rounded-full">
                      {getScopeLabel(kegiatan.scope)}
                    </span>
                  </div>
                </div>

                {/* Photo Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {kegiatan.foto.map((photo, index) => (
                      <div
                        key={photo.id}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => openLightbox(kegiatan.foto, index)}
                      >
                        <img
                          src={photo.foto_url}
                          alt={photo.caption || kegiatan.nama_kegiatan}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {photo.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-xs line-clamp-2">{photo.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && currentKegiatanPhotos.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation Buttons */}
          {currentKegiatanPhotos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Image Container */}
          <div className="max-w-6xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center p-4">
            <img
              src={currentKegiatanPhotos[currentPhotoIndex].foto_url}
              alt={currentKegiatanPhotos[currentPhotoIndex].caption || 'Photo'}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Caption */}
            {currentKegiatanPhotos[currentPhotoIndex].caption && (
              <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-2xl">
                <p className="text-white text-center">
                  {currentKegiatanPhotos[currentPhotoIndex].caption}
                </p>
              </div>
            )}

            {/* Counter */}
            <div className="mt-4 text-white text-sm">
              {currentPhotoIndex + 1} / {currentKegiatanPhotos.length}
            </div>
          </div>

          {/* Keyboard Navigation Hint */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-xs">
            Gunakan tombol ← → atau klik tombol navigasi
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600 text-sm">
          <p>Portal Keasramaan - Dokumentasi Kegiatan Asrama</p>
        </div>
      </div>
    </div>
  );
}
