'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Users, TrendingUp, Award, AlertTriangle, Download } from 'lucide-react';
import Link from 'next/link';

interface KPISummary {
  nama_musyrif: string;
  cabang: string;
  asrama: string;
  periode: string;
  tier1_total: number;
  tier2_total: number;
  tier3_total: number;
  total_score: number;
  ranking: number;
}

export default function DashboardKepalaAsramaPage() {
  const [kpiList, setKpiList] = useState<KPISummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [cabangList, setCabangList] = useState<string[]>([]);
  const [selectedCabang, setSelectedCabang] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('');

  useEffect(() => {
    const now = new Date();
    const defaultPeriode = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    setSelectedPeriode(defaultPeriode);
    fetchCabangList();
  }, []);

  useEffect(() => {
    if (selectedPeriode && selectedCabang) {
      fetchKPIData();
    }
  }, [selectedCabang, selectedPeriode]);

  const fetchCabangList = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase
        .from('cabang_keasramaan')
        .select('nama_cabang')
        .order('nama_cabang');
      
      if (data && data.length > 0) {
        const cabangNames = data.map(c => c.nama_cabang);
        setCabangList(cabangNames);
        if (!selectedCabang) {
          setSelectedCabang(cabangNames[0]); // Set default to first cabang
        }
      }
    } catch (error) {
      console.error('Error fetching cabang:', error);
    }
  };

  const fetchKPIData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/kpi/summary?cabang=${selectedCabang}&periode=${selectedPeriode}`);
      const result = await response.json();

      if (result.success) {
        setKpiList(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAverageScore = () => {
    if (kpiList.length === 0) return 0;
    const sum = kpiList.reduce((acc, kpi) => acc + kpi.total_score, 0);
    return sum / kpiList.length;
  };

  const getAverageTier1 = () => {
    if (kpiList.length === 0) return 0;
    const sum = kpiList.reduce((acc, kpi) => acc + kpi.tier1_total, 0);
    return sum / kpiList.length;
  };

  const getAverageTier2 = () => {
    if (kpiList.length === 0) return 0;
    const sum = kpiList.reduce((acc, kpi) => acc + kpi.tier2_total, 0);
    return sum / kpiList.length;
  };

  const getAverageTier3 = () => {
    if (kpiList.length === 0) return 0;
    const sum = kpiList.reduce((acc, kpi) => acc + kpi.tier3_total, 0);
    return sum / kpiList.length;
  };

  const getTopPerformers = () => {
    return [...kpiList].sort((a, b) => b.total_score - a.total_score).slice(0, 3);
  };

  const getNeedAttention = () => {
    return [...kpiList].filter(kpi => kpi.total_score < 75).sort((a, b) => a.total_score - b.total_score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankingBadge = (ranking: number) => {
    if (ranking === 1) return 'bg-yellow-100 text-yellow-800';
    if (ranking === 2) return 'bg-gray-100 text-gray-800';
    if (ranking === 3) return 'bg-orange-100 text-orange-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Kepala Asrama</h1>
            <p className="text-purple-100">Monitoring KPI Tim Musyrif</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cabang</label>
            <select
              value={selectedCabang}
              onChange={(e) => setSelectedCabang(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {cabangList.map((cabang) => (
                <option key={cabang} value={cabang}>{cabang}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
            <input
              type="month"
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>


      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-600">Total Musyrif</p>
              </div>
              <p className="text-3xl font-bold text-gray-800">{kpiList.length}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Rata-rata Tier 1</p>
              <p className={`text-3xl font-bold ${getScoreColor(getAverageTier1())}`}>
                {getAverageTier1().toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Output (50%)</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Rata-rata Tier 2</p>
              <p className={`text-3xl font-bold ${getScoreColor(getAverageTier2())}`}>
                {getAverageTier2().toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Administrasi (30%)</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Rata-rata Total</p>
              <p className={`text-3xl font-bold ${getScoreColor(getAverageScore())}`}>
                {getAverageScore().toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Overall Score</p>
            </div>
          </div>

          {/* Top Performers */}
          {getTopPerformers().length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Top Performers</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getTopPerformers().map((kpi, index) => (
                  <Link
                    key={kpi.nama_musyrif}
                    href={`/kpi/musyrif/${encodeURIComponent(kpi.nama_musyrif)}`}
                    className="block p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 hover:border-green-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{kpi.nama_musyrif}</p>
                        <p className="text-sm text-gray-600">{kpi.asrama}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getRankingBadge(kpi.ranking)}`}>
                        #{kpi.ranking}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {kpi.total_score.toFixed(1)}
                    </div>
                    <div className="flex gap-2 text-xs text-gray-600">
                      <span>T1: {kpi.tier1_total.toFixed(1)}</span>
                      <span>T2: {kpi.tier2_total.toFixed(1)}</span>
                      <span>T3: {kpi.tier3_total.toFixed(1)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Need Attention */}
          {getNeedAttention().length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h2 className="text-lg font-semibold text-gray-800">Musyrif Perlu Perhatian</h2>
              </div>
              <div className="space-y-3">
                {getNeedAttention().map((kpi) => (
                  <Link
                    key={kpi.nama_musyrif}
                    href={`/kpi/musyrif/${encodeURIComponent(kpi.nama_musyrif)}`}
                    className="block p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{kpi.nama_musyrif}</p>
                        <p className="text-sm text-gray-600">{kpi.asrama}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-yellow-600">{kpi.total_score.toFixed(1)}</p>
                        <p className="text-xs text-gray-500">Rank #{kpi.ranking}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-4 text-sm text-gray-600">
                      <span>Tier 1: {kpi.tier1_total.toFixed(1)}</span>
                      <span>Tier 2: {kpi.tier2_total.toFixed(1)}</span>
                      <span>Tier 3: {kpi.tier3_total.toFixed(1)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All Musyrif Ranking */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Ranking Musyrif</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Musyrif</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Asrama</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tier 1</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tier 2</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tier 3</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {kpiList.map((kpi) => (
                    <tr key={kpi.nama_musyrif} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${getRankingBadge(kpi.ranking)}`}>
                          {kpi.ranking}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{kpi.nama_musyrif}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{kpi.asrama}</td>
                      <td className="px-4 py-3 text-sm">{kpi.tier1_total.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm">{kpi.tier2_total.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm">{kpi.tier3_total.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-bold ${getScoreColor(kpi.total_score)}`}>
                          {kpi.total_score.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Link
                          href={`/kpi/musyrif/${encodeURIComponent(kpi.nama_musyrif)}`}
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      </main>
    </div>
  );
}
