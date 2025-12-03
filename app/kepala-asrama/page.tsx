'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Shield, X } from 'lucide-react';

interface KepalaAsrama {
  id: string;
  nama: string;
  cabang: string;
  status: string;
}

interface Cabang {
  id: string;
  cabang: string;
}

export default function KepalaAsramaPage() {
  const [data, setData] = useState<KepalaAsrama[]>([]);
  const [cabangList, setLokasiList] = useState<Cabang[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nama: '', cabang: '', status: 'aktif' });

  useEffect(() => {
    fetchData();
    fetchLokasi();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: result, error } = await supabase.from('kepala_asrama_keasramaan').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error:', error);
    else setData(result || []);
    setLoading(false);
  };

  const fetchLokasi = async () => {
    const { data: result, error } = await supabase
      .from('cabang_keasramaan')
      .select('*')
      .eq('status', 'aktif')
      .order('nama_cabang', { ascending: true });
    if (error) console.error('Error:', error);
    else setLokasiList(result || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode && currentId) {
      await supabase.from('kepala_asrama_keasramaan').update({ ...formData, updated_at: new Date().toISOString() }).eq('id', currentId);
    } else {
      await supabase.from('kepala_asrama_keasramaan').insert([formData]);
    }
    setShowModal(false);
    resetForm();
    fetchData();
  };

  const handleEdit = (item: KepalaAsrama) => {
    setEditMode(true);
    setCurrentId(item.id);
    setFormData({ nama: item.nama, cabang: item.cabang, status: item.status });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus data ini?')) {
      await supabase.from('kepala_asrama_keasramaan').delete().eq('id', id);
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({ nama: '', cabang: '', status: 'aktif' });
    setEditMode(false);
    setCurrentId(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Kepala Asrama</h1>
              <p className="text-gray-600">Kelola data kepala asrama keasramaan</p>
            </div>
            <button onClick={() => { resetForm(); setShowModal(true); }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all">
              <Plus className="w-5 h-5" />Tambah Data
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Memuat data...</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">No</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Nama</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Cabang</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 text-gray-700">{index + 1}</td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{item.nama}</td>
                      <td className="px-6 py-4 text-gray-700">{item.cabang}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>{item.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(item)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">{editMode ? 'Edit Kepala Asrama' : 'Tambah Kepala Asrama'}</h2>
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                <input type="text" value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nama Kepala Asrama" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cabang</label>
                <select value={formData.cabang}
                  onChange={(e) => setFormData({ ...formData, cabang: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <option value="">Pilih Cabang</option>
                  {cabangList.map((cab) => (
                    <option key={cab.id} value={cab.nama_cabang}>{cab.nama_cabang}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all">
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
