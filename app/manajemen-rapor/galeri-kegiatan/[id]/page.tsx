'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Upload, Edit2, Trash2, GripVertical, X, Save, Calendar, MapPin } from 'lucide-react';

interface Kegiatan {
  id: string;
  nama_kegiatan: string;
  deskripsi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  tahun_ajaran: string;
  semester: string;
  scope: string;
}

interface Foto {
  id: string;
  foto_url: string;
  caption: string;
  urutan: number;
}

export default function KegiatanDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null);
  const [photos, setPhotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionValue, setCaptionValue] = useState('');
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kegiatanRes, photosRes] = await Promise.all([
        fetch(`/api/rapor/kegiatan/${id}`),
        fetch(`/api/rapor/kegiatan/${id}/foto`),
      ]);

      const kegiatanResult = await kegiatanRes.json();
      const photosResult = await photosRes.json();

      if (kegiatanResult.success) {
        setKegiatan(kegiatanResult.data);
      }

      if (photosResult.success) {
        setPhotos(photosResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
        formData.append('captions', ''); // Empty caption initially
      }

      const response = await fetch(`/api/rapor/kegiatan/${id}/foto`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert(`${result.data.length} foto berhasil diupload`);
        fetchData(); // Refresh photos
      } else {
        alert(result.error || 'Gagal mengupload foto');
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Terjadi kesalahan saat mengupload foto');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (fotoId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus foto ini?')) return;

    try {
      const response = await fetch(`/api/rapor/kegiatan/foto/${fotoId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setPhotos(photos.filter(p => p.id !== fotoId));
        alert('Foto berhasil dihapus');
      } else {
        alert(result.error || 'Gagal menghapus foto');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Terjadi kesalahan saat menghapus foto');
    }
  };

  const handleEditCaption = (foto: Foto) => {
    setEditingCaption(foto.id);
    setCaptionValue(foto.caption || '');
  };

  const handleSaveCaption = async (fotoId: string) => {
    try {
      const response = await fetch(`/api/rapor/kegiatan/foto/${fotoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caption: captionValue }),
      });

      const result = await response.json();

      if (result.success) {
        setPhotos(photos.map(p => 
          p.id === fotoId ? { ...p, caption: captionValue } : p
        ));
        setEditingCaption(null);
      } else {
        alert(result.error || 'Gagal menyimpan caption');
      }
    } catch (error) {
      console.error('Error saving caption:', error);
      alert('Terjadi kesalahan saat menyimpan caption');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === index) return;

    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedItem];
    
    newPhotos.splice(draggedItem, 1);
    newPhotos.splice(index, 0, draggedPhoto);
    
    setPhotos(newPhotos);
    setDraggedItem(index);
  };

  const handleDragEnd = async () => {
    if (draggedItem === null) return;

    // Update urutan in database
    const updatedPhotos = photos.map((photo, index) => ({
      id: photo.id,
      urutan: index + 1,
    }));

    try {
      const response = await fetch(`/api/rapor/kegiatan/foto/${photos[0].id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photos: updatedPhotos }),
      });

      const result = await response.json();

      if (!result.success) {
        alert('Gagal menyimpan urutan foto');
        fetchData(); // Reload to get correct order
      }
    } catch (error) {
      console.error('Error saving order:', error);
      fetchData();
    }

    setDraggedItem(null);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (!kegiatan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Kegiatan tidak ditemukan</p>
        <Link
          href="/manajemen-rapor/galeri-kegiatan"
          className="mt-4 inline-block text-blue-600 hover:text-blue-700"
        >
          Kembali ke Daftar Kegiatan
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/manajemen-rapor/galeri-kegiatan"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Daftar Kegiatan
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{kegiatan.nama_kegiatan}</h1>
          <div className="flex flex-wrap gap-2 items-center text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(kegiatan.tanggal_mulai)} - {formatDate(kegiatan.tanggal_selesai)}</span>
            </div>
            <span>•</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
              {kegiatan.tahun_ajaran}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">
              {kegiatan.semester}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
              {getScopeLabel(kegiatan.scope)}
            </span>
          </div>
          {kegiatan.deskripsi && (
            <p className="mt-4 text-gray-600">{kegiatan.deskripsi}</p>
          )}
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Foto</h2>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5" />
              {uploading ? 'Mengupload...' : 'Pilih Foto'}
            </button>
            <p className="text-sm text-gray-600">
              Maksimal 5MB per foto. Format: JPG, PNG, WEBP
            </p>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Galeri Foto ({photos.length})
          </h2>

          {photos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Belum ada foto. Upload foto pertama untuk kegiatan ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((foto, index) => (
                <div
                  key={foto.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow cursor-move"
                >
                  {/* Drag Handle */}
                  <div className="bg-gray-100 px-3 py-2 flex items-center justify-between border-b border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600">
                      <GripVertical className="w-4 h-4" />
                      <span className="text-sm font-medium">#{foto.urutan}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditCaption(foto)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Edit caption"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeletePhoto(foto.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="aspect-video bg-gray-200 relative">
                    <img
                      src={foto.foto_url}
                      alt={foto.caption || `Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Caption */}
                  <div className="p-3">
                    {editingCaption === foto.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={captionValue}
                          onChange={(e) => setCaptionValue(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          rows={2}
                          placeholder="Tambahkan caption..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveCaption(foto.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            <Save className="w-3 h-3" />
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditingCaption(null)}
                            className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                          >
                            <X className="w-3 h-3" />
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        {foto.caption || <span className="italic text-gray-400">Tidak ada caption</span>}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </>
  );
}
