'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { FileText, Eye, Download, Loader2, CheckCircle, AlertCircle, FileDown } from 'lucide-react';
import GoogleOAuthButton from '@/components/GoogleOAuthButton';
import LeggerTable from '@/components/rapor/LeggerTable';
import PreviewModal from '@/components/rapor/PreviewModal';
import DetailModal from '@/components/rapor/DetailModal';

interface LeggerData {
  nis: string;
  nama_siswa: string;
  foto_url: string;
  kelas: string;
  asrama: string;
  status: 'ready' | 'incomplete' | 'error';
  statusDetails: {
    santri: boolean;
    habit: boolean;
    kegiatan: number; // 0-6
    catatan: boolean;
  };
  pdfUrl?: string;
  drivePdfUrl?: string; // Google Drive PDF link
  generating?: boolean;
}

export default function LeggerRaporPage() {
  // Filter states
  const [allCabangList, setAllCabangList] = useState<string[]>([]);
  const [allTahunAjaranList, setAllTahunAjaranList] = useState<string[]>([]);
  const [allSemesterList, setAllSemesterList] = useState<string[]>([]);
  const [allKelasList, setAllKelasList] = useState<string[]>([]);
  const [allAsramaList, setAllAsramaList] = useState<any[]>([]);
  const [filteredKelasList, setFilteredKelasList] = useState<string[]>([]);
  const [filteredAsramaList, setFilteredAsramaList] = useState<string[]>([]);

  const [selectedCabang, setSelectedCabang] = useState('');
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedAsrama, setSelectedAsrama] = useState('');

  // Legger data
  const [leggerData, setLeggerData] = useState<LeggerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  // Modal states
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedNis, setSelectedNis] = useState('');

  // Fetch filter options on mount
  useEffect(() => {
    fetchAllFilterOptions();
  }, []);

  // Filter cascading
  useEffect(() => {
    if (selectedCabang && allAsramaList.length > 0) {
      const asramaByCabang = allAsramaList.filter(a => a.lokasi === selectedCabang);
      const kelasFromAsrama = [...new Set(asramaByCabang.map(a => a.kelas).filter(k => k))];
      setFilteredKelasList(kelasFromAsrama);

      if (selectedKelas && !kelasFromAsrama.includes(selectedKelas)) {
        setSelectedKelas('');
        setSelectedAsrama('');
      }
    } else {
      setFilteredKelasList([]);
      if (selectedCabang) {
        setSelectedKelas('');
        setSelectedAsrama('');
      }
    }
  }, [selectedCabang, allAsramaList, selectedKelas]);

  useEffect(() => {
    if (selectedCabang && selectedKelas) {
      const filtered = allAsramaList.filter(
        a => a.lokasi === selectedCabang && a.kelas === selectedKelas
      );
      setFilteredAsramaList(filtered.map(a => a.asrama));

      if (selectedAsrama && !filtered.find(a => a.asrama === selectedAsrama)) {
        setSelectedAsrama('');
      }
    } else {
      setFilteredAsramaList([]);
      setSelectedAsrama('');
    }
  }, [selectedCabang, selectedKelas, allAsramaList]);

  // Fetch legger data when all filters selected
  useEffect(() => {
    if (selectedCabang && selectedTahunAjaran && selectedSemester && selectedKelas && selectedAsrama) {
      fetchLeggerData();
    } else {
      setLeggerData([]);
    }
  }, [selectedCabang, selectedTahunAjaran, selectedSemester, selectedKelas, selectedAsrama]);

  const fetchAllFilterOptions = async () => {
    try {
      const { data: cabangData } = await supabase
        .from('cabang_keasramaan')
        .select('nama_cabang')
        .order('nama_cabang');
      setAllCabangList(cabangData?.map((item) => item.nama_cabang) || []);

      const { data: tahunData } = await supabase
        .from('tahun_ajaran_keasramaan')
        .select('tahun_ajaran')
        .eq('status', 'aktif')
        .order('tahun_ajaran', { ascending: false });
      setAllTahunAjaranList(tahunData?.map((item) => item.tahun_ajaran) || []);

      const { data: semesterData } = await supabase
        .from('semester_keasramaan')
        .select('semester')
        .eq('status', 'aktif')
        .order('angka');
      setAllSemesterList(semesterData?.map((item) => item.semester) || []);

      const { data: kelasData } = await supabase
        .from('kelas_keasramaan')
        .select('nama_kelas')
        .eq('status', 'aktif')
        .order('nama_kelas');
      setAllKelasList(kelasData?.map((item) => item.nama_kelas) || []);

      const { data: siswaData } = await supabase
        .from('data_siswa_keasramaan')
        .select('asrama, cabang, kelas');

      const asramaMap = new Map();
      siswaData?.forEach(d => {
        if (d.asrama && d.cabang && d.kelas) {
          const key = `${d.asrama}-${d.cabang}-${d.kelas}`;
          if (!asramaMap.has(key)) {
            asramaMap.set(key, {
              asrama: d.asrama,
              lokasi: d.cabang,
              kelas: d.kelas
            });
          }
        }
      });
      setAllAsramaList(Array.from(asramaMap.values()));
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchLeggerData = async () => {
    setLoading(true);
    try {
      // Fetch all santri in this kelas/asrama
      const { data: santriList, error: santriError } = await supabase
        .from('data_siswa_keasramaan')
        .select('nis, nama_siswa, foto, kelas, asrama')
        .eq('cabang', selectedCabang)
        .eq('kelas', selectedKelas)
        .eq('asrama', selectedAsrama)
        .order('nama_siswa');

      if (santriError) throw santriError;

      if (!santriList || santriList.length === 0) {
        setLeggerData([]);
        return;
      }

      // For each santri, check data completeness
      const leggerPromises = santriList.map(async (santri) => {
        const statusDetails = await checkDataCompleteness(santri.nis);
        
        // Determine overall status
        let status: 'ready' | 'incomplete' | 'error' = 'ready';
        if (!statusDetails.santri) {
          status = 'error';
        } else if (!statusDetails.habit || statusDetails.kegiatan < 6 || !statusDetails.catatan) {
          status = 'incomplete';
        }

        // Check if PDF already generated
        const { data: logData, error: logError } = await supabase
          .from('rapor_generate_log_keasramaan')
          .select('pdf_url, status, drive_pdf_url')
          .eq('nis', santri.nis)
          .eq('tahun_ajaran', selectedTahunAjaran)
          .eq('semester', selectedSemester)
          .eq('status', 'success')
          .order('generated_at', { ascending: false })
          .limit(1)
          .maybeSingle(); // Use maybeSingle() instead of single() to handle no data gracefully

        return {
          nis: santri.nis,
          nama_siswa: santri.nama_siswa,
          foto_url: santri.foto || '',
          kelas: santri.kelas,
          asrama: santri.asrama,
          status,
          statusDetails,
          pdfUrl: logData?.pdf_url,
          drivePdfUrl: logData?.drive_pdf_url,
          generating: false,
        };
      });

      const leggerResults = await Promise.all(leggerPromises);
      setLeggerData(leggerResults);
    } catch (error) {
      console.error('Error fetching legger data:', error);
      alert('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const checkDataCompleteness = async (nis: string) => {
    const statusDetails = {
      santri: false,
      habit: false,
      kegiatan: 0,
      catatan: false,
    };

    try {
      // Check santri data
      const { data: santriData } = await supabase
        .from('data_siswa_keasramaan')
        .select('nis')
        .eq('nis', nis)
        .single();
      statusDetails.santri = !!santriData;

      // Check habit tracker
      const { data: habitData } = await supabase
        .from('formulir_habit_tracker_keasramaan')
        .select('id')
        .eq('nis', nis)
        .eq('tahun_ajaran', selectedTahunAjaran)
        .eq('semester', selectedSemester)
        .limit(1);
      statusDetails.habit = !!habitData && habitData.length > 0;

      // Check kegiatan
      const { data: kegiatanData } = await supabase
        .from('rapor_kegiatan_keasramaan')
        .select('id')
        .eq('cabang', selectedCabang)
        .eq('tahun_ajaran', selectedTahunAjaran)
        .eq('semester', selectedSemester)
        .eq('kelas', selectedKelas)
        .in('asrama', [selectedAsrama, 'Semua']);
      statusDetails.kegiatan = kegiatanData?.length || 0;

      // Check catatan
      const { data: catatanData } = await supabase
        .from('rapor_catatan_keasramaan')
        .select('id')
        .eq('nis', nis)
        .eq('tahun_ajaran', selectedTahunAjaran)
        .eq('semester', selectedSemester)
        .single();
      statusDetails.catatan = !!catatanData;
    } catch (error) {
      console.error('Error checking data completeness:', error);
    }

    return statusDetails;
  };

  const handleGenerateSingle = async (nis: string) => {
    try {
      // Get Google tokens
      const tokensEncoded = localStorage.getItem('google_oauth_tokens');
      if (!tokensEncoded) {
        alert('❌ Google account not connected. Please connect first.');
        return;
      }

      const googleTokens = JSON.parse(atob(tokensEncoded));

      // Update UI to show generating
      setLeggerData(prev => prev.map(item => 
        item.nis === nis ? { ...item, generating: true } : item
      ));

      const response = await fetch('/api/rapor/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'single',
          cabang: selectedCabang,
          tahunAjaran: selectedTahunAjaran,
          semester: selectedSemester,
          kelas: selectedKelas,
          asrama: selectedAsrama,
          nis,
          googleTokens,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh data from database to get latest PDF URLs
        await fetchLeggerData();
        alert('✅ Rapor berhasil di-generate!');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      alert('❌ Error: ' + error.message);
      setLeggerData(prev => prev.map(item => 
        item.nis === nis ? { ...item, generating: false } : item
      ));
    }
  };

  const handleGenerateAll = async () => {
    const readyData = leggerData.filter(d => d.status === 'ready');
    
    if (readyData.length === 0) {
      alert('Tidak ada santri yang siap untuk di-generate!');
      return;
    }

    const confirmed = confirm(`Generate rapor untuk ${readyData.length} santri?`);
    if (!confirmed) return;

    try {
      const tokensEncoded = localStorage.getItem('google_oauth_tokens');
      if (!tokensEncoded) {
        alert('❌ Google account not connected. Please connect first.');
        return;
      }

      const googleTokens = JSON.parse(atob(tokensEncoded));

      // Generate one by one with delay
      for (let i = 0; i < readyData.length; i++) {
        const santri = readyData[i];
        
        setLeggerData(prev => prev.map(item => 
          item.nis === santri.nis ? { ...item, generating: true } : item
        ));

        try {
          const response = await fetch('/api/rapor/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'single',
              cabang: selectedCabang,
              tahunAjaran: selectedTahunAjaran,
              semester: selectedSemester,
              kelas: selectedKelas,
              asrama: selectedAsrama,
              nis: santri.nis,
              googleTokens,
            }),
          });

          const result = await response.json();

          if (result.success) {
            // Mark as not generating, will refresh all data after batch complete
            setLeggerData(prev => prev.map(item => 
              item.nis === santri.nis ? { ...item, generating: false } : item
            ));
          } else {
            throw new Error(result.message);
          }
        } catch (error: any) {
          console.error(`Error generating for ${santri.nama_siswa}:`, error);
          setLeggerData(prev => prev.map(item => 
            item.nis === santri.nis ? { ...item, generating: false } : item
          ));
        }

        // Delay 2 seconds between generations
        if (i < readyData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Refresh all data after batch complete
      await fetchLeggerData();
      alert('✅ Batch generate selesai!');
    } catch (error: any) {
      alert('❌ Error: ' + error.message);
    }
  };

  const handlePreview = (nis: string) => {
    setSelectedNis(nis);
    setPreviewModalOpen(true);
  };

  const handleDetailView = (nis: string) => {
    setSelectedNis(nis);
    setDetailModalOpen(true);
  };

  const handleDelete = async (nis: string) => {
    const santri = leggerData.find(d => d.nis === nis);
    if (!santri) return;

    const confirmed = confirm(`Hapus rapor untuk ${santri.nama_siswa}?\n\nRapor yang sudah di-generate akan dihapus dari database. File PDF di Google Drive tidak akan dihapus.`);
    if (!confirmed) return;

    try {
      // Delete from rapor_generate_log_keasramaan
      const { error } = await supabase
        .from('rapor_generate_log_keasramaan')
        .delete()
        .eq('nis', nis)
        .eq('tahun_ajaran', selectedTahunAjaran)
        .eq('semester', selectedSemester);

      if (error) throw error;

      // Update UI - remove pdfUrl
      setLeggerData(prev => prev.map(item => 
        item.nis === nis ? { ...item, pdfUrl: undefined } : item
      ));

      alert('✅ Rapor berhasil dihapus dari database!');
    } catch (error: any) {
      console.error('Error deleting rapor:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const isFilterComplete = selectedCabang && selectedTahunAjaran && selectedSemester && selectedKelas && selectedAsrama;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-linear-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Legger Rapor</h1>
                  <p className="text-gray-600">Preview dan generate rapor santri</p>
                </div>
              </div>
              <GoogleOAuthButton />
            </div>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>📌 Info:</strong> Legger menampilkan preview data rapor sebelum di-generate. 
                Pastikan semua data lengkap sebelum generate.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Filter</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cabang</label>
                <select
                  value={selectedCabang}
                  onChange={(e) => setSelectedCabang(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Pilih Cabang</option>
                  {allCabangList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tahun Ajaran</label>
                <select
                  value={selectedTahunAjaran}
                  onChange={(e) => setSelectedTahunAjaran(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Pilih Tahun Ajaran</option>
                  {allTahunAjaranList.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Pilih Semester</option>
                  {allSemesterList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelas {!selectedCabang && <span className="text-xs text-gray-400">(pilih cabang dulu)</span>}
                </label>
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!selectedCabang}
                >
                  <option value="">Pilih Kelas</option>
                  {filteredKelasList.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asrama {!selectedKelas && <span className="text-xs text-gray-400">(pilih kelas dulu)</span>}
                </label>
                <select
                  value={selectedAsrama}
                  onChange={(e) => setSelectedAsrama(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!selectedCabang || !selectedKelas}
                >
                  <option value="">Pilih Asrama</option>
                  {filteredAsramaList.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {!isFilterComplete ? (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center">
              <p className="text-yellow-800 font-medium">
                Silakan pilih semua filter untuk melihat legger
              </p>
            </div>
          ) : loading ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">Memuat data legger...</p>
            </div>
          ) : leggerData.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <p className="text-gray-600">Tidak ada santri di kelas/asrama ini</p>
            </div>
          ) : (
            <>
              {/* Action Bar */}
              <div className="bg-white rounded-2xl shadow-md p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {leggerData.length} santri | {selectedRows.length} dipilih
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      ✅ {leggerData.filter(d => d.status === 'ready').length} Siap
                    </span>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                      ⚠️ {leggerData.filter(d => d.status === 'incomplete').length} Kurang
                    </span>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                      ❌ {leggerData.filter(d => d.status === 'error').length} Error
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleGenerateAll}
                  disabled={leggerData.filter(d => d.status === 'ready').length === 0}
                  className="flex items-center gap-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileDown className="w-5 h-5" />
                  Generate Semua Rapor
                </button>
              </div>

              {/* Legger Table */}
              <LeggerTable
                data={leggerData}
                selectedRows={selectedRows}
                onSelectRow={(nis) => {
                  setSelectedRows(prev => 
                    prev.includes(nis) ? prev.filter(n => n !== nis) : [...prev, nis]
                  );
                }}
                onSelectAll={() => {
                  if (selectedRows.length === leggerData.length) {
                    setSelectedRows([]);
                  } else {
                    setSelectedRows(leggerData.map(d => d.nis));
                  }
                }}
                onPreview={handlePreview}
                onGenerate={handleGenerateSingle}
                onDelete={handleDelete}
              />
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      {previewModalOpen && (
        <PreviewModal
          nis={selectedNis}
          cabang={selectedCabang}
          tahunAjaran={selectedTahunAjaran}
          semester={selectedSemester}
          kelas={selectedKelas}
          asrama={selectedAsrama}
          onClose={() => setPreviewModalOpen(false)}
          onViewDetail={() => {
            setPreviewModalOpen(false);
            setDetailModalOpen(true);
          }}
          onGenerate={() => {
            setPreviewModalOpen(false);
            handleGenerateSingle(selectedNis);
          }}
        />
      )}

      {detailModalOpen && (
        <DetailModal
          nis={selectedNis}
          cabang={selectedCabang}
          tahunAjaran={selectedTahunAjaran}
          semester={selectedSemester}
          kelas={selectedKelas}
          asrama={selectedAsrama}
          onClose={() => setDetailModalOpen(false)}
          onGenerate={() => {
            setDetailModalOpen(false);
            handleGenerateSingle(selectedNis);
          }}
        />
      )}
    </div>
  );
}
