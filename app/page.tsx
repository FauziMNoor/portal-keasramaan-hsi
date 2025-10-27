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

interface DistribusiLokasi {
  lokasi: string;
  jumlah: number;
}

interface StrukturPengurus {
  lokasi: string;
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
  const [distribusiLokasi, setDistribusiLokasi] = useState<DistribusiLokasi[]>([]);
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
      fetchDistribusiLokasi(),
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
      const [santri, asrama, musyrif, kelas, lokasi, kepas] = await Promise.all([
        supabase.from('data_siswa_keasramaan').select('id', { count: 'exact', head: true }),
        supabase.from('asrama_keasramaan').select('id', { count: 'exact', head: true }),
        supabase.from('musyrif_keasramaan').select('id', { count: 'exact', head: true }),
        supabase.from('kelas_keasramaan').select('id', { count: 'exact', head: true }),
        supabase.from('lokasi_keasramaan').select('id', { count: 'exact', head: true }),
        supabase.from('kepala_asrama_keasramaan').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalSantri: santri.count || 0,
        totalAsrama: asrama.count || 0,
        totalMusyrif: musyrif.count || 0,
        totalKelas: kelas.count || 0,
        totalLokasi: lokasi.count || 0,
        totalKepas: kepas.count || 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchDistribusiLokasi = async () => {
    try {
      const { data, error } = await supabase
        .from('data_siswa_keasramaan')
        .select('lokasi');

      if (data) {
        const distribusi = data.reduce((acc: any, curr) => {
          const lokasi = curr.lokasi || 'Tidak Ada Lokasi';
          acc[lokasi] = (acc[lokasi] || 0) + 1;
          return acc;
        }, {});

        const result = Object.entries(distribusi).map(([lokasi, jumlah]) => ({
          lokasi,
          jumlah: jumlah as number,
        }));

        setDistribusiLokasi(result);
      }
    } catch (err) {
      console.error('Error fetching distribusi:', err);
    }
  };

  const fetchStrukturPengurus = async () => {
    try {
      const { data: lokasiData } = await supabase
        .from('lokasi_keasramaan')
        .select('lokasi');

      if (lokasiData) {
        const struktur = await Promise.all(
          lokasiData.map(async (lok) => {
            const [kepas, asrama, musyrif, santri] = await Promise.all([
              supabase
                .from('kepala_asrama_keasramaan')
                .select('nama')
                .eq('lokasi', lok.lokasi)
                .limit(1)
                .single(),
              supabase
                .from('asrama_keasramaan')
                .select('id', { count: 'exact', head: true })
                .eq('lokasi', lok.lokasi),
              supabase
                .from('musyrif_keasramaan')
                .select('id', { count: 'exact', head: true })
                .eq('lokasi', lok.lokasi),
              supabase
                .from('data_siswa_keasramaan')
                .select('id', { count: 'exact', head: true })
                .eq('lokasi', lok.lokasi),
            ]);

            return {
              lokasi: lok.lokasi,
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
        <main className="flex-1 flex items-center justify-center">
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
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 1. HEADER UTAMA - Identitas Sekolah */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl shadow-xl p-8 text-white">
            <div className="flex items-start gap-6">
              {/* Logo */}
              <div className="shrink-0">
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo Sekolah"
                      className="w-20 h-20 object-contain rounded-xl"
                    />
                  ) : (
                    <GraduationCap className="w-16 h-16 text-blue-600" />
                  )}
                </div>
              </div>

              {/* Info Sekolah */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">
                  {identitas?.nama_sekolah || 'HSI Boarding School'}
                </h1>
                <p className="text-xl text-blue-100 mb-4">
                  {identitas?.nama_kepala_sekolah || 'Kepala Sekolah'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {identitas?.alamat && (
                    <div className="flex items-center gap-2">
                      <MapPinned className="w-4 h-4 shrink-0" />
                      <span className="text-blue-100">{identitas.alamat}</span>
                    </div>
                  )}
                  {identitas?.no_telepon && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span className="text-blue-100">{identitas.no_telepon}</span>
                    </div>
                  )}
                  {identitas?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="text-blue-100">{identitas.email}</span>
                    </div>
                  )}
                  {identitas?.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 shrink-0" />
                      <span className="text-blue-100">{identitas.website}</span>
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
              label="Total Musyrif"
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
              label="Total Lokasi"
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
            {/* A. Distribusi Santri per Lokasi */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Distribusi Santri per Lokasi
              </h2>
              <div className="space-y-3">
                {distribusiLokasi.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-700 font-medium">{item.lokasi}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${(item.jumlah / stats.totalSantri) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-2xl font-bold text-blue-600 w-12 text-right">
                        {item.jumlah}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* B. Struktur Pengurus Asrama */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                Struktur Pengurus Asrama
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">Lokasi</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">Kepala Asrama</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">Asrama</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">Musyrif</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">Santri</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strukturPengurus.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-2 font-medium text-gray-800">{item.lokasi}</td>
                        <td className="py-3 px-2 text-gray-600">{item.kepala_asrama}</td>
                        <td className="py-3 px-2 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg font-bold">
                            {item.jumlah_asrama}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-lg font-bold">
                            {item.jumlah_musyrif}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-lg font-bold">
                            {item.jumlah_santri}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
