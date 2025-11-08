'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Edit, Trash2, Eye, Calendar, Filter } from 'lucide-react';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContainer';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Kegiatan {
  id: string;
  nama_kegiatan: string;
  deskripsi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  tahun_ajaran: string;
  semester: string;
  scope: string;
  created_at: string;
}

export default function GaleriKegiatanPage() {
  const toast = useToast();
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [filteredList, setFilteredList] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tahun_ajaran: '',
    semester: '',
    scope: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string; nama: string }>({
    isOpen: false,
    id: '',
    nama: '',
  });

  useEffect(() => {
    fetchKegiatan();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [kegiatanList, searchTerm, filters]);

  const fetchKegiatan = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.tahun_ajaran) queryParams.append('tahun_ajaran', filters.tahun_ajaran);
      if (filters.semester) queryParams.append('semester', filters.semester);
      if (filters.scope) queryParams.append('scope', filters.scope);

      const response = await fetch(`/api/rapor/kegiatan?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setKegiatanList(result.data);
      } else {
        toast.error('Gagal memuat data kegiatan');
      }
    } catch (error) {
      console.error('Error fetching kegiatan:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...kegiatanList];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(k =>
        k.nama_kegiatan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredList(filtered);
  };

  const handleDelete = async () => {
    const { id } = deleteDialog;
    setDeleteDialog({ isOpen: false, id: '', nama: '' });

    try {
      const response = await fetch(`/api/rapor/kegiatan/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Kegiatan berhasil dihapus');
        fetchKegiatan();
      } else {
        toast.error(result.error || 'Gagal menghapus kegiatan');
      }
    } catch (error) {
      console.error('Error deleting kegiatan:', error);
      toast.error('Terjadi kesalahan saat menghapus kegiatan');
    }
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
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Galeri Kegiatan</h1>
        <p className="text-gray-600">Kelola dokumentasi foto kegiatan asrama</p>
      </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama kegiatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle & Create Button */}
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filter
              </button>
              <Link
                href="/manajemen-rapor/galeri-kegiatan/create"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Tambah Kegiatan
              </Link>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 2024/2025"
                  value={filters.tahun_ajaran}
                  onChange={(e) => setFilters({ ...filters, tahun_ajaran: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <select
                  value={filters.semester}
                  onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Semester</option>
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scope
                </label>
                <select
                  value={filters.scope}
                  onChange={(e) => setFilters({ ...filters, scope: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Scope</option>
                  <option value="seluruh_sekolah">Seluruh Sekolah</option>
                  <option value="kelas_10">Kelas 10</option>
                  <option value="kelas_11">Kelas 11</option>
                  <option value="kelas_12">Kelas 12</option>
                  <option value="asrama_putra">Asrama Putra</option>
                  <option value="asrama_putri">Asrama Putri</option>
                </select>
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button
                  onClick={fetchKegiatan}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : filteredList.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum Ada Kegiatan</h3>
            <p className="text-gray-600 mb-4">Mulai tambahkan kegiatan untuk mendokumentasikan aktivitas asrama</p>
            <Link
              href="/manajemen-rapor/galeri-kegiatan/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tambah Kegiatan Pertama
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredList.map((kegiatan) => (
              <div key={kegiatan.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {kegiatan.nama_kegiatan}
                    </h3>
                  </div>
                  
                  {kegiatan.deskripsi && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {kegiatan.deskripsi}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(kegiatan.tanggal_mulai)} - {formatDate(kegiatan.tanggal_selesai)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {kegiatan.tahun_ajaran}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {kegiatan.semester}
                      </span>
                    </div>
                    <div>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {getScopeLabel(kegiatan.scope)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Link
                      href={`/manajemen-rapor/galeri-kegiatan/${kegiatan.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm touch-manipulation"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Detail</span>
                    </Link>
                    <Link
                      href={`/manajemen-rapor/galeri-kegiatan/${kegiatan.id}/edit`}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm touch-manipulation"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, id: kegiatan.id, nama: kegiatan.nama_kegiatan })}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors text-sm touch-manipulation"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          title="Hapus Kegiatan"
          message={`Apakah Anda yakin ingin menghapus kegiatan "${deleteDialog.nama}"? Semua foto akan ikut terhapus.`}
          confirmText="Hapus"
          cancelText="Batal"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteDialog({ isOpen: false, id: '', nama: '' })}
        />
    </>
  );
}
