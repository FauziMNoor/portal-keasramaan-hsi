'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, ChevronDown, ChevronUp, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { compileRaporData } from '@/lib/raporHelper';

interface DetailModalProps {
  nis: string;
  cabang: string;
  tahunAjaran: string;
  semester: string;
  kelas: string;
  asrama: string;
  onClose: () => void;
  onGenerate: () => void;
}

export default function DetailModal({
  nis,
  cabang,
  tahunAjaran,
  semester,
  kelas,
  asrama,
  onClose,
  onGenerate,
}: DetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState({
    habit: false,
    kegiatan: false,
    catatan: false,
    dokumentasi: false,
  });

  useEffect(() => {
    fetchDetailData();
  }, [nis]);

  const fetchDetailData = async () => {
    setLoading(true);
    try {
      const result = await compileRaporData({
        nis,
        cabang,
        tahunAjaran,
        semester,
        kelas,
        asrama,
      });

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching detail data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800">Detail Lengkap Rapor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">Memuat data lengkap...</p>
            </div>
          ) : data ? (
            <>
              {/* Foto Santri */}
              <div className="text-center mb-6">
                <FotoSantri foto={data.santri?.foto || ''} nama={data.santri?.nama_siswa || ''} size="xlarge" />
                <h3 className="text-2xl font-bold text-gray-800">{data.santri?.nama_siswa}</h3>
                <p className="text-gray-600">{nis}</p>
              </div>

              {/* Info Dasar */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-bold text-gray-800 mb-3">📋 INFO DASAR</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Nama</div>
                    <div className="font-semibold text-gray-800">{data.santri?.nama_siswa}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">NIS</div>
                    <div className="font-semibold text-gray-800">{nis}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Semester</div>
                    <div className="font-semibold text-gray-800">{semester}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Tahun Ajaran</div>
                    <div className="font-semibold text-gray-800">{tahunAjaran}</div>
                  </div>
                </div>
              </div>

              {/* Habit Tracker Section */}
              <div className="bg-white border-2 border-gray-200 rounded-xl mb-4">
                <button
                  onClick={() => toggleSection('habit')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-800">
                    📊 HABIT TRACKER ({data.habit?.total_entry || 0} entry)
                  </span>
                  {expandedSections.habit ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                {expandedSections.habit && (
                  <div className="px-4 pb-4 space-y-2 max-h-96 overflow-y-auto">
                    {[
                      { label: 'Shalat Fardhu Berjamaah', key: 'shalat_fardhu_berjamaah' },
                      { label: 'Tata Cara Shalat', key: 'tata_cara_shalat' },
                      { label: 'Qiyamul Lail', key: 'qiyamul_lail' },
                      { label: 'Shalat Sunnah', key: 'shalat_sunnah' },
                      { label: 'Puasa Sunnah', key: 'puasa_sunnah' },
                      { label: 'Tata Cara Wudhu', key: 'tata_cara_wudhu' },
                      { label: 'Sedekah', key: 'sedekah' },
                      { label: 'Dzikir Pagi Petang', key: 'dzikir_pagi_petang' },
                      { label: 'Etika Dalam Tutur Kata', key: 'etika_dalam_tutur_kata' },
                      { label: 'Etika Dalam Bergaul', key: 'etika_dalam_bergaul' },
                      { label: 'Etika Dalam Berpakaian', key: 'etika_dalam_berpakaian' },
                      { label: 'Adab Sehari-hari', key: 'adab_sehari_hari' },
                      { label: 'Waktu Tidur', key: 'waktu_tidur' },
                      { label: 'Pelaksanaan Piket Kamar', key: 'pelaksanaan_piket_kamar' },
                      { label: 'Disiplin Halaqah Tahfidz', key: 'disiplin_halaqah_tahfidz' },
                      { label: 'Perizinan', key: 'perizinan' },
                      { label: 'Belajar Malam', key: 'belajar_malam' },
                      { label: 'Disiplin Berangkat ke Masjid', key: 'disiplin_berangkat_ke_masjid' },
                      { label: 'Kebersihan Tubuh, Berpakaian & Berpenampilan', key: 'kebersihan_tubuh_berpakaian_berpenampilan' },
                      { label: 'Kamar', key: 'kamar' },
                      { label: 'Ranjang & Almari', key: 'ranjang_dan_almari' },
                    ].map((habit) => (
                      <div key={habit.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{habit.label}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {data.habit?.[`${habit.key}_deskripsi`] || '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Kegiatan Section */}
              <div className="bg-white border-2 border-gray-200 rounded-xl mb-4">
                <button
                  onClick={() => toggleSection('kegiatan')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-800">
                    📷 KEGIATAN ({data.kegiatan?.length || 0} kegiatan)
                  </span>
                  {expandedSections.kegiatan ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                {expandedSections.kegiatan && (
                  <div className="px-4 pb-4 space-y-4">
                    {data.kegiatan && data.kegiatan.length > 0 ? (
                      data.kegiatan.map((keg: any, idx: number) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-3">
                          <div className="font-semibold text-gray-800 mb-2">
                            {idx + 1}. {keg.nama_kegiatan}
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {keg.foto_1 && <FotoKegiatan foto={keg.foto_1} alt={`${keg.nama_kegiatan} 1`} />}
                            {keg.foto_2 && <FotoKegiatan foto={keg.foto_2} alt={`${keg.nama_kegiatan} 2`} />}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Keterangan:</span> {keg.keterangan_kegiatan || '-'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">Belum ada kegiatan</p>
                    )}
                  </div>
                )}
              </div>

              {/* Catatan Section */}
              <div className="bg-white border-2 border-gray-200 rounded-xl mb-4">
                <button
                  onClick={() => toggleSection('catatan')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-800">📝 CATATAN MUSYRIF</span>
                  {expandedSections.catatan ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                {expandedSections.catatan && (
                  <div className="px-4 pb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-800">
                        {data.catatan?.catatan_musyrif || '-'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pengesahan */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-bold text-gray-800 mb-3">👥 PENGESAHAN</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Ketua Asrama</div>
                    <div className="font-semibold text-gray-800">
                      {data.catatan?.nama_ketua_asrama || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Musyrif</div>
                    <div className="font-semibold text-gray-800">
                      {data.catatan?.nama_musyrif || data.santri?.musyrif || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={onGenerate}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-colors"
                >
                  Generate Rapor
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Data tidak ditemukan
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Component untuk menampilkan foto santri
function FotoSantri({ foto, nama, size = 'medium' }: { foto: string; nama: string; size?: 'medium' | 'large' | 'xlarge' }) {
  const [fotoUrl, setFotoUrl] = useState<string>('');
  const sizeClass = size === 'xlarge' ? 'w-32 h-32' : size === 'large' ? 'w-24 h-24' : 'w-16 h-16';
  const iconSize = size === 'xlarge' ? 'w-16 h-16' : size === 'large' ? 'w-12 h-12' : 'w-8 h-8';

  useEffect(() => {
    if (foto) {
      if (foto.startsWith('http')) {
        setFotoUrl(foto);
      } else {
        const { data } = supabase.storage.from('foto-siswa').getPublicUrl(foto);
        if (data?.publicUrl) {
          setFotoUrl(data.publicUrl);
        }
      }
    }
  }, [foto]);

  if (fotoUrl) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden bg-gray-200 mx-auto mb-3`}>
        <img
          src={fotoUrl}
          alt={nama}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3`}>
      <User className={`${iconSize} text-gray-400`} />
    </div>
  );
}

// Component untuk menampilkan foto kegiatan
function FotoKegiatan({ foto, alt }: { foto: string; alt: string }) {
  const [fotoUrl, setFotoUrl] = useState<string>('');

  useEffect(() => {
    if (foto) {
      if (foto.startsWith('http')) {
        setFotoUrl(foto);
      } else {
        const { data } = supabase.storage.from('kegiatan-rapor').getPublicUrl(foto);
        if (data?.publicUrl) {
          setFotoUrl(data.publicUrl);
        }
      }
    }
  }, [foto]);

  if (fotoUrl) {
    return (
      <div className="relative h-32 bg-gray-100 rounded overflow-hidden">
        <img
          src={fotoUrl}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative h-32 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
      <span className="text-gray-400 text-sm">No Photo</span>
    </div>
  );
}
