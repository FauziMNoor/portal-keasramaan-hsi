'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, Award, Target, Filter as FilterIcon, Eye, Download, User as UserIcon, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DashboardStats {
  totalSantriDisiplin: number;
  totalSantri: number;
  persentaseDisiplin: number;
  rataRataNilai: number;
  asramaTerbaik: { nama: string; nilai: number };
  musyrifTerbaik: { nama: string; jumlahSantri: number };
}

interface SantriRanking {
  ranking: number;
  nama_siswa: string;
  nis: string;
  kelas: string;
  asrama: string;
  foto: string;
  rata_rata: number;
  predikat: string;
  trend: 'up' | 'down' | 'stable';
}

export default function DashboardHabitTrackerPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topSantri, setTopSantri] = useState<any[]>([]);
  const [santriList, setSantriList] = useState<SantriRanking[]>([]);
  
  const [filters, setFilters] = useState({
    tahun_ajaran: '',
    semester: '',
    lokasi: '',
    asrama: '',
    musyrif: '',
  });

  const [masterData, setMasterData] = useState({
    tahunAjaranList: [] as string[],
    semesterList: [] as string[],
    lokasiList: [] as string[],
    asramaList: [] as string[],
    musyrifList: [] as string[],
  });

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    // Fetch master data from database
    const { data: habitData } = await supabase
      .from('formulir_habit_tracker_keasramaan')
      .select('tahun_ajaran, semester, lokasi, asrama, musyrif');

    if (habitData) {
      const uniqueTahunAjaran = [...new Set(habitData.map(d => d.tahun_ajaran).filter(Boolean))];
      const uniqueSemester = [...new Set(habitData.map(d => d.semester).filter(Boolean))];
      const uniqueLokasi = [...new Set(habitData.map(d => d.lokasi).filter(Boolean))];
      const uniqueAsrama = [...new Set(habitData.map(d => d.asrama).filter(Boolean))];
      const uniqueMusyrif = [...new Set(habitData.map(d => d.musyrif).filter(Boolean))];

      setMasterData({
        tahunAjaranList: uniqueTahunAjaran as string[],
        semesterList: uniqueSemester as string[],
        lokasiList: uniqueLokasi as string[],
        asramaList: uniqueAsrama as string[],
        musyrifList: uniqueMusyrif as string[],
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Habit Tracker</h1>
                <p className="text-gray-600">Analisis dan statistik habit tracker siswa</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <p className="text-gray-600">Dashboard dalam pengembangan...</p>
            <p className="text-sm text-gray-500 mt-2">Fitur dashboard akan segera tersedia</p>
          </div>
        </div>
      </main>
    </div>
  );
}
