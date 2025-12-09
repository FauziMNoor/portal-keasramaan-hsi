'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Building2, Save, Upload, X, MapPin, Phone, Mail, Globe, User, Shield } from 'lucide-react';

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
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
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
      // Ambil dari tabel identitas_sekolah_keasramaan
      const { data: identitas } = await supabase
        .from('identitas_sekolah_keasramaan')
        .select('*')
        .limit(1)
        .single();

      if (identitas) {
        setData(identitas);
        
        setFormData({
          cabang: userCabang,
          nama_sekolah: identitas.nama_sekolah || 'PONDOK PESANTREN SMA IT HSI IDN',
          nama_singkat: identitas.nama_singkat || 'HSI BOARDING SCHOOL',
          nama_kepala_sekolah: identitas.nama_kepala_sekolah || '',
          nip_kepala_sekolah: identitas.nip_kepala_sekolah || '',
          nama_kepala_asrama: identitas.nama_kepala_asrama || '',
          nip_kepala_asrama: identitas.nip_kepala_asrama || '',
          alamat_lengkap: identitas.alamat || '',
          kota: identitas.kota || '',
          kode_pos: identitas.kode_pos || '',
          no_telepon: identitas.no_telepon || '',
          email: identitas.email || '',
          website: identitas.website || '',
          logo_url: identitas.logo || '',
          stempel_url: identitas.stempel_url || '',
        });
      } else {
        // Data kosong, set default
        setFormData(prev => ({ ...prev, cabang: userCabang, kota: '' }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setFormData(prev => ({ ...prev, cabang: userCabang, kota: '' }));
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Simpan file untuk diupload nanti saat submit
    setSelectedLogoFile(file);

    // Buat preview dari file
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    if (confirm('Yakin ingin menghapus logo?')) {
      // Tandai untuk dihapus saat submit
      setFormData({ ...formData, logo_url: '' });
      setLogoPreview('');
      setSelectedLogoFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let logoUrl = formData.logo_url;

      // Upload logo baru jika ada file yang dipilih
      if (selectedLogoFile) {
        setUploading(true);
        try {
          // Hapus logo lama jika ada
          if (formData.logo_url && formData.logo_url.includes('supabase')) {
            const oldFileName = formData.logo_url.split('/').pop();
            if (oldFileName) {
              await supabase.storage.from('logos').remove([oldFileName]);
            }
          }

          // Upload file baru
          const fileExt = selectedLogoFile.name.split('.').pop();
          const fileName = `logo-${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('logos')
            .upload(fileName, selectedLogoFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('logos')
            .getPublicUrl(fileName);

          logoUrl = urlData.publicUrl;
        } catch (uploadError: any) {
          throw new Error('❌ Gagal upload logo: ' + uploadError.message);
        } finally {
          setUploading(false);
        }
      } else if (!formData.logo_url && data?.logo_url) {
        // Jika logo dihapus, hapus dari storage
        if (data.logo_url.includes('supabase')) {
          const oldFileName = data.logo_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage.from('logos').remove([oldFileName]);
          }
        }
      }

      // Simpan ke tabel identitas_sekolah_keasramaan
      const dataToSave = {
        nama_sekolah: formData.nama_sekolah,
        nama_singkat: formData.nama_singkat,
        nama_kepala_sekolah: formData.nama_kepala_sekolah,
        nip_kepala_sekolah: formData.nip_kepala_sekolah,
        nama_kepala_asrama: formData.nama_kepala_asrama,
        nip_kepala_asrama: formData.nip_kepala_asrama,
        alamat: formData.alamat_lengkap,
        kota: formData.kota,
        kode_pos: formData.kode_pos,
        no_telepon: formData.no_telepon,
        email: formData.email,
        website: formData.website,
        logo: logoUrl,
        stempel_url: formData.stempel_url,
      };

      // Cek apakah data sudah ada
      const { data: existing } = await supabase
        .from('identitas_sekolah_keasramaan')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('identitas_sekolah_keasramaan')
          .update(dataToSave)
          .eq('id', existing.id);

        if (updateError) {
          console.error('Update error:', updateError);
          throw new Error(updateError.message || 'Gagal update data');
        }
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('identitas_sekolah_keasramaan')
          .insert([dataToSave]);

        if (insertError) {
          console.error('Insert error:', insertError);
          throw new Error(insertError.message || 'Gagal menyimpan data');
        }
      }

      // Success!
      alert('✅ Data berhasil disimpan!');
      setSelectedLogoFile(null); // Reset selected file
      
      // Reload data dari database
      await fetchData();
    } catch (error: any) {
      console.error('Save error:', error);
      
      // Tampilkan error yang lebih user-friendly
      const errorMessage = error.message || 'Terjadi kesalahan saat menyimpan data';
      alert(errorMessage);
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
                        Pilih File Logo
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Format: JPG, PNG, atau SVG • Maksimal 2MB
                    </p>
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
