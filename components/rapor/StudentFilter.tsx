'use client';

import { useState, useEffect } from 'react';
import { User, Users, Search, X } from 'lucide-react';

export interface StudentFilterMode {
  type: 'single' | 'bulk';
}

export interface StudentFilterValue {
  mode: 'single' | 'bulk';
  singleNIS?: string;
  bulkNISList?: string[];
  filters?: {
    kelas?: string;
    asrama?: string;
    cabang?: string;
  };
}

interface Student {
  id: string;
  nis: string;
  nama_siswa: string;
  kelas: string;
  asrama: string;
  cabang: string;
}

interface StudentFilterProps {
  value: StudentFilterValue;
  onChange: (value: StudentFilterValue) => void;
  disabled?: boolean;
}

export default function StudentFilter({ value, onChange, disabled = false }: StudentFilterProps) {
  const [mode, setMode] = useState<'single' | 'bulk'>(value.mode);
  const [singleNIS, setSingleNIS] = useState(value.singleNIS || '');
  const [bulkNISText, setBulkNISText] = useState(
    value.bulkNISList?.join('\n') || ''
  );
  
  // Bulk mode with filters
  const [showFilters, setShowFilters] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterAsrama, setFilterAsrama] = useState('');
  const [filterCabang, setFilterCabang] = useState('');
  
  const [kelasList, setKelasList] = useState<string[]>([]);
  const [asramaList, setAsramaList] = useState<string[]>([]);
  const [cabangList, setCabangList] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);

  // Update parent when mode changes
  useEffect(() => {
    if (mode === 'single') {
      onChange({
        mode: 'single',
        singleNIS,
      });
    } else {
      const nisList = bulkNISText
        .split('\n')
        .map((n) => n.trim())
        .filter((n) => n);
      onChange({
        mode: 'bulk',
        bulkNISList: nisList,
      });
    }
  }, [mode, singleNIS, bulkNISText]);

  // Fetch students when filters are shown
  useEffect(() => {
    if (showFilters) {
      fetchStudents();
      fetchFilterOptions();
    }
  }, [showFilters, searchQuery, filterKelas, filterAsrama, filterCabang]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterKelas) params.append('kelas', filterKelas);
      if (filterAsrama) params.append('asrama', filterAsrama);
      if (filterCabang) params.append('cabang', filterCabang);

      const res = await fetch(`/api/siswa?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const res = await fetch('/api/siswa');
      const data = await res.json();
      if (data.success && data.data) {
        const allStudents = data.data as Student[];
        
        // Extract unique values
        const kelasSet = new Set(allStudents.map((s) => s.kelas).filter(Boolean));
        const asramaSet = new Set(allStudents.map((s) => s.asrama).filter(Boolean));
        const cabangSet = new Set(allStudents.map((s) => s.cabang).filter(Boolean));
        
        setKelasList(Array.from(kelasSet).sort());
        setAsramaList(Array.from(asramaSet).sort());
        setCabangList(Array.from(cabangSet).sort());
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleModeChange = (newMode: 'single' | 'bulk') => {
    setMode(newMode);
    setShowFilters(false);
    setSelectedStudents(new Set());
  };

  const handleToggleStudent = (nis: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(nis)) {
      newSelected.delete(nis);
    } else {
      newSelected.add(nis);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map((s) => s.nis)));
    }
  };

  const handleApplySelection = () => {
    const nisList = Array.from(selectedStudents);
    setBulkNISText(nisList.join('\n'));
    setShowFilters(false);
  };

  const selectedCount = mode === 'bulk' 
    ? bulkNISText.split('\n').filter((n) => n.trim()).length 
    : singleNIS.trim() ? 1 : 0;

  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Mode Pemilihan Siswa <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => handleModeChange('single')}
            disabled={disabled}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              mode === 'single'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <User className="w-5 h-5 inline mr-2" />
            Single Siswa
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('bulk')}
            disabled={disabled}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              mode === 'bulk'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Bulk (Multiple Siswa)
          </button>
        </div>
      </div>

      {/* Single Mode Input */}
      {mode === 'single' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            NIS Siswa <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={singleNIS}
            onChange={(e) => setSingleNIS(e.target.value)}
            placeholder="Masukkan NIS siswa"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            disabled={disabled}
          />
        </div>
      )}

      {/* Bulk Mode Input */}
      {mode === 'bulk' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700">
              Daftar NIS Siswa <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              disabled={disabled}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showFilters ? 'Tutup Filter' : 'Pilih dengan Filter'}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4 border-2 border-gray-200">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari Siswa
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama atau NIS..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelas
                  </label>
                  <select
                    value={filterKelas}
                    onChange={(e) => setFilterKelas(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Semua Kelas</option>
                    {kelasList.map((kelas) => (
                      <option key={kelas} value={kelas}>
                        {kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asrama
                  </label>
                  <select
                    value={filterAsrama}
                    onChange={(e) => setFilterAsrama(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Semua Asrama</option>
                    {asramaList.map((asrama) => (
                      <option key={asrama} value={asrama}>
                        {asrama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cabang
                  </label>
                  <select
                    value={filterCabang}
                    onChange={(e) => setFilterCabang(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Semua Cabang</option>
                    {cabangList.map((cabang) => (
                      <option key={cabang} value={cabang}>
                        {cabang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Pilih Siswa ({selectedStudents.size} dipilih)
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {selectedStudents.size === students.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg bg-white">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading...
                    </div>
                  ) : students.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Tidak ada siswa ditemukan
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {students.map((student) => (
                        <label
                          key={student.id}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.has(student.nis)}
                            onChange={() => handleToggleStudent(student.nis)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {student.nama_siswa}
                            </p>
                            <p className="text-xs text-gray-500">
                              NIS: {student.nis} | {student.kelas} | {student.asrama}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Apply Button */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFilters(false);
                    setSelectedStudents(new Set());
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplySelection}
                  disabled={selectedStudents.size === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Terapkan ({selectedStudents.size} siswa)
                </button>
              </div>
            </div>
          )}

          {/* Manual NIS Input */}
          <div>
            <textarea
              value={bulkNISText}
              onChange={(e) => setBulkNISText(e.target.value)}
              placeholder="Masukkan NIS siswa, satu per baris&#10;Contoh:&#10;12345&#10;12346&#10;12347"
              rows={8}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm"
              disabled={disabled}
            />
            <p className="text-sm text-gray-500 mt-2">
              Total: <strong>{selectedCount} siswa</strong>
            </p>
          </div>
        </div>
      )}

      {/* Selected Count Badge */}
      {selectedCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>{selectedCount}</strong> siswa dipilih untuk generate rapor
          </p>
        </div>
      )}
    </div>
  );
}
