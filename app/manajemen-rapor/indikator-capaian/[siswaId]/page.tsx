'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, TrendingUp, FileText } from 'lucide-react';

interface Siswa {
  id: string;
  nama_siswa: string;
  nis: string;
  kelas: string;
  asrama: string;
}

interface CapaianHistory {
  tahun_ajaran: string;
  semester: string;
  capaian: CapaianItem[];
}

interface CapaianItem {
  id: string;
  nilai: string;
  deskripsi: string;
  rapor_indikator_keasramaan: {
    id: string;
    nama_indikator: string;
    deskripsi: string;
    urutan: number;
    rapor_kategori_indikator_keasramaan: {
      id: string;
      nama_kategori: string;
      urutan: number;
    };
  };
}

export default function CapaianHistoryPage({ params }: { params: Promise<{ siswaId: string }> }) {
  const resolvedParams = use(params);
  const siswaId = resolvedParams.siswaId;
  
  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [history, setHistory] = useState<CapaianHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriode, setSelectedPeriode] = useState<string>('');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparePeriode, setComparePeriode] = useState<string>('');

  useEffect(() => {
    fetchSiswa();
    fetchHistory();
  }, [siswaId]);

  const fetchSiswa = async () => {
    try {
      const response = await fetch(`/api/siswa?search=${siswaId}`);
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        const foundSiswa = result.data.find((s: Siswa) => s.nis === siswaId);
        if (foundSiswa) {
          setSiswa(foundSiswa);
        }
      }
    } catch (error) {
      console.error('Error fetching siswa:', error);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/rapor/indikator/capaian/history?siswa_nis=${siswaId}`);
      const result = await response.json();

      if (result.success) {
        setHistory(result.data);
        if (result.data.length > 0) {
          setSelectedPeriode(`${result.data[0].tahun_ajaran}-${result.data[0].semester}`);
        }
      } else {
        alert('Gagal memuat history capaian');
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      alert('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedPeriodeData = () => {
    if (!selectedPeriode) return null;
    const [tahun, semester] = selectedPeriode.split('-');
    return history.find(h => h.tahun_ajaran === tahun && h.semester === semester);
  };

  const getComparePeriodeData = () => {
    if (!comparePeriode) return null;
    const [tahun, semester] = comparePeriode.split('-');
    return history.find(h => h.tahun_ajaran === tahun && h.semester === semester);
  };

  const groupByKategori = (capaian: CapaianItem[]) => {
    const grouped: Record<string, { kategori: any; items: CapaianItem[] }> = {};
    
    capaian.forEach(item => {
      const kategori = item.rapor_indikator_keasramaan.rapor_kategori_indikator_keasramaan;
      if (!grouped[kategori.id]) {
        grouped[kategori.id] = {
          kategori,
          items: [],
        };
      }
      grouped[kategori.id].items.push(item);
    });

    // Sort by kategori urutan
    return Object.values(grouped).sort((a, b) => a.kategori.urutan - b.kategori.urutan);
  };

  const getNilaiColor = (nilai: string) => {
    switch (nilai) {
      case 'A': return 'bg-green-100 text-green-800 border-green-300';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'D': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const selectedData = getSelectedPeriodeData();
  const compareData = getComparePeriodeData();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/manajemen-rapor/indikator-capaian"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Indikator & Capaian
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">History Capaian Siswa</h1>
        {siswa && (
          <div className="flex items-center gap-4 text-gray-600">
            <p className="text-lg">
              <span className="font-semibold">{siswa.nama_siswa}</span> • NIS: {siswa.nis}
            </p>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {siswa.kelas}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {siswa.asrama}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center w-full md:w-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Periode
                </label>
                <select
                  value={selectedPeriode}
                  onChange={(e) => setSelectedPeriode(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {history.map((h) => (
                    <option key={`${h.tahun_ajaran}-${h.semester}`} value={`${h.tahun_ajaran}-${h.semester}`}>
                      {h.tahun_ajaran} - {h.semester}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="comparisonMode"
                  checked={comparisonMode}
                  onChange={(e) => setComparisonMode(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="comparisonMode" className="text-sm font-medium text-gray-700">
                  Mode Perbandingan
                </label>
              </div>

              {comparisonMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bandingkan dengan
                  </label>
                  <select
                    value={comparePeriode}
                    onChange={(e) => setComparePeriode(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih Periode</option>
                    {history
                      .filter(h => `${h.tahun_ajaran}-${h.semester}` !== selectedPeriode)
                      .map((h) => (
                        <option key={`${h.tahun_ajaran}-${h.semester}`} value={`${h.tahun_ajaran}-${h.semester}`}>
                          {h.tahun_ajaran} - {h.semester}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum Ada History Capaian</h3>
          <p className="text-gray-600 mb-4">Siswa ini belum memiliki data capaian yang tersimpan</p>
          <Link
            href="/manajemen-rapor/indikator-capaian/input-capaian"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Input Capaian Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Single View */}
          {!comparisonMode && selectedData && (
            <div>
                {groupByKategori(selectedData.capaian).map(({ kategori, items }) => (
                  <div key={kategori.id} className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                    <div className="bg-blue-600 text-white px-6 py-4">
                      <h2 className="text-xl font-semibold">{kategori.nama_kategori}</h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">
                                  {item.rapor_indikator_keasramaan.nama_indikator}
                                </h3>
                                {item.rapor_indikator_keasramaan.deskripsi && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {item.rapor_indikator_keasramaan.deskripsi}
                                  </p>
                                )}
                              </div>
                              <span className={`px-4 py-1 rounded-full text-sm font-semibold border ${getNilaiColor(item.nilai)}`}>
                                {item.nilai || '-'}
                              </span>
                            </div>
                            {item.deskripsi && (
                              <p className="text-sm text-gray-700 mt-2 pl-4 border-l-2 border-blue-300">
                                {item.deskripsi}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          )}

          {/* Comparison View */}
          {comparisonMode && selectedData && compareData && (
            <div>
                {groupByKategori(selectedData.capaian).map(({ kategori, items }) => {
                  const compareItems = compareData.capaian.filter(
                    c => c.rapor_indikator_keasramaan.rapor_kategori_indikator_keasramaan.id === kategori.id
                  );

                  return (
                    <div key={kategori.id} className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                      <div className="bg-blue-600 text-white px-6 py-4">
                        <h2 className="text-xl font-semibold">{kategori.nama_kategori}</h2>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {items.map((item) => {
                            const compareItem = compareItems.find(
                              c => c.rapor_indikator_keasramaan.id === item.rapor_indikator_keasramaan.id
                            );

                            return (
                              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">
                                  {item.rapor_indikator_keasramaan.nama_indikator}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Current Period */}
                                  <div className="border-l-4 border-blue-500 pl-4">
                                    <p className="text-sm font-medium text-gray-600 mb-2">
                                      {selectedData.tahun_ajaran} - {selectedData.semester}
                                    </p>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getNilaiColor(item.nilai)}`}>
                                        {item.nilai || '-'}
                                      </span>
                                    </div>
                                    {item.deskripsi && (
                                      <p className="text-sm text-gray-700">{item.deskripsi}</p>
                                    )}
                                  </div>

                                  {/* Compare Period */}
                                  <div className="border-l-4 border-purple-500 pl-4">
                                    <p className="text-sm font-medium text-gray-600 mb-2">
                                      {compareData.tahun_ajaran} - {compareData.semester}
                                    </p>
                                    {compareItem ? (
                                      <>
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getNilaiColor(compareItem.nilai)}`}>
                                            {compareItem.nilai || '-'}
                                          </span>
                                          {item.nilai && compareItem.nilai && item.nilai !== compareItem.nilai && (
                                            <TrendingUp className={`w-4 h-4 ${
                                              item.nilai < compareItem.nilai ? 'text-red-500' : 'text-green-500'
                                            }`} />
                                          )}
                                        </div>
                                        {compareItem.deskripsi && (
                                          <p className="text-sm text-gray-700">{compareItem.deskripsi}</p>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-sm text-gray-500 italic">Belum ada data</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
          )}

          {comparisonMode && (!selectedData || !compareData) && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Pilih Periode untuk Dibandingkan</h3>
              <p className="text-gray-600">Silakan pilih dua periode untuk melihat perbandingan capaian</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
