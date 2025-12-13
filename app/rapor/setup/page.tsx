'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { uploadFotoKegiatan, uploadFotoDokumentasi, deleteFoto, validateImageFile } from '@/lib/raporStorage';
import { Settings, Upload, X, Save, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';

interface Kegiatan {
  id?: string;
  urutan: number;
  nama_kegiatan: string;
  keterangan_kegiatan: string;
  foto_1: string;
  foto_2: string;
}

interface Dokumentasi {
  id: string;
  foto: string;
  keterangan: string;
}

export default function SetupRaporPage() {
  // Filter states - All data
  const [allCabangList, setAllCabangList] = useState<string[]>([]);
  const [allTahunAjaranList, setAllTahunAjaranList] = useState<string[]>([]);
  const [allSemesterList, setAllSemesterList] = useState<string[]>([]);
  const [allKelasList, setAllKelasList] = useState<string[]>([]);
  const [allAsramaList, setAllAsramaList] = useState<any[]>([]);

  // Filter states - Filtered data
  const [filteredKelasList, setFilteredKelasList] = useState<string[]>([]);
  const [filteredAsramaList, setFilteredAsramaList] = useState<string[]>([]);

  // Selected filters
  const [selectedCabang, setSelectedCabang] = useState('');
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedAsrama, setSelectedAsrama] = useState('');

  // Data states
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [dokumentasiList, setDokumentasiList] = useState<Dokumentasi[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingKegiatan, setSavingKegiatan] = useState<{ [key: number]: boolean }>({});

  // Upload states
  const [uploadingKegiatan, setUploadingKegiatan] = useState<{ [key: string]: boolean }>({});
  const [uploadingDokumentasi, setUploadingDokumentasi] = useState(false);

  // Initialize 6 kegiatan
  useEffect(() => {
    const initialKegiatan: Kegiatan[] = [];
    for (let i = 1; i <= 6; i++) {
      initialKegiatan.push({
        urutan: i,
        nama_kegiatan: '',
        keterangan_kegiatan: '',
        foto_1: '',
        foto_2: '',
      });
    }
    setKegiatanList(initialKegiatan);
  }, []);

  // Fetch all filter options on mount
  useEffect(() => {
    fetchAllFilterOptions();
  }, []);

  // Filter cascading: Kelas berdasarkan Cabang
  useEffect(() => {
    if (selectedCabang && allAsramaList.length > 0) {
      console.log('Selected Cabang:', selectedCabang);
      console.log('All Asrama List:', allAsramaList);
      
      // Filter asrama by cabang
      const asramaByCabang = allAsramaList.filter(a => a.lokasi === selectedCabang);
      console.log('Asrama by Cabang:', asramaByCabang);
      
      // Get unique kelas from asrama
      const kelasFromAsrama = [...new Set(asramaByCabang.map(a => a.kelas).filter(k => k))];
      console.log('Kelas from Asrama:', kelasFromAsrama);
      
      setFilteredKelasList(kelasFromAsrama);

      // Reset kelas & asrama if not valid
      if (selectedKelas && !kelasFromAsrama.includes(selectedKelas)) {
        setSelectedKelas('');
        setSelectedAsrama('');
      }
    } else {
      setFilteredKelasList([]);
      if (selectedCabang) {
        // Cabang dipilih tapi asrama list kosong, reset
        setSelectedKelas('');
        setSelectedAsrama('');
      }
    }
  }, [selectedCabang, allAsramaList, selectedKelas]);

  // Filter cascading: Asrama berdasarkan Cabang & Kelas
  useEffect(() => {
    if (selectedCabang && selectedKelas) {
      const filtered = allAsramaList.filter(
        a => a.lokasi === selectedCabang && a.kelas === selectedKelas
      );
      setFilteredAsramaList(filtered.map(a => a.asrama));

      // Reset asrama if not valid
      if (selectedAsrama && !filtered.find(a => a.asrama === selectedAsrama)) {
        setSelectedAsrama('');
      }
    } else {
      setFilteredAsramaList([]);
      setSelectedAsrama('');
    }
  }, [selectedCabang, selectedKelas, allAsramaList]);

  // Fetch data when required filters are selected (asrama optional)
  useEffect(() => {
    if (selectedCabang && selectedTahunAjaran && selectedSemester && selectedKelas) {
      fetchData();
    }
  }, [selectedCabang, selectedTahunAjaran, selectedSemester, selectedKelas, selectedAsrama]);

  const fetchAllFilterOptions = async () => {
    try {
      // Fetch cabang
      const { data: cabangData, error: cabangError } = await supabase
        .from('cabang_keasramaan')
        .select('nama_cabang')
        .order('nama_cabang');
      
      if (cabangError) {
        console.error('Error fetching cabang:', cabangError);
      } else {
        setAllCabangList(cabangData?.map((item) => item.nama_cabang) || []);
        console.log('✅ Cabang List:', cabangData);
      }

      // Fetch tahun ajaran
      const { data: tahunData, error: tahunError } = await supabase
        .from('tahun_ajaran_keasramaan')
        .select('tahun_ajaran')
        .eq('status', 'aktif')
        .order('tahun_ajaran', { ascending: false });
      
      if (tahunError) {
        console.error('Error fetching tahun ajaran:', tahunError);
      } else {
        setAllTahunAjaranList(tahunData?.map((item) => item.tahun_ajaran) || []);
        console.log('✅ Tahun Ajaran List:', tahunData);
      }

      // Fetch semester
      const { data: semesterData, error: semesterError } = await supabase
        .from('semester_keasramaan')
        .select('semester')
        .eq('status', 'aktif')
        .order('angka');
      
      if (semesterError) {
        console.error('Error fetching semester:', semesterError);
      } else {
        setAllSemesterList(semesterData?.map((item) => item.semester) || []);
        console.log('✅ Semester List:', semesterData);
      }

      // Fetch all kelas
      const { data: kelasData, error: kelasError } = await supabase
        .from('kelas_keasramaan')
        .select('nama_kelas')
        .eq('status', 'aktif')
        .order('nama_kelas');
      
      if (kelasError) {
        console.error('Error fetching kelas:', kelasError);
      } else {
        setAllKelasList(kelasData?.map((item) => item.nama_kelas) || []);
        console.log('✅ Kelas List:', kelasData);
      }

      // Fetch all asrama (with lokasi & kelas for filtering)
      // Use data_siswa_keasramaan as primary source (more reliable)
      try {
        const { data: siswaData, error: siswaError } = await supabase
          .from('data_siswa_keasramaan')
          .select('asrama, cabang, kelas');
        
        if (siswaError) {
          console.error('❌ Error fetching from data_siswa:', siswaError);
          setAllAsramaList([]);
        } else {
          // Extract unique asrama with cabang & kelas
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
          const uniqueAsrama = Array.from(asramaMap.values());
          setAllAsramaList(uniqueAsrama);
          console.log('✅ Asrama Data:', uniqueAsrama);
        }
      } catch (error) {
        console.error('❌ Error fetching asrama:', error);
        setAllAsramaList([]);
      }
    } catch (error) {
      console.error('❌ Error in fetchAllFilterOptions:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);

    // Build query for kegiatan
    let kegiatanQuery = supabase
      .from('rapor_kegiatan_keasramaan')
      .select('*')
      .eq('cabang', selectedCabang)
      .eq('tahun_ajaran', selectedTahunAjaran)
      .eq('semester', selectedSemester)
      .eq('kelas', selectedKelas);

    // Add asrama filter only if selected
    if (selectedAsrama) {
      kegiatanQuery = kegiatanQuery.eq('asrama', selectedAsrama);
    }

    const { data: kegiatanData } = await kegiatanQuery.order('urutan', { ascending: true });

    // Always show 6 kegiatan slots, merge with database data
    const mergedKegiatan: Kegiatan[] = [];
    for (let i = 1; i <= 6; i++) {
      const existingData = kegiatanData?.find(k => k.urutan === i);
      if (existingData) {
        mergedKegiatan.push(existingData);
      } else {
        mergedKegiatan.push({
          urutan: i,
          nama_kegiatan: '',
          keterangan_kegiatan: '',
          foto_1: '',
          foto_2: '',
        });
      }
    }
    setKegiatanList(mergedKegiatan);

    // Build query for dokumentasi
    let dokumentasiQuery = supabase
      .from('rapor_dokumentasi_lainnya_keasramaan')
      .select('*')
      .eq('cabang', selectedCabang)
      .eq('tahun_ajaran', selectedTahunAjaran)
      .eq('semester', selectedSemester)
      .eq('kelas', selectedKelas);

    // Add asrama filter only if selected
    if (selectedAsrama) {
      dokumentasiQuery = dokumentasiQuery.eq('asrama', selectedAsrama);
    }

    const { data: dokumentasiData } = await dokumentasiQuery.order('urutan', { ascending: true });

    setDokumentasiList(dokumentasiData || []);
    setLoading(false);
  };

  const handleFotoUpload = async (
    file: File,
    urutan: number,
    fotoKe: 1 | 2
  ) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const key = `${urutan}-${fotoKe}`;
    setUploadingKegiatan({ ...uploadingKegiatan, [key]: true });

    const result = await uploadFotoKegiatan(file, {
      cabang: selectedCabang,
      tahun_ajaran: selectedTahunAjaran,
      semester: selectedSemester,
      kelas: selectedKelas,
      asrama: selectedAsrama,
      urutan,
      foto_ke: fotoKe,
    });

    setUploadingKegiatan({ ...uploadingKegiatan, [key]: false });

    if (result.success) {
      // Update kegiatan list
      setKegiatanList((prev) =>
        prev.map((k) =>
          k.urutan === urutan
            ? { ...k, [`foto_${fotoKe}`]: result.url }
            : k
        )
      );
    } else {
      alert('❌ Gagal upload: ' + result.error);
    }
  };

  const handleFotoDelete = async (urutan: number, fotoKe: 1 | 2) => {
    if (!confirm('Yakin ingin menghapus foto ini?')) return;

    // Get current kegiatan
    const kegiatan = kegiatanList.find((k) => k.urutan === urutan);
    if (!kegiatan) return;

    const fotoUrl = kegiatan[`foto_${fotoKe}` as keyof Kegiatan] as string;

    if (fotoUrl) {
      // Delete from storage
      const path = fotoUrl.split('/rapor-kegiatan/')[1];
      if (path) {
        await deleteFoto(path);
      }
    }

    // Update state
    setKegiatanList((prev) =>
      prev.map((k) =>
        k.urutan === urutan
          ? { ...k, [`foto_${fotoKe}`]: '' }
          : k
      )
    );

    // Update database if kegiatan already saved
    if (kegiatan.id) {
      const updatePayload = {
        [`foto_${fotoKe}`]: '',
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('rapor_kegiatan_keasramaan')
        .update(updatePayload)
        .eq('id', kegiatan.id);

      if (error) {
        console.error('Error updating database:', error);
        alert('❌ Gagal update database. Foto akan muncul lagi setelah refresh.');
      } else {
        console.log('✅ Foto berhasil dihapus dari database');
      }
    }
  };

  const handleDokumentasiUpload = async (files: FileList) => {
    setUploadingDokumentasi(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(`File ${file.name}: ${validation.error}`);
        continue;
      }

      const result = await uploadFotoDokumentasi(file, {
        cabang: selectedCabang,
        tahun_ajaran: selectedTahunAjaran,
        semester: selectedSemester,
        kelas: selectedKelas,
        asrama: selectedAsrama,
      });

      if (result.success) {
        // Insert to database
        const { data } = await supabase
          .from('rapor_dokumentasi_lainnya_keasramaan')
          .insert([
            {
              cabang: selectedCabang,
              tahun_ajaran: selectedTahunAjaran,
              semester: selectedSemester,
              kelas: selectedKelas,
              asrama: selectedAsrama,
              foto: result.url,
              keterangan: '',
            },
          ])
          .select()
          .single();

        if (data) {
          setDokumentasiList((prev) => [...prev, data]);
        }
      }
    }

    setUploadingDokumentasi(false);
  };

  const handleSaveKegiatan = async (kegiatan: Kegiatan) => {
    if (!selectedCabang || !selectedTahunAjaran || !selectedSemester || !selectedKelas) {
      alert('Pilih minimal Cabang, Tahun Ajaran, Semester, dan Kelas!');
      return;
    }

    // Check if kegiatan is empty
    if (!kegiatan.nama_kegiatan) {
      // If kegiatan has ID but nama is empty, delete from database
      if (kegiatan.id) {
        await handleDeleteKegiatan(kegiatan);
      } else {
        alert('Nama kegiatan tidak boleh kosong!');
      }
      return;
    }

    setSavingKegiatan({ ...savingKegiatan, [kegiatan.urutan]: true });

    const payload = {
      cabang: selectedCabang,
      tahun_ajaran: selectedTahunAjaran,
      semester: selectedSemester,
      kelas: selectedKelas,
      asrama: selectedAsrama || 'Semua', // Default to 'Semua' if not selected
      urutan: kegiatan.urutan,
      nama_kegiatan: kegiatan.nama_kegiatan,
      keterangan_kegiatan: kegiatan.keterangan_kegiatan,
      foto_1: kegiatan.foto_1,
      foto_2: kegiatan.foto_2,
    };

    try {
      if (kegiatan.id) {
        // Update
        const { error } = await supabase
          .from('rapor_kegiatan_keasramaan')
          .update(payload)
          .eq('id', kegiatan.id);

        if (error) throw error;
        alert('✅ Kegiatan berhasil diperbarui!');
      } else {
        // Insert
        const { data, error } = await supabase
          .from('rapor_kegiatan_keasramaan')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setKegiatanList((prev) =>
            prev.map((k) => (k.urutan === kegiatan.urutan ? { ...k, id: data.id } : k))
          );
          alert('✅ Kegiatan berhasil disimpan!');
        }
      }
    } catch (error) {
      console.error('Error saving kegiatan:', error);
      alert('❌ Gagal menyimpan kegiatan!');
    } finally {
      setSavingKegiatan({ ...savingKegiatan, [kegiatan.urutan]: false });
    }
  };

  const handleDeleteKegiatan = async (kegiatan: Kegiatan) => {
    if (!kegiatan.id) {
      alert('Kegiatan belum tersimpan di database!');
      return;
    }

    if (!confirm(`Yakin ingin menghapus "${kegiatan.nama_kegiatan}"?`)) {
      return;
    }

    setSavingKegiatan({ ...savingKegiatan, [kegiatan.urutan]: true });

    try {
      // Delete photos from storage first
      if (kegiatan.foto_1) {
        const path1 = kegiatan.foto_1.split('/rapor-kegiatan/')[1];
        if (path1) await deleteFoto(path1);
      }
      if (kegiatan.foto_2) {
        const path2 = kegiatan.foto_2.split('/rapor-kegiatan/')[1];
        if (path2) await deleteFoto(path2);
      }

      // Delete from database
      const { error } = await supabase
        .from('rapor_kegiatan_keasramaan')
        .delete()
        .eq('id', kegiatan.id);

      if (error) throw error;

      // Reset kegiatan in state
      setKegiatanList((prev) =>
        prev.map((k) =>
          k.urutan === kegiatan.urutan
            ? {
                urutan: k.urutan,
                nama_kegiatan: '',
                keterangan_kegiatan: '',
                foto_1: '',
                foto_2: '',
              }
            : k
        )
      );

      alert('✅ Kegiatan berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting kegiatan:', error);
      alert('❌ Gagal menghapus kegiatan!');
    } finally {
      setSavingKegiatan({ ...savingKegiatan, [kegiatan.urutan]: false });
    }
  };

  const handleDeleteDokumentasi = async (id: string, fotoUrl: string) => {
    if (!confirm('Yakin ingin menghapus foto ini?')) return;

    // Delete from storage
    const path = fotoUrl.split('/rapor-kegiatan/')[1];
    if (path) {
      await deleteFoto(path);
    }

    // Delete from database
    await supabase
      .from('rapor_dokumentasi_lainnya_keasramaan')
      .delete()
      .eq('id', id);

    setDokumentasiList((prev) => prev.filter((d) => d.id !== id));
  };

  const isFilterComplete = selectedCabang && selectedTahunAjaran && selectedSemester && selectedKelas;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Setup Rapor</h1>
                <p className="text-gray-600">Kelola kegiatan dan dokumentasi untuk rapor</p>
              </div>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!selectedCabang || !selectedKelas}
                >
                  <option value="">Semua Asrama</option>
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
                Silakan pilih minimal Cabang, Tahun Ajaran, Semester, dan Kelas
              </p>
              <p className="text-yellow-600 text-sm mt-2">
                Asrama bersifat opsional. Jika tidak dipilih, data akan berlaku untuk semua asrama.
              </p>
            </div>
          ) : loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Kegiatan Cards */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">6 Kegiatan Utama</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {kegiatanList.map((kegiatan) => (
                    <KegiatanCard
                      key={kegiatan.urutan}
                      kegiatan={kegiatan}
                      onUpdate={(updated) => {
                        setKegiatanList((prev) =>
                          prev.map((k) => (k.urutan === updated.urutan ? updated : k))
                        );
                      }}
                      onFotoUpload={handleFotoUpload}
                      onFotoDelete={handleFotoDelete}
                      onSave={handleSaveKegiatan}
                      onDelete={handleDeleteKegiatan}
                      uploading={uploadingKegiatan}
                      saving={savingKegiatan[kegiatan.urutan]}
                    />
                  ))}
                </div>
              </div>

              {/* Dokumentasi Lainnya */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Dokumentasi Program Lainnya</h2>
                
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 mb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">
                    {uploadingDokumentasi ? 'Uploading...' : 'Click to upload multiple photos'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => e.target.files && handleDokumentasiUpload(e.target.files)}
                    className="hidden"
                    disabled={uploadingDokumentasi}
                  />
                </label>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {dokumentasiList.map((dok) => (
                    <div key={dok.id} className="relative group">
                      <img
                        src={dok.foto}
                        alt="Dokumentasi"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleDeleteDokumentasi(dok.id, dok.foto)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {dokumentasiList.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Belum ada dokumentasi
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Kegiatan Card Component
function KegiatanCard({
  kegiatan,
  onUpdate,
  onFotoUpload,
  onFotoDelete,
  onSave,
  onDelete,
  uploading,
  saving,
}: {
  kegiatan: Kegiatan;
  onUpdate: (kegiatan: Kegiatan) => void;
  onFotoUpload: (file: File, urutan: number, fotoKe: 1 | 2) => void;
  onFotoDelete: (urutan: number, fotoKe: 1 | 2) => void;
  onSave: (kegiatan: Kegiatan) => void;
  onDelete: (kegiatan: Kegiatan) => void;
  uploading: { [key: string]: boolean };
  saving?: boolean;
}) {
  const isEmpty = !kegiatan.nama_kegiatan && !kegiatan.foto_1 && !kegiatan.foto_2;
  const hasData = kegiatan.nama_kegiatan || kegiatan.foto_1 || kegiatan.foto_2;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          Kegiatan {kegiatan.urutan}
        </h3>
        {kegiatan.id && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Tersimpan
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Kegiatan
          </label>
          <input
            type="text"
            value={kegiatan.nama_kegiatan}
            onChange={(e) => onUpdate({ ...kegiatan, nama_kegiatan: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Contoh: Kegiatan Pramuka"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keterangan
          </label>
          <textarea
            value={kegiatan.keterangan_kegiatan}
            onChange={(e) => onUpdate({ ...kegiatan, keterangan_kegiatan: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Deskripsi kegiatan..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FotoUploader
            label="Foto 1"
            foto={kegiatan.foto_1}
            onUpload={(file) => onFotoUpload(file, kegiatan.urutan, 1)}
            onDelete={() => onFotoDelete(kegiatan.urutan, 1)}
            uploading={uploading[`${kegiatan.urutan}-1`]}
          />
          <FotoUploader
            label="Foto 2"
            foto={kegiatan.foto_2}
            onUpload={(file) => onFotoUpload(file, kegiatan.urutan, 2)}
            onDelete={() => onFotoDelete(kegiatan.urutan, 2)}
            uploading={uploading[`${kegiatan.urutan}-2`]}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onSave(kegiatan)}
            disabled={saving || isEmpty}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan
              </>
            )}
          </button>

          {kegiatan.id && hasData && (
            <button
              onClick={() => onDelete(kegiatan)}
              disabled={saving}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Hapus kegiatan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Foto Uploader Component
function FotoUploader({
  label,
  foto,
  onUpload,
  onDelete,
  uploading,
}: {
  label: string;
  foto: string;
  onUpload: (file: File) => void;
  onDelete?: () => void;
  uploading?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {foto ? (
        <div className="relative group">
          <img src={foto} alt={label} className="w-full h-32 object-cover rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
            <label className="p-2 bg-white rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
              <Upload className="w-5 h-5 text-blue-600" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                className="hidden"
                disabled={uploading}
              />
            </label>
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                title="Hapus foto"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          {uploading ? (
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">Upload</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}
