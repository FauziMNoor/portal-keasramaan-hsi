'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Edit, Trash2, Eye, FileText, Filter, Copy, Layers } from 'lucide-react';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContainer';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Template {
  id: string;
  nama_template: string;
  jenis_rapor: string;
  ukuran_kertas_default: string;
  orientasi_default: string;
  is_active: boolean;
  created_at: string;
  template_type?: 'legacy' | 'builder';
}

export default function TemplateRaporPage() {
  const toast = useToast();
  const router = useRouter();
  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [filteredList, setFilteredList] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    jenis_rapor: '',
    is_active: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    nama_template: '',
    jenis_rapor: 'semester',
    ukuran_kertas_default: 'A4',
    orientasi_default: 'portrait',
    is_active: true,
    template_type: 'legacy' as 'legacy' | 'builder',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string; nama: string }>({
    isOpen: false,
    id: '',
    nama: '',
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [templateList, searchTerm, filters]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.jenis_rapor) queryParams.append('jenis_rapor', filters.jenis_rapor);
      if (filters.is_active) queryParams.append('is_active', filters.is_active);

      const response = await fetch(`/api/rapor/template?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setTemplateList(result.data);
      } else {
        toast.error('Gagal memuat data template');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...templateList];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.nama_template.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredList(filtered);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama_template.trim()) {
      toast.warning('Nama template harus diisi');
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = formData.template_type === 'builder' 
        ? '/api/rapor/template/builder'
        : '/api/rapor/template';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Template berhasil dibuat');
        setShowCreateModal(false);
        
        const templateId = result.data.id;
        
        // Reset form
        setFormData({
          nama_template: '',
          jenis_rapor: 'semester',
          ukuran_kertas_default: 'A4',
          orientasi_default: 'portrait',
          is_active: true,
          template_type: 'legacy',
        });
        
        // Redirect to builder if builder type, otherwise refresh list
        if (formData.template_type === 'builder') {
          router.push(`/manajemen-rapor/template-rapor/builder/${templateId}`);
        } else {
          fetchTemplates();
        }
      } else {
        toast.error(result.error || 'Gagal membuat template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Terjadi kesalahan saat membuat template');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const { id } = deleteDialog;
    setDeleteDialog({ isOpen: false, id: '', nama: '' });

    try {
      const response = await fetch(`/api/rapor/template/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Template berhasil dihapus');
        fetchTemplates();
      } else {
        toast.error(result.error || 'Gagal menghapus template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Terjadi kesalahan saat menghapus template');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/rapor/template/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Status template berhasil diubah');
        fetchTemplates();
      } else {
        toast.error(result.error || 'Gagal mengubah status template');
      }
    } catch (error) {
      console.error('Error toggling template status:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const getJenisLabel = (jenis: string) => {
    const labels: Record<string, string> = {
      semester: 'Semester',
      bulanan: 'Bulanan',
      tahunan: 'Tahunan',
    };
    return labels[jenis] || jenis;
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Template Rapor</h1>
        <p className="text-gray-600">Kelola template rapor keasramaan</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari nama template..."
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Buat Template
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Rapor
              </label>
              <select
                value={filters.jenis_rapor}
                onChange={(e) => setFilters({ ...filters, jenis_rapor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Jenis</option>
                <option value="semester">Semester</option>
                <option value="bulanan">Bulanan</option>
                <option value="tahunan">Tahunan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.is_active}
                onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={fetchTemplates}
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
        <div className="bg-white rounded-lg shadow-sm">
          <div className="empty-state animate-fade-in-up">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-linear-to-br from-blue-50 to-indigo-50 rounded-full opacity-50 animate-pulse"></div>
              </div>
              <FileText className="empty-state-icon relative z-10" />
            </div>
            <h3 className="empty-state-title">
              {templateList.length === 0 ? 'Belum Ada Template' : 'Tidak Ada Hasil'}
            </h3>
            <p className="empty-state-description">
              {templateList.length === 0
                ? 'Mulai buat template rapor untuk generate rapor siswa dengan mudah'
                : 'Coba ubah filter atau kata kunci pencarian Anda'}
            </p>
            {templateList.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary inline-flex items-center gap-2 hover-lift"
              >
                <Plus className="w-5 h-5" />
                Buat Template Pertama
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 stagger-fade-in">
          {filteredList.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-smooth overflow-hidden hover-lift">
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                    {template.nama_template}
                  </h3>
                  <button
                    onClick={() => toggleActive(template.id, template.is_active)}
                    className={`px-2 py-1 text-xs rounded-full transition-smooth focus-ring ${
                      template.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {template.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {getJenisLabel(template.jenis_rapor)}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {template.ukuran_kertas_default}
                    </span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                      {template.orientasi_default}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      template.template_type === 'builder'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {template.template_type === 'builder' ? 'Builder' : 'Legacy'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Dibuat: {formatDate(template.created_at)}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  {template.template_type === 'builder' ? (
                    <Link
                      href={`/manajemen-rapor/template-rapor/builder/${template.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-smooth text-sm touch-manipulation focus-ring"
                    >
                      <Layers className="w-4 h-4" />
                      <span className="hidden sm:inline">Open in Builder</span>
                      <span className="sm:hidden">Builder</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/manajemen-rapor/template-rapor/${template.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-smooth text-sm touch-manipulation focus-ring"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Link>
                  )}
                  <Link
                    href={`/manajemen-rapor/template-rapor/${template.id}/preview`}
                    className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-smooth text-sm touch-manipulation focus-ring"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteDialog({ isOpen: true, id: template.id, nama: template.nama_template })}
                    className="flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 active:bg-red-100 transition-smooth text-sm touch-manipulation focus-ring"
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in custom-scrollbar">
            <div className="p-4 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Buat Template Baru</h2>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Template *
                  </label>
                  <input
                    type="text"
                    value={formData.nama_template}
                    onChange={(e) => setFormData({ ...formData, nama_template: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: Rapor Semester Ganjil 2024"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Template *
                  </label>
                  <select
                    value={formData.template_type}
                    onChange={(e) => setFormData({ ...formData, template_type: e.target.value as 'legacy' | 'builder' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="legacy">Legacy (Form-based)</option>
                    <option value="builder">Builder (Drag & Drop)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.template_type === 'builder' 
                      ? 'Template dengan visual editor drag-and-drop seperti Google Slides'
                      : 'Template dengan form konfigurasi (sistem lama)'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Rapor *
                  </label>
                  <select
                    value={formData.jenis_rapor}
                    onChange={(e) => setFormData({ ...formData, jenis_rapor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="semester">Semester</option>
                    <option value="bulanan">Bulanan</option>
                    <option value="tahunan">Tahunan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ukuran Kertas Default
                  </label>
                  <select
                    value={formData.ukuran_kertas_default}
                    onChange={(e) => setFormData({ ...formData, ukuran_kertas_default: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="A5">A5 (148 x 210 mm)</option>
                    <option value="A4">A4 (210 x 297 mm)</option>
                    <option value="Letter">Letter (216 x 279 mm)</option>
                    <option value="F4">F4 (210 x 330 mm)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orientasi Default
                  </label>
                  <select
                    value={formData.orientasi_default}
                    onChange={(e) => setFormData({ ...formData, orientasi_default: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                    Aktifkan template
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-smooth focus-ring"
                    disabled={submitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-smooth disabled:opacity-50 focus-ring"
                    disabled={submitting}
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Hapus Template"
        message={`Apakah Anda yakin ingin menghapus template "${deleteDialog.nama}"? Semua halaman akan ikut terhapus.`}
        confirmText="Hapus"
        cancelText="Batal"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: '', nama: '' })}
      />
    </>
  );
}
