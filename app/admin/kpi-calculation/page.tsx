'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Calculator, Play, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function KPICalculationPage() {
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // Form data
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  const handleBatchCalculation = async () => {
    // Check if data already exists for this period
    const periodeStr = `${tahun}-${bulan.toString().padStart(2, '0')}`;
    const monthName = new Date(tahun, bulan - 1).toLocaleString('id-ID', { month: 'long' });
    
    const confirmMessage = `Apakah Anda yakin ingin menghitung KPI untuk ${monthName} ${tahun}?\n\n` +
      `⚠️ Jika data sudah ada, akan di-UPDATE dengan perhitungan terbaru.\n\n` +
      `Klik OK untuk melanjutkan.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setCalculating(true);
      setError('');
      setResult(null);

      const response = await fetch('/api/kpi/calculate/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulan, tahun }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calculator className="w-6 h-6" />
          KPI Calculation Engine
        </h1>
        <p className="text-gray-600 mt-1">
          Hitung KPI untuk semua musyrif secara otomatis
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informasi</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Batch Calculation:</strong> Hitung KPI untuk semua musyrif di semua cabang</li>
          <li>• <strong>Periode:</strong> Pilih bulan dan tahun yang ingin dihitung</li>
          <li>• <strong>Otomatis:</strong> Sistem akan menghitung Tier 1, Tier 2, Tier 3, dan Ranking</li>
          <li>• <strong>Hasil:</strong> Disimpan ke database dan bisa dilihat di dashboard</li>
        </ul>
      </div>

      {/* Calculation Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Batch Calculation</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bulan
            </label>
            <select
              value={bulan}
              onChange={(e) => setBulan(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={calculating}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {new Date(2024, month - 1).toLocaleString('id-ID', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun
            </label>
            <select
              value={tahun}
              onChange={(e) => setTahun(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={calculating}
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleBatchCalculation}
          disabled={calculating}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
        >
          {calculating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Hitung KPI (Batch)
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800 text-lg">Calculation Complete!</p>
              <p className="text-sm text-green-700">KPI berhasil dihitung untuk semua musyrif</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600">Total Musyrif</p>
              <p className="text-2xl font-bold text-gray-800">{result.total}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600">Saved</p>
              <p className="text-2xl font-bold text-green-600">{result.saved}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{result.failed}</p>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Musyrif</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cabang</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asrama</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier 1</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier 2</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier 3</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {result.results.map((kpi: any) => (
                    <tr key={`${kpi.nama_musyrif}-${kpi.cabang}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          kpi.ranking === 1 ? 'bg-yellow-100 text-yellow-800' :
                          kpi.ranking === 2 ? 'bg-gray-100 text-gray-800' :
                          kpi.ranking === 3 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {kpi.ranking}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{kpi.nama_musyrif}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{kpi.cabang}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{kpi.asrama}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{kpi.tier1.total_tier1.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{kpi.tier2.total_tier2.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{kpi.tier3.total_tier3.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">{kpi.total_score.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">How It Works</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Hitung Hari Kerja Efektif</p>
              <p className="text-sm text-gray-600">Sistem menghitung total hari dalam bulan, dikurangi hari libur (rutin, cuti, sakit, izin)</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Calculate Tier 1 - Output (50%)</p>
              <p className="text-sm text-gray-600">Ubudiyah (25%), Akhlaq (10%), Kedisiplinan (10%), Kebersihan (5%)</p>
              <p className="text-xs text-gray-500 mt-1">Data source: Habit Tracker</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Calculate Tier 2 - Administrasi (30%)</p>
              <p className="text-sm text-gray-600">Jurnal (10%), Habit Tracker (10%), Koordinasi (5%), Catatan Perilaku (5%)</p>
              <p className="text-xs text-gray-500 mt-1">Data source: Jurnal, Habit Tracker, Rapat, Kolaborasi, Catatan</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-bold">4</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Calculate Tier 3 - Proses (20%)</p>
              <p className="text-sm text-gray-600">Completion Rate (10%), Kehadiran (5%), Engagement (5%)</p>
              <p className="text-xs text-gray-500 mt-1">Data source: Jurnal, Habit Tracker, Kolaborasi, Catatan</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-bold">5</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Calculate Ranking</p>
              <p className="text-sm text-gray-600">Ranking berdasarkan total score per cabang</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Save to Database</p>
              <p className="text-sm text-gray-600">Hasil disimpan ke tabel kpi_summary_keasramaan</p>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
