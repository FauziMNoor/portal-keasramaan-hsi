'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { FileText, Download, Filter, FileSpreadsheet, User } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RekapData {
  nama_siswa: string;
  nis: string;
  kelas: string;
  rombel: string;
  asrama: string;
  cabang: string;
  musyrif: string;
  kepala_asrama: string;
  semester: string;
  tahun_ajaran: string;
  foto?: string;

  // Ubudiyah (8 indikator, max 28)
  shalat_fardhu_berjamaah: number;
  tata_cara_shalat: number;
  qiyamul_lail: number;
  shalat_sunnah: number;
  puasa_sunnah: number;
  tata_cara_wudhu: number;
  sedekah: number;
  dzikir_pagi_petang: number;

  // Akhlaq (4 indikator, max 12)
  etika_dalam_tutur_kata: number;
  etika_dalam_bergaul: number;
  etika_dalam_berpakaian: number;
  adab_sehari_hari: number;

  // Kedisiplinan (6 indikator, max 21)
  waktu_tidur: number;
  pelaksanaan_piket_kamar: number;
  disiplin_halaqah_tahfidz: number;
  perizinan: number;
  belajar_malam: number;
  disiplin_berangkat_ke_masjid: number;

  // Kebersihan & Kerapian (3 indikator, max 9)
  kebersihan_tubuh_berpakaian_berpenampilan: number;
  kamar: number;
  ranjang_dan_almari: number;

  // Calculated fields
  total_ubudiyah: number;
  persentase_ubudiyah: number;
  total_akhlaq: number;
  persentase_akhlaq: number;
  total_kedisiplinan: number;
  persentase_kedisiplinan: number;
  total_kebersihan: number;
  persentase_kebersihan: number;
  total_asrama: number;
  persentase_asrama: number;
  predikat: string;
}

// Component untuk menampilkan foto siswa
function FotoSiswa({ foto, nama }: { foto: string; nama: string }) {
  const [fotoUrl, setFotoUrl] = useState<string>('');

  useEffect(() => {
    if (foto) {
      if (foto.startsWith('http')) {
        setFotoUrl(foto);
      } else {
        const { data } = supabase.storage.from('foto-siswa').getPublicUrl(foto);
        if (data?.publicUrl) {
          setFotoUrl(data.publicUrl);
        }
      }
    }
  }, [foto]);

  if (fotoUrl) {
    return (
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300 flex-shrink-0 border-4 border-white shadow-lg">
        <img
          src={fotoUrl}
          alt={nama}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded-full bg-gray-300 flex-shrink-0 border-4 border-white shadow-lg flex items-center justify-center">
      <User className="w-8 h-8 text-gray-500" />
    </div>
  );
}

export default function RekapHabitTrackerPage() {
  const [rekapData, setRekapData] = useState<RekapData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'detail'>('ringkasan');
  const [filters, setFilters] = useState({
    tahun_ajaran: '',
    semester: '',
    cabang: '',
    kelas: '',
    asrama: '',
    musyrif: '',
    tanggal_mulai: '',
    tanggal_akhir: '',
  });

  const [tahunAjaranList, setTahunAjaranList] = useState<any[]>([]);
  const [semesterList, setSemesterList] = useState<any[]>([]);
  const [cabangList, setLokasiList] = useState<any[]>([]);
  const [allKelasList, setAllKelasList] = useState<any[]>([]);
  const [filteredKelasList, setFilteredKelasList] = useState<any[]>([]);
  const [allAsramaList, setAllAsramaList] = useState<any[]>([]);
  const [filteredAsramaList, setFilteredAsramaList] = useState<any[]>([]);
  const [allMusyrifList, setAllMusyrifList] = useState<any[]>([]);
  const [filteredMusyrifList, setFilteredMusyrifList] = useState<any[]>([]);
  const [indikatorMap, setIndikatorMap] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    fetchMasterData();
    fetchIndikator();
  }, []);

  // Filter kelas berdasarkan cabang yang dipilih
  useEffect(() => {
    if (filters.cabang && allKelasList.length > 0) {
      const filtered = allKelasList.filter(k => k.cabang === filters.cabang);
      setFilteredKelasList(filtered);

      // Reset kelas jika tidak ada di filtered list
      if (filters.kelas && !filtered.find(k => k.nama_kelas === filters.kelas)) {
        setFilters(prev => ({ ...prev, kelas: '', asrama: '', musyrif: '' }));
      }
    } else {
      setFilteredKelasList(allKelasList);
    }
  }, [filters.cabang, allKelasList]);

  // Filter asrama berdasarkan cabang dan kelas yang dipilih
  useEffect(() => {
    if (filters.cabang && filters.kelas && allAsramaList.length > 0) {
      const filtered = allAsramaList.filter(
        a => a.nama_cabang === filters.cabang && a.kelas === filters.kelas
      );
      setFilteredAsramaList(filtered);

      // Reset asrama jika tidak ada di filtered list
      if (filters.asrama && !filtered.find(a => a.nama_asrama === filters.asrama)) {
        setFilters(prev => ({ ...prev, asrama: '', musyrif: '' }));
      }
    } else {
      setFilteredAsramaList([]);
      setFilters(prev => ({ ...prev, asrama: '', musyrif: '' }));
    }
  }, [filters.cabang, filters.kelas, allAsramaList]);

  // Filter musyrif berdasarkan cabang, kelas, dan asrama yang dipilih
  useEffect(() => {
    if (filters.cabang && filters.kelas && filters.asrama && allMusyrifList.length > 0) {
      const filtered = allMusyrifList.filter(
        m => m.cabang === filters.cabang &&
          m.kelas === filters.kelas &&
          m.asrama === filters.asrama
      );
      setFilteredMusyrifList(filtered);

      // Reset musyrif jika tidak ada di filtered list
      if (filters.musyrif && !filtered.find(m => m.nama_musyrif === filters.musyrif)) {
        setFilters(prev => ({ ...prev, musyrif: '' }));
      }
    } else {
      setFilteredMusyrifList([]);
      if (filters.musyrif) {
        setFilters(prev => ({ ...prev, musyrif: '' }));
      }
    }
  }, [filters.cabang, filters.kelas, filters.asrama, allMusyrifList]);

  const fetchIndikator = async () => {
    const { data, error } = await supabase
      .from('indikator_keasramaan')
      .select('*');

    if (data) {
      // Create map: field_name -> { nilai_angka -> deskripsi }
      const map: { [key: string]: { [nilai: number]: string } } = {};
      data.forEach((ind) => {
        // Convert nama_indikator to field name
        const fieldName = ind.nama_indikator
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/,/g, '')
          .replace(/&/g, '')
          .replace(/-/g, '_') // Replace hyphen with underscore
          .replace(/__+/g, '_'); // Replace multiple underscores with single

        if (!map[fieldName]) {
          map[fieldName] = {};
        }
        map[fieldName][ind.nilai_angka] = ind.deskripsi;
      });
      setIndikatorMap(map);
      console.log('Indikator map:', map);
    }
  };

  const fetchMasterData = async () => {
    // Get unique values from actual habit tracker data
    const { data: habitData } = await supabase
      .from('formulir_habit_tracker_keasramaan')
      .select('tahun_ajaran, semester, cabang, kelas, asrama, musyrif');

    if (habitData) {
      // Extract unique values
      const uniqueTahunAjaran = [...new Set(habitData.map(d => d.tahun_ajaran).filter(Boolean))];
      const uniqueSemester = [...new Set(habitData.map(d => d.semester).filter(Boolean))];
      const uniqueLokasi = [...new Set(habitData.map(d => d.cabang).filter(Boolean))];

      // Create kelas list with cabang info
      const kelasMap = new Map();
      habitData.forEach(d => {
        if (d.kelas && d.cabang) {
          const key = `${d.kelas}-${d.cabang}`;
          if (!kelasMap.has(key)) {
            kelasMap.set(key, {
              id: key,
              nama_kelas: d.kelas,
              cabang: d.cabang
            });
          }
        }
      });
      const kelasWithCabang = Array.from(kelasMap.values());

      // Create asrama list with cabang and kelas info
      const asramaMap = new Map();
      habitData.forEach(d => {
        if (d.asrama && d.cabang && d.kelas) {
          const key = `${d.asrama}-${d.cabang}-${d.kelas}`;
          if (!asramaMap.has(key)) {
            asramaMap.set(key, {
              id: key,
              asrama: d.asrama,
              cabang: d.cabang,
              kelas: d.kelas
            });
          }
        }
      });
      const asramaWithInfo = Array.from(asramaMap.values());

      // Create musyrif list with full info for filtering
      const musyrifMap = new Map();
      habitData.forEach(d => {
        if (d.musyrif && d.asrama && d.cabang && d.kelas) {
          const key = `${d.musyrif}-${d.asrama}-${d.cabang}-${d.kelas}`;
          if (!musyrifMap.has(key)) {
            musyrifMap.set(key, {
              id: key,
              nama_musyrif: d.musyrif,
              asrama: d.asrama,
              cabang: d.cabang,
              kelas: d.kelas
            });
          }
        }
      });
      const musyrifWithInfo = Array.from(musyrifMap.values());

      setTahunAjaranList(uniqueTahunAjaran.map(t => ({ id: t, tahun_ajaran: t })));
      setSemesterList(uniqueSemester.map(s => ({ id: s, semester: s })));
      setLokasiList(uniqueLokasi.map(l => ({ id: l, cabang: l })));
      setAllKelasList(kelasWithCabang);
      setFilteredKelasList(kelasWithCabang);
      setAllAsramaList(asramaWithInfo);
      setFilteredAsramaList([]);
      setAllMusyrifList(musyrifWithInfo);
      setFilteredMusyrifList([]);
    }
  };

  const calculateRekap = async () => {
    if (!filters.semester || !filters.tahun_ajaran) {
      alert('Semester dan Tahun Ajaran harus dipilih!');
      return;
    }

    setLoading(true);

    try {
      console.log('Filters:', filters);

      // First, check if there's any data in the table
      const { data: allData, error: checkError } = await supabase
        .from('formulir_habit_tracker_keasramaan')
        .select('semester, tahun_ajaran, cabang, kelas, asrama, tanggal')
        .limit(10);

      console.log('Sample data in table:', allData);
      if (allData && allData.length > 0) {
        console.log('First record details:', {
          semester: `"${allData[0].semester}"`,
          tahun_ajaran: `"${allData[0].tahun_ajaran}"`,
          cabang: `"${allData[0].cabang}"`,
          kelas: `"${allData[0].kelas}"`,
          asrama: `"${allData[0].asrama}"`,
        });
      }

      // Build query with case-insensitive matching
      let query = supabase
        .from('formulir_habit_tracker_keasramaan')
        .select('*')
        .ilike('semester', filters.semester)
        .ilike('tahun_ajaran', filters.tahun_ajaran);

      if (filters.cabang) query = query.ilike('cabang', filters.cabang);
      if (filters.kelas) query = query.eq('kelas', filters.kelas);
      if (filters.asrama) query = query.ilike('asrama', filters.asrama);
      if (filters.musyrif) query = query.ilike('musyrif', filters.musyrif);
      if (filters.tanggal_mulai) query = query.gte('tanggal', filters.tanggal_mulai);
      if (filters.tanggal_akhir) query = query.lte('tanggal', filters.tanggal_akhir);

      const { data, error } = await query;

      if (error) {
        console.error('Query error:', error);
        throw error;
      }

      console.log('Data fetched:', data?.length, 'records');
      console.log('First record:', data?.[0]);

      if (!data || data.length === 0) {
        alert('Tidak ada data habit tracker untuk filter yang dipilih.\n\nCek console untuk melihat data yang tersedia di database.');
        setRekapData([]);
        setLoading(false);
        return;
      }

      // Group by NIS and calculate averages
      const groupedData: { [nis: string]: any } = {};

      data?.forEach((record) => {
        if (!groupedData[record.nis]) {
          groupedData[record.nis] = {
            nama_siswa: record.nama_siswa,
            nis: record.nis,
            kelas: record.kelas,
            rombel: '-', // Will be fetched from data_siswa later
            asrama: record.asrama,
            cabang: record.cabang,
            musyrif: record.musyrif,
            kepala_asrama: record.kepas,
            semester: record.semester,
            tahun_ajaran: record.tahun_ajaran,
            records: [],
          };
        }
        groupedData[record.nis].records.push(record);
      });

      // Fetch rombel and foto from data_siswa_keasramaan
      const nisList = Object.keys(groupedData);
      if (nisList.length > 0) {
        const { data: siswaData, error: siswaError } = await supabase
          .from('data_siswa_keasramaan')
          .select('nis, rombel, foto')
          .in('nis', nisList);

        console.log('Fetched rombel and foto for', siswaData?.length, 'students');

        if (siswaError) {
          console.error('Error fetching rombel:', siswaError);
        }

        siswaData?.forEach((siswa) => {
          if (groupedData[siswa.nis]) {
            groupedData[siswa.nis].rombel = siswa.rombel || '-';
            groupedData[siswa.nis].foto = siswa.foto || '';
          }
        });
      }

      // Calculate averages and totals
      const rekapResult: RekapData[] = Object.values(groupedData).map((student: any) => {
        const records = student.records;
        const count = records.length;

        // Calculate averages for each indicator
        const avgUbudiyah = {
          shalat_fardhu_berjamaah: avg(records, 'shalat_fardhu_berjamaah'),
          tata_cara_shalat: avg(records, 'tata_cara_shalat'),
          qiyamul_lail: avg(records, 'qiyamul_lail'),
          shalat_sunnah: avg(records, 'shalat_sunnah'),
          puasa_sunnah: avg(records, 'puasa_sunnah'),
          tata_cara_wudhu: avg(records, 'tata_cara_wudhu'),
          sedekah: avg(records, 'sedekah'),
          dzikir_pagi_petang: avg(records, 'dzikir_pagi_petang'),
        };

        const avgAkhlaq = {
          etika_dalam_tutur_kata: avg(records, 'etika_dalam_tutur_kata'),
          etika_dalam_bergaul: avg(records, 'etika_dalam_bergaul'),
          etika_dalam_berpakaian: avg(records, 'etika_dalam_berpakaian'),
          adab_sehari_hari: avg(records, 'adab_sehari_hari'),
        };

        const avgKedisiplinan = {
          waktu_tidur: avg(records, 'waktu_tidur'),
          pelaksanaan_piket_kamar: avg(records, 'pelaksanaan_piket_kamar'),
          disiplin_halaqah_tahfidz: avg(records, 'disiplin_halaqah_tahfidz'),
          perizinan: avg(records, 'perizinan'),
          belajar_malam: avg(records, 'belajar_malam'),
          disiplin_berangkat_ke_masjid: avg(records, 'disiplin_berangkat_ke_masjid'),
        };

        const avgKebersihan = {
          kebersihan_tubuh_berpakaian_berpenampilan: avg(records, 'kebersihan_tubuh_berpakaian_berpenampilan'),
          kamar: avg(records, 'kamar'),
          ranjang_dan_almari: avg(records, 'ranjang_dan_almari'),
        };

        // Calculate totals
        const total_ubudiyah = Object.values(avgUbudiyah).reduce((sum, val) => sum + val, 0);
        const total_akhlaq = Object.values(avgAkhlaq).reduce((sum, val) => sum + val, 0);
        const total_kedisiplinan = Object.values(avgKedisiplinan).reduce((sum, val) => sum + val, 0);
        const total_kebersihan = Object.values(avgKebersihan).reduce((sum, val) => sum + val, 0);
        const total_asrama = total_ubudiyah + total_akhlaq + total_kedisiplinan + total_kebersihan;

        // Calculate percentages (max 100%)
        const persentase_ubudiyah = Math.min(100, (total_ubudiyah / 28) * 100);
        const persentase_akhlaq = Math.min(100, (total_akhlaq / 12) * 100);
        const persentase_kedisiplinan = Math.min(100, (total_kedisiplinan / 21) * 100);
        const persentase_kebersihan = Math.min(100, (total_kebersihan / 9) * 100);
        const persentase_asrama = Math.min(100, (total_asrama / 70) * 100);

        // Determine predikat
        let predikat = 'Maqbul';
        if (total_asrama > 65) predikat = 'Mumtaz';
        else if (total_asrama > 60) predikat = 'Jayyid Jiddan';
        else if (total_asrama > 50) predikat = 'Jayyid';
        else if (total_asrama > 30) predikat = 'Dhaif';

        return {
          ...student,
          ...avgUbudiyah,
          ...avgAkhlaq,
          ...avgKedisiplinan,
          ...avgKebersihan,
          total_ubudiyah: Math.round(total_ubudiyah),
          persentase_ubudiyah: Math.round(persentase_ubudiyah),
          total_akhlaq: Math.round(total_akhlaq),
          persentase_akhlaq: Math.round(persentase_akhlaq),
          total_kedisiplinan: Math.round(total_kedisiplinan),
          persentase_kedisiplinan: Math.round(persentase_kedisiplinan),
          total_kebersihan: Math.round(total_kebersihan),
          persentase_kebersihan: Math.round(persentase_kebersihan),
          total_asrama: Math.round(total_asrama),
          persentase_asrama: Math.round(persentase_asrama),
          predikat,
        };
      });

      console.log('Rekap result:', rekapResult.length, 'students');
      console.log('Sample data:', rekapResult[0]);

      setRekapData(rekapResult);
    } catch (error: any) {
      console.error('Error:', error);
      alert('Gagal mengambil data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate average
  const avg = (records: any[], field: string): number => {
    const values = records.map(r => parseFloat(r[field]) || 0).filter(v => v > 0);
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  // Helper function to get rubrik description for a value
  const getRubrikDesc = (fieldName: string, nilai: number): string => {
    const indikatorNilai = indikatorMap[fieldName];
    if (!indikatorNilai) {
      console.log(`Indikator not found for field: ${fieldName}`);
      return '';
    }

    const nilaiRounded = Math.round(nilai);
    const deskripsi = indikatorNilai[nilaiRounded];

    if (!deskripsi) {
      console.log(`No description for ${fieldName} with value ${nilaiRounded}`);
      return '';
    }

    return deskripsi;
  };



  const exportToExcel = () => {
    if (rekapData.length === 0) {
      alert('Tidak ada data untuk di-export!');
      return;
    }

    // Prepare data for Excel with all detail columns
    const excelData = rekapData.map((item, index) => ({
      'No': index + 1,
      'Nama Siswa': item.nama_siswa,
      'NIS': item.nis,
      'Kelas': item.kelas,
      'Asrama': item.asrama,
      'Cabang': item.cabang,
      'Musyrif': item.musyrif,
      'Kepala Asrama': item.kepala_asrama,
      'Tahun Ajaran': item.tahun_ajaran,
      'Semester': item.semester,

      // Ubudiyah Details
      'Shalat Fardhu Berjamaah': Math.round(item.shalat_fardhu_berjamaah),
      'Tata Cara Shalat': Math.round(item.tata_cara_shalat),
      'Qiyamul Lail': Math.round(item.qiyamul_lail),
      'Shalat Sunnah': Math.round(item.shalat_sunnah),
      'Puasa Sunnah': Math.round(item.puasa_sunnah),
      'Tata Cara Wudhu': Math.round(item.tata_cara_wudhu),
      'Sedekah': Math.round(item.sedekah),
      'Dzikir Pagi Petang': Math.round(item.dzikir_pagi_petang),
      'Total Ubudiyah': `${item.total_ubudiyah} / 28`,
      '% Ubudiyah': `${item.persentase_ubudiyah}%`,

      // Akhlaq Details
      'Etika Tutur Kata': Math.round(item.etika_dalam_tutur_kata),
      'Etika Bergaul': Math.round(item.etika_dalam_bergaul),
      'Etika Berpakaian': Math.round(item.etika_dalam_berpakaian),
      'Adab Sehari-hari': Math.round(item.adab_sehari_hari),
      'Total Akhlaq': `${item.total_akhlaq} / 12`,
      '% Akhlaq': `${item.persentase_akhlaq}%`,

      // Kedisiplinan Details
      'Waktu Tidur': Math.round(item.waktu_tidur),
      'Piket Kamar': Math.round(item.pelaksanaan_piket_kamar),
      'Halaqah Tahfidz': Math.round(item.disiplin_halaqah_tahfidz),
      'Perizinan': Math.round(item.perizinan),
      'Belajar Malam': Math.round(item.belajar_malam),
      'Berangkat Masjid': Math.round(item.disiplin_berangkat_ke_masjid),
      'Total Kedisiplinan': `${item.total_kedisiplinan} / 21`,
      '% Kedisiplinan': `${item.persentase_kedisiplinan}%`,

      // Kebersihan Details
      'Kebersihan Tubuh': Math.round(item.kebersihan_tubuh_berpakaian_berpenampilan),
      'Kamar': Math.round(item.kamar),
      'Ranjang & Almari': Math.round(item.ranjang_dan_almari),
      'Total Kebersihan': `${item.total_kebersihan} / 9`,
      '% Kebersihan': `${item.persentase_kebersihan}%`,

      'Total Asrama': `${item.total_asrama} / 70`,
      '% Asrama': `${item.persentase_asrama}%`,
      'Predikat': item.predikat,
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for all columns
    ws['!cols'] = [
      { wch: 5 },  // No
      { wch: 25 }, // Nama
      { wch: 15 }, // NIS
      { wch: 10 }, // Kelas
      { wch: 20 }, // Asrama
      { wch: 15 }, // Cabang
      { wch: 20 }, // Musyrif
      { wch: 20 }, // Kepala Asrama
      { wch: 15 }, // Tahun Ajaran
      { wch: 12 }, // Semester

      // Ubudiyah
      { wch: 12 }, // Shalat Fardhu Berjamaah
      { wch: 12 }, // Tata Cara Shalat
      { wch: 12 }, // Qiyamul Lail
      { wch: 12 }, // Shalat Sunnah
      { wch: 12 }, // Puasa Sunnah
      { wch: 12 }, // Tata Cara Wudhu
      { wch: 10 }, // Sedekah
      { wch: 12 }, // Dzikir Pagi Petang
      { wch: 15 }, // Total Ubudiyah
      { wch: 12 }, // % Ubudiyah

      // Akhlaq
      { wch: 12 }, // Etika Tutur Kata
      { wch: 12 }, // Etika Bergaul
      { wch: 12 }, // Etika Berpakaian
      { wch: 12 }, // Adab Sehari-hari
      { wch: 15 }, // Total Akhlaq
      { wch: 12 }, // % Akhlaq

      // Kedisiplinan
      { wch: 12 }, // Waktu Tidur
      { wch: 12 }, // Piket Kamar
      { wch: 12 }, // Halaqah Tahfidz
      { wch: 10 }, // Perizinan
      { wch: 12 }, // Belajar Malam
      { wch: 12 }, // Berangkat Masjid
      { wch: 18 }, // Total Kedisiplinan
      { wch: 15 }, // % Kedisiplinan

      // Kebersihan
      { wch: 12 }, // Kebersihan Tubuh
      { wch: 10 }, // Kamar
      { wch: 12 }, // Ranjang & Almari
      { wch: 16 }, // Total Kebersihan
      { wch: 13 }, // % Kebersihan

      { wch: 15 }, // Total Asrama
      { wch: 12 }, // % Asrama
      { wch: 15 }, // Predikat
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Habit Tracker');

    // Generate filename with date
    const filename = `Rekap_Habit_Tracker_${filters.semester}_${filters.tahun_ajaran}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);
  };

  const exportToPDF = () => {
    if (rekapData.length === 0) {
      alert('Tidak ada data untuk di-export!');
      return;
    }

    // Note: PDF export tetap menggunakan format ringkasan karena keterbatasan lebar halaman
    // Untuk detail lengkap, gunakan Export Excel
    const doc = new jsPDF('landscape', 'mm', 'a4');

    // Title
    doc.setFontSize(16);
    doc.text('REKAP HABIT TRACKER KEASRAMAAN', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Semester: ${filters.semester} | Tahun Ajaran: ${filters.tahun_ajaran}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
    doc.setFontSize(8);
    doc.text('(Untuk detail lengkap per indikator, gunakan Export Excel)', doc.internal.pageSize.getWidth() / 2, 26, { align: 'center' });

    // Prepare table data - ringkasan saja
    const tableData = rekapData.map((item, index) => [
      index + 1,
      item.nama_siswa,
      item.nis,
      item.kelas,
      item.asrama,
      `${item.total_ubudiyah}/28`,
      `${item.persentase_ubudiyah}%`,
      `${item.total_akhlaq}/12`,
      `${item.persentase_akhlaq}%`,
      `${item.total_kedisiplinan}/21`,
      `${item.persentase_kedisiplinan}%`,
      `${item.total_kebersihan}/9`,
      `${item.persentase_kebersihan}%`,
      `${item.total_asrama}/70`,
      `${item.persentase_asrama}%`,
      item.predikat,
    ]);

    // Generate table
    autoTable(doc, {
      startY: 30,
      head: [[
        'No',
        'Nama Siswa',
        'NIS',
        'Kelas',
        'Asrama',
        'Ubudiyah',
        '%',
        'Akhlaq',
        '%',
        'Kedisiplinan',
        '%',
        'Kebersihan',
        '%',
        'Total',
        '%',
        'Predikat'
      ]],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 197, 94],
        fontSize: 8,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7,
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 12, halign: 'center' },
        4: { cellWidth: 25 },
        5: { cellWidth: 15, halign: 'center' },
        6: { cellWidth: 10, halign: 'center' },
        7: { cellWidth: 15, halign: 'center' },
        8: { cellWidth: 10, halign: 'center' },
        9: { cellWidth: 18, halign: 'center' },
        10: { cellWidth: 10, halign: 'center' },
        11: { cellWidth: 16, halign: 'center' },
        12: { cellWidth: 10, halign: 'center' },
        13: { cellWidth: 15, halign: 'center' },
        14: { cellWidth: 10, halign: 'center' },
        15: { cellWidth: 18, halign: 'center' },
      },
      margin: { top: 30, left: 10, right: 10 },
    });

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Generate filename with date
    const filename = `Rekap_Habit_Tracker_${filters.semester}_${filters.tahun_ajaran}_${new Date().toISOString().split('T')[0]}.pdf`;

    // Download
    doc.save(filename);
  };

  const exportDetailToExcel = () => {
    if (rekapData.length === 0) {
      alert('Tidak ada data untuk di-export!');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Create sheet for each student
    rekapData.forEach((item, index) => {
      const studentData: any[] = [];

      // Header info
      studentData.push(['REKAP DETAIL HABIT TRACKER KEASRAMAAN']);
      studentData.push([]);
      studentData.push(['Nama Siswa', item.nama_siswa]);
      studentData.push(['NIS', item.nis]);
      studentData.push(['Kelas', item.kelas]);
      studentData.push(['Asrama', item.asrama]);
      studentData.push(['Cabang', item.cabang]);
      studentData.push(['Musyrif', item.musyrif]);
      studentData.push(['Kepala Asrama', item.kepala_asrama]);
      studentData.push(['Tahun Ajaran', item.tahun_ajaran]);
      studentData.push(['Semester', item.semester]);
      studentData.push([]);
      studentData.push(['Total Nilai', `${item.total_asrama} / 70`, 'Persentase', `${item.persentase_asrama}%`, 'Predikat', item.predikat]);
      studentData.push([]);

      // Ubudiyah
      studentData.push(['UBUDIYAH', `${item.total_ubudiyah} / 28`, `${item.persentase_ubudiyah}%`]);
      studentData.push(['Indikator', 'Nilai', 'Keterangan']);
      studentData.push(['Shalat Fardhu Berjamaah', `${Math.round(item.shalat_fardhu_berjamaah)} / 3`, getRubrikDesc('shalat_fardhu_berjamaah', item.shalat_fardhu_berjamaah)]);
      studentData.push(['Tata Cara Shalat', `${Math.round(item.tata_cara_shalat)} / 3`, getRubrikDesc('tata_cara_shalat', item.tata_cara_shalat)]);
      studentData.push(['Qiyamul Lail', `${Math.round(item.qiyamul_lail)} / 3`, getRubrikDesc('qiyamul_lail', item.qiyamul_lail)]);
      studentData.push(['Shalat Sunnah', `${Math.round(item.shalat_sunnah)} / 3`, getRubrikDesc('shalat_sunnah', item.shalat_sunnah)]);
      studentData.push(['Puasa Sunnah', `${Math.round(item.puasa_sunnah)} / 5`, getRubrikDesc('puasa_sunnah', item.puasa_sunnah)]);
      studentData.push(['Tata Cara Wudhu', `${Math.round(item.tata_cara_wudhu)} / 3`, getRubrikDesc('tata_cara_wudhu', item.tata_cara_wudhu)]);
      studentData.push(['Sedekah', `${Math.round(item.sedekah)} / 4`, getRubrikDesc('sedekah', item.sedekah)]);
      studentData.push(['Dzikir Pagi Petang', `${Math.round(item.dzikir_pagi_petang)} / 4`, getRubrikDesc('dzikir_pagi_petang', item.dzikir_pagi_petang)]);
      studentData.push([]);

      // Akhlaq
      studentData.push(['AKHLAQ', `${item.total_akhlaq} / 12`, `${item.persentase_akhlaq}%`]);
      studentData.push(['Indikator', 'Nilai', 'Keterangan']);
      studentData.push(['Etika Tutur Kata', `${Math.round(item.etika_dalam_tutur_kata)} / 3`, getRubrikDesc('etika_dalam_tutur_kata', item.etika_dalam_tutur_kata)]);
      studentData.push(['Etika Bergaul', `${Math.round(item.etika_dalam_bergaul)} / 3`, getRubrikDesc('etika_dalam_bergaul', item.etika_dalam_bergaul)]);
      studentData.push(['Etika Berpakaian', `${Math.round(item.etika_dalam_berpakaian)} / 3`, getRubrikDesc('etika_dalam_berpakaian', item.etika_dalam_berpakaian)]);
      studentData.push(['Adab Sehari-hari', `${Math.round(item.adab_sehari_hari)} / 3`, getRubrikDesc('adab_sehari_hari', item.adab_sehari_hari)]);
      studentData.push([]);

      // Kedisiplinan
      studentData.push(['KEDISIPLINAN', `${item.total_kedisiplinan} / 21`, `${item.persentase_kedisiplinan}%`]);
      studentData.push(['Indikator', 'Nilai', 'Keterangan']);
      studentData.push(['Waktu Tidur', `${Math.round(item.waktu_tidur)} / 4`, getRubrikDesc('waktu_tidur', item.waktu_tidur)]);
      studentData.push(['Piket Kamar', `${Math.round(item.pelaksanaan_piket_kamar)} / 3`, getRubrikDesc('pelaksanaan_piket_kamar', item.pelaksanaan_piket_kamar)]);
      studentData.push(['Halaqah Tahfidz', `${Math.round(item.disiplin_halaqah_tahfidz)} / 3`, getRubrikDesc('disiplin_halaqah_tahfidz', item.disiplin_halaqah_tahfidz)]);
      studentData.push(['Perizinan', `${Math.round(item.perizinan)} / 3`, getRubrikDesc('perizinan', item.perizinan)]);
      studentData.push(['Belajar Malam', `${Math.round(item.belajar_malam)} / 4`, getRubrikDesc('belajar_malam', item.belajar_malam)]);
      studentData.push(['Berangkat Masjid', `${Math.round(item.disiplin_berangkat_ke_masjid)} / 4`, getRubrikDesc('disiplin_berangkat_ke_masjid', item.disiplin_berangkat_ke_masjid)]);
      studentData.push([]);

      // Kebersihan
      studentData.push(['KEBERSIHAN & KERAPIAN', `${item.total_kebersihan} / 9`, `${item.persentase_kebersihan}%`]);
      studentData.push(['Indikator', 'Nilai', 'Keterangan']);
      studentData.push(['Kebersihan Tubuh', `${Math.round(item.kebersihan_tubuh_berpakaian_berpenampilan)} / 3`, getRubrikDesc('kebersihan_tubuh_berpakaian_berpenampilan', item.kebersihan_tubuh_berpakaian_berpenampilan)]);
      studentData.push(['Kamar', `${Math.round(item.kamar)} / 3`, getRubrikDesc('kamar', item.kamar)]);
      studentData.push(['Ranjang & Almari', `${Math.round(item.ranjang_dan_almari)} / 3`, getRubrikDesc('ranjang_dan_almari', item.ranjang_dan_almari)]);

      const ws = XLSX.utils.aoa_to_sheet(studentData);

      // Set column widths
      ws['!cols'] = [
        { wch: 30 }, // Indikator
        { wch: 12 }, // Nilai
        { wch: 100 }, // Keterangan
      ];

      // Add sheet with student name (max 31 chars for Excel)
      const sheetName = `${index + 1}_${item.nama_siswa}`.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    // Generate filename
    const filename = `Detail_Habit_Tracker_${filters.semester}_${filters.tahun_ajaran}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);
  };

  const exportDetailToPDF = () => {
    if (rekapData.length === 0) {
      alert('Tidak ada data untuk di-export!');
      return;
    }

    const doc = new jsPDF('portrait', 'mm', 'a4');

    rekapData.forEach((item, studentIndex) => {
      if (studentIndex > 0) {
        doc.addPage();
      }

      // Title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('REKAP DETAIL HABIT TRACKER KEASRAMAAN', 105, 15, { align: 'center' });

      // Student Info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let yPos = 25;
      doc.text(`Nama: ${item.nama_siswa}`, 15, yPos);
      yPos += 5;
      doc.text(`NIS: ${item.nis} | Kelas: ${item.kelas}`, 15, yPos);
      yPos += 5;
      doc.text(`Asrama: ${item.asrama} | Cabang: ${item.cabang}`, 15, yPos);
      yPos += 5;
      doc.text(`Musyrif: ${item.musyrif} | Kepala Asrama: ${item.kepala_asrama}`, 15, yPos);
      yPos += 5;
      doc.text(`Tahun Ajaran: ${item.tahun_ajaran} | Semester: ${item.semester}`, 15, yPos);
      yPos += 8;

      // Total Score
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: ${item.total_asrama} / 70 (${item.persentase_asrama}%) - Predikat: ${item.predikat}`, 15, yPos);
      yPos += 8;

      // Ubudiyah
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`UBUDIYAH: ${item.total_ubudiyah} / 28 (${item.persentase_ubudiyah}%)`, 15, yPos);
      yPos += 5;

      const ubudiyahData = [
        ['Shalat Fardhu Berjamaah', `${Math.round(item.shalat_fardhu_berjamaah)}/3`, getRubrikDesc('shalat_fardhu_berjamaah', item.shalat_fardhu_berjamaah)],
        ['Tata Cara Shalat', `${Math.round(item.tata_cara_shalat)}/3`, getRubrikDesc('tata_cara_shalat', item.tata_cara_shalat)],
        ['Qiyamul Lail', `${Math.round(item.qiyamul_lail)}/3`, getRubrikDesc('qiyamul_lail', item.qiyamul_lail)],
        ['Shalat Sunnah', `${Math.round(item.shalat_sunnah)}/3`, getRubrikDesc('shalat_sunnah', item.shalat_sunnah)],
        ['Puasa Sunnah', `${Math.round(item.puasa_sunnah)}/5`, getRubrikDesc('puasa_sunnah', item.puasa_sunnah)],
        ['Tata Cara Wudhu', `${Math.round(item.tata_cara_wudhu)}/3`, getRubrikDesc('tata_cara_wudhu', item.tata_cara_wudhu)],
        ['Sedekah', `${Math.round(item.sedekah)}/4`, getRubrikDesc('sedekah', item.sedekah)],
        ['Dzikir Pagi Petang', `${Math.round(item.dzikir_pagi_petang)}/4`, getRubrikDesc('dzikir_pagi_petang', item.dzikir_pagi_petang)],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Indikator', 'Nilai', 'Keterangan']],
        body: ubudiyahData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 15, halign: 'center' },
          2: { cellWidth: 120 },
        },
        margin: { left: 15, right: 15 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 5;

      // Akhlaq
      doc.setFont('helvetica', 'bold');
      doc.text(`AKHLAQ: ${item.total_akhlaq} / 12 (${item.persentase_akhlaq}%)`, 15, yPos);
      yPos += 5;

      const akhlaqData = [
        ['Etika Tutur Kata', `${Math.round(item.etika_dalam_tutur_kata)}/3`, getRubrikDesc('etika_dalam_tutur_kata', item.etika_dalam_tutur_kata)],
        ['Etika Bergaul', `${Math.round(item.etika_dalam_bergaul)}/3`, getRubrikDesc('etika_dalam_bergaul', item.etika_dalam_bergaul)],
        ['Etika Berpakaian', `${Math.round(item.etika_dalam_berpakaian)}/3`, getRubrikDesc('etika_dalam_berpakaian', item.etika_dalam_berpakaian)],
        ['Adab Sehari-hari', `${Math.round(item.adab_sehari_hari)}/3`, getRubrikDesc('adab_sehari_hari', item.adab_sehari_hari)],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Indikator', 'Nilai', 'Keterangan']],
        body: akhlaqData,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94], fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 15, halign: 'center' },
          2: { cellWidth: 120 },
        },
        margin: { left: 15, right: 15 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 5;

      // Check if need new page
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      // Kedisiplinan
      doc.setFont('helvetica', 'bold');
      doc.text(`KEDISIPLINAN: ${item.total_kedisiplinan} / 21 (${item.persentase_kedisiplinan}%)`, 15, yPos);
      yPos += 5;

      const kedisiplinanData = [
        ['Waktu Tidur', `${Math.round(item.waktu_tidur)}/4`, getRubrikDesc('waktu_tidur', item.waktu_tidur)],
        ['Piket Kamar', `${Math.round(item.pelaksanaan_piket_kamar)}/3`, getRubrikDesc('pelaksanaan_piket_kamar', item.pelaksanaan_piket_kamar)],
        ['Halaqah Tahfidz', `${Math.round(item.disiplin_halaqah_tahfidz)}/3`, getRubrikDesc('disiplin_halaqah_tahfidz', item.disiplin_halaqah_tahfidz)],
        ['Perizinan', `${Math.round(item.perizinan)}/3`, getRubrikDesc('perizinan', item.perizinan)],
        ['Belajar Malam', `${Math.round(item.belajar_malam)}/4`, getRubrikDesc('belajar_malam', item.belajar_malam)],
        ['Berangkat Masjid', `${Math.round(item.disiplin_berangkat_ke_masjid)}/4`, getRubrikDesc('disiplin_berangkat_ke_masjid', item.disiplin_berangkat_ke_masjid)],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Indikator', 'Nilai', 'Keterangan']],
        body: kedisiplinanData,
        theme: 'grid',
        headStyles: { fillColor: [249, 115, 22], fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 15, halign: 'center' },
          2: { cellWidth: 120 },
        },
        margin: { left: 15, right: 15 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 5;

      // Kebersihan
      doc.setFont('helvetica', 'bold');
      doc.text(`KEBERSIHAN & KERAPIAN: ${item.total_kebersihan} / 9 (${item.persentase_kebersihan}%)`, 15, yPos);
      yPos += 5;

      const kebersihanData = [
        ['Kebersihan Tubuh', `${Math.round(item.kebersihan_tubuh_berpakaian_berpenampilan)}/3`, getRubrikDesc('kebersihan_tubuh_berpakaian_berpenampilan', item.kebersihan_tubuh_berpakaian_berpenampilan)],
        ['Kamar', `${Math.round(item.kamar)}/3`, getRubrikDesc('kamar', item.kamar)],
        ['Ranjang & Almari', `${Math.round(item.ranjang_dan_almari)}/3`, getRubrikDesc('ranjang_dan_almari', item.ranjang_dan_almari)],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Indikator', 'Nilai', 'Keterangan']],
        body: kebersihanData,
        theme: 'grid',
        headStyles: { fillColor: [168, 85, 247], fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 15, halign: 'center' },
          2: { cellWidth: 120 },
        },
        margin: { left: 15, right: 15 },
      });

      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Halaman ${studentIndex + 1} dari ${rekapData.length}`, 105, 285, { align: 'center' });
    });

    // Generate filename
    const filename = `Detail_Habit_Tracker_${filters.semester}_${filters.tahun_ajaran}_${new Date().toISOString().split('T')[0]}.pdf`;

    // Download
    doc.save(filename);
  };


  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Rekap Habit Tracker</h1>
                <p className="text-sm sm:text-base text-gray-600">Laporan dan analisis habit tracker siswa</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Filter Data</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {/* 1. Tahun Ajaran */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun Ajaran <span className="text-red-500">*</span>
                </label>
                <select
                  value={filters.tahun_ajaran}
                  onChange={(e) => setFilters({ ...filters, tahun_ajaran: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Pilih Tahun Ajaran</option>
                  {tahunAjaranList.map((ta) => (
                    <option key={ta.id} value={ta.tahun_ajaran}>
                      {ta.tahun_ajaran}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  value={filters.semester}
                  onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Pilih Semester</option>
                  {semesterList.map((sem) => (
                    <option key={sem.id} value={sem.semester}>
                      {sem.semester}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Cabang */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cabang</label>
                <select
                  value={filters.cabang}
                  onChange={(e) => setFilters({ ...filters, cabang: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Semua Cabang</option>
                  {cabangList.map((lok) => (
                    <option key={lok.id} value={lok.nama_cabang}>
                      {lok.nama_cabang}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Kelas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                <select
                  value={filters.kelas}
                  onChange={(e) => setFilters({ ...filters, kelas: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!filters.cabang}
                >
                  <option value="">{filters.cabang ? 'Semua Kelas' : 'Pilih Cabang Dulu'}</option>
                  {filteredKelasList.map((kls) => (
                    <option key={kls.id} value={kls.nama_kelas}>
                      {kls.nama_kelas}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Asrama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asrama</label>
                <select
                  value={filters.asrama}
                  onChange={(e) => setFilters({ ...filters, asrama: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!filters.cabang || !filters.kelas}
                >
                  <option value="">
                    {!filters.cabang ? 'Pilih Cabang Dulu' : !filters.kelas ? 'Pilih Kelas Dulu' : 'Semua Asrama'}
                  </option>
                  {filteredAsramaList.map((asr) => (
                    <option key={asr.id} value={asr.nama_asrama}>
                      {asr.nama_asrama}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. Musyrif/ah */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Musyrif/ah</label>
                <select
                  value={filters.musyrif}
                  onChange={(e) => setFilters({ ...filters, musyrif: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!filters.cabang || !filters.kelas || !filters.asrama}
                >
                  <option value="">
                    {!filters.cabang ? 'Pilih Cabang Dulu' :
                      !filters.kelas ? 'Pilih Kelas Dulu' :
                        !filters.asrama ? 'Pilih Asrama Dulu' : 'Semua Musyrif/ah'}
                  </option>
                  {filteredMusyrifList.map((mus) => (
                    <option key={mus.id} value={mus.nama_musyrif}>
                      {mus.nama_musyrif}
                    </option>
                  ))}
                </select>
              </div>

              {/* 7. Tanggal Mulai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                <input
                  type="date"
                  value={filters.tanggal_mulai}
                  onChange={(e) => setFilters({ ...filters, tanggal_mulai: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* 8. Tanggal Akhir */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
                <input
                  type="date"
                  value={filters.tanggal_akhir}
                  onChange={(e) => setFilters({ ...filters, tanggal_akhir: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={calculateRekap}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                <Filter className="w-5 h-5" />
                {loading ? 'Memproses...' : 'Tampilkan Rekap'}
              </button>

              {rekapData.length > 0 && (
                <>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg transition-all text-sm sm:text-base"
                  >
                    <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Export Excel</span>
                    <span className="sm:hidden">Excel</span>
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg transition-all text-sm sm:text-base"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Export PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memproses data rekap...</p>
            </div>
          ) : rekapData.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-md">
              <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
                <h3 className="text-lg font-semibold">
                  Hasil Rekap: {rekapData.length} Siswa
                </h3>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 overflow-x-auto">
                <div className="flex items-center justify-between min-w-max">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('ringkasan')}
                      className={`px-4 sm:px-6 py-2.5 sm:py-3 font-semibold transition-all text-sm sm:text-base ${activeTab === 'ringkasan'
                        ? 'border-b-2 border-green-500 text-green-600 bg-green-50'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                    >
                      📊 Ringkasan
                    </button>
                    <button
                      onClick={() => setActiveTab('detail')}
                      className={`px-6 py-3 font-semibold transition-all ${activeTab === 'detail'
                        ? 'border-b-2 border-green-500 text-green-600 bg-green-50'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                    >
                      📋 Detail Kategori
                    </button>
                  </div>
                  {/* Export buttons for Detail Kategori */}
                  {activeTab === 'detail' && (
                    <div className="flex gap-2 px-4">
                      <button
                        onClick={exportDetailToExcel}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Excel Detail
                      </button>
                      <button
                        onClick={exportDetailToPDF}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                      >
                        <Download className="w-4 h-4" />
                        PDF Detail
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {activeTab === 'ringkasan' ? (
                <>
                  {/* Container dengan scroll hanya untuk tabel */}
                  <div className="overflow-x-auto rounded-b-2xl">
                    <table className="w-full text-sm" style={{ minWidth: '5000px' }}>
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-5 py-4 text-left font-semibold text-gray-700 border-b whitespace-nowrap" style={{ minWidth: '60px' }}>No</th>
                          <th className="px-5 py-4 text-left font-semibold text-gray-700 border-b whitespace-nowrap" style={{ minWidth: '220px' }}>Nama Siswa</th>
                          <th className="px-5 py-4 text-left font-semibold text-gray-700 border-b whitespace-nowrap" style={{ minWidth: '140px' }}>NIS</th>
                          <th className="px-5 py-4 text-center font-semibold text-gray-700 border-b whitespace-nowrap" style={{ minWidth: '80px' }}>Kelas</th>
                          <th className="px-5 py-4 text-left font-semibold text-gray-700 border-b whitespace-nowrap" style={{ minWidth: '180px' }}>Asrama</th>
                          <th className="px-5 py-4 text-center font-semibold text-gray-700 border-b whitespace-nowrap" style={{ minWidth: '120px' }}>Cabang</th>
                          <th className="px-5 py-4 text-left font-semibold text-gray-700 border-b whitespace-nowrap" style={{ minWidth: '180px' }}>Musyrif/ah</th>
                          <th className="px-5 py-4 text-left font-semibold text-gray-700 border-b whitespace-nowrap" style={{ minWidth: '180px' }}>Kepala Asrama</th>
                          <th className="px-5 py-4 text-center font-semibold text-gray-700 border-b whitespace-nowrap" style={{ minWidth: '120px' }}>Tahun Ajaran</th>
                          <th className="px-5 py-4 text-center font-semibold text-gray-700 border-b whitespace-nowrap" style={{ minWidth: '100px' }}>Semester</th>

                          {/* Ubudiyah Detail Columns */}
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-blue-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Shalat Fardhu Berjamaah</th>
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-blue-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Tata Cara Shalat</th>
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-blue-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Qiyamul Lail</th>
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-blue-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Shalat Sunnah</th>
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-blue-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Puasa Sunnah</th>
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-blue-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Tata Cara Wudhu</th>
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-blue-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Sedekah</th>
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-blue-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Dzikir Pagi Petang</th>
                          <th className="px-5 py-4 text-center font-semibold text-gray-700 border-b bg-blue-100 whitespace-nowrap" style={{ minWidth: '140px' }}>Total Ubudiyah</th>
                          <th className="px-5 py-4 text-center font-semibold text-gray-700 border-b bg-blue-100 whitespace-nowrap" style={{ minWidth: '120px' }}>% Ubudiyah</th>

                          {/* Akhlaq Detail Columns */}
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-green-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Etika Tutur Kata</th>
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-green-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Etika Bergaul</th>
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-green-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Etika Berpakaian</th>
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-green-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Adab Sehari-hari</th>
                          <th className="px-5 py-4 text-center font-semibold text-gray-700 border-b bg-green-100 whitespace-nowrap" style={{ minWidth: '130px' }}>Total Akhlaq</th>
                          <th className="px-5 py-4 text-center font-semibold text-gray-700 border-b bg-green-100 whitespace-nowrap" style={{ minWidth: '110px' }}>% Akhlaq</th>

                          {/* Kedisiplinan Detail Columns */}
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-orange-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Waktu Tidur</th>
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-orange-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Piket Kamar</th>
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-orange-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Halaqah Tahfidz</th>
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-orange-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Perizinan</th>
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-orange-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Belajar Malam</th>
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-orange-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Berangkat Masjid</th>
                          <th className="px-5 py-4 text-center font-semibold text-gray-700 border-b bg-orange-100 whitespace-nowrap" style={{ minWidth: '160px' }}>Total Kedisiplinan</th>
                          <th className="px-5 py-4 text-center font-semibold text-gray-700 border-b bg-orange-100 whitespace-nowrap" style={{ minWidth: '140px' }}>% Kedisiplinan</th>

                          {/* Kebersihan Detail Columns */}
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-purple-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Kebersihan Tubuh</th>
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-purple-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Kamar</th>
                          <th className="px-3 py-4 text-center font-semibold text-gray-700 border-b bg-purple-50 whitespace-nowrap text-xs" style={{ minWidth: '100px' }}>Ranjang & Almari</th>
                          <th className="px-5 py-4 text-center font-semibold text-gray-700 border-b bg-purple-100 whitespace-nowrap" style={{ minWidth: '150px' }}>Total Kebersihan</th>
                          <th className="px-5 py-4 text-center font-semibold text-gray-700 border-b bg-purple-100 whitespace-nowrap" style={{ minWidth: '130px' }}>% Kebersihan</th>

                          <th className="px-5 py-4 text-center font-semibold text-gray-700 border-b bg-yellow-50 whitespace-nowrap" style={{ minWidth: '140px' }}>Total Asrama</th>
                          <th className="px-5 py-4 text-center font-semibold text-gray-700 border-b bg-yellow-50 whitespace-nowrap" style={{ minWidth: '120px' }}>% Asrama</th>
                          <th className="px-5 py-4 text-center font-semibold text-gray-700 border-b bg-red-50 whitespace-nowrap" style={{ minWidth: '130px' }}>Predikat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rekapData.map((item, index) => (
                          <tr key={item.nis} className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                            <td className="px-5 py-4 text-gray-700 border-b text-center">{index + 1}</td>
                            <td className="px-5 py-4 text-gray-800 font-medium border-b">{item.nama_siswa}</td>
                            <td className="px-5 py-4 text-gray-700 border-b font-mono text-sm">{item.nis}</td>
                            <td className="px-5 py-4 text-gray-700 border-b text-center">{item.kelas}</td>
                            <td className="px-5 py-4 text-gray-700 border-b">{item.asrama}</td>
                            <td className="px-5 py-4 text-gray-700 border-b text-center">{item.cabang}</td>
                            <td className="px-5 py-4 text-gray-700 border-b">{item.musyrif}</td>
                            <td className="px-5 py-4 text-gray-700 border-b">{item.kepala_asrama}</td>
                            <td className="px-5 py-4 text-gray-700 border-b text-center">{item.tahun_ajaran}</td>
                            <td className="px-5 py-4 text-gray-700 border-b text-center">{item.semester}</td>

                            {/* Ubudiyah Detail Values */}
                            <td className="px-3 py-4 text-center border-b bg-blue-50 text-xs" title={getRubrikDesc('shalat_fardhu_berjamaah', item.shalat_fardhu_berjamaah)}>{Math.round(item.shalat_fardhu_berjamaah)}</td>
                            <td className="px-3 py-4 text-center border-b bg-blue-50 text-xs" title={getRubrikDesc('tata_cara_shalat', item.tata_cara_shalat)}>{Math.round(item.tata_cara_shalat)}</td>
                            <td className="px-3 py-4 text-center border-b bg-blue-50 text-xs" title={getRubrikDesc('qiyamul_lail', item.qiyamul_lail)}>{Math.round(item.qiyamul_lail)}</td>
                            <td className="px-3 py-4 text-center border-b bg-blue-50 text-xs" title={getRubrikDesc('shalat_sunnah', item.shalat_sunnah)}>{Math.round(item.shalat_sunnah)}</td>
                            <td className="px-3 py-4 text-center border-b bg-blue-50 text-xs" title={getRubrikDesc('puasa_sunnah', item.puasa_sunnah)}>{Math.round(item.puasa_sunnah)}</td>
                            <td className="px-3 py-4 text-center border-b bg-blue-50 text-xs" title={getRubrikDesc('tata_cara_wudhu', item.tata_cara_wudhu)}>{Math.round(item.tata_cara_wudhu)}</td>
                            <td className="px-3 py-4 text-center border-b bg-blue-50 text-xs" title={getRubrikDesc('sedekah', item.sedekah)}>{Math.round(item.sedekah)}</td>
                            <td className="px-3 py-4 text-center border-b bg-blue-50 text-xs" title={getRubrikDesc('dzikir_pagi_petang', item.dzikir_pagi_petang)}>{Math.round(item.dzikir_pagi_petang)}</td>
                            <td className="px-5 py-4 text-center border-b bg-blue-100 font-semibold text-blue-700">{item.total_ubudiyah} / 28</td>
                            <td className="px-5 py-4 text-center border-b bg-blue-100 text-blue-600">{item.persentase_ubudiyah}%</td>

                            {/* Akhlaq Detail Values */}
                            <td className="px-3 py-4 text-center border-b bg-green-50 text-xs" title={getRubrikDesc('etika_dalam_tutur_kata', item.etika_dalam_tutur_kata)}>{Math.round(item.etika_dalam_tutur_kata)}</td>
                            <td className="px-3 py-4 text-center border-b bg-green-50 text-xs" title={getRubrikDesc('etika_dalam_bergaul', item.etika_dalam_bergaul)}>{Math.round(item.etika_dalam_bergaul)}</td>
                            <td className="px-3 py-4 text-center border-b bg-green-50 text-xs" title={getRubrikDesc('etika_dalam_berpakaian', item.etika_dalam_berpakaian)}>{Math.round(item.etika_dalam_berpakaian)}</td>
                            <td className="px-3 py-4 text-center border-b bg-green-50 text-xs" title={getRubrikDesc('adab_sehari_hari', item.adab_sehari_hari)}>{Math.round(item.adab_sehari_hari)}</td>
                            <td className="px-5 py-4 text-center border-b bg-green-100 font-semibold text-green-700">{item.total_akhlaq} / 12</td>
                            <td className="px-5 py-4 text-center border-b bg-green-100 text-green-600">{item.persentase_akhlaq}%</td>

                            {/* Kedisiplinan Detail Values */}
                            <td className="px-3 py-4 text-center border-b bg-orange-50 text-xs" title={getRubrikDesc('waktu_tidur', item.waktu_tidur)}>{Math.round(item.waktu_tidur)}</td>
                            <td className="px-3 py-4 text-center border-b bg-orange-50 text-xs" title={getRubrikDesc('pelaksanaan_piket_kamar', item.pelaksanaan_piket_kamar)}>{Math.round(item.pelaksanaan_piket_kamar)}</td>
                            <td className="px-3 py-4 text-center border-b bg-orange-50 text-xs" title={getRubrikDesc('disiplin_halaqah_tahfidz', item.disiplin_halaqah_tahfidz)}>{Math.round(item.disiplin_halaqah_tahfidz)}</td>
                            <td className="px-3 py-4 text-center border-b bg-orange-50 text-xs" title={getRubrikDesc('perizinan', item.perizinan)}>{Math.round(item.perizinan)}</td>
                            <td className="px-3 py-4 text-center border-b bg-orange-50 text-xs" title={getRubrikDesc('belajar_malam', item.belajar_malam)}>{Math.round(item.belajar_malam)}</td>
                            <td className="px-3 py-4 text-center border-b bg-orange-50 text-xs" title={getRubrikDesc('disiplin_berangkat_ke_masjid', item.disiplin_berangkat_ke_masjid)}>{Math.round(item.disiplin_berangkat_ke_masjid)}</td>
                            <td className="px-5 py-4 text-center border-b bg-orange-100 font-semibold text-orange-700">{item.total_kedisiplinan} / 21</td>
                            <td className="px-5 py-4 text-center border-b bg-orange-100 text-orange-600">{item.persentase_kedisiplinan}%</td>

                            {/* Kebersihan Detail Values */}
                            <td className="px-3 py-4 text-center border-b bg-purple-50 text-xs" title={getRubrikDesc('kebersihan_tubuh_berpakaian_berpenampilan', item.kebersihan_tubuh_berpakaian_berpenampilan)}>{Math.round(item.kebersihan_tubuh_berpakaian_berpenampilan)}</td>
                            <td className="px-3 py-4 text-center border-b bg-purple-50 text-xs" title={getRubrikDesc('kamar', item.kamar)}>{Math.round(item.kamar)}</td>
                            <td className="px-3 py-4 text-center border-b bg-purple-50 text-xs" title={getRubrikDesc('ranjang_dan_almari', item.ranjang_dan_almari)}>{Math.round(item.ranjang_dan_almari)}</td>
                            <td className="px-5 py-4 text-center border-b bg-purple-100 font-semibold text-purple-700">{item.total_kebersihan} / 9</td>
                            <td className="px-5 py-4 text-center border-b bg-purple-100 text-purple-600">{item.persentase_kebersihan}%</td>

                            <td className="px-5 py-4 text-center border-b bg-yellow-50 font-bold text-lg text-yellow-700">{item.total_asrama} / 70</td>
                            <td className="px-5 py-4 text-center border-b bg-yellow-50 font-semibold text-yellow-600">{item.persentase_asrama}%</td>
                            <td className="px-5 py-4 text-center border-b bg-red-50">
                              <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${item.predikat === 'Mumtaz' ? 'bg-green-500 text-white' :
                                item.predikat === 'Jayyid Jiddan' ? 'bg-blue-500 text-white' :
                                  item.predikat === 'Jayyid' ? 'bg-yellow-500 text-white' :
                                    item.predikat === 'Dhaif' ? 'bg-orange-500 text-white' :
                                      'bg-red-500 text-white'
                                }`}>
                                {item.predikat}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                /* Tab Detail Kategori */
                <div className="p-4">
                  {rekapData.map((item, index) => (
                    <div key={item.nis} className="mb-6 border border-gray-200 rounded-xl overflow-hidden">
                      {/* Student Header */}
                      <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Foto Siswa */}
                            <FotoSiswa foto={item.foto || ''} nama={item.nama_siswa} />
                            {/* Info Siswa */}
                            <div>
                              <h3 className="text-lg font-bold text-gray-800">{index + 1}. {item.nama_siswa}</h3>
                              <p className="text-sm text-gray-600">NIS: {item.nis} | Kelas: {item.kelas} | Asrama: {item.asrama}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-800">{item.total_asrama} / 70</div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${item.predikat === 'Mumtaz' ? 'bg-green-500 text-white' :
                              item.predikat === 'Jayyid Jiddan' ? 'bg-blue-500 text-white' :
                                item.predikat === 'Jayyid' ? 'bg-yellow-500 text-white' :
                                  item.predikat === 'Dhaif' ? 'bg-orange-500 text-white' :
                                    'bg-red-500 text-white'
                              }`}>
                              {item.predikat}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Categories */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                        {/* Ubudiyah */}
                        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                          <h4 className="font-bold text-blue-700 mb-3 flex items-center justify-between">
                            <span>🕌 Ubudiyah</span>
                            <span className="text-sm">{item.total_ubudiyah} / 28 ({item.persentase_ubudiyah}%)</span>
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Shalat Fardhu Berjamaah:</span>
                                <strong className="text-blue-700">{Math.round(item.shalat_fardhu_berjamaah)} / 3</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('shalat_fardhu_berjamaah', item.shalat_fardhu_berjamaah)}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Tata Cara Shalat:</span>
                                <strong className="text-blue-700">{Math.round(item.tata_cara_shalat)} / 3</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('tata_cara_shalat', item.tata_cara_shalat)}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Qiyamul Lail:</span>
                                <strong className="text-blue-700">{Math.round(item.qiyamul_lail)} / 3</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('qiyamul_lail', item.qiyamul_lail)}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Shalat Sunnah:</span>
                                <strong className="text-blue-700">{Math.round(item.shalat_sunnah)} / 3</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('shalat_sunnah', item.shalat_sunnah)}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Puasa Sunnah:</span>
                                <strong className="text-blue-700">{Math.round(item.puasa_sunnah)} / 5</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('puasa_sunnah', item.puasa_sunnah)}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Tata Cara Wudhu:</span>
                                <strong className="text-blue-700">{Math.round(item.tata_cara_wudhu)} / 3</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('tata_cara_wudhu', item.tata_cara_wudhu)}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Sedekah:</span>
                                <strong className="text-blue-700">{Math.round(item.sedekah)} / 4</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('sedekah', item.sedekah)}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Dzikir Pagi Petang:</span>
                                <strong className="text-blue-700">{Math.round(item.dzikir_pagi_petang)} / 4</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('dzikir_pagi_petang', item.dzikir_pagi_petang)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Akhlaq */}
                        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                          <h4 className="font-bold text-green-700 mb-3 flex items-center justify-between">
                            <span>💚 Akhlaq</span>
                            <span className="text-sm">{item.total_akhlaq} / 12 ({item.persentase_akhlaq}%)</span>
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Etika Tutur Kata:</span>
                                <strong className="text-green-700">{Math.round(item.etika_dalam_tutur_kata)} / 3</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('etika_dalam_tutur_kata', item.etika_dalam_tutur_kata)}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Etika Bergaul:</span>
                                <strong className="text-green-700">{Math.round(item.etika_dalam_bergaul)} / 3</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('etika_dalam_bergaul', item.etika_dalam_bergaul)}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Etika Berpakaian:</span>
                                <strong className="text-green-700">{Math.round(item.etika_dalam_berpakaian)} / 3</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('etika_dalam_berpakaian', item.etika_dalam_berpakaian)}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Adab Sehari-hari:</span>
                                <strong className="text-green-700">{Math.round(item.adab_sehari_hari)} / 3</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('adab_sehari_hari', item.adab_sehari_hari)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Kedisiplinan */}
                        <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                          <h4 className="font-bold text-orange-700 mb-3 flex items-center justify-between">
                            <span>⏰ Kedisiplinan</span>
                            <span className="text-sm">{item.total_kedisiplinan} / 21 ({item.persentase_kedisiplinan}%)</span>
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Waktu Tidur:</span>
                                <strong className="text-orange-700">{Math.round(item.waktu_tidur)} / 4</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('waktu_tidur', item.waktu_tidur)}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Piket Kamar:</span>
                                <strong className="text-orange-700">{Math.round(item.pelaksanaan_piket_kamar)} / 3</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('pelaksanaan_piket_kamar', item.pelaksanaan_piket_kamar)}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Halaqah Tahfidz:</span>
                                <strong className="text-orange-700">{Math.round(item.disiplin_halaqah_tahfidz)} / 3</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('disiplin_halaqah_tahfidz', item.disiplin_halaqah_tahfidz)}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Perizinan:</span>
                                <strong className="text-orange-700">{Math.round(item.perizinan)} / 3</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('perizinan', item.perizinan)}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Belajar Malam:</span>
                                <strong className="text-orange-700">{Math.round(item.belajar_malam)} / 4</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('belajar_malam', item.belajar_malam)}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Berangkat Masjid:</span>
                                <strong className="text-orange-700">{Math.round(item.disiplin_berangkat_ke_masjid)} / 4</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('disiplin_berangkat_ke_masjid', item.disiplin_berangkat_ke_masjid)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Kebersihan */}
                        <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                          <h4 className="font-bold text-purple-700 mb-3 flex items-center justify-between">
                            <span>✨ Kebersihan & Kerapian</span>
                            <span className="text-sm">{item.total_kebersihan} / 9 ({item.persentase_kebersihan}%)</span>
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Kebersihan Tubuh:</span>
                                <strong className="text-purple-700">{Math.round(item.kebersihan_tubuh_berpakaian_berpenampilan)} / 3</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('kebersihan_tubuh_berpakaian_berpenampilan', item.kebersihan_tubuh_berpakaian_berpenampilan)}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Kamar:</span>
                                <strong className="text-purple-700">{Math.round(item.kamar)} / 3</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('kamar', item.kamar)}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Ranjang & Almari:</span>
                                <strong className="text-purple-700">{Math.round(item.ranjang_dan_almari)} / 3</strong>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{getRubrikDesc('ranjang_dan_almari', item.ranjang_dan_almari)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p>Pilih filter dan klik "Tampilkan Rekap" untuk melihat data</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
