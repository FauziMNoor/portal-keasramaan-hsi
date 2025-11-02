'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Save, X, Tag, AlertTriangle } from 'lucide-react';

interface Kategori {
  id: string;
  nama_kategori: string;
  deskripsi: string;
  status: string;
}

interface LevelDampak {
  id: string;
  nama_level: string;
  poin: number;
  deskripsi: string;
  urutan: number;
  status: string;
}

export default function KategoriPage() {
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [levelDampakList, setLevelDampakList] = useState<LevelDampak[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'kategori' | 'level'>('kategori');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formType, setFormType] = useState<'kategori' | 'level'>('kategori');
  
  const [formKategori, setFormKategori] = useState({
    nama_kategori: '',
    deskripsi: '',
  });

  const [formLevel, setFormLevel] = useState({
    nama_level: '',
    poin: 0,
    deskripsi: '',
    urutan: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [kategori, level] = await Promise.all([
      supabase.from('kategori_perilaku_keasramaan').select('*').order('nama_kategori'),
      supabase.from('level_dampak_keasramaan').select('*').order('urutan'),
    ]);

    setKategoriList(kategori.data || []);
    setLevelDampakList(level.data || []);
    setLoading(false);
  };

  const handleSubmitKategori = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('kategori_perilaku_keasramaan')
          .update(formKategori)
          .eq('id', editingId);
        
        if (error) throw error;
        alert('Kategori berhasil diupdate!');
      } else {
        const { error } = await supabase
          .from('kategori_perilaku_keasramaan')
          .insert([{ ...formKategori, status: 'aktif' }]);
        
        if (error) throw error;
        alert('Kategori berhasil ditambahkan!');
      }

      setShowForm(false);
      setEditingId(null);
      setFormKategori({ nama_kategori: '', deskripsi: '' });
      fetchData();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Gagal menyimpan: ' + error.message);
    }
  };

  const handleSubmitLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('level_dampak_keasramaan')
          .update(formLevel)
          .eq('id', editingId);
        
        if (error) throw error;
        alert('Level dampak berhasil diupdate!');
      } else {
        const { error } = await supabase
          .from('level_dampak_keasramaan')
          .insert([{ ...formLevel, status: 'aktif' }]);
        
        if (error) throw error;
        alert('Level dampak berhasil ditambahkan!');
      }

      setShowForm(false);
      setEditingId(null);
      setFormLevel({ nama_level: '', poin: 0, deskripsi: '', urutan: 0 });
      fetchData();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Gagal menyimpan: ' + error.message);
    }
  };

  const handleEditKategori = (kategori: Kategori) => {
    setFormKategori({
      nama_kategori: kategori.nama_kategori,
      deskripsi: kategori.deskripsi,
    });
    setEditingId(kategori.id);
    setFormType('kategori');
    setShowForm(true);
  };

  const handleEditLevel = (level: LevelDampak) => {
    setFormLevel({
      nama_level: level.nama_level,
      poin: level.poin,
      deskripsi: level.deskripsi,
      urutan: level.urutan,
    });
    setEditingId(level.id);
    setFormType('level');
    setShowForm(true);
  };

  const handleDeleteKategori = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;

    try {
      const { error } = await supabase
        .from('kategori_perilaku_keasramaan')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      alert('Kategori berhasil dihapus!');
      fetchData();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Gagal menghapus: ' + error.message);
    }
  };

  const handleDeleteLevel = async (id: string) => {
    if (!confirm('Yakin ingin menghapus level dampak ini?')) return;

    try {
      const { error } = await supabase
        .from('level_dampak_keasramaan')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      alert('Level dampak berhasil dihapus!');
      fetchData();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Gagal menghapus: ' + error.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Kelola Kategori & Level</h1>
              <p className="text-gray-600">Atur kategori perilaku dan level dampak pelanggaran</p>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormType(activeTab === 'kategori' ? 'kategori' : 'level');
                if (activeTab === 'kategori') {
                  setFormKategori({ nama_kategori: '', deskripsi: '' });
                } else {
                  setFormLevel({ nama_level: '', poin: 0, deskripsi: '', urutan: 0 });
                }
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Tambah {activeTab === 'kategori' ? 'Kategori' : 'Level Dampak'}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('kategori')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                activeTab === 'kategori'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Tag className="w-5 h-5 inline mr-2" />
              Kategori Perilaku ({kategoriList.length})
            </button>
            <button
              onClick={() => setActiveTab('level')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                activeTab === 'level'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <AlertTriangle className="w-5 h-5 inline mr-2" />
              Level Dampak ({levelDampakList.length})
            </button>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingId ? 'Edit' : 'Tambah'} {formType === 'kategori' ? 'Kategori' : 'Level Dampak'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formType === 'kategori' ? (
                  <form onSubmit={handleSubmitKategori} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Kategori <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formKategori.nama_kategori}
                        onChange={(e) => setFormKategori({ ...formKategori, nama_kategori: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Misal: Kedisiplinan, Kebersihan, dll"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi
                      </label>
                      <textarea
                        value={formKategori.deskripsi}
                        onChange={(e) => setFormKategori({ ...formKategori, deskripsi: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Deskripsi kategori..."
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setEditingId(null);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all"
                      >
                        <Save className="w-4 h-4" />
                        Simpan
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmitLevel} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Level <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formLevel.nama_level}
                        onChange={(e) => setFormLevel({ ...formLevel, nama_level: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Misal: Ringan, Sedang, Berat"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Poin <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formLevel.poin}
                        onChange={(e) => setFormLevel({ ...formLevel, poin: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Misal: -5, -15, -30"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Gunakan angka negatif untuk pelanggaran</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urutan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formLevel.urutan}
                        onChange={(e) => setFormLevel({ ...formLevel, urutan: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Misal: 1, 2, 3"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Urutan tampilan (1 = paling atas)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi
                      </label>
                      <textarea
                        value={formLevel.deskripsi}
                        onChange={(e) => setFormLevel({ ...formLevel, deskripsi: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        rows={3}
                        placeholder="Deskripsi level dampak..."
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setEditingId(null);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-4 py-2 rounded-lg transition-all"
                      >
                        <Save className="w-4 h-4" />
                        Simpan
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
              Memuat data...
            </div>
          ) : activeTab === 'kategori' ? (
            // Tabel Kategori
            kategoriList.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
                Belum ada kategori. Klik tombol "Tambah Kategori" untuk menambahkan.
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">No</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Nama Kategori</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Deskripsi</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kategoriList.map((kategori, index) => (
                      <tr key={kategori.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-4 text-gray-700">{index + 1}</td>
                        <td className="px-6 py-4 text-gray-800 font-medium">{kategori.nama_kategori}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{kategori.deskripsi || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditKategori(kategori)}
                              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteKategori(kategori.id)}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
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
            )
          ) : (
            // Tabel Level Dampak
            levelDampakList.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
                Belum ada level dampak. Klik tombol "Tambah Level Dampak" untuk menambahkan.
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Urutan</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Nama Level</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Poin</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Deskripsi</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelDampakList.map((level) => (
                      <tr key={level.id} className={level.urutan % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 text-gray-700 font-semibold">{level.urutan}</td>
                        <td className="px-6 py-4 text-gray-800 font-medium">{level.nama_level}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                            {level.poin}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{level.deskripsi || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditLevel(level)}
                              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLevel(level.id)}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
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
            )
          )}

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">ℹ️ Informasi:</h3>
            {activeTab === 'kategori' ? (
              <ul className="list-disc list-inside space-y-2 text-blue-700">
                <li><strong>Kategori Perilaku</strong> digunakan untuk pelanggaran DAN kebaikan</li>
                <li>Contoh: Kedisiplinan, Kebersihan, Adab & Akhlak, Ibadah, dll</li>
                <li>User akan memilih kategori, lalu mengetik nama pelanggaran/kebaikan sendiri</li>
                <li>Kategori bersifat umum dan dapat digunakan berkali-kali</li>
              </ul>
            ) : (
              <ul className="list-disc list-inside space-y-2 text-blue-700">
                <li><strong>Level Dampak</strong> hanya untuk pelanggaran (bukan kebaikan)</li>
                <li>Contoh: Ringan (-5), Sedang (-15), Berat (-30)</li>
                <li>Poin otomatis diterapkan berdasarkan level yang dipilih</li>
                <li>Urutan menentukan tampilan di dropdown (1 = paling atas)</li>
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
