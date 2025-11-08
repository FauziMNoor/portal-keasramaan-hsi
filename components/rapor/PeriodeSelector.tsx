'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export interface PeriodeValue {
  tahunAjaran: string;
  semester: string;
  bulan?: string;
}

interface PeriodeSelectorProps {
  value: PeriodeValue;
  onChange: (value: PeriodeValue) => void;
  showBulan?: boolean;
  disabled?: boolean;
}

interface TahunAjaran {
  id: string;
  tahun_ajaran: string;
  status: string;
}

interface Semester {
  id: string;
  semester: string;
  status: string;
}

export default function PeriodeSelector({
  value,
  onChange,
  showBulan = false,
  disabled = false,
}: PeriodeSelectorProps) {
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [semesterList, setSemesterList] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPeriode();
  }, []);

  const fetchPeriode = async () => {
    setLoading(true);
    try {
      const [tahunRes, semesterRes] = await Promise.all([
        fetch('/api/master/tahun-ajaran?status=aktif'),
        fetch('/api/master/semester?status=aktif'),
      ]);

      const tahunData = await tahunRes.json();
      const semesterData = await semesterRes.json();

      if (tahunData.success) {
        setTahunAjaranList(tahunData.data || []);
        // Set default to first active if not already set
        if (tahunData.data && tahunData.data.length > 0 && !value.tahunAjaran) {
          onChange({
            ...value,
            tahunAjaran: tahunData.data[0].tahun_ajaran,
          });
        }
      }

      if (semesterData.success) {
        setSemesterList(semesterData.data || []);
        // Set default to first active if not already set
        if (semesterData.data && semesterData.data.length > 0 && !value.semester) {
          onChange({
            ...value,
            semester: semesterData.data[0].semester,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching periode:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTahunAjaranChange = (tahunAjaran: string) => {
    onChange({
      ...value,
      tahunAjaran,
    });
  };

  const handleSemesterChange = (semester: string) => {
    onChange({
      ...value,
      semester,
    });
  };

  const handleBulanChange = (bulan: string) => {
    onChange({
      ...value,
      bulan,
    });
  };

  const bulanOptions = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-5 h-5 text-gray-600" />
        <label className="text-sm font-semibold text-gray-700">
          Periode Rapor <span className="text-red-500">*</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tahun Ajaran */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tahun Ajaran <span className="text-red-500">*</span>
          </label>
          <select
            value={value.tahunAjaran}
            onChange={(e) => handleTahunAjaranChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            disabled={disabled || loading}
          >
            <option value="">-- Pilih Tahun Ajaran --</option>
            {tahunAjaranList.map((ta) => (
              <option key={ta.id} value={ta.tahun_ajaran}>
                {ta.tahun_ajaran}
              </option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Semester <span className="text-red-500">*</span>
          </label>
          <select
            value={value.semester}
            onChange={(e) => handleSemesterChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            disabled={disabled || loading}
          >
            <option value="">-- Pilih Semester --</option>
            {semesterList.map((sem) => (
              <option key={sem.id} value={sem.semester}>
                Semester {sem.semester}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulan (Optional) */}
      {showBulan && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bulan (Opsional)
          </label>
          <select
            value={value.bulan || ''}
            onChange={(e) => handleBulanChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            disabled={disabled || loading}
          >
            <option value="">-- Semua Bulan --</option>
            {bulanOptions.map((bulan) => (
              <option key={bulan.value} value={bulan.value}>
                {bulan.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Pilih bulan untuk rapor bulanan (kosongkan untuk rapor semester)
          </p>
        </div>
      )}

      {/* Selected Periode Display */}
      {value.tahunAjaran && value.semester && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Periode:</strong> {value.tahunAjaran} - Semester {value.semester}
            {value.bulan && ` - ${bulanOptions.find((b) => b.value === value.bulan)?.label}`}
          </p>
        </div>
      )}
    </div>
  );
}
