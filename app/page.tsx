'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import {
  Users,
  Building2,
  UserCog,
  GraduationCap,
  MapPin,
  Shield,
  Mail,
  Phone,
  Globe,
  MapPinned
} from 'lucide-react';

interface IdentitasSekolah {
  nama_sekolah: string;
  nama_kepala_sekolah: string;
  alamat: string;
  no_telepon: string;
  email: string;
  website: string;
  logo: string;
}

interface Stats {
  totalSantri: number;
  totalAsrama: number;
  totalMusyrif: number;
  totalKelas: number;
  totalLokasi: number;
  totalKepas: number;
}

interface DistribusiCabang {
  cabang: string;
  jumlah: number;
}

interface StrukturPengurus {
  cabang: string;
  kepala_asrama: string;
  jumlah_asrama: number;
  jumlah_musyrif: number;
  jumlah_santri: number;
}

export default function Home() {
  const [identitas, setIdentitas] = useState<IdentitasSekolah | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalSantri: 0,
    totalAsrama: 0,
    totalMusyrif: 0,
    totalKelas: 0,
    totalLokasi: 0,
    totalKepas: 0,
  });
  const [distribusiCabang, setDistribusiCabang] = useState<DistribusiCabang[]>([]);
  const [strukturPengurus, setStrukturPengurus] = useState<StrukturPengurus[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchIdentitas(),
      fetchStats(),
      fetchDistribusiCabang(),
      fetchStrukturPengurus(),
    ]);
    setLoading(false);
  };

  const fetchIdentitas = async () => {
    try {
      const { data, error } = await supabase
        .from('identitas_sekolah_keasramaan')
        .select('*')
        .limit(1)
        .single();

      if (data) {
        setIdentitas(data);
        if (data.logo) {
          if (data.logo.startsWith('http')) {
            setLogoUrl(data.logo);
          } else {
            const { data: urlData } = supabase.storage.from('logos').getPublicUrl(data.logo);
            if (urlData?.publicUrl) {
              setLogoUrl(urlData.publicUrl);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching identitas:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const [santri, asrama, musyrif, kelas, cabang, kepas] = await Promise.all([
        supabase.from('data_siswa_keasramaan').select('id', { count: 'exact', head: true }),
        supabase.from('asrama_keasramaan').select('id', { count: 'exact', head: true }),
        supabase.from('musyrif_keasramaan').select('id', { count: 'exact', head: true }),
        supabase.from('kelas_keasramaan').select('id', { count: 'exact', head: true }),
        supabase.from('cabang_keasramaan').select('id', { count: 'exact', head: true }),
        supabase.from('kepala_asrama_keasramaan').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalSantri: santri.count || 0,
        totalAsrama: asrama.count || 0,
        totalMusyrif: musyrif.count || 0,
        totalKelas: kelas.count || 0,
        totalLokasi: cabang.count || 0,
        totalKepas: kepas.count || 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchDistribusiCabang = async () => {
    try {
      const { data, error } = await supabase
        .from('data_siswa_keasramaan')
        .select('cabang');

      if (data) {
        const distribusi = data.reduce((acc: any, curr) => {
          const cabang = curr.cabang || 'Tidak Ada Cabang';
          acc[cabang] = (acc[cabang] || 0) + 1;
          return acc;
        }, {});

        const result = Object.entries(distribusi).map(([cabang, jumlah]) => ({
          cabang,
          jumlah: jumlah as number,
        }));

        setDistribusiCabang(result);
      }
    } catch (err) {
      console.error('Error fetching distribusi:', err);
    }
  };

  const fetchStrukturPengurus = async () => {
    try {
      const { data: cabangData } = await supabase
        .from('cabang_keasramaan')
        .select('nama_cabang');

      if (cabangData) {
        const struktur = await Promise.all(
          cabangData.map(async (cab) => {
            const [kepas, asrama, musyrif, santri] = await Promise.all([
              supabase
                .from('kepala_asrama_keasramaan')
                .select('nama')
                .eq('cabang', cab.nama_cabang)
                .limit(1)
                .single(),
              supabase
                .from('asrama_keasramaan')
                .select('id', { count: 'exact', head: true })
                .eq('nama_cabang', cab.nama_cabang),
              supabase
                .from('musyrif_keasramaan')
                .select('id', { count: 'exact', head: true })
                .eq('cabang', cab.nama_cabang),
              supabase
                .from('data_siswa_keasramaan')
                .select('id', { count: 'exact', head: true })
                .eq('cabang', cab.nama_cabang),
            ]);

            return {
              cabang: cab.nama_cabang,
              kepala_asrama: kepas.data?.nama || '-',
              jumlah_asrama: asrama.count || 0,
              jumlah_musyrif: musyrif.count || 0,
              jumlah_santri: santri.count || 0,
            };
          })
        );

        setStrukturPengurus(struktur);
      }
    } catch (err) {
      console.error('Error fetching struktur:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center lg:ml-0 ml-0">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* 1. HEADER UTAMA - Identitas Sekolah */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* Logo */}
              <div className="shrink-0 mx-auto sm:mx-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo Sekolah"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl"
                    />
                  ) : (
                    <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600" />
                  )}
                </div>
              </div>

              {/* Info Sekolah */}
              <div className="flex-1 w-full">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-center sm:text-left">
                  {identitas?.nama_sekolah || 'HSI Boarding School'}
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-3 sm:mb-4 text-center sm:text-left">
                  {identitas?.nama_kepala_sekolah || 'Kepala Sekolah'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  {identitas?.alamat && (
                    <div className="flex items-start gap-2">
                      <MapPinned className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="text-blue-100 text-left">{identitas.alamat}</span>
                    </div>
                  )}
                  {identitas?.no_telepon && (
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="text-blue-100 text-left">{identitas.no_telepon}</span>
                    </div>
                  )}
                  {identitas?.email && (
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="text-blue-100 text-left">{identitas.email}</span>
                    </div>
                  )}
                  {identitas?.website && (
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="text-blue-100 text-left">{identitas.website}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. STATISTIK RINGKAS - Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="Total Santri"
              value={stats.totalSantri}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              icon={<Building2 className="w-6 h-6" />}
              label="Total Asrama"
              value={stats.totalAsrama}
              color="from-indigo-500 to-indigo-600"
            />
            <StatCard
              icon={<UserCog className="w-6 h-6" />}
              label="Total Musyrif/ah"
              value={stats.totalMusyrif}
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              icon={<GraduationCap className="w-6 h-6" />}
              label="Total Kelas"
              value={stats.totalKelas}
              color="from-green-500 to-green-600"
            />
            <StatCard
              icon={<MapPin className="w-6 h-6" />}
              label="Total Cabang"
              value={stats.totalLokasi}
              color="from-orange-500 to-orange-600"
            />
            <StatCard
              icon={<Shield className="w-6 h-6" />}
              label="Kepala Asrama"
              value={stats.totalKepas}
              color="from-amber-500 to-amber-600"
            />
          </div>

          {/* 3. PANEL DATA DINAMIS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* A. Distribusi Santri per Cabang */}
            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Distribusi Santri per Cabang
              </h2>
              <div className="space-y-3">
                {distribusiCabang.length > 0 ? (
                  distribusiCabang.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                        <span className="text-xs sm:text-sm text-gray-700 font-medium truncate">{item.cabang}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <div className="bg-gray-200 rounded-full h-1.5 sm:h-2 w-20 sm:w-32">
                          <div
                            className="bg-blue-500 h-1.5 sm:h-2 rounded-full transition-all"
                            style={{
                              width: `${(item.jumlah / stats.totalSantri) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-blue-600 w-8 sm:w-12 text-right">
                          {item.jumlah}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4 text-sm">Belum ada data distribusi</p>
                )}
              </div>
            </div>

            {/* B. Struktur Pengurus Asrama */}
            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                Struktur Pengurus Asrama
              </h2>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-3 font-semibold text-gray-700 text-xs">Cabang</th>
                        <th className="text-left py-3 px-3 font-semibold text-gray-700 text-xs">Kepala Asrama</th>
                        <th className="text-center py-3 px-3 font-semibold text-gray-700 text-xs">Asrama</th>
                        <th className="text-center py-3 px-3 font-semibold text-gray-700 text-xs">Musyrif/ah</th>
                        <th className="text-center py-3 px-3 font-semibold text-gray-700 text-xs">Santri</th>
                      </tr>
                    </thead>
                    <tbody>
                      {strukturPengurus.length > 0 ? (
                        strukturPengurus.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                            <td className="py-3 px-3 font-medium text-gray-800 text-xs">{item.cabang}</td>
                            <td className="py-3 px-3 text-gray-600 text-xs">{item.kepala_asrama}</td>
                            <td className="py-3 px-3 text-center">
                              <span className="inline-flex items-center justify-center w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs">
                                {item.jumlah_asrama}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="inline-flex items-center justify-center w-7 h-7 bg-purple-100 text-purple-700 rounded-lg font-bold text-xs">
                                {item.jumlah_musyrif}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-700 rounded-lg font-bold text-xs">
                                {item.jumlah_santri}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-gray-500 text-sm">
                            Belum ada data struktur pengurus
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {strukturPengurus.length > 0 ? (
                  strukturPengurus.map((item, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all">
                      {/* Header */}
                      <div className="mb-3 pb-3 border-b border-blue-200">
                        <h3 className="font-bold text-gray-800 text-base">{item.cabang}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Kepala Asrama:</span> {item.kepala_asrama}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Asrama</p>
                          <span className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-sm">
                            {item.jumlah_asrama}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Musyrif/ah</p>
                          <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-700 rounded-lg font-bold text-sm">
                            {item.jumlah_musyrif}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Santri</p>
                          <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 rounded-lg font-bold text-sm">
                            {item.jumlah_santri}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4 text-sm">Belum ada data struktur pengurus</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// Component StatCard
function StatCard({ icon, label, value, color }: any) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105`}>
      <div className="flex items-center justify-between mb-3">
        {icon}
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <h3 className="text-sm font-medium opacity-90">{label}</h3>
    </div>
  );
}
