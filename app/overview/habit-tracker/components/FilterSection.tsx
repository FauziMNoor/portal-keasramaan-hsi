import { Filter as FilterIcon } from 'lucide-react';

interface FilterSectionProps {
  filters: any;
  setFilters: (filters: any) => void;
  masterData: any;
  onLoad: () => void;
  loading: boolean;
}

export default function FilterSection({ filters, setFilters, masterData, onLoad, loading }: FilterSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FilterIcon className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">Filter Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
            {masterData.tahunAjaranList.map((ta: string) => (
              <option key={ta} value={ta}>{ta}</option>
            ))}
          </select>
        </div>

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
            {masterData.semesterList.map((sem: string) => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi</label>
          <select
            value={filters.lokasi}
            onChange={(e) => setFilters({ ...filters, lokasi: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
          >
            <option value="">Semua Lokasi</option>
            {masterData.lokasiList.map((lok: string) => (
              <option key={lok} value={lok}>{lok}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Asrama</label>
          <select
            value={filters.asrama}
            onChange={(e) => setFilters({ ...filters, asrama: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
          >
            <option value="">Semua Asrama</option>
            {masterData.asramaList.map((asr: string) => (
              <option key={asr} value={asr}>{asr}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Musyrif/ah</label>
          <select
            value={filters.musyrif}
            onChange={(e) => setFilters({ ...filters, musyrif: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
          >
            <option value="">Semua Musyrif/ah</option>
            {masterData.musyrifList.map((mus: string) => (
              <option key={mus} value={mus}>{mus}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={onLoad}
          disabled={loading}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Memuat...' : '📊 Tampilkan Dashboard'}
        </button>
      </div>
    </div>
  );
}
