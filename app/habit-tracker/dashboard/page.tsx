'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import HabitTrackerStats from '@/components/HabitTrackerStats';
import { TrendingUp, Filter as FilterIcon } from 'lucide-react';

export default function DashboardHabitTrackerPage() {
  const [filters, setFilters] = useState({
    tahun_ajaran: '',
    semester: '',
    cabang: '',
    asrama: '',
    musyrif: '',
  });

  const [masterData, setMasterData] = useState({
    tahunAjaranList: [] as string[],
    semesterList: [] as string[],
    cabangList: [] as string[],
    asramaList: [] as string[],
    musyrifList: [] as string[],
  });

  const [allHabitData, setAllHabitData] = useState<any[]>([]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  // Hitung filtered musyrif list secara real-time menggunakan useMemo
  const filteredMusyrifList = useMemo(() => {
    if (allHabitData.length === 0) {
      console.log('No habit data yet');
      return [];
    }

    console.log('=== FILTERING MUSYRIF ===');
    console.log('Current filters:', { cabang: filters.cabang, asrama: filters.asrama });
    console.log('Total habit data:', allHabitData.length);

    if (filters.cabang || filters.asrama) {
      const filtered = allHabitData.filter(d => {
        const matchCabang = !filters.cabang || d.cabang === filters.cabang;
        const matchAsrama = !filters.asrama || d.asrama === filters.asrama;
        return matchCabang && matchAsrama && d.musyrif;
      });
      
      console.log('Filtered data count:', filtered.length);
      console.log('Sample filtered data:', filtered.slice(0, 3));
      
      const uniqueMusyrif = [...new Set(filtered.map(d => d.musyrif).filter(Boolean))] as string[];
      console.log('Unique musyrif after filter:', uniqueMusyrif);
      
      return uniqueMusyrif;
    } else {
      const allMusyrif = [...new Set(allHabitData.map(d => d.musyrif).filter(Boolean))] as string[];
      console.log('No filter applied, all musyrif count:', allMusyrif.length);
      return allMusyrif;
    }
  }, [filters.cabang, filters.asrama, allHabitData]);

  const fetchMasterData = async () => {
    const { data: habitData } = await supabase
      .from('formulir_habit_tracker_keasramaan')
      .select('tahun_ajaran, semester, cabang, asrama, musyrif');

    if (habitData) {
      setAllHabitData(habitData);
      
      const uniqueTahunAjaran = [...new Set(habitData.map(d => d.tahun_ajaran).filter(Boolean))];
      const uniqueSemester = [...new Set(habitData.map(d => d.semester).filter(Boolean))];
      const uniqueCabang = [...new Set(habitData.map(d => d.cabang).filter(Boolean))];
      const uniqueAsrama = [...new Set(habitData.map(d => d.asrama).filter(Boolean))];
      const uniqueMusyrif = [...new Set(habitData.map(d => d.musyrif).filter(Boolean))];

      setMasterData({
        tahunAjaranList: uniqueTahunAjaran as string[],
        semesterList: uniqueSemester as string[],
        cabangList: uniqueCabang as string[],
        asramaList: uniqueAsrama as string[],
        musyrifList: uniqueMusyrif as string[],
      });

      // Set default tahun ajaran
      if (uniqueTahunAjaran.length > 0) {
        setFilters(prev => ({ ...prev, tahun_ajaran: uniqueTahunAjaran[uniqueTahunAjaran.length - 1] as string }));
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
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

          {/* Filter Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FilterIcon className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Filter Data</h2>
            </div>
            
            {/* DEBUG BUTTON */}
            <button 
              onClick={() => {
                console.log('=== MANUAL DEBUG ===');
                console.log('Current filters:', filters);
                console.log('allHabitData length:', allHabitData.length);
                console.log('filteredMusyrifList:', filteredMusyrifList);
                console.log('Sample allHabitData:', allHabitData.slice(0, 5));
                
                // Test filter manually
                const testFiltered = allHabitData.filter(d => {
                  console.log('Testing:', { cabang: d.cabang, asrama: d.asrama, musyrif: d.musyrif });
                  return d.cabang === filters.cabang && d.asrama === filters.asrama;
                });
                console.log('Manual filter result:', testFiltered.length, 'records');
                console.log('Musyrif from manual filter:', [...new Set(testFiltered.map(d => d.musyrif))]);
              }}
              className="mb-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
            >
              🐛 DEBUG FILTER
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tahun Ajaran</label>
                <select
                  value={filters.tahun_ajaran}
                  onChange={(e) => setFilters({ ...filters, tahun_ajaran: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua</option>
                  {masterData.tahunAjaranList.map((ta) => (
                    <option key={ta} value={ta}>{ta}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                <select
                  value={filters.semester}
                  onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua</option>
                  {masterData.semesterList.map((sem) => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cabang</label>
                <select
                  value={filters.cabang}
                  onChange={(e) => setFilters({ ...filters, cabang: e.target.value, asrama: '', musyrif: '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua</option>
                  {masterData.cabangList.map((cab) => (
                    <option key={cab} value={cab}>{cab}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asrama</label>
                <select
                  value={filters.asrama}
                  onChange={(e) => setFilters({ ...filters, asrama: e.target.value, musyrif: '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  disabled={!filters.cabang}
                >
                  <option value="">{!filters.cabang ? 'Pilih Cabang Dulu' : 'Semua'}</option>
                  {masterData.asramaList
                    .filter(asr => !filters.cabang || asr.includes(filters.cabang))
                    .map((asr) => (
                      <option key={asr} value={asr}>{asr}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Musyrif/ah</label>
                <select
                  value={filters.musyrif}
                  onChange={(e) => setFilters({ ...filters, musyrif: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Musyrif/ah</option>
                  {filteredMusyrifList.map((mus) => (
                    <option key={mus} value={mus}>{mus}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* HabitTrackerStats Component */}
          <HabitTrackerStats filters={filters} />
        </div>
      </main>
    </div>
  );
}
