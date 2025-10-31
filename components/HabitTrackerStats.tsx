'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface HabitStats {
  month: string;
  currentPeriod: number;
  previousPeriod: number;
}

interface HabitTrackerStatsProps {
  filters?: {
    tahun_ajaran?: string;
    semester?: string;
    cabang?: string;
    asrama?: string;
    musyrif?: string;
  };
}

export default function HabitTrackerStats({ filters = {} }: HabitTrackerStatsProps) {
  const [tahunAjaran, setTahunAjaran] = useState('');
  const [tahunAjaranList, setTahunAjaranList] = useState<any[]>([]);
  const [chartData, setChartData] = useState<HabitStats[]>([]);
  const [totalCurrent, setTotalCurrent] = useState(0);
  const [totalPrevious, setTotalPrevious] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    // Apply external filters if provided
    if (filters.tahun_ajaran) setTahunAjaran(filters.tahun_ajaran);
  }, [filters]);

  useEffect(() => {
    if (tahunAjaran) {
      fetchHabitStats();
    }
  }, [tahunAjaran, filters.cabang, filters.asrama, filters.musyrif]);

  const fetchMasterData = async () => {
    try {
      const { data: habitData } = await supabase
        .from('formulir_habit_tracker_keasramaan')
        .select('tahun_ajaran');

      if (habitData) {
        const uniqueTahunAjaran = [...new Set(habitData.map(d => d.tahun_ajaran).filter(Boolean))];

        setTahunAjaranList(uniqueTahunAjaran.map(t => ({ value: t, label: t })));

        // Set default to latest tahun ajaran if not provided by filters
        if (!filters.tahun_ajaran && uniqueTahunAjaran.length > 0) {
          setTahunAjaran(uniqueTahunAjaran[uniqueTahunAjaran.length - 1] as string);
        }
      }
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  const fetchHabitStats = async () => {
    setLoading(true);
    try {
      // Build query
      let query = supabase
        .from('formulir_habit_tracker_keasramaan')
        .select('tanggal, tahun_ajaran');

      if (filters.cabang) query = query.eq('cabang', filters.cabang);
      if (filters.asrama) query = query.eq('asrama', filters.asrama);
      if (filters.musyrif) query = query.eq('musyrif', filters.musyrif);

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        // Get current and previous tahun ajaran
        const currentTA = tahunAjaran;
        const taIndex = tahunAjaranList.findIndex(ta => ta.value === currentTA);
        const previousTA = taIndex > 0 ? tahunAjaranList[taIndex - 1].value : null;

        // Filter data by tahun ajaran
        const currentData = data.filter(d => d.tahun_ajaran === currentTA);
        const previousData = previousTA ? data.filter(d => d.tahun_ajaran === previousTA) : [];

        // Group by month
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData: HabitStats[] = monthNames.map((month, index) => {
          const currentCount = currentData.filter(d => {
            const date = new Date(d.tanggal);
            return date.getMonth() === index;
          }).length;

          const previousCount = previousData.filter(d => {
            const date = new Date(d.tanggal);
            return date.getMonth() === index;
          }).length;

          return {
            month,
            currentPeriod: currentCount,
            previousPeriod: previousCount,
          };
        });

        setChartData(monthlyData);

        // Calculate totals
        const currentTotal = currentData.length;
        const previousTotal = previousData.length;
        setTotalCurrent(currentTotal);
        setTotalPrevious(previousTotal);

        // Calculate percentage change
        if (previousTotal > 0) {
          const change = ((currentTotal - previousTotal) / previousTotal) * 100;
          setPercentageChange(Math.round(change));
        } else {
          setPercentageChange(0);
        }
      }
    } catch (error) {
      console.error('Error fetching habit stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Statistik Input Habit Tracker</h2>
          <div className="flex items-center gap-2">
            {percentageChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({percentageChange >= 0 ? '+' : ''}{percentageChange}%) dari periode sebelumnya
            </span>
          </div>
        </div>

        {/* Tahun Ajaran Selector */}
        <select
          value={tahunAjaran}
          onChange={(e) => setTahunAjaran(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {tahunAjaranList.map((ta) => (
            <option key={ta.value} value={ta.value}>
              {ta.label}
            </option>
          ))}
        </select>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-8 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-sm text-gray-600">Periode Ini</span>
          <span className="text-2xl font-bold text-gray-800">{formatNumber(totalCurrent)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-sm text-gray-600">Periode Lalu</span>
          <span className="text-2xl font-bold text-gray-800">{formatNumber(totalPrevious)}</span>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="currentPeriod" 
              stroke="#10b981" 
              strokeWidth={2}
              fill="url(#colorCurrent)" 
              name="Periode Ini"
            />
            <Area 
              type="monotone" 
              dataKey="previousPeriod" 
              stroke="#f59e0b" 
              strokeWidth={2}
              fill="url(#colorPrevious)" 
              name="Periode Lalu"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
