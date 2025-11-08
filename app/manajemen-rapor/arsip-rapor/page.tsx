'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Filter, FileText, Calendar, User, Loader2 } from 'lucide-react';
import ArchiveSkeleton from '@/components/rapor/ArchiveSkeleton';
import { useToast } from '@/components/ui/ToastContainer';

interface ArchivedRapor {
  id: string;
  siswa_nis: string;
  siswa_nama: string;
  tahun_ajaran: string;
  semester: string;
  template_nama: string;
  pdf_url: string;
  generated_by: string;
  created_at: string;
}

export default function ArsipRaporPage() {
  const toast = useToast();
  const [archives, setArchives] = useState<ArchivedRapor[]>([]);
  const [filteredArchives, setFilteredArchives] = useState<ArchivedRapor[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tahunAjaran: '',
    semester: '',
    templateId: '',
    dateFrom: '',
    dateTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [templates, setTemplates] = useState<Array<{ id: string; nama_template: string }>>([]);

  useEffect(() => {
    fetchArchives();
    fetchTemplates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [archives, searchTerm, filters]);

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rapor/archive');
      const result = await response.json();

      if (result.success) {
        setArchives(result.data || []);
      } else {
        toast.error('Gagal memuat arsip rapor');
      }
    } catch (error) {
      console.error('Error fetching archives:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/rapor/template');
      const result = await response.json();
      if (result.success) {
        setTemplates(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...archives];

    // Search by student name
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.siswa_nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.siswa_nis.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tahun ajaran
    if (filters.tahunAjaran) {
      filtered = filtered.filter(a => a.tahun_ajaran === filters.tahunAjaran);
    }

    // Filter by semester
    if (filters.semester) {
      filtered = filtered.filter(a => a.semester === filters.semester);
    }

    // Filter by template
    if (filters.templateId) {
      filtered = filtered.filter(a => a.template_nama === filters.templateId);
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(a => new Date(a.created_at) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(a => new Date(a.created_at) <= new Date(filters.dateTo));
    }

    setFilteredArchives(filtered);
  };

  const handleDownload = async (archive: ArchivedRapor) => {
    if (!archive.pdf_url) {
      toast.error('URL PDF tidak tersedia');
      return;
    }

    setDownloading(archive.id);
    try {
      // Fetch the PDF from Supabase Storage
      const response = await fetch(archive.pdf_url);
      if (!response.ok) {
        throw new Error('Gagal mengunduh PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rapor_${archive.siswa_nama}_${archive.tahun_ajaran}_Sem${archive.semester}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF berhasil diunduh');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Gagal mengunduh PDF');
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUniqueTahunAjaran = () => {
    const unique = [...new Set(archives.map(a => a.tahun_ajaran))];
    return unique.sort().reverse();
  };

  // Show skeleton while loading
  if (loading) {
    return <ArchiveSkeleton />;
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Arsip Rapor</h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">
          Riwayat rapor yang telah di-generate
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Cari nama atau NIS siswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto justify-center touch-manipulation"
          >
            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            Filter
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Tahun Ajaran
              </label>
              <select
                value={filters.tahunAjaran}
                onChange={(e) => setFilters({ ...filters, tahunAjaran: e.target.value })}
                className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Tahun</option>
                {getUniqueTahunAjaran().map(ta => (
                  <option key={ta} value={ta}>{ta}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <select
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Template
              </label>
              <select
                value={filters.templateId}
                onChange={(e) => setFilters({ ...filters, templateId: e.target.value })}
                className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Template</option>
                {templates.map(t => (
                  <option key={t.id} value={t.nama_template}>{t.nama_template}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({
                    tahunAjaran: '',
                    semester: '',
                    templateId: '',
                    dateFrom: '',
                    dateTo: '',
                  });
                  setSearchTerm('');
                }}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation"
              >
                Reset Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {filteredArchives.length === 0 ? (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md">
          <div className="empty-state animate-fade-in-up">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-linear-to-br from-blue-50 to-indigo-50 rounded-full opacity-50 animate-pulse"></div>
              </div>
              <FileText className="empty-state-icon relative z-10" />
            </div>
            <h3 className="empty-state-title">
              {archives.length === 0 ? 'Belum Ada Arsip' : 'Tidak Ada Hasil'}
            </h3>
            <p className="empty-state-description">
              {archives.length === 0
                ? 'Arsip rapor akan muncul setelah Anda melakukan generate rapor'
                : 'Coba ubah filter atau kata kunci pencarian Anda'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Siswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Periode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Generate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Di-generate Oleh
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredArchives.map((archive) => (
                  <tr key={archive.id} className="hover:bg-gray-50 transition-smooth">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {archive.siswa_nama}
                          </div>
                          <div className="text-sm text-gray-500">
                            NIS: {archive.siswa_nis}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {archive.tahun_ajaran} - Sem {archive.semester}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {archive.template_nama}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(archive.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {archive.generated_by || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleDownload(archive)}
                        disabled={downloading === archive.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
                      >
                        {downloading === archive.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Mengunduh...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Unduh</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200 stagger-fade-in">
            {filteredArchives.map((archive) => (
              <div key={archive.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-smooth">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-2 shrink-0" />
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                        {archive.siswa_nama}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 ml-5 sm:ml-6">NIS: {archive.siswa_nis}</p>
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
                  <div className="flex items-center text-xs sm:text-sm">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-2 shrink-0" />
                    <span className="text-gray-700">
                      {archive.tahun_ajaran} - Sem {archive.semester}
                    </span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-2 shrink-0" />
                    <span className="text-gray-700 truncate">{archive.template_nama}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Generate: {formatDate(archive.created_at)}
                  </div>
                  {archive.generated_by && (
                    <div className="text-xs text-gray-500">
                      Oleh: {archive.generated_by}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDownload(archive)}
                  disabled={downloading === archive.id}
                  className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation focus-ring"
                >
                  {downloading === archive.id ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      <span>Mengunduh...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Unduh PDF</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      {!loading && filteredArchives.length > 0 && (
        <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600">
          Menampilkan {filteredArchives.length} dari {archives.length} arsip
        </div>
      )}
    </div>
  );
}
