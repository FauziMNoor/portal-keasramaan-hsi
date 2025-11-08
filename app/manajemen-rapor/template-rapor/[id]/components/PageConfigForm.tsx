'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface PageConfigFormProps {
  page: {
    id: string;
    tipe_halaman: string;
    ukuran_kertas: string | null;
    orientasi: string | null;
    config: any;
  };
  templateDefaults: {
    ukuran_kertas: string;
    orientasi: string;
  };
  onSave: (pageId: string, config: any, ukuran_kertas?: string, orientasi?: string) => void;
  onClose: () => void;
}

export default function PageConfigForm({ page, templateDefaults, onSave, onClose }: PageConfigFormProps) {
  const [ukuranKertas, setUkuranKertas] = useState(page.ukuran_kertas || '');
  const [orientasi, setOrientasi] = useState(page.orientasi || '');
  const [config, setConfig] = useState(page.config || {});
  const [kegiatanList, setKegiatanList] = useState<any[]>([]);
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (page.tipe_halaman === 'galeri_kegiatan') {
      fetchKegiatan();
    } else if (page.tipe_halaman === 'dynamic_data') {
      fetchKategori();
    }
  }, [page.tipe_halaman]);

  const fetchKegiatan = async () => {
    try {
      const response = await fetch('/api/rapor/kegiatan');
      const result = await response.json();
      if (result.success) {
        setKegiatanList(result.data);
      }
    } catch (error) {
      console.error('Error fetching kegiatan:', error);
    }
  };

  const fetchKategori = async () => {
    try {
      const response = await fetch('/api/rapor/indikator/kategori');
      const result = await response.json();
      if (result.success) {
        setKategoriList(result.data);
      }
    } catch (error) {
      console.error('Error fetching kategori:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      page.id,
      config,
      ukuranKertas || undefined,
      orientasi || undefined
    );
  };

  const updateConfig = (key: string, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert('Ukuran file maksimal 10MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'rapor-covers');

      const response = await fetch('/api/rapor/upload-cover', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        updateConfig('cover_image_url', result.url);
        alert('Cover image berhasil diupload');
      } else {
        alert(result.error || 'Gagal mengupload cover image');
      }
    } catch (error) {
      console.error('Error uploading cover:', error);
      alert('Terjadi kesalahan saat mengupload cover image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const renderConfigFields = () => {
    switch (page.tipe_halaman) {
      case 'static_cover':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Cover
              </label>
              
              {/* Preview */}
              {config.cover_image_url && (
                <div className="mb-3 relative">
                  <img
                    src={config.cover_image_url}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => updateConfig('cover_image_url', '')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Hapus gambar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Mengupload...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">
                      {config.cover_image_url ? 'Ganti Gambar Cover' : 'Upload Gambar Cover'}
                    </span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Format: JPG, PNG, WEBP. Maksimal 10MB. Resolusi minimal 1920x1080 untuk hasil terbaik.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Overlay Data Siswa
              </label>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show_nama_siswa"
                  checked={config.overlay_data?.show_nama_siswa || false}
                  onChange={(e) => updateConfig('overlay_data', {
                    ...config.overlay_data,
                    show_nama_siswa: e.target.checked
                  })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="show_nama_siswa" className="ml-2 text-sm text-gray-700">
                  Tampilkan Nama Siswa
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show_tahun_ajaran"
                  checked={config.overlay_data?.show_tahun_ajaran || false}
                  onChange={(e) => updateConfig('overlay_data', {
                    ...config.overlay_data,
                    show_tahun_ajaran: e.target.checked
                  })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="show_tahun_ajaran" className="ml-2 text-sm text-gray-700">
                  Tampilkan Tahun Ajaran
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show_semester"
                  checked={config.overlay_data?.show_semester || false}
                  onChange={(e) => updateConfig('overlay_data', {
                    ...config.overlay_data,
                    show_semester: e.target.checked
                  })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="show_semester" className="ml-2 text-sm text-gray-700">
                  Tampilkan Semester
                </label>
              </div>
            </div>
          </>
        );

      case 'dynamic_data':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori Indikator yang Ditampilkan
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {kategoriList.length === 0 ? (
                  <p className="text-sm text-gray-500">Belum ada kategori indikator</p>
                ) : (
                  kategoriList.map((kategori) => (
                    <div key={kategori.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`kategori_${kategori.id}`}
                        checked={(config.kategori_indikator_ids || []).includes(kategori.id)}
                        onChange={(e) => {
                          const currentIds = config.kategori_indikator_ids || [];
                          const newIds = e.target.checked
                            ? [...currentIds, kategori.id]
                            : currentIds.filter((id: string) => id !== kategori.id);
                          updateConfig('kategori_indikator_ids', newIds);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`kategori_${kategori.id}`} className="ml-2 text-sm text-gray-700">
                        {kategori.nama_kategori}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Layout
              </label>
              <select
                value={config.layout || 'list'}
                onChange={(e) => updateConfig('layout', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="list">List</option>
                <option value="table">Table</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="show_deskripsi"
                checked={config.show_deskripsi || false}
                onChange={(e) => updateConfig('show_deskripsi', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="show_deskripsi" className="ml-2 text-sm text-gray-700">
                Tampilkan Deskripsi Capaian
              </label>
            </div>
          </>
        );

      case 'galeri_kegiatan':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kegiatan yang Ditampilkan
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {kegiatanList.length === 0 ? (
                  <p className="text-sm text-gray-500">Belum ada kegiatan</p>
                ) : (
                  kegiatanList.map((kegiatan) => (
                    <div key={kegiatan.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`kegiatan_${kegiatan.id}`}
                        checked={(config.kegiatan_ids || []).includes(kegiatan.id)}
                        onChange={(e) => {
                          const currentIds = config.kegiatan_ids || [];
                          const newIds = e.target.checked
                            ? [...currentIds, kegiatan.id]
                            : currentIds.filter((id: string) => id !== kegiatan.id);
                          updateConfig('kegiatan_ids', newIds);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`kegiatan_${kegiatan.id}`} className="ml-2 text-sm text-gray-700">
                        {kegiatan.nama_kegiatan}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Layout Foto
              </label>
              <select
                value={config.layout || 'grid-2'}
                onChange={(e) => updateConfig('layout', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="grid-2">Grid 2 Kolom</option>
                <option value="grid-4">Grid 4 Foto</option>
                <option value="grid-6">Grid 6 Foto</option>
                <option value="collage">Collage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maksimal Foto per Halaman
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.max_foto_per_page || 2}
                onChange={(e) => updateConfig('max_foto_per_page', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto_select_by_scope"
                checked={config.auto_select_by_scope || false}
                onChange={(e) => updateConfig('auto_select_by_scope', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="auto_select_by_scope" className="ml-2 text-sm text-gray-700">
                Auto-select kegiatan berdasarkan scope siswa
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto_paginate"
                checked={config.auto_paginate !== false}
                onChange={(e) => updateConfig('auto_paginate', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="auto_paginate" className="ml-2 text-sm text-gray-700">
                Auto-paginate jika foto melebihi kapasitas
              </label>
            </div>
          </>
        );

      case 'qr_code':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base URL untuk QR Code
              </label>
              <input
                type="text"
                value={config.qr_base_url || ''}
                onChange={(e) => updateConfig('qr_base_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://portal.sekolah.com/galeri-publik/"
              />
              <p className="text-xs text-gray-500 mt-1">
                Token unik akan ditambahkan otomatis di akhir URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ukuran QR Code (px)
              </label>
              <input
                type="number"
                min="100"
                max="500"
                value={config.qr_size || 200}
                onChange={(e) => updateConfig('qr_size', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Posisi QR Code
              </label>
              <select
                value={config.qr_position || 'center'}
                onChange={(e) => updateConfig('qr_position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="center">Center</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="show_text"
                checked={config.show_text !== false}
                onChange={(e) => updateConfig('show_text', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="show_text" className="ml-2 text-sm text-gray-700">
                Tampilkan teks instruksi
              </label>
            </div>

            {config.show_text !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teks Instruksi
                </label>
                <textarea
                  value={config.text || 'Scan untuk melihat galeri lengkap'}
                  onChange={(e) => updateConfig('text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
            )}
          </>
        );

      default:
        return <p className="text-gray-600">Tidak ada konfigurasi untuk tipe halaman ini</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Konfigurasi Halaman</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Page Settings */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Pengaturan Halaman</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ukuran Kertas
                  </label>
                  <select
                    value={ukuranKertas}
                    onChange={(e) => setUkuranKertas(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Default ({templateDefaults.ukuran_kertas})</option>
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                    <option value="F4">F4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orientasi
                  </label>
                  <select
                    value={orientasi}
                    onChange={(e) => setOrientasi(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Default ({templateDefaults.orientasi})</option>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Type-specific Config */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Konfigurasi Konten</h3>
              <div className="space-y-4">
                {renderConfigFields()}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
