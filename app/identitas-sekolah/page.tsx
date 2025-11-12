'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Building2, Save, Upload, X, FileText, Image as ImageIcon, Settings, MapPin, Phone, Mail, Globe, User, Shield, Zap, FileImage, Ruler } from 'lucide-react';

interface IdentitasSekolah {
  id: string;
  cabang: string;
  nama_sekolah: string;
  nama_singkat: string;
  nama_kepala_sekolah: string;
  nip_kepala_sekolah: string;
  nama_kepala_asrama: string;
  nip_kepala_asrama: string;
  alamat_lengkap: string;
  kota: string;
  kode_pos: string;
  no_telepon: string;
  email: string;
  website: string;
  logo_url: string;
  stempel_url: string;
  kop_mode: string; // 'dynamic' atau 'template'
  kop_template_url: string; // URL template KOP full A4
  kop_content_margin_top: number; // Margin atas untuk konten (mm)
  kop_content_margin_bottom: number; // Margin bawah untuk konten (mm)
  kop_content_margin_left: number; // Margin kiri untuk konten (mm)
  kop_content_margin_right: number; // Margin kanan untuk konten (mm)
}

export default function IdentitasSekolahPage() {
  const [data, setData] = useState<IdentitasSekolah | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userCabang, setUserCabang] = useState('');
  const [kepalaAsramaList, setKepalaAsramaList] = useState<any[]>([]);
  const [kopTemplatePreview, setKopTemplatePreview] = useState<string>('');
  const kopTemplateInputRef = useRef<HTMLInputElement>(null);
  const [uploadingKopTemplate, setUploadingKopTemplate] = useState(false);
  const [formData, setFormData] = useState({
    cabang: '',
    nama_sekolah: 'PONDOK PESANTREN SMA IT HSI IDN',
    nama_singkat: 'HSI BOARDING SCHOOL',
    nama_kepala_sekolah: '',
    nip_kepala_sekolah: '',
    nama_kepala_asrama: '',
    nip_kepala_asrama: '',
    alamat_lengkap: '',
    kota: '',
    kode_pos: '',
    no_telepon: '',
    email: '',
    website: '',
    logo_url: '',
    stempel_url: '',
    kop_mode: 'dynamic', // default: dynamic
    kop_template_url: '',
    kop_content_margin_top: 40,
    kop_content_margin_bottom: 30,
    kop_content_margin_left: 20,
    kop_content_margin_right: 20,
  });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (userCabang) {
      fetchData();
      fetchKepalaAsrama();
    }
  }, [userCabang]);

  useEffect(() => {
    if (formData.logo_url) {
      loadLogoPreview(formData.logo_url);
    }
  }, [formData.logo_url]);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        const cabang = data.user?.cabang || 'Purworejo';
        setUserCabang(cabang);
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      setUserCabang('Purworejo');
    }
  };

  const fetchKepalaAsrama = async () => {
    try {
      // Cek apakah kolom menggunakan 'cabang' atau 'lokasi'
      const { data: kepalaAsrama, error } = await supabase
        .from('kepala_asrama_keasramaan')
        .select('*')
        .eq('cabang', userCabang) // Gunakan 'cabang' sesuai standar
        .eq('status', 'aktif');

      if (error) {
        // Jika error karena kolom tidak ada, coba dengan 'lokasi'
        if (error.code === '42703') {
          const { data: kepalaAsramaLokasi } = await supabase
            .from('kepala_asrama_keasramaan')
            .select('*')
            .eq('lokasi', userCabang)
            .eq('status', 'aktif');
          
          if (kepalaAsramaLokasi) {
            setKepalaAsramaList(kepalaAsramaLokasi);
          }
        } else {
          console.error('Error fetching kepala asrama:', error);
        }
      } else if (kepalaAsrama) {
        setKepalaAsramaList(kepalaAsrama);
      }
    } catch (error) {
      console.error('Error fetching kepala asrama:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Cek di tabel info_sekolah_keasramaan dulu (tabel baru)
      const { data: infoSekolah } = await supabase
        .from('info_sekolah_keasramaan')
        .select('*')
        .eq('cabang', userCabang)
        .single();

      if (infoSekolah) {
        setData(infoSekolah);
        
        // Auto-populate kepala asrama dari master data jika belum ada
        let namaKepas = infoSekolah.nama_kepala_asrama || '';
        if (!namaKepas && kepalaAsramaList.length > 0) {
          namaKepas = kepalaAsramaList[0].nama;
        }
        
        setFormData({
          cabang: infoSekolah.cabang || userCabang,
          nama_sekolah: infoSekolah.nama_sekolah || 'PONDOK PESANTREN SMA IT HSI IDN',
          nama_singkat: infoSekolah.nama_singkat || 'HSI BOARDING SCHOOL',
          nama_kepala_sekolah: infoSekolah.nama_kepala_sekolah || '',
          nip_kepala_sekolah: infoSekolah.nip_kepala_sekolah || '',
          nama_kepala_asrama: namaKepas,
          nip_kepala_asrama: infoSekolah.nip_kepala_asrama || '',
          alamat_lengkap: infoSekolah.alamat_lengkap || '',
          kota: infoSekolah.kota || '',
          kode_pos: infoSekolah.kode_pos || '',
          no_telepon: infoSekolah.no_telepon || '',
          email: infoSekolah.email || '',
          website: infoSekolah.website || '',
          logo_url: infoSekolah.logo_url || '',
          stempel_url: infoSekolah.stempel_url || '',
          kop_mode: infoSekolah.kop_mode || 'dynamic',
          kop_template_url: infoSekolah.kop_template_url || '',
          kop_content_margin_top: infoSekolah.kop_content_margin_top || 40,
          kop_content_margin_bottom: infoSekolah.kop_content_margin_bottom || 30,
          kop_content_margin_left: infoSekolah.kop_content_margin_left || 20,
          kop_content_margin_right: infoSekolah.kop_content_margin_right || 20,
        });
        
        if (infoSekolah.kop_template_url) {
          setKopTemplatePreview(infoSekolah.kop_template_url);
        }
      } else {
        // Fallback ke tabel lama identitas_sekolah_keasramaan
        const { data: identitas } = await supabase
          .from('identitas_sekolah_keasramaan')
          .select('*')
          .limit(1)
          .single();

        if (identitas) {
          setFormData({
            cabang: userCabang,
            nama_sekolah: identitas.nama_sekolah || 'PONDOK PESANTREN SMA IT HSI IDN',
            nama_singkat: 'HSI BOARDING SCHOOL',
            nama_kepala_sekolah: identitas.nama_kepala_sekolah || '',
            nip_kepala_sekolah: '',
            nama_kepala_asrama: '',
            nip_kepala_asrama: '',
            alamat_lengkap: identitas.alamat || '',
            kota: userCabang,
            kode_pos: '',
            no_telepon: identitas.no_telepon || '',
            email: identitas.email || '',
            website: identitas.website || '',
            logo_url: identitas.logo || '',
            stempel_url: '',
            kop_mode: 'dynamic',
            kop_template_url: '',
            kop_content_margin_top: 40,
            kop_content_margin_bottom: 30,
            kop_content_margin_left: 20,
            kop_content_margin_right: 20,
          });
        } else {
          // Data kosong, set default dengan cabang
          setFormData(prev => ({ ...prev, cabang: userCabang, kota: userCabang }));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setFormData(prev => ({ ...prev, cabang: userCabang, kota: userCabang }));
    } finally {
      setLoading(false);
    }
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
      if (formData.logo_url && !formData.logo_url.startsWith('http')) {
        await supabase.storage.from('logos').remove([formData.logo_url]);
      }

      // Upload file baru
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${userCabang}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      // Update form data dengan URL file
      setFormData({ ...formData, logo_url: urlData.publicUrl });
      alert('✅ Logo berhasil diupload!');
    } catch (error: any) {
      console.error('Error uploading:', error);
      alert('❌ Gagal upload logo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!formData.logo_url) return;

    if (confirm('Yakin ingin menghapus logo?')) {
      try {
        // Hapus dari storage jika bukan URL eksternal
        if (formData.logo_url.includes('supabase')) {
          const fileName = formData.logo_url.split('/').pop();
          if (fileName) {
            await supabase.storage.from('logos').remove([fileName]);
          }
        }

        setFormData({ ...formData, logo_url: '' });
        setLogoPreview('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error removing logo:', error);
      }
    }
  };

  const handleKopTemplateSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi file
    if (!file.type.startsWith('image/')) {
      alert('❌ File harus berupa gambar (PNG/JPG)!');
      return;
    }

    // Validasi ukuran (max 10MB untuk template A4)
    if (file.size > 10 * 1024 * 1024) {
      alert('❌ Ukuran file maksimal 10MB!');
      return;
    }

    setUploadingKopTemplate(true);

    try {
      // Hapus template lama jika ada
      if (formData.kop_template_url && formData.kop_template_url.includes('supabase')) {
        const fileName = formData.kop_template_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('kop-templates-keasramaan').remove([fileName]);
        }
      }

      // Upload file baru
      const fileExt = file.name.split('.').pop();
      const fileName = `kop-${userCabang}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('kop-templates-keasramaan')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('kop-templates-keasramaan')
        .getPublicUrl(filePath);

      // Update form data dengan URL file
      setFormData({ ...formData, kop_template_url: urlData.publicUrl });
      setKopTemplatePreview(urlData.publicUrl);
      alert('✅ Template KOP berhasil diupload!');
    } catch (error: any) {
      console.error('Error uploading:', error);
      alert('❌ Gagal upload template KOP: ' + error.message);
    } finally {
      setUploadingKopTemplate(false);
    }
  };

  const handleRemoveKopTemplate = async () => {
    if (!formData.kop_template_url) return;

    if (confirm('Yakin ingin menghapus template KOP?')) {
      try {
        // Hapus dari storage
        if (formData.kop_template_url.includes('supabase')) {
          const fileName = formData.kop_template_url.split('/').pop();
          if (fileName) {
            await supabase.storage.from('kop-templates-keasramaan').remove([fileName]);
          }
        }

        setFormData({ ...formData, kop_template_url: '', kop_mode: 'dynamic' });
        setKopTemplatePreview('');
        if (kopTemplateInputRef.current) {
          kopTemplateInputRef.current.value = '';
        }
        alert('✅ Template KOP berhasil dihapus!');
      } catch (error) {
        console.error('Error removing template:', error);
        alert('❌ Gagal menghapus template KOP');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSave = {
        ...formData,
        cabang: userCabang,
      };

      // Cek apakah data sudah ada (tanpa throw error jika tidak ada)
      const { data: existing, error: checkError } = await supabase
        .from('info_sekolah_keasramaan')
        .select('id')
        .eq('cabang', userCabang)
        .maybeSingle(); // Gunakan maybeSingle() agar tidak throw error

      // Jika ada error saat cek (bukan "not found"), throw
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('info_sekolah_keasramaan')
          .update(dataToSave)
          .eq('cabang', userCabang);

        if (updateError) {
          console.error('Update error:', updateError);
          throw new Error(updateError.message || 'Gagal update data');
        }
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('info_sekolah_keasramaan')
          .insert([dataToSave]);

        if (insertError) {
          console.error('Insert error:', insertError);
          
          // Jika error RLS, berikan pesan yang lebih jelas
          if (insertError.code === '42501') {
            throw new Error('Permission denied. Silakan jalankan FIX_RLS_INFO_SEKOLAH.sql di Supabase SQL Editor.');
          }
          
          throw new Error(insertError.message || 'Gagal menyimpan data');
        }
      }

      alert('✅ Data berhasil disimpan!');
      await fetchData();
    } catch (error: any) {
      console.error('Error saving data:', error);
      
      // Tampilkan error yang lebih user-friendly
      const errorMessage = error.message || 'Terjadi kesalahan saat menyimpan data';
      alert('❌ ' + errorMessage);
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
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Sekolah Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.nama_sekolah}
                        onChange={(e) => setFormData({ ...formData, nama_sekolah: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="PONDOK PESANTREN SMA IT HSI IDN"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Singkat
                      </label>
                      <input
                        type="text"
                        value={formData.nama_singkat}
                        onChange={(e) => setFormData({ ...formData, nama_singkat: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="HSI BOARDING SCHOOL"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pejabat */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Pejabat</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Kepala Sekolah
                      </label>
                      <input
                        type="text"
                        value={formData.nama_kepala_sekolah}
                        onChange={(e) => setFormData({ ...formData, nama_kepala_sekolah: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Dr. H. Ahmad Fauzi, M.Pd."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NIP Kepala Sekolah (Opsional)
                      </label>
                      <input
                        type="text"
                        value={formData.nip_kepala_sekolah}
                        onChange={(e) => setFormData({ ...formData, nip_kepala_sekolah: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="197001011990031001"
                      />
                    </div>
                  </div>

                  {kepalaAsramaList.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-green-700 font-medium">
                            Kepala Asrama: {kepalaAsramaList[0]?.nama}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Data diambil dari{' '}
                            <a href="/kepala-asrama" className="underline hover:text-green-900" target="_blank">
                              Master Kepala Asrama
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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
                      value={formData.alamat_lengkap}
                      onChange={(e) => setFormData({ ...formData, alamat_lengkap: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Jl. Raya Pendidikan No. 123, Sukabumi, Jawa Barat"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kota
                      </label>
                      <input
                        type="text"
                        value={formData.kota}
                        onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Purworejo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kode Pos
                      </label>
                      <input
                        type="text"
                        value={formData.kode_pos}
                        onChange={(e) => setFormData({ ...formData, kode_pos: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="54111"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No. Telepon
                      </label>
                      <input
                        type="tel"
                        value={formData.no_telepon}
                        onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="(0275) 123456"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="info@hsiboardingschool.sch.id"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website (Opsional)
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://www.hsiboardingschool.sch.id"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* KOP Surat */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  KOP Surat Dinamis
                </h2>
                
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Pilih Mode KOP Surat:
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl hover:bg-white/50 transition-colors">
                      <input
                        type="radio"
                        name="kop_mode"
                        value="dynamic"
                        checked={formData.kop_mode === 'dynamic'}
                        onChange={(e) => setFormData({ ...formData, kop_mode: e.target.value })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Mode 1: KOP Dinamis (Text-Based)
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Generate KOP otomatis dari data sistem (logo, nama sekolah, alamat, kontak)
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl hover:bg-white/50 transition-colors">
                      <input
                        type="radio"
                        name="kop_mode"
                        value="template"
                        checked={formData.kop_mode === 'template'}
                        onChange={(e) => setFormData({ ...formData, kop_mode: e.target.value })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 flex items-center gap-2">
                          <FileImage className="w-4 h-4 text-purple-600" />
                          Mode 2: KOP Template (Image-Based)
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Upload template KOP full A4 (PNG/JPG) sebagai background, konten overlay di atas
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Mode Template: Upload KOP */}
                {formData.kop_mode === 'template' && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="space-y-2 text-sm text-yellow-800">
                        <div className="flex items-center gap-2">
                          <Ruler className="w-4 h-4" />
                          <span><strong>Ukuran Template:</strong> A4 (210mm x 297mm atau 2480px x 3508px @ 300dpi)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileImage className="w-4 h-4" />
                          <span><strong>Format:</strong> PNG atau JPG</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          <span><strong>Ukuran Max:</strong> 10MB</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Template KOP Full A4
                      </label>
                      
                      {kopTemplatePreview ? (
                        <div className="relative group">
                          <img
                            src={kopTemplatePreview}
                            alt="Template KOP"
                            className="w-full max-w-md border-2 border-gray-300 rounded-xl shadow-lg"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveKopTemplate}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            ref={kopTemplateInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleKopTemplateSelect}
                            className="hidden"
                            id="kop-template-upload"
                          />
                          <label
                            htmlFor="kop-template-upload"
                            className="inline-flex items-center gap-2 px-6 py-4 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer"
                          >
                            <Upload className="w-6 h-6 text-purple-600" />
                            <span className="text-sm font-medium text-gray-700">
                              {uploadingKopTemplate ? 'Mengupload...' : 'Pilih File Template KOP'}
                            </span>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Margin Settings */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-gray-600" />
                        Pengaturan Area Konten (mm)
                      </h4>
                      <p className="text-xs text-gray-600 mb-3">
                        Atur margin untuk area konten surat agar tidak tertimpa header/footer template
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Margin Atas
                          </label>
                          <input
                            type="number"
                            value={formData.kop_content_margin_top}
                            onChange={(e) => setFormData({ ...formData, kop_content_margin_top: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Margin Bawah
                          </label>
                          <input
                            type="number"
                            value={formData.kop_content_margin_bottom}
                            onChange={(e) => setFormData({ ...formData, kop_content_margin_bottom: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Margin Kiri
                          </label>
                          <input
                            type="number"
                            value={formData.kop_content_margin_left}
                            onChange={(e) => setFormData({ ...formData, kop_content_margin_left: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Margin Kanan
                          </label>
                          <input
                            type="number"
                            value={formData.kop_content_margin_right}
                            onChange={(e) => setFormData({ ...formData, kop_content_margin_right: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode Dynamic: Info */}
                {formData.kop_mode === 'dynamic' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="text-sm text-green-800">
                      <div className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Mode KOP Dinamis Aktif
                      </div>
                      <p className="mb-2">KOP surat akan di-generate otomatis menggunakan:</p>
                      <ul className="space-y-1.5">
                        <li className="flex items-center gap-2">
                          <ImageIcon className="w-3 h-3" />
                          Logo sekolah (jika ada)
                        </li>
                        <li className="flex items-center gap-2">
                          <Building2 className="w-3 h-3" />
                          Nama sekolah & nama singkat
                        </li>
                        <li className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          Alamat lengkap
                        </li>
                        <li className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          Kontak (telepon, email, website)
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
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
