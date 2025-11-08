'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface Template {
  id: string;
  nama_template: string;
  jenis_rapor: string;
  ukuran_kertas_default: string;
  orientasi_default: string;
}

interface TemplatePage {
  id: string;
  urutan: number;
  tipe_halaman: string;
  ukuran_kertas: string | null;
  orientasi: string | null;
  config: any;
}

interface Siswa {
  nis: string;
  nama: string;
  kelas: string;
}

export default function TemplatePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [selectedSiswa, setSelectedSiswa] = useState<string>('');
  const [siswaData, setSiswaData] = useState<any>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    fetchTemplate();
    fetchPages();
    fetchSiswaList();
  }, [templateId]);

  useEffect(() => {
    if (selectedSiswa) {
      fetchSiswaData(selectedSiswa);
    }
  }, [selectedSiswa]);

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

  const fetchSiswaList = async () => {
    try {
      const response = await fetch('/api/siswa');
      const result = await response.json();

      if (result.success) {
        setSiswaList(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching siswa:', error);
    }
  };

  const fetchSiswaData = async (nis: string) => {
    try {
      // Fetch siswa details
      const siswaResponse = await fetch(`/api/siswa/${nis}`);
      const siswaResult = await siswaResponse.json();

      if (siswaResult.success) {
        setSiswaData(siswaResult.data);
      }
    } catch (error) {
      console.error('Error fetching siswa data:', error);
    }
  };

  const renderPagePreview = (page: TemplatePage) => {
    const ukuran = page.ukuran_kertas || template?.ukuran_kertas_default || 'A4';
    const orientasi = page.orientasi || template?.orientasi_default || 'portrait';

    const aspectRatio = orientasi === 'landscape' ? 'aspect-[1.414/1]' : 'aspect-[1/1.414]';

    switch (page.tipe_halaman) {
      case 'static_cover':
        return (
          <div className={`bg-white border-2 border-gray-300 ${aspectRatio} flex items-center justify-center relative overflow-hidden`}>
            {page.config.cover_image_url ? (
              <img
                src={page.config.cover_image_url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-8">
                <p className="text-gray-400 mb-2">Cover Image</p>
                <p className="text-xs text-gray-400">Belum ada gambar cover</p>
              </div>
            )}
            
            {/* Overlay Data */}
            {page.config.overlay_data && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-30 p-8">
                {page.config.overlay_data.show_nama_siswa && (
                  <h1 className="text-3xl font-bold mb-2">
                    {siswaData?.nama || '[Nama Siswa]'}
                  </h1>
                )}
                {page.config.overlay_data.show_tahun_ajaran && (
                  <p className="text-xl mb-1">[Tahun Ajaran]</p>
                )}
                {page.config.overlay_data.show_semester && (
                  <p className="text-xl">[Semester]</p>
                )}
              </div>
            )}
          </div>
        );

      case 'dynamic_data':
        return (
          <div className={`bg-white border-2 border-gray-300 ${aspectRatio} p-8 overflow-auto`}>
            <h2 className="text-2xl font-bold mb-6 text-center">Data Capaian Indikator</h2>
            
            {page.config.kategori_indikator_ids && page.config.kategori_indikator_ids.length > 0 ? (
              <div className="space-y-6">
                {page.config.kategori_indikator_ids.map((kategoriId: string, idx: number) => (
                  <div key={kategoriId} className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3 text-blue-600">
                      Kategori {idx + 1}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Indikator 1</span>
                        <span className="text-sm font-semibold">A</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Indikator 2</span>
                        <span className="text-sm font-semibold">B</span>
                      </div>
                      {page.config.show_deskripsi && (
                        <p className="text-xs text-gray-600 italic mt-2">
                          Deskripsi capaian akan ditampilkan di sini
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <p>Belum ada kategori indikator dipilih</p>
              </div>
            )}
          </div>
        );

      case 'galeri_kegiatan':
        return (
          <div className={`bg-white border-2 border-gray-300 ${aspectRatio} p-8 overflow-auto`}>
            <h2 className="text-2xl font-bold mb-6 text-center">Galeri Kegiatan</h2>
            
            {page.config.kegiatan_ids && page.config.kegiatan_ids.length > 0 ? (
              <div className="space-y-6">
                {page.config.kegiatan_ids.slice(0, 2).map((kegiatanId: string, idx: number) => (
                  <div key={kegiatanId}>
                    <h3 className="text-lg font-semibold mb-3">Kegiatan {idx + 1}</h3>
                    <div className={`grid gap-2 ${
                      page.config.layout === 'grid-2' ? 'grid-cols-2' :
                      page.config.layout === 'grid-4' ? 'grid-cols-2' :
                      page.config.layout === 'grid-6' ? 'grid-cols-3' :
                      'grid-cols-2'
                    }`}>
                      {[...Array(Math.min(page.config.max_foto_per_page || 2, 4))].map((_, i) => (
                        <div key={i} className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-sm">Foto {i + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <p>Belum ada kegiatan dipilih</p>
                {page.config.auto_select_by_scope && (
                  <p className="text-xs mt-2">Auto-select berdasarkan scope aktif</p>
                )}
              </div>
            )}
          </div>
        );

      case 'qr_code':
        return (
          <div className={`bg-white border-2 border-gray-300 ${aspectRatio} flex flex-col items-center justify-center p-8`}>
            <h2 className="text-2xl font-bold mb-6">Akses Galeri Online</h2>
            
            <div className={`bg-gray-200 rounded-lg flex items-center justify-center mb-4`}
                 style={{ width: page.config.qr_size || 200, height: page.config.qr_size || 200 }}>
              <span className="text-gray-400">QR Code</span>
            </div>
            
            {page.config.show_text !== false && (
              <p className="text-center text-gray-700 max-w-md">
                {page.config.text || 'Scan untuk melihat galeri lengkap'}
              </p>
            )}
            
            {page.config.qr_base_url && (
              <p className="text-xs text-gray-400 mt-4">
                {page.config.qr_base_url}[token]
              </p>
            )}
          </div>
        );

      default:
        return (
          <div className={`bg-white border-2 border-gray-300 ${aspectRatio} flex items-center justify-center`}>
            <p className="text-gray-400">Unknown page type</p>
          </div>
        );
    }
  };

  if (!template || loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Memuat preview...</p>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Template ini belum memiliki halaman</p>
        <Link
          href={`/manajemen-rapor/template-rapor/${templateId}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tambah Halaman
        </Link>
      </div>
    );
  }

  const currentPage = pages[currentPageIndex];

  return (
    <div className={fullscreen ? 'fixed inset-0 bg-gray-900 z-50 overflow-auto' : ''}>
      <div className={fullscreen ? 'p-8' : ''}>
        {/* Header */}
        <div className={`mb-8 ${fullscreen ? 'text-white' : ''}`}>
          {!fullscreen && (
            <Link
              href={`/manajemen-rapor/template-rapor/${templateId}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Template Builder
            </Link>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{template.nama_template}</h1>
              <p className={fullscreen ? 'text-gray-300' : 'text-gray-600'}>
                Preview Template - Halaman {currentPageIndex + 1} dari {pages.length}
              </p>
            </div>
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className={`p-2 rounded-lg transition-colors ${
                fullscreen
                  ? 'bg-gray-800 hover:bg-gray-700 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Siswa Selector */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${fullscreen ? 'text-white' : 'text-gray-700'}`}>
            Pilih Siswa untuk Preview dengan Data Real (Opsional)
          </label>
          <select
            value={selectedSiswa}
            onChange={(e) => setSelectedSiswa(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Gunakan Data Sample --</option>
            {siswaList.map((siswa) => (
              <option key={siswa.nis} value={siswa.nis}>
                {siswa.nama} - {siswa.kelas}
              </option>
            ))}
          </select>
        </div>

        {/* Preview Area */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
            disabled={currentPageIndex === 0}
            className={`p-2 rounded-lg transition-colors ${
              currentPageIndex === 0
                ? 'opacity-50 cursor-not-allowed'
                : fullscreen
                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex-1 max-w-4xl">
            {renderPagePreview(currentPage)}
          </div>

          <button
            onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
            disabled={currentPageIndex === pages.length - 1}
            className={`p-2 rounded-lg transition-colors ${
              currentPageIndex === pages.length - 1
                ? 'opacity-50 cursor-not-allowed'
                : fullscreen
                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Page Info */}
        <div className={`text-center ${fullscreen ? 'text-white' : 'text-gray-600'}`}>
          <p className="text-sm mb-2">
            Tipe: <span className="font-semibold">{currentPage.tipe_halaman}</span>
          </p>
          <p className="text-sm">
            Ukuran: {currentPage.ukuran_kertas || template.ukuran_kertas_default} | 
            Orientasi: {currentPage.orientasi || template.orientasi_default}
          </p>
        </div>

        {/* Page Navigation Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPageIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentPageIndex
                  ? 'bg-blue-600'
                  : fullscreen
                  ? 'bg-gray-600 hover:bg-gray-500'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
