'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { TrendingUp, Award, Target, Calendar, AlertCircle, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';

interface KPISummary {
  nama_musyrif: string;
  cabang: string;
  asrama: string;
  periode: string;
  hari_kerja_efektif: number;
  tier1_ubudiyah: number;
  tier1_akhlaq: number;
  tier1_kedisiplinan: number;
  tier1_kebersihan: number;
  tier1_total: number;
  tier2_jurnal: number;
  tier2_habit_tracker: number;
  tier2_koordinasi: number;
  tier2_catatan_perilaku: number;
  tier2_total: number;
  tier2_koordinasi_kehadiran_rapat: number;
  tier2_koordinasi_responsiveness: number;
  tier2_koordinasi_inisiatif: number;
  tier3_completion_rate: number;
  tier3_kehadiran: number;
  tier3_engagement: number;
  tier3_total: number;
  total_score: number;
  ranking: number;
}

export default function DashboardMusyrifPage() {
  const params = useParams();
  const namaMusyrif = decodeURIComponent(params.nama as string);
  
  const [kpiData, setKpiData] = useState<KPISummary | null>(null);
  const [trendData, setTrendData] = useState<KPISummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriode, setSelectedPeriode] = useState('');

  useEffect(() => {
    // Set default periode (current month)
    const now = new Date();
    const defaultPeriode = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    setSelectedPeriode(defaultPeriode);
  }, []);

  useEffect(() => {
    if (selectedPeriode) {
      fetchKPIData();
      fetchTrendData();
    }
  }, [namaMusyrif, selectedPeriode]);

  const fetchKPIData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/kpi/summary?musyrif=${namaMusyrif}&periode=${selectedPeriode}`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        setKpiData(result.data[0]);
      } else {
        setKpiData(null);
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendData = async () => {
    try {
      // Fetch last 3 months
      const response = await fetch(`/api/kpi/summary?musyrif=${namaMusyrif}`);
      const result = await response.json();

      if (result.success && result.data) {
        // Sort by periode descending, take last 3
        const sorted = result.data.sort((a: KPISummary, b: KPISummary) => 
          b.periode.localeCompare(a.periode)
        ).slice(0, 3);
        setTrendData(sorted.reverse());
      }
    } catch (error) {
      console.error('Error fetching trend data:', error);
    }
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

  const getRankingBadge = (ranking: number) => {
    if (ranking === 1) return 'bg-yellow-100 text-yellow-800';
    if (ranking === 2) return 'bg-gray-100 text-gray-800';
    if (ranking === 3) return 'bg-orange-100 text-orange-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getImprovementAreas = () => {
    if (!kpiData) return [];
    
    const areas = [
      { name: 'Ubudiyah', score: kpiData.tier1_ubudiyah, target: 98 },
      { name: 'Akhlaq', score: kpiData.tier1_akhlaq, target: 95 },
      { name: 'Kedisiplinan', score: kpiData.tier1_kedisiplinan, target: 95 },
      { name: 'Kebersihan', score: kpiData.tier1_kebersihan, target: 95 },
      { name: 'Jurnal', score: kpiData.tier2_jurnal, target: 100 },
      { name: 'Habit Tracker', score: kpiData.tier2_habit_tracker, target: 100 },
      { name: 'Koordinasi', score: kpiData.tier2_koordinasi, target: 100 },
    ];

    return areas
      .filter(area => area.score < area.target)
      .sort((a, b) => (a.score - a.target) - (b.score - b.target))
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!kpiData) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800">Data KPI Tidak Ditemukan</p>
              <p className="text-sm text-yellow-700 mt-1">
                Belum ada data KPI untuk periode ini. Silakan hubungi admin untuk menghitung KPI.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{kpiData.nama_musyrif}</h1>
            <p className="text-blue-100">{kpiData.asrama} - {kpiData.cabang}</p>
            <p className="text-blue-200 text-sm mt-1">
              Periode: {new Date(kpiData.periode + '-01').toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold mb-2">{kpiData.total_score.toFixed(1)}</div>
            <div className="text-blue-100">Overall Score</div>
            <div className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full ${getRankingBadge(kpiData.ranking)}`}>
              <Award className="w-5 h-5" />
              <span className="font-bold">Rank #{kpiData.ranking}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hari Kerja Efektif */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Hari Kerja Efektif</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Hari</p>
            <p className="text-2xl font-bold text-gray-800">
              {new Date(kpiData.periode.split('-')[0], kpiData.periode.split('-')[1], 0).getDate()}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Hari Kerja Efektif</p>
            <p className="text-2xl font-bold text-green-600">{kpiData.hari_kerja_efektif}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Hari Libur</p>
            <p className="text-2xl font-bold text-orange-600">
              {new Date(kpiData.periode.split('-')[0], kpiData.periode.split('-')[1], 0).getDate() - kpiData.hari_kerja_efektif}
            </p>
          </div>
        </div>
      </div>


      {/* Tier Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1 */}
        <div className={`rounded-lg border-2 p-6 ${getScoreBg(kpiData.tier1_total)}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Tier 1: Output</h3>
            <span className="text-sm text-gray-600">50%</span>
          </div>
          <div className={`text-4xl font-bold mb-4 ${getScoreColor(kpiData.tier1_total)}`}>
            {kpiData.tier1_total.toFixed(1)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ubudiyah (25%)</span>
              <span className="font-medium">{kpiData.tier1_ubudiyah.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Akhlaq (10%)</span>
              <span className="font-medium">{kpiData.tier1_akhlaq.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Kedisiplinan (10%)</span>
              <span className="font-medium">{kpiData.tier1_kedisiplinan.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Kebersihan (5%)</span>
              <span className="font-medium">{kpiData.tier1_kebersihan.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Tier 2 */}
        <div className={`rounded-lg border-2 p-6 ${getScoreBg(kpiData.tier2_total)}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Tier 2: Administrasi</h3>
            <span className="text-sm text-gray-600">30%</span>
          </div>
          <div className={`text-4xl font-bold mb-4 ${getScoreColor(kpiData.tier2_total)}`}>
            {kpiData.tier2_total.toFixed(1)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Jurnal (10%)</span>
              <span className="font-medium">{kpiData.tier2_jurnal.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Habit Tracker (10%)</span>
              <span className="font-medium">{kpiData.tier2_habit_tracker.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Koordinasi (5%)</span>
              <span className="font-medium">{kpiData.tier2_koordinasi.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Catatan (5%)</span>
              <span className="font-medium">{kpiData.tier2_catatan_perilaku.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Tier 3 */}
        <div className={`rounded-lg border-2 p-6 ${getScoreBg(kpiData.tier3_total)}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Tier 3: Proses</h3>
            <span className="text-sm text-gray-600">20%</span>
          </div>
          <div className={`text-4xl font-bold mb-4 ${getScoreColor(kpiData.tier3_total)}`}>
            {kpiData.tier3_total.toFixed(1)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completion (10%)</span>
              <span className="font-medium">{kpiData.tier3_completion_rate.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Kehadiran (5%)</span>
              <span className="font-medium">{kpiData.tier3_kehadiran.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Engagement (5%)</span>
              <span className="font-medium">{kpiData.tier3_engagement.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Koordinasi Detail */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Detail Koordinasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Kehadiran Rapat (40%)</p>
            <p className="text-2xl font-bold text-gray-800">{kpiData.tier2_koordinasi_kehadiran_rapat.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Responsiveness (30%)</p>
            <p className="text-2xl font-bold text-gray-800">{kpiData.tier2_koordinasi_responsiveness.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Inisiatif Kolaborasi (30%)</p>
            <p className="text-2xl font-bold text-gray-800">{kpiData.tier2_koordinasi_inisiatif.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Trend 3 Bulan */}
      {trendData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Trend 3 Bulan Terakhir</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Periode</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tier 1</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tier 2</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tier 3</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {trendData.map((data, index) => (
                  <tr key={data.periode}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(data.periode + '-01').toLocaleString('id-ID', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-sm">{data.tier1_total.toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm">{data.tier2_total.toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm">{data.tier3_total.toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm font-bold">{data.total_score.toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRankingBadge(data.ranking)}`}>
                        #{data.ranking}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Area Improvement */}
      {getImprovementAreas().length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Area yang Perlu Ditingkatkan</h2>
          </div>
          <div className="space-y-3">
            {getImprovementAreas().map((area, index) => (
              <div key={area.name} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-gray-800">{area.name}</p>
                  <p className="text-sm text-gray-600">
                    Current: {area.score.toFixed(1)}% | Target: {area.target}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-600 font-medium">
                    Gap: {(area.target - area.score).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rekomendasi */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-800 mb-2">Rekomendasi Aksi</h3>
            <ul className="text-sm text-green-700 space-y-1">
              {kpiData.tier2_jurnal < 100 && (
                <li>• Tingkatkan konsistensi pengisian jurnal harian</li>
              )}
              {kpiData.tier2_habit_tracker < 100 && (
                <li>• Pastikan habit tracker diisi setiap hari</li>
              )}
              {kpiData.tier2_koordinasi_kehadiran_rapat < 90 && (
                <li>• Tingkatkan kehadiran di rapat koordinasi</li>
              )}
              {kpiData.tier2_koordinasi_inisiatif < 80 && (
                <li>• Lebih aktif dalam kolaborasi dengan musyrif lain</li>
              )}
              {kpiData.tier1_ubudiyah < 98 && (
                <li>• Fokus pada peningkatan ubudiyah santri (target 98%)</li>
              )}
            </ul>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
