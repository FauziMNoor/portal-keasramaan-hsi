'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Building2, Save, Upload, X } from 'lucide-react';

interface IdentitasSekolah {
  id: string;
  nama_sekolah: string;
  nama_kepala_sekolah: string;
  alamat: string;
  no_telepon: string;
  email: string;
  website: string;
  logo: string;
}

export default function IdentitasSekolahPage() {
  const [data, setData] = useState<IdentitasSekolah | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    nama_sekolah: '',
    nama_kepala_sekolah: '',
    alamat: '',
    no_telepon: '',
    email: '',
    website: '',
    logo: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.logo) {
      loadLogoPreview(formData.logo);
    }
  }, [formData.logo]);

  const fetchData = async () => {
    setLoading(true);
    const { data: result, error } = await supabase
      .from('identitas_sekolah_keasramaan')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error:', error);
    } else if (result) {
      setData(result);
      setFormData({
        nama_sekolah: result.nama_sekolah || '',
        nama_kepala_sekolah: result.nama_kepala_sekolah || '',
        alamat: result.alamat || '',
        no_telepon: result.no_telepon || '',
        email: result.email || '',
        website: result.website || '',
        logo: result.logo || '',
      });
    }
    setLoading(false);
  };

  const loadLogoPreview = async (logoPath: string) => {
    if (!logoPath) {
      setLogoPreview('');
      return;
    }

    // Jika sudah berupa URL lengkap, gunakan langsung
    if (logoPath.startsWith('http')) {
      setLogoPreview(logoPath);
      return;
    }

    // Jika path dari storage, ambil public URL
    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl(logoPath);

    if (data?.publicUrl) {
      setLogoPreview(data.publicUrl);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi file
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar!');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB!');
      return;
    }

    setUploading(true);

    try {
      // Hapus logo lama jika ada
      if (formData.logo && !formData.logo.startsWith('http')) {
        await supabase.storage.from('logos').remove([formData.logo]);
      }

      // Upload file baru
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Update form data dengan path file
      setFormData({ ...formData, logo: filePath });
      alert('Logo berhasil diupload!');
    } catch (error: any) {
      console.error('Error uploading:', error);
      alert('Gagal upload logo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!formData.logo) return;

    if (confirm('Yakin ingin menghapus logo?')) {
      try {
        // Hapus dari storage jika bukan URL eksternal
        if (!formData.logo.startsWith('http')) {
          await supabase.storage.from('logos').remove([formData.logo]);
        }

        setFormData({ ...formData, logo: '' });
        setLogoPreview('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error removing logo:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (data?.id) {
        // Update existing
        const { error } = await supabase
          .from('identitas_sekolah_keasramaan')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', data.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('identitas_sekolah_keasramaan')
          .insert([formData]);

        if (error) throw error;
      }

      alert('Data berhasil disimpan!');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Identitas Sekolah</h1>
                <p className="text-gray-600">Kelola informasi identitas sekolah</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
              Memuat data...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
              {/* Logo Section */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Logo Sekolah</h2>
                <div className="flex items-start gap-6">
                  <div className="shrink-0">
                    <div className="relative">
                      {logoPreview ? (
                        <div className="relative group">
                          <img
                            src={logoPreview}
                            alt="Logo Sekolah"
                            className="w-32 h-32 object-contain border-2 border-gray-200 rounded-xl p-2 bg-white"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                          <Upload className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Logo
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                    >
                      <Upload className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {uploading ? 'Mengupload...' : 'Pilih File Logo'}
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Format: JPG, PNG, atau SVG • Maksimal 2MB
                    </p>
                    {uploading && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informasi Dasar */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Informasi Dasar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Sekolah <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nama_sekolah}
                      onChange={(e) => setFormData({ ...formData, nama_sekolah: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="HSI Boarding School"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={formData.nama_kepala_sekolah}
                      onChange={(e) => setFormData({ ...formData, nama_kepala_sekolah: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Fauzi M. Noor, S.Sy"
                    />
                  </div>
                </div>
              </div>

              {/* Kontak & Alamat */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Kontak & Alamat</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat Lengkap
                    </label>
                    <textarea
                      value={formData.alamat}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Jl. Raya Pendidikan No. 123, Sukabumi, Jawa Barat"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No. Telepon
                      </label>
                      <input
                        type="tel"
                        value={formData.no_telepon}
                        onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="(0266) 123456"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="info@smaithsi.sch.id"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="https://www.smaithsi.sch.id"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
