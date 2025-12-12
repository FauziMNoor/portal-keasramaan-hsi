'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { BarChart3, TrendingUp, Award, Building2, Download } from 'lucide-react';
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

interface CabangStats {
  cabang: string;
  total_musyrif: number;
  avg_score: number;
  avg_tier1: number;
  avg_tier2: number;
  avg_tier3: number;
  top_musyrif: string;
  top_score: number;
}

export default function DashboardKepalaSekolahPage() {
  const [kpiList, setKpiList] = useState<KPISummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriode, setSelectedPeriode] = useState('');

  useEffect(() => {
    const now = new Date();
    const defaultPeriode = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    setSelectedPeriode(defaultPeriode);
  }, []);

  useEffect(() => {
    if (selectedPeriode) {
      fetchKPIData();
    }
  }, [selectedPeriode]);

  const fetchKPIData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/kpi/summary?periode=${selectedPeriode}`);
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

  const getCabangStats = (): CabangStats[] => {
    // Get unique cabang from kpiList
    const uniqueCabang = [...new Set(kpiList.map(kpi => kpi.cabang))];
    return uniqueCabang.map(cabang => {
      const cabangData = kpiList.filter(kpi => kpi.cabang === cabang);
      if (cabangData.length === 0) {
        return {
          cabang,
          total_musyrif: 0,
          avg_score: 0,
          avg_tier1: 0,
          avg_tier2: 0,
          avg_tier3: 0,
          top_musyrif: '-',
          top_score: 0,
        };
      }

      const avgScore = cabangData.reduce((sum, kpi) => sum + kpi.total_score, 0) / cabangData.length;
      const avgTier1 = cabangData.reduce((sum, kpi) => sum + kpi.tier1_total, 0) / cabangData.length;
      const avgTier2 = cabangData.reduce((sum, kpi) => sum + kpi.tier2_total, 0) / cabangData.length;
      const avgTier3 = cabangData.reduce((sum, kpi) => sum + kpi.tier3_total, 0) / cabangData.length;
      const topMusyrif = cabangData.reduce((prev, current) => 
        current.total_score > prev.total_score ? current : prev
      );

      return {
        cabang,
        total_musyrif: cabangData.length,
        avg_score: avgScore,
        avg_tier1: avgTier1,
        avg_tier2: avgTier2,
        avg_tier3: avgTier3,
        top_musyrif: topMusyrif.nama_musyrif,
        top_score: topMusyrif.total_score,
      };
    });
  };

  const getTopGlobal = () => {
    return [...kpiList].sort((a, b) => b.total_score - a.total_score).slice(0, 5);
  };

  const getNeedAttentionGlobal = () => {
    return [...kpiList].filter(kpi => kpi.total_score < 75).sort((a, b) => a.total_score - b.total_score).slice(0, 5);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 75) return 'bg-blue-50 border-blue-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Kepala Sekolah</h1>
            <p className="text-indigo-100">Overview KPI Global - Semua Cabang</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Periode Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
          <input
            type="month"
            value={selectedPeriode}
            onChange={(e) => setSelectedPeriode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <>
          {/* Performa per Cabang */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Performa per Cabang</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getCabangStats().map((stats) => (
                <div key={stats.cabang} className={`rounded-lg border-2 p-6 ${getScoreBg(stats.avg_score)}`}>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{stats.cabang}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Musyrif</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.total_musyrif}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rata-rata Score</p>
                      <p className={`text-2xl font-bold ${getScoreColor(stats.avg_score)}`}>
                        {stats.avg_score.toFixed(1)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tier 1 (Output)</span>
                      <span className="font-medium">{stats.avg_tier1.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tier 2 (Administrasi)</span>
                      <span className="font-medium">{stats.avg_tier2.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tier 3 (Proses)</span>
                      <span className="font-medium">{stats.avg_tier3.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Top Performer</p>
                    <p className="font-semibold text-gray-800">{stats.top_musyrif}</p>
                    <p className="text-sm text-green-600 font-medium">{stats.top_score.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Top 5 Musyrif Global */}
          {getTopGlobal().length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Top 5 Musyrif (Global)</h2>
              </div>
              <div className="space-y-3">
                {getTopGlobal().map((kpi, index) => (
                  <Link
                    key={`${kpi.nama_musyrif}-${kpi.cabang}`}
                    href={`/kpi/musyrif/${encodeURIComponent(kpi.nama_musyrif)}`}
                    className="block p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200 hover:border-green-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{kpi.nama_musyrif}</p>
                          <p className="text-sm text-gray-600">{kpi.asrama} - {kpi.cabang}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600">{kpi.total_score.toFixed(1)}</p>
                        <div className="flex gap-2 text-xs text-gray-600 mt-1">
                          <span>T1: {kpi.tier1_total.toFixed(1)}</span>
                          <span>T2: {kpi.tier2_total.toFixed(1)}</span>
                          <span>T3: {kpi.tier3_total.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Musyrif Perlu Perhatian Global */}
          {getNeedAttentionGlobal().length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                <h2 className="text-lg font-semibold text-gray-800">Musyrif Perlu Perhatian (Global)</h2>
              </div>
              <div className="space-y-3">
                {getNeedAttentionGlobal().map((kpi) => (
                  <Link
                    key={`${kpi.nama_musyrif}-${kpi.cabang}`}
                    href={`/kpi/musyrif/${encodeURIComponent(kpi.nama_musyrif)}`}
                    className="block p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{kpi.nama_musyrif}</p>
                        <p className="text-sm text-gray-600">{kpi.asrama} - {kpi.cabang}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-yellow-600">{kpi.total_score.toFixed(1)}</p>
                        <div className="flex gap-2 text-xs text-gray-600 mt-1">
                          <span>T1: {kpi.tier1_total.toFixed(1)}</span>
                          <span>T2: {kpi.tier2_total.toFixed(1)}</span>
                          <span>T3: {kpi.tier3_total.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Comparison Antar Cabang */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Comparison Antar Cabang</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Cabang</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Total Musyrif</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Avg Tier 1</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Avg Tier 2</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Avg Tier 3</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Avg Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Top Performer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getCabangStats().map((stats) => (
                    <tr key={stats.cabang} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{stats.cabang}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{stats.total_musyrif}</td>
                      <td className="px-4 py-3 text-sm">{stats.avg_tier1.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm">{stats.avg_tier2.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm">{stats.avg_tier3.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-bold ${getScoreColor(stats.avg_score)}`}>
                          {stats.avg_score.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium text-gray-800">{stats.top_musyrif}</p>
                          <p className="text-xs text-green-600">{stats.top_score.toFixed(1)}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Summary Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Musyrif (Semua Cabang)</p>
                <p className="text-2xl font-bold text-gray-800">{kpiList.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Rata-rata Global</p>
                <p className={`text-2xl font-bold ${getScoreColor(
                  kpiList.reduce((sum, kpi) => sum + kpi.total_score, 0) / (kpiList.length || 1)
                )}`}>
                  {(kpiList.reduce((sum, kpi) => sum + kpi.total_score, 0) / (kpiList.length || 1)).toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Highest Score</p>
                <p className="text-2xl font-bold text-green-600">
                  {kpiList.length > 0 ? Math.max(...kpiList.map(kpi => kpi.total_score)).toFixed(1) : '0'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Lowest Score</p>
                <p className="text-2xl font-bold text-red-600">
                  {kpiList.length > 0 ? Math.min(...kpiList.map(kpi => kpi.total_score)).toFixed(1) : '0'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      </main>
    </div>
  );
}
