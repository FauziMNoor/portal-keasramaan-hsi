'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Search, Filter, Download, Trash2, AlertCircle, Award, FileText, TrendingUp, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCatatanPerilakuPhotoUrl } from '@/lib/uploadCatatanPerilaku';

interface CatatanPerilaku {
  id: string;
  tipe: string;
  tanggal: string;
  nis: string;
  nama_siswa: string;
  cabang: string;
  kelas: string;
  asrama: string;
  nama_kategori: string;
  nama_pelanggaran_kebaikan: string;
  level_dampak: string;
  poin: number;
  deskripsi_tambahan: string;
  dicatat_oleh: string;
  created_at: string;
  foto_kegiatan: string[];
}

export default function RiwayatPage() {
  const [catatanList, setCatatanList] = useState<CatatanPerilaku[]>([]);
  const [filteredList, setFilteredList] = useState<CatatanPerilaku[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipe, setFilterTipe] = useState<'semua' | 'pelanggaran' | 'kebaikan'>('semua');
  const [filterTanggalMulai, setFilterTanggalMulai] = useState('');
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState('');
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetchCatatan();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [catatanList, searchTerm, filterTipe, filterTanggalMulai, filterTanggalAkhir]);

  const fetchCatatan = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('catatan_perilaku_keasramaan')
      .select('*')
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error:', error);
    } else {
      setCatatanList(data || []);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...catatanList];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tipe
    if (filterTipe !== 'semua') {
      filtered = filtered.filter((c) => c.tipe === filterTipe);
    }

    // Filter by tanggal
    if (filterTanggalMulai) {
      filtered = filtered.filter((c) => c.tanggal >= filterTanggalMulai);
    }
    if (filterTanggalAkhir) {
      filtered = filtered.filter((c) => c.tanggal <= filterTanggalAkhir);
    }

    setFilteredList(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus catatan ini?')) return;

    try {
      const { error } = await supabase
        .from('catatan_perilaku_keasramaan')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Catatan berhasil dihapus!');
      fetchCatatan();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Gagal menghapus: ' + error.message);
    }
  };

  const exportToCSV = () => {
    const headers = ['Tanggal', 'Tipe', 'NIS', 'Nama Siswa', 'Cabang', 'Kelas', 'Asrama', 'Kategori', 'Poin', 'Deskripsi', 'Dicatat Oleh'];
    const rows = filteredList.map((c) => [
      c.tanggal,
      c.tipe,
      c.nis,
      c.nama_siswa,
      c.cabang,
      c.kelas,
      c.asrama,
      c.nama_kategori,
      c.poin,
      c.deskripsi_tambahan || '-',
      c.dicatat_oleh,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `riwayat-catatan-perilaku-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const totalPelanggaran = filteredList.filter((c) => c.tipe === 'pelanggaran').length;
  const totalKebaikan = filteredList.filter((c) => c.tipe === 'kebaikan').length;
  const totalPoin = filteredList.reduce((sum, c) => sum + c.poin, 0);

  const openLightbox = (images: string[], startIndex: number = 0) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImages([]);
    setLightboxIndex(0);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, lightboxImages]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Riwayat Catatan Perilaku</h1>
              <p className="text-sm sm:text-base text-gray-600">Lihat semua catatan pelanggaran dan kebaikan santri</p>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <FileText className="w-6 h-6" />
                <span className="text-3xl font-bold">{filteredList.length}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Total Catatan</h3>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <AlertCircle className="w-6 h-6" />
                <span className="text-3xl font-bold">{totalPelanggaran}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Pelanggaran</h3>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <Award className="w-6 h-6" />
                <span className="text-3xl font-bold">{totalKebaikan}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Kebaikan</h3>
            </div>
            
            <div className={`bg-gradient-to-br ${totalPoin >= 0 ? 'from-indigo-500 to-indigo-600' : 'from-orange-500 to-orange-600'} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105`}>
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-6 h-6" />
                <span className="text-3xl font-bold">{totalPoin > 0 ? '+' : ''}{totalPoin}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Total Poin</h3>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-1" />
                  Cari Santri/Kategori
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nama, NIS, atau kategori..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Tipe
                </label>
                <select
                  value={filterTipe}
                  onChange={(e) => setFilterTipe(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="semua">Semua</option>
                  <option value="pelanggaran">Pelanggaran</option>
                  <option value="kebaikan">Kebaikan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                <input
                  type="date"
                  value={filterTanggalMulai}
                  onChange={(e) => setFilterTanggalMulai(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
                <input
                  type="date"
                  value={filterTanggalAkhir}
                  onChange={(e) => setFilterTanggalAkhir(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
              Memuat data...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
              Tidak ada data catatan perilaku
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">No</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Tanggal</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Tipe</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Santri</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Cabang/Kelas</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Kategori</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Nama Pelanggaran/Kebaikan</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Level Dampak</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Poin</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Foto</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Dicatat Oleh</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((catatan, index) => (
                      <tr key={catatan.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3 text-gray-700">{index + 1}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {new Date(catatan.tanggal).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {catatan.tipe === 'pelanggaran' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              <AlertCircle className="w-3 h-3" />
                              Pelanggaran
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <Award className="w-3 h-3" />
                              Kebaikan
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{catatan.nama_siswa}</p>
                          <p className="text-xs text-gray-500">{catatan.nis}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700 text-sm">
                          {catatan.cabang} - {catatan.kelas}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 text-sm">{catatan.nama_kategori}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-800 text-sm">{catatan.nama_pelanggaran_kebaikan || '-'}</p>
                          {catatan.deskripsi_tambahan && (
                            <p className="text-xs text-gray-500 mt-1">{catatan.deskripsi_tambahan}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {catatan.tipe === 'pelanggaran' && catatan.level_dampak ? (
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                              {catatan.level_dampak}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            catatan.poin < 0 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {catatan.poin > 0 ? '+' : ''}{catatan.poin}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {catatan.foto_kegiatan && catatan.foto_kegiatan.length > 0 ? (
                            <div className="flex gap-1 justify-center">
                              {catatan.foto_kegiatan.slice(0, 3).map((foto, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => openLightbox(
                                    catatan.foto_kegiatan.map(f => getCatatanPerilakuPhotoUrl(f)),
                                    idx
                                  )}
                                  className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all hover:scale-110 group"
                                  title={`Lihat foto ${idx + 1}`}
                                >
                                  <img
                                    src={getCatatanPerilakuPhotoUrl(foto)}
                                    alt={`Foto ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </button>
                              ))}
                              {catatan.foto_kegiatan.length > 3 && (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                                  +{catatan.foto_kegiatan.length - 3}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700 text-sm">{catatan.dicatat_oleh}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDelete(catatan.id)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all"
            title="Tutup (ESC)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 z-50 px-4 py-2 bg-white bg-opacity-20 rounded-full text-white font-semibold">
            {lightboxIndex + 1} / {lightboxImages.length}
          </div>

          {/* Previous Button */}
          {lightboxImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 z-50 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all"
              title="Foto sebelumnya (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <div 
            className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImages[lightboxIndex]}
              alt={`Foto ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Next Button */}
          {lightboxImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 z-50 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all"
              title="Foto selanjutnya (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Download Button */}
          <a
            href={lightboxImages[lightboxIndex]}
            download
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-4 right-4 z-50 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white font-semibold transition-all flex items-center gap-2"
            title="Download foto"
          >
            <Download className="w-4 h-4" />
            Download
          </a>

          {/* Thumbnails */}
          {lightboxImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-white bg-opacity-20 p-2 rounded-full">
              {lightboxImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(idx);
                  }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === lightboxIndex 
                      ? 'border-white scale-110' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
