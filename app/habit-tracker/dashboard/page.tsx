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
