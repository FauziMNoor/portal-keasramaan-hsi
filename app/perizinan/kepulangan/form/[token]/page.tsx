'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Calendar, User, MapPin, Phone, FileText, CheckCircle, MessageCircle, Clock, Upload, X, Image as ImageIcon, RefreshCw, AlertCircle } from 'lucide-react';

// Success Page Component
function SuccessPage({ data }: { data: any }) {
  const [kepasWhatsApp, setKepasWhatsApp] = useState('');
  const [kepasNama, setKepasNama] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKepasWhatsApp();
  }, []);

  const fetchKepasWhatsApp = async () => {
    try {
      const { data: kepasData } = await supabase
        .from('users_keasramaan')
        .select('nama_lengkap, no_telepon')
        .eq('role', 'kepala_asrama')
        .eq('cabang', data.cabang)
        .eq('is_active', true)
        .single();

      if (kepasData) {
        setKepasNama(kepasData.nama_lengkap || '');
        setKepasWhatsApp(kepasData.no_telepon || '');
      }
    } catch (err) {
      console.error('Error fetching kepas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (!kepasWhatsApp) {
      alert('Nomor WhatsApp Kepala Asrama belum tersedia. Silakan hubungi sekolah.');
      return;
    }

    let message = '';

    if (data.isPerpanjangan) {
      message = `Assalamu'alaikum, Saya wali santri dari:\n\nNama: ${data.nama_siswa}\nNIS: ${data.nis}\nKelas: ${data.kelas}\n\nSaya telah mengajukan PERPANJANGAN izin kepulangan melalui sistem dengan detail:\n- Tanggal Selesai Awal: ${new Date(data.tanggal_selesai_awal).toLocaleDateString('id-ID')}\n- Tanggal Selesai Baru: ${new Date(data.tanggal_selesai_baru).toLocaleDateString('id-ID')}\n- Perpanjangan: ${data.perpanjangan_hari} hari\n- Alasan: ${data.alasan_perpanjangan}\n\nMohon untuk dapat diproses. Terima kasih.`;
    } else {
      message = `Assalamu'alaikum, Saya wali santri dari:\n\nNama: ${data.nama_siswa}\nNIS: ${data.nis}\nKelas: ${data.kelas}\n\nSaya telah mengajukan izin kepulangan melalui sistem dengan detail:\n- Tanggal: ${new Date(data.tanggal_mulai).toLocaleDateString('id-ID')} s/d ${new Date(data.tanggal_selesai).toLocaleDateString('id-ID')}\n- Durasi: ${data.durasi_hari} hari\n- Kategori: ${data.keperluan}\n- Alasan: ${data.alasan}\n\nMohon untuk dapat diproses. Terima kasih.`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${kepasWhatsApp}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <div className={`w-20 h-20 ${data.isPerpanjangan ? 'bg-orange-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <CheckCircle className={`w-12 h-12 ${data.isPerpanjangan ? 'text-orange-600' : 'text-green-600'}`} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {data.isPerpanjangan ? 'Perpanjangan Berhasil Terkirim!' : 'Formulir Berhasil Terkirim!'}
          </h1>
          <p className="text-gray-600">
            {data.isPerpanjangan
              ? 'Permohonan perpanjangan izin telah diterima dan menunggu persetujuan.'
              : 'Permohonan izin kepulangan telah diterima dan menunggu persetujuan.'}
          </p>
        </div>

        <div className={`${data.isPerpanjangan ? 'bg-orange-50' : 'bg-blue-50'} rounded-xl p-6 mb-6`}>
          <h2 className="font-bold text-gray-800 mb-4">
            {data.isPerpanjangan ? 'Detail Perpanjangan:' : 'Detail Permohonan:'}
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">NIS:</span>
              <span className="font-semibold text-right">{data.nis}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Nama:</span>
              <span className="font-semibold text-right">{data.nama_siswa}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cabang:</span>
              <span className="font-semibold text-right">{data.cabang}</span>
            </div>

            {data.isPerpanjangan ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Durasi Awal:</span>
                  <span className="font-semibold text-right">{data.durasi_awal} hari</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tanggal Selesai Awal:</span>
                  <span className="font-semibold text-right">{new Date(data.tanggal_selesai_awal).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tanggal Selesai Baru:</span>
                  <span className="font-semibold text-orange-600 text-right">{new Date(data.tanggal_selesai_baru).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Perpanjangan:</span>
                  <span className="font-semibold text-orange-600 text-right">{data.perpanjangan_hari} hari</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Perpanjangan Ke:</span>
                  <span className="font-semibold text-right">{data.perpanjangan_ke}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tanggal Mulai:</span>
                  <span className="font-semibold text-right">{new Date(data.tanggal_mulai).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tanggal Selesai:</span>
                  <span className="font-semibold text-right">{new Date(data.tanggal_selesai).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Durasi:</span>
                  <span className="font-semibold text-right">{data.durasi_hari} hari</span>
                </div>
              </>
            )}

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                Menunggu Persetujuan
              </span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-amber-800 mb-2">Proses Selanjutnya:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-amber-700">
            <li>Menunggu persetujuan Kepala Asrama</li>
            <li>Menunggu persetujuan Kepala Sekolah</li>
          </ol>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Untuk mempercepat proses, silakan konfirmasi langsung ke Kepala Asrama
          </p>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : kepasWhatsApp ? (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-600">Kepala Asrama {data.cabang}:</p>
                <p className="font-semibold text-gray-800">{kepasNama || 'Kepala Asrama'}</p>
              </div>
              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-3 shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Konfirmasi via WhatsApp Kepala Asrama
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Ajukan Izin Lagi
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-amber-600">
                Nomor WhatsApp Kepala Asrama belum tersedia. Silakan hubungi pihak sekolah untuk informasi lebih lanjut.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Ajukan Izin Lagi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FormPerizinanKepulangan() {
  const params = useParams();
  const token = params.token as string;

  // Tab state: 'new' untuk izin baru, 'extend' untuk perpanjangan
  const [activeTab, setActiveTab] = useState<'new' | 'extend'>('new');

  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [logoSekolah, setLogoSekolah] = useState<string>('');

  const [formData, setFormData] = useState({
    nis: '',
    nama_siswa: '',
    kelas: '',
    asrama: '',
    cabang: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    keperluan: '',
    alasan: '',
    alamat_tujuan: '',
    no_hp_wali: '',
  });

  // State untuk perpanjangan izin
  const [extendFormData, setExtendFormData] = useState({
    nis: '',
    nama_siswa: '',
    kelas: '',
    asrama: '',
    cabang: '',
    perizinan_id: '',
    tanggal_mulai_awal: '',
    tanggal_selesai_awal: '',
    tanggal_selesai_baru: '',
    alasan_perpanjangan: '',
    durasi_awal: 0,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tipeDokumen, setTipeDokumen] = useState('surat_dokter');
  const [existingPerizinan, setExistingPerizinan] = useState<any>(null);

  useEffect(() => {
    checkToken();
    fetchLogoSekolah();
  }, [token]);

  const fetchLogoSekolah = async () => {
    try {
      const { data } = await supabase
        .from('identitas_sekolah_keasramaan')
        .select('logo')
        .limit(1)
        .single();

      if (data?.logo) {
        if (data.logo.startsWith('http')) {
          setLogoSekolah(data.logo);
        } else {
          const { data: urlData } = supabase.storage.from('logos').getPublicUrl(data.logo);
          if (urlData?.publicUrl) {
            setLogoSekolah(urlData.publicUrl);
          }
        }
      }
    } catch (err) {
      console.warn('Logo fetch failed:', err);
    }
  };

  const checkToken = async () => {
    try {
      const { data } = await supabase
        .from('token_perizinan_keasramaan')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .single();

      if (data) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
      }
    } catch (err) {
      setTokenValid(false);
    } finally {
      setCheckingToken(false);
    }
  };

  const handleNISBlur = async () => {
    if (!formData.nis) return;

    try {
      const { data } = await supabase
        .from('data_siswa_keasramaan')
        .select('nama_siswa, kelas, asrama, cabang')
        .eq('nis', formData.nis)
        .single();

      if (data) {
        setFormData(prev => ({
          ...prev,
          nama_siswa: data.nama_siswa || '',
          kelas: data.kelas || '',
          asrama: data.asrama || '',
          cabang: data.cabang || '',
        }));
      } else {
        alert('NIS tidak ditemukan. Pastikan NIS sudah terdaftar.');
      }
    } catch (err) {
      console.error('Error fetching siswa:', err);
    }
  };

  // Handle NIS blur untuk perpanjangan
  const handleExtendNISBlur = async () => {
    if (!extendFormData.nis) return;

    try {
      // Cari perizinan yang sedang aktif untuk NIS ini
      const { data: perizinanData } = await supabase
        .from('perizinan_kepulangan_keasramaan')
        .select('*')
        .eq('nis', extendFormData.nis)
        .eq('status', 'approved_kepsek')
        .eq('is_perpanjangan', false)
        .order('tanggal_selesai', { ascending: false })
        .limit(1)
        .single();

      if (perizinanData) {
        // Cek apakah masih bisa diperpanjang (belum selesai atau max 3 hari setelah selesai)
        const now = new Date();
        const selesaiDate = new Date(perizinanData.tanggal_selesai);
        const daysAfterEnd = Math.floor((now.getTime() - selesaiDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysAfterEnd > 3) {
          alert('Perizinan sudah selesai lebih dari 3 hari. Tidak bisa diperpanjang.');
          return;
        }

        setExistingPerizinan(perizinanData);
        setExtendFormData(prev => ({
          ...prev,
          nama_siswa: perizinanData.nama_siswa,
          kelas: perizinanData.kelas,
          asrama: perizinanData.asrama,
          cabang: perizinanData.cabang,
          perizinan_id: perizinanData.id,
          tanggal_mulai_awal: perizinanData.tanggal_mulai,
          tanggal_selesai_awal: perizinanData.tanggal_selesai,
          durasi_awal: perizinanData.durasi_hari,
        }));
      } else {
        alert('Tidak ada perizinan aktif untuk NIS ini yang bisa diperpanjang.');
        setExistingPerizinan(null);
      }
    } catch (err) {
      console.error('Error fetching perizinan:', err);
      alert('Terjadi kesalahan saat mencari data perizinan.');
    }
  };

  // Handle file upload untuk perpanjangan
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Format file tidak didukung. Gunakan JPG, PNG, atau PDF.');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  // Handle submit perpanjangan
  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!extendFormData.perizinan_id) {
      alert('Mohon isi NIS dan pastikan data perizinan ditemukan');
      return;
    }

    if (!extendFormData.tanggal_selesai_baru) {
      alert('Mohon isi tanggal selesai baru');
      return;
    }

    if (new Date(extendFormData.tanggal_selesai_baru) <= new Date(extendFormData.tanggal_selesai_awal)) {
      alert('Tanggal selesai baru harus lebih lama dari tanggal selesai sebelumnya');
      return;
    }

    if (!extendFormData.alasan_perpanjangan) {
      alert('Mohon isi alasan perpanjangan');
      return;
    }

    setLoading(true);

    try {
      let buktiUrl = null;

      // Upload file jika ada
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `perpanjangan/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('perizinan')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('perizinan')
          .getPublicUrl(filePath);

        buktiUrl = urlData.publicUrl;
      }

      // Hitung perpanjangan ke berapa
      const { data: countData } = await supabase
        .from('perizinan_kepulangan_keasramaan')
        .select('perpanjangan_ke')
        .eq('perizinan_induk_id', extendFormData.perizinan_id)
        .eq('is_perpanjangan', true)
        .order('perpanjangan_ke', { ascending: false })
        .limit(1)
        .single();

      const perpanjanganKe = countData ? countData.perpanjangan_ke + 1 : 1;

      // Hitung durasi perpanjangan
      const tanggalMulai = new Date(extendFormData.tanggal_mulai_awal);
      const tanggalSelesaiBaru = new Date(extendFormData.tanggal_selesai_baru);
      const durasiTotal = Math.ceil((tanggalSelesaiBaru.getTime() - tanggalMulai.getTime()) / (1000 * 60 * 60 * 24));

      const tanggalSelesaiAwal = new Date(extendFormData.tanggal_selesai_awal);
      const perpanjanganHari = Math.ceil((tanggalSelesaiBaru.getTime() - tanggalSelesaiAwal.getTime()) / (1000 * 60 * 60 * 24));

      // Insert perpanjangan sebagai record baru di tabel yang sama
      const { data: perpanjanganData, error: insertError } = await supabase
        .from('perizinan_kepulangan_keasramaan')
        .insert([{
          nis: extendFormData.nis,
          nama_siswa: extendFormData.nama_siswa,
          kelas: extendFormData.kelas,
          asrama: extendFormData.asrama,
          cabang: extendFormData.cabang,
          tanggal_pengajuan: new Date().toISOString().split('T')[0],
          tanggal_mulai: extendFormData.tanggal_mulai_awal,
          tanggal_selesai: extendFormData.tanggal_selesai_baru,
          durasi_hari: durasiTotal,
          keperluan: existingPerizinan.keperluan,
          alasan: existingPerizinan.alasan,
          alamat_tujuan: existingPerizinan.alamat_tujuan,
          no_hp_wali: existingPerizinan.no_hp_wali,
          status: 'pending',
          is_perpanjangan: true,
          perizinan_induk_id: extendFormData.perizinan_id,
          alasan_perpanjangan: extendFormData.alasan_perpanjangan,
          jumlah_perpanjangan_hari: perpanjanganHari,
          perpanjangan_ke: perpanjanganKe,
          dokumen_pendukung_url: buktiUrl,
          dokumen_pendukung_uploaded_at: buktiUrl ? new Date().toISOString() : null,
          dokumen_pendukung_tipe: buktiUrl ? tipeDokumen : null,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Set submitted data untuk success page
      setSubmittedData({
        ...perpanjanganData,
        tanggal_selesai_awal: extendFormData.tanggal_selesai_awal,
        tanggal_selesai_baru: extendFormData.tanggal_selesai_baru,
        durasi_awal: extendFormData.durasi_awal,
        perpanjangan_hari: perpanjanganHari,
        isPerpanjangan: true,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting perpanjangan:', err);
      alert('Gagal mengirim perpanjangan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nis || !formData.nama_siswa) {
      alert('Mohon isi NIS dan pastikan data siswa ditemukan');
      return;
    }

    if (new Date(formData.tanggal_selesai) < new Date(formData.tanggal_mulai)) {
      alert('Tanggal selesai tidak boleh lebih awal dari tanggal mulai');
      return;
    }

    setLoading(true);

    try {
      const { data } = await supabase
        .from('perizinan_kepulangan_keasramaan')
        .insert([{
          ...formData,
          status: 'pending',
        }])
        .select()
        .single();

      if (data) {
        setSubmittedData(data);
        setSubmitted(true);
      }
    } catch (err: any) {
      console.error('Error submitting:', err);
      alert('Gagal mengirim formulir: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memvalidasi token...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Token Tidak Valid</h1>
          <p className="text-gray-600">Link yang Anda gunakan tidak valid atau sudah tidak aktif.</p>
        </div>
      </div>
    );
  }

  if (submitted && submittedData) {
    return <SuccessPage data={submittedData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Header dengan Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-gray-100">
              {logoSekolah ? (
                <img
                  src={logoSekolah}
                  alt="Logo Sekolah"
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-xl"
                  onError={() => setLogoSekolah('')}
                />
              ) : (
                <span className="text-4xl">🏫</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Formulir Perizinan Kepulangan</h1>
            <p className="text-sm sm:text-base text-gray-500">HSI Boarding School</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'new'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Izin Baru
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('extend')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'extend'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Perpanjangan Izin
            </button>
          </div>

          {/* Form Izin Baru */}
          {activeTab === 'new' && (
            <form onSubmit={handleSubmit} className="space-y-5">
            {/* NIS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                NIS Santri <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nis}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                onBlur={handleNISBlur}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Masukkan NIS"
              />
            </div>

            {/* Nama Siswa (Auto-filled) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Santri
              </label>
              <input
                type="text"
                value={formData.nama_siswa}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                placeholder="Otomatis terisi setelah input NIS"
              />
            </div>

            {/* Kelas, Asrama, Cabang (Auto-filled) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
                <input
                  type="text"
                  value={formData.kelas}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Asrama</label>
                <input
                  type="text"
                  value={formData.asrama}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cabang</label>
                <input
                  type="text"
                  value={formData.cabang}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                />
              </div>
            </div>

            {/* Tanggal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.tanggal_mulai}
                  onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Tanggal Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.tanggal_selesai}
                  onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Keperluan Perizinan (dulu: Keperluan Detail) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Keperluan Perizinan <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.keperluan}
                onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Pilih</option>
                <option value="Administratif">Administratif</option>
                <option value="Sakit">Sakit</option>
                <option value="Acara Keluarga">Acara Keluarga</option>
                <option value="Urusan Penting">Urusan Penting</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Alasan Izin */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alasan Izin <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.alasan}
                onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Jelaskan alasan izin secara detail"
              />
            </div>

            {/* Alamat Tujuan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Alamat Tujuan <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.alamat_tujuan}
                onChange={(e) => setFormData({ ...formData, alamat_tujuan: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Alamat lengkap tujuan kepulangan"
              />
            </div>

            {/* No HP Wali */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                No. HP Wali/Orang Tua <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-semibold">+62</span>
                </div>
                <input
                  type="tel"
                  required
                  value={formData.no_hp_wali}
                  onChange={(e) => {
                    // Hanya izinkan angka
                    const value = e.target.value.replace(/\D/g, '');

                    // Auto-format: jika user ketik 0 di awal, ganti dengan 62
                    let formatted = value;
                    if (value.startsWith('0')) {
                      formatted = '62' + value.substring(1);
                    } else if (!value.startsWith('62') && value.length > 0) {
                      formatted = '62' + value;
                    }

                    setFormData({ ...formData, no_hp_wali: formatted });
                  }}
                  className="w-full pl-14 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="8123456789"
                  pattern="62[0-9]{8,13}"
                  title="Format: 62 diikuti 8-13 digit angka (contoh: 628123456789)"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Format: 62 + nomor HP (contoh: 628123456789)
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Mengirim...' : 'Kirim Permohonan Izin'}
            </button>
          </form>
          )}

          {/* Form Perpanjangan Izin */}
          {activeTab === 'extend' && (
            <form onSubmit={handleExtendSubmit} className="space-y-5">
              {/* Info Alert */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-orange-800 mb-1">Perpanjangan Izin Kepulangan</h3>
                    <p className="text-sm text-orange-700">
                      Masukkan NIS santri yang sedang izin untuk memperpanjang waktu kepulangan.
                      Perpanjangan hanya bisa dilakukan untuk izin yang sudah disetujui dan belum selesai atau maksimal 3 hari setelah selesai.
                    </p>
                  </div>
                </div>
              </div>

              {/* NIS */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  NIS Santri <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={extendFormData.nis}
                  onChange={(e) => setExtendFormData({ ...extendFormData, nis: e.target.value })}
                  onBlur={handleExtendNISBlur}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Masukkan NIS santri yang sedang izin"
                />
              </div>

              {/* Data Siswa (Auto-filled) */}
              {existingPerizinan && (
                <>
                  <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                    <h3 className="font-semibold text-blue-800 mb-2">Data Perizinan Aktif:</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Nama:</span>
                        <p className="font-semibold text-gray-800">{extendFormData.nama_siswa}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Kelas:</span>
                        <p className="font-semibold text-gray-800">{extendFormData.kelas}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Asrama:</span>
                        <p className="font-semibold text-gray-800">{extendFormData.asrama}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Cabang:</span>
                        <p className="font-semibold text-gray-800">{extendFormData.cabang}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tanggal Mulai:</span>
                        <p className="font-semibold text-gray-800">
                          {new Date(extendFormData.tanggal_mulai_awal).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tanggal Selesai Awal:</span>
                        <p className="font-semibold text-orange-600">
                          {new Date(extendFormData.tanggal_selesai_awal).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Durasi Awal:</span>
                        <p className="font-semibold text-gray-800">{extendFormData.durasi_awal} hari</p>
                      </div>
                    </div>
                  </div>

                  {/* Tanggal Selesai Baru */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Tanggal Selesai Baru <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={extendFormData.tanggal_selesai_baru}
                      onChange={(e) => setExtendFormData({ ...extendFormData, tanggal_selesai_baru: e.target.value })}
                      min={extendFormData.tanggal_selesai_awal}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Harus lebih lama dari tanggal selesai awal ({new Date(extendFormData.tanggal_selesai_awal).toLocaleDateString('id-ID')})
                    </p>
                  </div>

                  {/* Alasan Perpanjangan */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Alasan Perpanjangan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={extendFormData.alasan_perpanjangan}
                      onChange={(e) => setExtendFormData({ ...extendFormData, alasan_perpanjangan: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                      placeholder="Jelaskan alasan perpanjangan izin (contoh: Sakit, keperluan keluarga mendadak, dll)"
                    />
                  </div>

                  {/* Tipe Dokumen */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipe Dokumen Pendukung
                    </label>
                    <select
                      value={tipeDokumen}
                      onChange={(e) => setTipeDokumen(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    >
                      <option value="surat_dokter">Surat Dokter</option>
                      <option value="surat_keterangan">Surat Keterangan</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>

                  {/* Upload Bukti Dokumen */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Upload className="w-4 h-4 inline mr-2" />
                      Upload Bukti Dokumen (Opsional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-400 transition-colors">
                      {!selectedFile ? (
                        <div>
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600 mb-2">
                            Klik untuk upload atau drag & drop
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            JPG, PNG, atau PDF (Max. 5MB)
                          </p>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,application/pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload-extend"
                          />
                          <label
                            htmlFor="file-upload-extend"
                            className="inline-block bg-orange-100 hover:bg-orange-200 text-orange-700 px-6 py-2 rounded-lg cursor-pointer transition-colors font-semibold"
                          >
                            Pilih File
                          </label>
                        </div>
                      ) : (
                        <div className="relative">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="max-h-48 mx-auto rounded-lg mb-3"
                            />
                          ) : (
                            <div className="flex items-center justify-center gap-3 mb-3">
                              <FileText className="w-12 h-12 text-orange-600" />
                              <div className="text-left">
                                <p className="font-semibold text-gray-800">{selectedFile.name}</p>
                                <p className="text-sm text-gray-500">
                                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewUrl(null);
                            }}
                            className="inline-flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors font-semibold"
                          >
                            <X className="w-4 h-4" />
                            Hapus File
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? 'Mengirim...' : 'Kirim Perpanjangan Izin'}
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
