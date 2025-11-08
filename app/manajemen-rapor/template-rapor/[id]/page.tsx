'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Eye, Save, GripVertical } from 'lucide-react';
import PageTypeSelector from './components/PageTypeSelector';
import PageConfigForm from './components/PageConfigForm';

interface Template {
  id: string;
  nama_template: string;
  jenis_rapor: string;
  ukuran_kertas_default: string;
  orientasi_default: string;
  is_active: boolean;
}

interface TemplatePage {
  id: string;
  template_id: string;
  urutan: number;
  tipe_halaman: string;
  ukuran_kertas: string | null;
  orientasi: string | null;
  config: any;
}

export default function TemplateBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPageTypeSelector, setShowPageTypeSelector] = useState(false);
  const [selectedPage, setSelectedPage] = useState<TemplatePage | null>(null);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchTemplate();
    fetchPages();
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/rapor/template/${templateId}`);
      const result = await response.json();

      if (result.success) {
        setTemplate(result.data);
      } else {
        alert('Template tidak ditemukan');
        router.push('/manajemen-rapor/template-rapor');
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      alert('Terjadi kesalahan saat memuat template');
    }
  };

  const fetchPages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/rapor/template/${templateId}/pages`);
      const result = await response.json();

      if (result.success) {
        setPages(result.data);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPage = async (tipeHalaman: string) => {
    try {
      const response = await fetch(`/api/rapor/template/${templateId}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipe_halaman: tipeHalaman,
          config: {},
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowPageTypeSelector(false);
        fetchPages();
        // Open config form for new page
        setSelectedPage(result.data);
        setShowConfigForm(true);
      } else {
        alert(result.error || 'Gagal menambah halaman');
      }
    } catch (error) {
      console.error('Error adding page:', error);
      alert('Terjadi kesalahan saat menambah halaman');
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus halaman ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/rapor/template/pages/${pageId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        fetchPages();
      } else {
        alert(result.error || 'Gagal menghapus halaman');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Terjadi kesalahan saat menghapus halaman');
    }
  };

  const handleConfigPage = (page: TemplatePage) => {
    setSelectedPage(page);
    setShowConfigForm(true);
  };

  const handleSaveConfig = async (pageId: string, config: any, ukuran_kertas?: string, orientasi?: string) => {
    try {
      const response = await fetch(`/api/rapor/template/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          ukuran_kertas,
          orientasi,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowConfigForm(false);
        setSelectedPage(null);
        fetchPages();
      } else {
        alert(result.error || 'Gagal menyimpan konfigurasi');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Terjadi kesalahan saat menyimpan konfigurasi');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const draggedPage = pages[draggedIndex];
    const newUrutan = pages[dropIndex].urutan;

    try {
      const response = await fetch(`/api/rapor/template/pages/${draggedPage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_urutan: newUrutan }),
      });

      const result = await response.json();

      if (result.success) {
        fetchPages();
      } else {
        alert(result.error || 'Gagal mengubah urutan');
      }
    } catch (error) {
      console.error('Error reordering page:', error);
      alert('Terjadi kesalahan saat mengubah urutan');
    } finally {
      setDraggedIndex(null);
    }
  };

  const getPageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      static_cover: 'Cover Statis',
      dynamic_data: 'Data Dinamis',
      galeri_kegiatan: 'Galeri Kegiatan',
      qr_code: 'QR Code',
    };
    return labels[type] || type;
  };

  const getPageTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      static_cover: 'bg-blue-100 text-blue-700',
      dynamic_data: 'bg-green-100 text-green-700',
      galeri_kegiatan: 'bg-purple-100 text-purple-700',
      qr_code: 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (!template) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Memuat template...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Link
          href="/manajemen-rapor/template-rapor"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Template
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{template.nama_template}</h1>
        <p className="text-gray-600">Kelola halaman dan konfigurasi template rapor</p>
      </div>

      {/* Template Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Jenis Rapor</p>
            <p className="font-semibold text-gray-800">{template.jenis_rapor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ukuran Kertas</p>
            <p className="font-semibold text-gray-800">{template.ukuran_kertas_default}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Orientasi</p>
            <p className="font-semibold text-gray-800">{template.orientasi_default}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className={`font-semibold ${template.is_active ? 'text-green-600' : 'text-gray-600'}`}>
              {template.is_active ? 'Aktif' : 'Nonaktif'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowPageTypeSelector(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Halaman
        </button>
        <Link
          href={`/manajemen-rapor/template-rapor/${templateId}/preview`}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Eye className="w-5 h-5" />
          Preview Template
        </Link>
      </div>

      {/* Pages List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat halaman...</p>
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600 mb-4">Belum ada halaman dalam template ini</p>
          <button
            onClick={() => setShowPageTypeSelector(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tambah Halaman Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((page, index) => (
            <div
              key={page.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-move ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-gray-400" />
                
                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg font-bold text-gray-700">
                  {page.urutan}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPageTypeColor(page.tipe_halaman)}`}>
                      {getPageTypeLabel(page.tipe_halaman)}
                    </span>
                    {page.ukuran_kertas && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {page.ukuran_kertas}
                      </span>
                    )}
                    {page.orientasi && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {page.orientasi}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {Object.keys(page.config).length > 0 ? 'Sudah dikonfigurasi' : 'Belum dikonfigurasi'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleConfigPage(page)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Konfigurasi
                  </button>
                  <button
                    onClick={() => handleDeletePage(page.id)}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Page Type Selector Modal */}
      {showPageTypeSelector && (
        <PageTypeSelector
          onSelect={handleAddPage}
          onClose={() => setShowPageTypeSelector(false)}
        />
      )}

      {/* Page Config Form Modal */}
      {showConfigForm && selectedPage && (
        <PageConfigForm
          page={selectedPage}
          templateDefaults={{
            ukuran_kertas: template.ukuran_kertas_default,
            orientasi: template.orientasi_default,
          }}
          onSave={handleSaveConfig}
          onClose={() => {
            setShowConfigForm(false);
            setSelectedPage(null);
          }}
        />
      )}
    </>
  );
}
