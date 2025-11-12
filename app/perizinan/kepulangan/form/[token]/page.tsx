'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Calendar, User, MapPin, Phone, FileText, CheckCircle, MessageCircle } from 'lucide-react';

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

    const message = `Assalamu'alaikum, Saya wali santri dari:\n\nNama: ${data.nama_siswa}\nNIS: ${data.nis}\nKelas: ${data.kelas}\n\nSaya telah mengajukan izin kepulangan melalui sistem dengan detail:\n- Tanggal: ${new Date(data.tanggal_mulai).toLocaleDateString('id-ID')} s/d ${new Date(data.tanggal_selesai).toLocaleDateString('id-ID')}\n- Durasi: ${data.durasi_hari} hari\n- Kategori: ${data.keperluan}\n- Alasan: ${data.alasan}\n\nMohon untuk dapat diproses. Terima kasih.`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${kepasWhatsApp}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Formulir Berhasil Terkirim!</h1>
          <p className="text-gray-600">Permohonan izin kepulangan telah diterima dan menunggu persetujuan.</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">Detail Permohonan:</h2>
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
                Nomor WhatsApp Kepala Asrama belum tersedia. Silakan hubungi sekolah untuk informasi lebih lanjut.
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Formulir Izin Kepulangan</h1>
            <p className="text-sm sm:text-base text-gray-500">HSI Boarding School</p>
          </div>

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
              <input
                type="tel"
                required
                value={formData.no_hp_wali}
                onChange={(e) => setFormData({ ...formData, no_hp_wali: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="08xxxxxxxxxx"
              />
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
        </div>
      </div>
    </div>
  );
}
