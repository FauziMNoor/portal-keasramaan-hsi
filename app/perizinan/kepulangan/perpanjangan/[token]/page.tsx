'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Calendar, AlertCircle, Upload, X, CheckCircle, FileText, Image as ImageIcon } from 'lucide-react';

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
  alasan: string;
  alamat_tujuan: string;
  no_hp_wali: string;
  status: string;
}

interface SuccessData {
  perizinan_id: string;
  nama_siswa: string;
  nis: string;
  kelas: string;
  cabang: string;
  tanggal_mulai: string;
  tanggal_selesai_awal: string;
  tanggal_selesai_baru: string;
  durasi_awal: number;
  durasi_baru: number;
  perpanjangan_hari: number;
  perpanjangan_ke: number;
  alasan_perpanjangan: string;
}

export default function PerpanjanganIzinPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [step, setStep] = useState<'select' | 'form' | 'success'>('select');
  const [perizinanList, setPerizinanList] = useState<Perizinan[]>([]);
  const [selectedPerizinan, setSelectedPerizinan] = useState<Perizinan | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [logoSekolah, setLogoSekolah] = useState<string>('');
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  // Form states
  const [tanggalSelesaiBaru, setTanggalSelesaiBaru] = useState('');
  const [alasanPerpanjangan, setAlasanPerpanjangan] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tipeDokumen, setTipeDokumen] = useState('surat_dokter');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    validateToken();
    fetchLogoSekolah();
  }, [token]);

  const validateToken = async () => {
    setValidating(true);
    const { data, error } = await supabase
      .from('token_perizinan_keasramaan')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      setTokenValid(false);
    } else {
      setTokenValid(true);
      fetchPerizinanList(data.cabang);
    }
    setValidating(false);
  };

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

  const fetchPerizinanList = async (cabang?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('perizinan_kepulangan_keasramaan')
        .select('*')
        .eq('status', 'approved_kepsek')
        .eq('is_perpanjangan', false)
        .order('tanggal_selesai', { ascending: true });

      if (cabang) {
        query = query.eq('cabang', cabang);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        // Filter: hanya perizinan yang belum selesai dan bisa diperpanjang
        const now = new Date();
        const validPerizinan = data.filter(p => {
          const selesaiDate = new Date(p.tanggal_selesai);
          // Bisa perpanjang jika belum selesai atau baru selesai (max 3 hari setelah selesai)
          const daysAfterEnd = Math.floor((now.getTime() - selesaiDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysAfterEnd <= 3;
        });

        setPerizinanList(validPerizinan);
      }
    } catch (err) {
      console.error('Error fetching perizinan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('❌ Tipe file tidak didukung. Gunakan JPG, PNG, atau PDF');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('❌ Ukuran file terlalu besar. Maksimal 5MB');
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

  const handleSubmitPerpanjangan = async () => {
    if (!selectedPerizinan || !tanggalSelesaiBaru || !alasanPerpanjangan) {
      alert('❌ Semua field harus diisi');
      return;
    }

    if (!selectedFile) {
      alert('❌ Dokumen pendukung harus diupload');
      return;
    }

    const newSelesaiDate = new Date(tanggalSelesaiBaru);
    const oldSelesaiDate = new Date(selectedPerizinan.tanggal_selesai);

    if (newSelesaiDate <= oldSelesaiDate) {
      alert('❌ Tanggal selesai baru harus lebih besar dari tanggal selesai awal');
      return;
    }

    const perpanjanganHari = Math.floor((newSelesaiDate.getTime() - oldSelesaiDate.getTime()) / (1000 * 60 * 60 * 24));
    const durasiTotal = selectedPerizinan.durasi_hari + perpanjanganHari;

    if (durasiTotal > 30) {
      alert('❌ Total durasi tidak boleh lebih dari 30 hari');
      return;
    }

    setSubmitting(true);
    try {
      // Upload dokumen
      const fileName = `perpanjangan-${selectedPerizinan.nis}-${Date.now()}.${selectedFile.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('dokumen-perpanjangan')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('dokumen-perpanjangan')
        .getPublicUrl(fileName);

      // Buat record perpanjangan
      const { data: perpanjanganData, error: perpanjanganError } = await supabase
        .from('perizinan_kepulangan_keasramaan')
        .insert({
          nis: selectedPerizinan.nis,
          nama_siswa: selectedPerizinan.nama_siswa,
          kelas: selectedPerizinan.kelas,
          asrama: selectedPerizinan.asrama,
          cabang: selectedPerizinan.cabang,
          tanggal_pengajuan: new Date().toISOString().split('T')[0],
          tanggal_mulai: selectedPerizinan.tanggal_mulai,
          tanggal_selesai: tanggalSelesaiBaru,
          durasi_hari: durasiTotal,
          keperluan: selectedPerizinan.keperluan,
          alasan: selectedPerizinan.alasan,
          alamat_tujuan: selectedPerizinan.alamat_tujuan,
          no_hp_wali: selectedPerizinan.no_hp_wali,
          status: 'pending',
          is_perpanjangan: true,
          perizinan_induk_id: selectedPerizinan.id,
          alasan_perpanjangan: alasanPerpanjangan,
          dokumen_pendukung_url: urlData.publicUrl,
          dokumen_pendukung_uploaded_at: new Date().toISOString(),
          dokumen_pendukung_tipe: tipeDokumen,
        })
        .select()
        .single();

      if (perpanjanganError) throw perpanjanganError;

      setSuccessData({
        perizinan_id: perpanjanganData.id,
        nama_siswa: selectedPerizinan.nama_siswa,
        nis: selectedPerizinan.nis,
        kelas: selectedPerizinan.kelas,
        cabang: selectedPerizinan.cabang,
        tanggal_mulai: selectedPerizinan.tanggal_mulai,
        tanggal_selesai_awal: selectedPerizinan.tanggal_selesai,
        tanggal_selesai_baru: tanggalSelesaiBaru,
        durasi_awal: selectedPerizinan.durasi_hari,
        durasi_baru: durasiTotal,
        perpanjangan_hari: perpanjanganHari,
        perpanjangan_ke: 1,
        alasan_perpanjangan: alasanPerpanjangan,
      });

      setStep('success');
    } catch (err: any) {
      alert('❌ Gagal submit perpanjangan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memvalidasi link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Link Tidak Valid</h1>
          <p className="text-gray-600">Link perpanjangan tidak valid atau sudah tidak aktif.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-3 sm:p-4 py-6 sm:py-8">
      <div className="w-full max-w-2xl">
        {/* Logo & Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-3xl mb-3 sm:mb-4 shadow-xl border-4 border-green-100">
            {logoSekolah ? (
              <img
                src={logoSekolah}
                alt="Logo Sekolah"
                className="w-16 sm:w-20 h-16 sm:h-20 object-contain rounded-2xl"
                onError={() => setLogoSekolah('')}
              />
            ) : (
              <span className="text-4xl sm:text-5xl">🏫</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Perpanjangan Izin Kepulangan</h1>
          <p className="text-sm sm:text-base text-gray-600">HSI Boarding School</p>
        </div>

        {step === 'select' && (
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Pilih Perizinan yang Ingin Diperpanjang</h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : perizinanList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Tidak ada perizinan yang bisa diperpanjang</p>
              </div>
            ) : (
              <div className="space-y-3">
                {perizinanList.map(perizinan => (
                  <button
                    key={perizinan.id}
                    onClick={() => {
                      setSelectedPerizinan(perizinan);
                      setStep('form');
                    }}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{perizinan.nama_siswa}</p>
                        <p className="text-sm text-gray-600">{perizinan.nis} • {perizinan.kelas}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(perizinan.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(perizinan.tanggal_selesai).toLocaleDateString('id-ID')} ({perizinan.durasi_hari} hari)
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {perizinan.keperluan}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'form' && selectedPerizinan && (
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Form Perpanjangan</h2>
              <button
                onClick={() => {
                  setStep('select');
                  setSelectedPerizinan(null);
                  setTanggalSelesaiBaru('');
                  setAlasanPerpanjangan('');
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Perizinan Awal */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-3 text-sm sm:text-base">Perizinan Awal</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Nama</label>
                  <p className="text-gray-800">{selectedPerizinan.nama_siswa}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">NIS</label>
                  <p className="text-gray-800">{selectedPerizinan.nis}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Tanggal Selesai</label>
                  <p className="text-gray-800">{new Date(selectedPerizinan.tanggal_selesai).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Durasi</label>
                  <p className="text-gray-800">{selectedPerizinan.durasi_hari} hari</p>
                </div>
              </div>
            </div>

            {/* Form Perpanjangan */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Selesai Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={tanggalSelesaiBaru}
                  onChange={(e) => setTanggalSelesaiBaru(e.target.value)}
                  min={new Date(selectedPerizinan.tanggal_selesai).toISOString().split('T')[0]}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                {tanggalSelesaiBaru && (
                  <div className="mt-2 text-xs sm:text-sm space-y-1">
                    <p className="text-gray-600">
                      Perpanjangan: <span className="font-semibold text-blue-600">
                        {Math.floor((new Date(tanggalSelesaiBaru).getTime() - new Date(selectedPerizinan.tanggal_selesai).getTime()) / (1000 * 60 * 60 * 24))} hari
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Total durasi: <span className="font-semibold text-blue-600">
                        {selectedPerizinan.durasi_hari + Math.floor((new Date(tanggalSelesaiBaru).getTime() - new Date(selectedPerizinan.tanggal_selesai).getTime()) / (1000 * 60 * 60 * 24))} hari
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Alasan Perpanjangan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={alasanPerpanjangan}
                  onChange={(e) => setAlasanPerpanjangan(e.target.value)}
                  placeholder="Contoh: Masih dalam perawatan medis, perlu waktu lebih untuk pemulihan"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Tipe Dokumen Pendukung <span className="text-red-500">*</span>
                </label>
                <select
                  value={tipeDokumen}
                  onChange={(e) => setTipeDokumen(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="surat_dokter">Surat Keterangan Dokter</option>
                  <option value="surat_keluarga">Surat dari Keluarga</option>
                  <option value="surat_lainnya">Surat Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Upload Dokumen Pendukung <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400 mb-2" />
                    <span className="text-xs sm:text-sm text-gray-600 text-center">
                      {selectedFile ? selectedFile.name : 'Klik untuk upload dokumen'}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      JPG, PNG, atau PDF (Max 5MB)
                    </span>
                  </label>
                </div>
                {previewUrl && (
                  <div className="mt-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full h-48 object-contain mx-auto rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setStep('select');
                  setSelectedPerizinan(null);
                  setTanggalSelesaiBaru('');
                  setAlasanPerpanjangan('');
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Kembali
              </button>
              <button
                onClick={handleSubmitPerpanjangan}
                disabled={submitting || !tanggalSelesaiBaru || !alasanPerpanjangan || !selectedFile}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {submitting ? 'Mengirim...' : 'Kirim Perpanjangan'}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && successData && (
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 sm:w-12 h-8 sm:h-12 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Perpanjangan Berhasil Terkirim!</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6">Permohonan perpanjangan izin telah diterima dan menunggu persetujuan.</p>

            <div className="bg-blue-50 rounded-xl p-4 sm:p-6 mb-6 text-left">
              <h2 className="font-bold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">Detail Perpanjangan:</h2>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nama:</span>
                  <span className="font-semibold">{successData.nama_siswa}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">NIS:</span>
                  <span className="font-semibold">{successData.nis}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tanggal Selesai Awal:</span>
                  <span className="font-semibold">{new Date(successData.tanggal_selesai_awal).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tanggal Selesai Baru:</span>
                  <span className="font-semibold text-blue-600">{new Date(successData.tanggal_selesai_baru).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Perpanjangan:</span>
                  <span className="font-semibold text-blue-600">+{successData.perpanjangan_hari} hari</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Durasi:</span>
                  <span className="font-semibold">{successData.durasi_baru} hari</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                    Menunggu Persetujuan
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs sm:text-sm text-amber-800">
                <span className="font-semibold">📋 Catatan:</span> Perpanjangan izin Anda akan diproses oleh Kepala Asrama dan Kepala Sekolah. Anda akan diberitahu melalui WhatsApp ketika perpanjangan sudah disetujui.
              </p>
            </div>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base"
            >
              Kembali ke Beranda
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
