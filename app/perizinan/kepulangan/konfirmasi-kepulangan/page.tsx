'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Calendar, User, Clock, AlertCircle, Save, X, MessageCircle } from 'lucide-react';

interface Perizinan {
  id: string;
  nis: string;
  nama_siswa: string;
  kelas: string;
  asrama: string;
  cabang: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  durasi_hari: number;
  keperluan: string;
  status: string;
  status_kepulangan: string;
  tanggal_kembali: string | null;
  dikonfirmasi_oleh: string | null;
  dikonfirmasi_at: string | null;
  catatan_kembali: string | null;
  no_hp_wali: string | null;
}

export default function KonfirmasiKepulanganPage() {
  const [perizinanList, setPerizinanList] = useState<Perizinan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerizinan, setSelectedPerizinan] = useState<Perizinan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [userCabang, setUserCabang] = useState('');
  const [filterStatus, setFilterStatus] = useState('belum_pulang');
  
  // Form states
  const [tanggalKembali, setTanggalKembali] = useState('');
  const [catatanKembali, setCatatanKembali] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUserInfo();
    fetchPerizinan();
  }, [filterStatus]);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.user?.role || '');
        setUserName(data.user?.nama_lengkap || data.user?.nama || '');
        if (data.user?.role === 'kepala_asrama') {
          setUserCabang(data.user?.cabang || '');
        }
      }
    } catch (error) {
      console.error('Fetch user error:', error);
    }
  };

  const fetchPerizinan = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('perizinan_kepulangan_keasramaan')
        .select('*')
        .eq('status', 'approved_kepsek')
        .order('tanggal_mulai', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status_kepulangan', filterStatus);
      }

      if (userRole === 'kepala_asrama' && userCabang) {
        query = query.eq('cabang', userCabang);
      }

      const { data } = await query;

      if (data) {
        setPerizinanList(data);
      }
    } catch (err) {
      console.error('Error fetching perizinan:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (perizinan: Perizinan) => {
    setSelectedPerizinan(perizinan);
    setTanggalKembali(perizinan.tanggal_kembali || '');
    setCatatanKembali(perizinan.catatan_kembali || '');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedPerizinan || !tanggalKembali) {
      alert('❌ Tanggal kembali harus diisi');
      return;
    }

    setSubmitting(true);
    try {
      const kembaliDate = new Date(tanggalKembali);
      const selesaiDate = new Date(selectedPerizinan.tanggal_selesai);
      
      let statusKepulangan = 'sudah_pulang';
      if (kembaliDate > selesaiDate) {
        statusKepulangan = 'terlambat';
      }

      const { error } = await supabase
        .from('perizinan_kepulangan_keasramaan')
        .update({
          tanggal_kembali: tanggalKembali,
          status_kepulangan: statusKepulangan,
          dikonfirmasi_oleh: userName,
          dikonfirmasi_at: new Date().toISOString(),
          catatan_kembali: catatanKembali,
        })
        .eq('id', selectedPerizinan.id);

      if (error) throw error;

      // Tampilkan konfirmasi dengan opsi kirim WhatsApp
      const sendWA = confirm(`✅ Konfirmasi kepulangan berhasil! Status: ${statusKepulangan === 'terlambat' ? 'TERLAMBAT' : 'TEPAT WAKTU'}\n\n📱 Kirim notifikasi WhatsApp ke wali santri?`);

      if (sendWA) {
        sendWhatsAppNotification(selectedPerizinan, tanggalKembali);
      }

      setShowModal(false);
      fetchPerizinan();
    } catch (err: any) {
      alert('❌ Gagal konfirmasi: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      belum_pulang: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '⏳ Belum Pulang', icon: Clock },
      sudah_pulang: { bg: 'bg-green-100', text: 'text-green-700', label: '✅ Sudah Pulang', icon: CheckCircle },
      terlambat: { bg: 'bg-red-100', text: 'text-red-700', label: '⚠️ Terlambat', icon: AlertCircle },
    };

    const badge = badges[status] || badges.belum_pulang;
    const Icon = badge.icon;
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold ${badge.bg} ${badge.text} w-fit`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </div>
    );
  };

  const calculateDaysOverdue = (tanggalSelesai: string, tanggalKembali: string | null) => {
    if (!tanggalKembali) return null;

    const selesai = new Date(tanggalSelesai);
    const kembali = new Date(tanggalKembali);
    const diffTime = kembali.getTime() - selesai.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // Normalisasi nomor HP ke format 62xxx
  const normalizePhoneNumber = (phone: string | null): string => {
    if (!phone) return '';

    // Hapus semua karakter non-digit
    let cleaned = phone.replace(/\D/g, '');

    // Jika diawali 0, ganti dengan 62
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }

    // Jika tidak diawali 62, tambahkan 62
    if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }

    return cleaned;
  };

  // Buka WhatsApp dengan pesan otomatis
  const sendWhatsAppNotification = (perizinan: Perizinan, tanggalKembali: string) => {
    const normalizedPhone = normalizePhoneNumber(perizinan.no_hp_wali);

    const message = `Assalamu'alaikum Warahmatullahi Wabarakatuh

Yth. Bapak/Ibu Wali Santri

Kami informasikan bahwa:

*Nama*: ${perizinan.nama_siswa}
*NIS*: ${perizinan.nis}
*Kelas*: ${perizinan.kelas}

Telah kembali ke pondok pada:
📅 *${new Date(tanggalKembali).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}*

Alhamdulillah, ananda sudah tiba dengan selamat di asrama.

Terima kasih atas perhatian dan kerjasamanya.

Wassalamu'alaikum Warahmatullahi Wabarakatuh

_Kepala Asrama ${perizinan.cabang}_
_HSI Boarding School_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-3 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Konfirmasi Kepulangan Santri</h1>
            <p className="text-sm sm:text-base text-gray-600">Tracking santri yang sudah kembali ke asrama</p>
          </div>

          {/* Filter */}
          <div className="mb-4 sm:mb-6 flex gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterStatus('belum_pulang')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                filterStatus === 'belum_pulang'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Belum Pulang
            </button>
            <button
              onClick={() => setFilterStatus('sudah_pulang')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                filterStatus === 'sudah_pulang'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Sudah Pulang
            </button>
            <button
              onClick={() => setFilterStatus('terlambat')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                filterStatus === 'terlambat'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Terlambat
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Belum Pulang</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {perizinanList.filter(p => p.status_kepulangan === 'belum_pulang').length}
                  </p>
                </div>
                <Clock className="w-10 h-10 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sudah Pulang</p>
                  <p className="text-3xl font-bold text-green-600">
                    {perizinanList.filter(p => p.status_kepulangan === 'sudah_pulang').length}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Terlambat</p>
                  <p className="text-3xl font-bold text-red-600">
                    {perizinanList.filter(p => p.status_kepulangan === 'terlambat').length}
                  </p>
                </div>
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : perizinanList.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Tidak ada data perizinan
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Santri</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Tanggal Izin</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Durasi</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Kategori</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Status</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perizinanList.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-800">{item.nama_siswa}</div>
                          <div className="text-xs text-gray-500">{item.nis} • {item.kelas}</div>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <div>{new Date(item.tanggal_mulai).toLocaleDateString('id-ID')}</div>
                          <div className="text-xs text-gray-500">
                            s/d {new Date(item.tanggal_selesai).toLocaleDateString('id-ID')}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="font-semibold text-gray-800">{item.durasi_hari}</span>
                          <span className="text-xs text-gray-500"> hari</span>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {item.keperluan}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {getStatusBadge(item.status_kepulangan)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => openModal(item)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                          >
                            {item.status_kepulangan === 'belum_pulang' ? 'Konfirmasi' : 'Edit'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-gray-200">
                  {perizinanList.map((item) => (
                    <div key={item.id} className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-base">{item.nama_siswa}</h3>
                          <p className="text-xs text-gray-500">{item.nis} • {item.kelas}</p>
                        </div>
                        <div className="ml-2">
                          {getStatusBadge(item.status_kepulangan)}
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">
                            {new Date(item.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(item.tanggal_selesai).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{item.durasi_hari} hari</span>
                        </div>
                        <div className="flex items-start text-sm">
                          <User className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {item.keperluan}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => openModal(item)}
                        className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        {item.status_kepulangan === 'belum_pulang' ? 'Konfirmasi Kepulangan' : 'Edit Konfirmasi'}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modal Konfirmasi */}
      {showModal && selectedPerizinan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Konfirmasi Kepulangan</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Info Santri */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Nama Santri</label>
                    <p className="text-gray-800 font-semibold">{selectedPerizinan.nama_siswa}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">NIS</label>
                    <p className="text-gray-800 font-semibold">{selectedPerizinan.nis}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Kelas</label>
                    <p className="text-gray-800 font-semibold">{selectedPerizinan.kelas}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Asrama</label>
                    <p className="text-gray-800 font-semibold">{selectedPerizinan.asrama}</p>
                  </div>
                </div>

                {/* Info Wali Santri dengan Tombol WhatsApp */}
                <div className="border-t border-blue-200 pt-4">
                  <label className="text-xs font-semibold text-gray-600 block mb-2">Kontak Wali Santri</label>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 font-semibold">{selectedPerizinan.no_hp_wali}</p>
                      <p className="text-xs text-gray-500">
                        Format: {normalizePhoneNumber(selectedPerizinan.no_hp_wali)}
                      </p>
                    </div>
                    <button
                      onClick={() => sendWhatsAppNotification(selectedPerizinan, tanggalKembali || new Date().toISOString().split('T')[0])}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                      title="Kirim notifikasi WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Izin */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-gray-800 mb-3">Detail Izin Kepulangan</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Tanggal Mulai</label>
                    <p className="text-gray-800">{new Date(selectedPerizinan.tanggal_mulai).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Tanggal Selesai</label>
                    <p className="text-gray-800">{new Date(selectedPerizinan.tanggal_selesai).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Durasi</label>
                    <p className="text-gray-800">{selectedPerizinan.durasi_hari} hari</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Kategori</label>
                    <p className="text-gray-800">{selectedPerizinan.keperluan}</p>
                  </div>
                </div>
              </div>

              {/* Form Konfirmasi */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tanggal Kembali <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={tanggalKembali}
                    onChange={(e) => setTanggalKembali(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {tanggalKembali && (
                    <div className="mt-2 text-sm">
                      {new Date(tanggalKembali) > new Date(selectedPerizinan.tanggal_selesai) ? (
                        <div className="text-red-600 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Terlambat {calculateDaysOverdue(selectedPerizinan.tanggal_selesai, tanggalKembali)} hari
                        </div>
                      ) : (
                        <div className="text-green-600 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Tepat waktu
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Catatan Kembali
                  </label>
                  <textarea
                    value={catatanKembali}
                    onChange={(e) => setCatatanKembali(e.target.value)}
                    placeholder="Contoh: Santri kembali dalam kondisi sehat, tidak ada masalah"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !tanggalKembali}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Menyimpan...' : 'Simpan Konfirmasi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
