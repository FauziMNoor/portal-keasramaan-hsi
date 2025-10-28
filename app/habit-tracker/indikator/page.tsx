'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Save, X, BarChart3 } from 'lucide-react';

interface Indikator {
  id: string;
  kategori: string;
  nama_indikator: string;
  nilai_angka: number;
  deskripsi: string;
  created_at: string;
  updated_at: string;
}

const KATEGORI_OPTIONS = [
  'Ubudiyah',
  'Akhlaq',
  'Kedisiplinan',
  'Kebersihan & Kerapian',
];

export default function IndikatorPenilaianPage() {
  const [indikatorList, setIndikatorList] = useState<Indikator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [formData, setFormData] = useState({
    kategori: '',
    nama_indikator: '',
    nilai_angka: 1,
    deskripsi: '',
  });
  const [filterKategori, setFilterKategori] = useState<string>('');

  useEffect(() => {
    fetchIndikator();
  }, []);

  const fetchIndikator = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('indikator_keasramaan')
      .select('*')
      .order('kategori', { ascending: true })
      .order('nama_indikator', { ascending: true })
      .order('nilai_angka', { ascending: true });

    if (error) {
      console.error('Error:', error);
      alert('Gagal memuat data indikator');
    } else {
      setIndikatorList(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.kategori || !formData.nama_indikator || !formData.deskripsi) {
      alert('Semua field harus diisi!');
      return;
    }

    try {
      if (editMode) {
        // Update
        const { error } = await supabase
          .from('indikator_keasramaan')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedId);

        if (error) throw error;
        alert('✅ Indikator berhasil diupdate!');
      } else {
        // Insert
        const { error } = await supabase
          .from('indikator_keasramaan')
          .insert([formData]);

        if (error) throw error;
        alert('✅ Indikator berhasil ditambahkan!');
      }

      resetForm();
      fetchIndikator();
    } catch (error: any) {
      console.error('Error:', error);
      alert('❌ Gagal menyimpan: ' + error.message);
    }
  };

  const handleEdit = (indikator: Indikator) => {
    setEditMode(true);
    setSelectedId(indikator.id);
    setFormData({
      kategori: indikator.kategori,
      nama_indikator: indikator.nama_indikator,
      nilai_angka: indikator.nilai_angka,
      deskripsi: indikator.deskripsi,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus indikator ini?')) return;

    try {
      const { error } = await supabase
        .from('indikator_keasramaan')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('✅ Indikator berhasil dihapus!');
      fetchIndikator();
    } catch (error: any) {
      console.error('Error:', error);
      alert('❌ Gagal menghapus: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      kategori: '',
      nama_indikator: '',
      nilai_angka: 1,
      deskripsi: '',
    });
    setEditMode(false);
    setSelectedId('');
    setShowModal(false);
  };

  const filteredIndikator = filterKategori
    ? indikatorList.filter((item) => item.kategori === filterKategori)
    : indikatorList;

  const groupedIndikator = filteredIndikator.reduce((acc, item) => {
    if (!acc[item.kategori]) {
      acc[item.kategori] = [];
    }
    acc[item.kategori].push(item);
    return acc;
  }, {} as Record<string, Indikator[]>);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Indikator Penilaian</h1>
                <p className="text-gray-600">Kelola indikator penilaian habit tracker</p>
              </div>
            </div>
          </div>

          {/* Filter & Add Button */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter Kategori
                </label>
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Semua Kategori</option>
                  {KATEGORI_OPTIONS.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Tambah Indikator
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data...</p>
            </div>
          ) : (
            /* Data by Category */
            <div className="space-y-6">
              {Object.entries(groupedIndikator).map(([kategori, items]) => (
                <div key={kategori} className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">{kategori}</h2>
                    <p className="text-purple-100 text-sm">{items.length} Indikator</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            No
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nama Indikator
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nilai
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Deskripsi
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((item, index) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {item.nama_indikator}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-700 rounded-lg font-bold">
                                {item.nilai_angka}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {item.deskripsi}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {filteredIndikator.length === 0 && (
                <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada indikator penilaian</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Tambah Indikator Pertama
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editMode ? 'Edit Indikator' : 'Tambah Indikator'}
              </h2>
              <button
                onClick={resetForm}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {KATEGORI_OPTIONS.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nama Indikator */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Indikator <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama_indikator}
                  onChange={(e) => setFormData({ ...formData, nama_indikator: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Contoh: Shalat Fardhu Berjamaah"
                  required
                />
              </div>

              {/* Nilai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nilai Angka <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.nilai_angka}
                  onChange={(e) => setFormData({ ...formData, nilai_angka: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Nilai 1-10</p>
              </div>

              {/* Rubrik */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  placeholder="Contoh: 1 = Tidak pernah, 2 = Jarang, 3 = Sering"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all"
                >
                  <Save className="w-5 h-5" />
                  {editMode ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
