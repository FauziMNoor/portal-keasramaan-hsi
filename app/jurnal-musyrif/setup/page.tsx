'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Save, X, Settings, Clock, CheckSquare } from 'lucide-react';

interface Sesi {
  id: string;
  nama_sesi: string;
  urutan: number;
  status: string;
}

interface Jadwal {
  id: string;
  sesi_id: string;
  jam_mulai: string;
  jam_selesai: string;
  urutan: number;
}

interface Kegiatan {
  id: string;
  jadwal_id: string;
  deskripsi_kegiatan: string;
  urutan: number;
}

export default function SetupJurnalMusyrifPage() {
  const [sesiList, setSesiList] = useState<Sesi[]>([]);
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'sesi' | 'jadwal' | 'kegiatan'>('sesi');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState('');

  // Form states
  const [sesiForm, setSesiForm] = useState({ nama_sesi: '', urutan: 1, status: 'aktif' });
  const [jadwalForm, setJadwalForm] = useState({ sesi_id: '', jam_mulai: '', jam_selesai: '', urutan: 1 });
  const [kegiatanForm, setKegiatanForm] = useState({ jadwal_id: '', deskripsi_kegiatan: '', urutan: 1 });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchSesi(), fetchJadwal(), fetchKegiatan()]);
    setLoading(false);
  };

  const fetchSesi = async () => {
    const { data } = await supabase.from('sesi_jurnal_musyrif_keasramaan').select('*').order('urutan');
    setSesiList(data || []);
  };

  const fetchJadwal = async () => {
    const { data } = await supabase.from('jadwal_jurnal_musyrif_keasramaan').select('*').order('sesi_id').order('urutan');
    setJadwalList(data || []);
  };

  const fetchKegiatan = async () => {
    const { data } = await supabase.from('kegiatan_jurnal_musyrif_keasramaan').select('*').order('jadwal_id').order('urutan');
    setKegiatanList(data || []);
  };

  // SESI CRUD
  const handleSesiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode) {
        await supabase.from('sesi_jurnal_musyrif_keasramaan').update(sesiForm).eq('id', selectedId);
        alert('✅ Sesi berhasil diupdate!');
      } else {
        await supabase.from('sesi_jurnal_musyrif_keasramaan').insert([sesiForm]);
        alert('✅ Sesi berhasil ditambahkan!');
      }
      resetForm();
      fetchSesi();
    } catch (error: any) {
      alert('❌ Gagal: ' + error.message);
    }
  };

  const handleSesiEdit = (sesi: Sesi) => {
    setEditMode(true);
    setSelectedId(sesi.id);
    setSesiForm({ nama_sesi: sesi.nama_sesi, urutan: sesi.urutan, status: sesi.status });
    setShowModal(true);
  };

  const handleSesiDelete = async (id: string) => {
    if (!confirm('Yakin hapus sesi ini? Semua jadwal dan kegiatan terkait akan terhapus!')) return;
    await supabase.from('sesi_jurnal_musyrif_keasramaan').delete().eq('id', id);
    alert('✅ Sesi berhasil dihapus!');
    fetchAllData();
  };

  // JADWAL CRUD
  const handleJadwalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode) {
        await supabase.from('jadwal_jurnal_musyrif_keasramaan').update(jadwalForm).eq('id', selectedId);
        alert('✅ Jadwal berhasil diupdate!');
      } else {
        await supabase.from('jadwal_jurnal_musyrif_keasramaan').insert([jadwalForm]);
        alert('✅ Jadwal berhasil ditambahkan!');
      }
      resetForm();
      fetchJadwal();
    } catch (error: any) {
      alert('❌ Gagal: ' + error.message);
    }
  };

  const handleJadwalEdit = (jadwal: Jadwal) => {
    setEditMode(true);
    setSelectedId(jadwal.id);
    setJadwalForm({ sesi_id: jadwal.sesi_id, jam_mulai: jadwal.jam_mulai, jam_selesai: jadwal.jam_selesai, urutan: jadwal.urutan });
    setShowModal(true);
  };

  const handleJadwalDelete = async (id: string) => {
    if (!confirm('Yakin hapus jadwal ini? Semua kegiatan terkait akan terhapus!')) return;
    await supabase.from('jadwal_jurnal_musyrif_keasramaan').delete().eq('id', id);
    alert('✅ Jadwal berhasil dihapus!');
    fetchAllData();
  };

  // KEGIATAN CRUD
  const handleKegiatanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode) {
        await supabase.from('kegiatan_jurnal_musyrif_keasramaan').update(kegiatanForm).eq('id', selectedId);
        alert('✅ Kegiatan berhasil diupdate!');
      } else {
        await supabase.from('kegiatan_jurnal_musyrif_keasramaan').insert([kegiatanForm]);
        alert('✅ Kegiatan berhasil ditambahkan!');
      }
      resetForm();
      fetchKegiatan();
    } catch (error: any) {
      alert('❌ Gagal: ' + error.message);
    }
  };

  const handleKegiatanEdit = (kegiatan: Kegiatan) => {
    setEditMode(true);
    setSelectedId(kegiatan.id);
    setKegiatanForm({ jadwal_id: kegiatan.jadwal_id, deskripsi_kegiatan: kegiatan.deskripsi_kegiatan, urutan: kegiatan.urutan });
    setShowModal(true);
  };

  const handleKegiatanDelete = async (id: string) => {
    if (!confirm('Yakin hapus kegiatan ini?')) return;
    await supabase.from('kegiatan_jurnal_musyrif_keasramaan').delete().eq('id', id);
    alert('✅ Kegiatan berhasil dihapus!');
    fetchKegiatan();
  };

  const resetForm = () => {
    setSesiForm({ nama_sesi: '', urutan: 1, status: 'aktif' });
    setJadwalForm({ sesi_id: '', jam_mulai: '', jam_selesai: '', urutan: 1 });
    setKegiatanForm({ jadwal_id: '', deskripsi_kegiatan: '', urutan: 1 });
    setEditMode(false);
    setSelectedId('');
    setShowModal(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-3 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Setup Jurnal</h1>
                <p className="text-xs sm:text-base text-gray-600">Kelola Sesi, Jadwal, Kegiatan</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md mb-4 sm:mb-6 overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('sesi')}
                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 font-semibold transition-colors text-xs sm:text-base ${
                  activeTab === 'sesi'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Sesi</span>
                  <span className="sm:hidden">Sesi</span>
                  <span className="text-xs">({sesiList.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('jadwal')}
                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 font-semibold transition-colors text-xs sm:text-base ${
                  activeTab === 'jadwal'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Jadwal</span>
                  <span className="sm:hidden">Jadwal</span>
                  <span className="text-xs">({jadwalList.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('kegiatan')}
                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 font-semibold transition-colors text-xs sm:text-base ${
                  activeTab === 'kegiatan'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Kegiatan</span>
                  <span className="sm:hidden">Kegiatan</span>
                  <span className="text-xs">({kegiatanList.length})</span>
                </div>
              </button>
            </div>
          </div>

          {/* Add Button */}
          <div className="mb-4 sm:mb-6 flex justify-end">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl shadow-lg transition-all text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Tambah {activeTab === 'sesi' ? 'Sesi' : activeTab === 'jadwal' ? 'Jadwal' : 'Kegiatan'}</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-sm sm:text-base text-gray-600">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* SESI TAB */}
              {activeTab === 'sesi' && (
                <>
                  {/* Mobile Card View */}
                  <div className="block lg:hidden space-y-3">
                    {sesiList.map((sesi, idx) => (
                      <div key={sesi.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold text-gray-500">#{idx + 1}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                sesi.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {sesi.status}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-1">{sesi.nama_sesi}</h3>
                            <p className="text-xs text-gray-600">Urutan: {sesi.urutan}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleSesiEdit(sesi)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleSesiDelete(sesi.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Sesi</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Urutan</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {sesiList.map((sesi, idx) => (
                            <tr key={sesi.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{sesi.nama_sesi}</td>
                              <td className="px-6 py-4 text-center text-sm text-gray-900">{sesi.urutan}</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  sesi.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {sesi.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => handleSesiEdit(sesi)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleSesiDelete(sesi.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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
                </>
              )}

              {/* JADWAL TAB */}
              {activeTab === 'jadwal' && (
                <>
                  {/* Mobile Card View */}
                  <div className="block lg:hidden space-y-3">
                    {jadwalList.map((jadwal, idx) => {
                      const sesi = sesiList.find(s => s.id === jadwal.sesi_id);
                      return (
                        <div key={jadwal.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-gray-500">#{idx + 1}</span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                  {sesi?.nama_sesi || '-'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-base font-bold text-gray-900">
                                  {jadwal.jam_mulai} - {jadwal.jam_selesai}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600">Urutan: {jadwal.urutan}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => handleJadwalEdit(jadwal)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleJadwalDelete(jadwal.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium"
                            >
                              <Trash2 className="w-4 h-4" />
                              Hapus
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sesi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam Mulai</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam Selesai</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Urutan</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {jadwalList.map((jadwal, idx) => {
                            const sesi = sesiList.find(s => s.id === jadwal.sesi_id);
                            return (
                              <tr key={jadwal.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{sesi?.nama_sesi || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{jadwal.jam_mulai}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{jadwal.jam_selesai}</td>
                                <td className="px-6 py-4 text-center text-sm text-gray-900">{jadwal.urutan}</td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => handleJadwalEdit(jadwal)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleJadwalDelete(jadwal.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* KEGIATAN TAB */}
              {activeTab === 'kegiatan' && (
                <>
                  {/* Mobile Card View */}
                  <div className="block lg:hidden space-y-3">
                    {kegiatanList.map((kegiatan, idx) => {
                      const jadwal = jadwalList.find(j => j.id === kegiatan.jadwal_id);
                      const sesi = sesiList.find(s => s.id === jadwal?.sesi_id);
                      return (
                        <div key={kegiatan.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold text-gray-500">#{idx + 1}</span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                {sesi?.nama_sesi}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-xs text-gray-600">
                                {jadwal?.jam_mulai} - {jadwal?.jam_selesai}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 leading-relaxed mb-2">{kegiatan.deskripsi_kegiatan}</p>
                            <p className="text-xs text-gray-600">Urutan: {kegiatan.urutan}</p>
                          </div>
                          <div className="flex gap-2 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => handleKegiatanEdit(kegiatan)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleKegiatanDelete(kegiatan.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium"
                            >
                              <Trash2 className="w-4 h-4" />
                              Hapus
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jadwal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi Kegiatan</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Urutan</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {kegiatanList.map((kegiatan, idx) => {
                            const jadwal = jadwalList.find(j => j.id === kegiatan.jadwal_id);
                            const sesi = sesiList.find(s => s.id === jadwal?.sesi_id);
                            return (
                              <tr key={kegiatan.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {sesi?.nama_sesi} ({jadwal?.jam_mulai}-{jadwal?.jam_selesai})
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{kegiatan.deskripsi_kegiatan}</td>
                                <td className="px-6 py-4 text-center text-sm text-gray-900">{kegiatan.urutan}</td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => handleKegiatanEdit(kegiatan)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleKegiatanDelete(kegiatan.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-xl sm:rounded-t-2xl">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {editMode ? 'Edit' : 'Tambah'} {activeTab === 'sesi' ? 'Sesi' : activeTab === 'jadwal' ? 'Jadwal' : 'Kegiatan'}
              </h2>
              <button onClick={resetForm} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 sm:p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SESI FORM */}
            {activeTab === 'sesi' && (
              <form onSubmit={handleSesiSubmit} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Sesi *</label>
                  <input
                    type="text"
                    value={sesiForm.nama_sesi}
                    onChange={(e) => setSesiForm({ ...sesiForm, nama_sesi: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    placeholder="Contoh: SESI 1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urutan *</label>
                  <input
                    type="number"
                    min="1"
                    value={sesiForm.urutan}
                    onChange={(e) => setSesiForm({ ...sesiForm, urutan: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    value={sesiForm.status}
                    onChange={(e) => setSesiForm({ ...sesiForm, status: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
                <div className="flex gap-2 sm:gap-3 pt-4">
                  <button type="button" onClick={resetForm} className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 text-sm sm:text-base">
                    Batal
                  </button>
                  <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg text-sm sm:text-base">
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    {editMode ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            )}

            {/* JADWAL FORM */}
            {activeTab === 'jadwal' && (
              <form onSubmit={handleJadwalSubmit} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sesi *</label>
                  <select
                    value={jadwalForm.sesi_id}
                    onChange={(e) => setJadwalForm({ ...jadwalForm, sesi_id: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    required
                  >
                    <option value="">Pilih Sesi</option>
                    {sesiList.filter(s => s.status === 'aktif').map(sesi => (
                      <option key={sesi.id} value={sesi.id}>{sesi.nama_sesi}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jam Mulai *</label>
                    <input
                      type="time"
                      value={jadwalForm.jam_mulai}
                      onChange={(e) => setJadwalForm({ ...jadwalForm, jam_mulai: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jam Selesai *</label>
                    <input
                      type="time"
                      value={jadwalForm.jam_selesai}
                      onChange={(e) => setJadwalForm({ ...jadwalForm, jam_selesai: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urutan *</label>
                  <input
                    type="number"
                    min="1"
                    value={jadwalForm.urutan}
                    onChange={(e) => setJadwalForm({ ...jadwalForm, urutan: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="flex gap-2 sm:gap-3 pt-4">
                  <button type="button" onClick={resetForm} className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 text-sm sm:text-base">
                    Batal
                  </button>
                  <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg text-sm sm:text-base">
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    {editMode ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            )}

            {/* KEGIATAN FORM */}
            {activeTab === 'kegiatan' && (
              <form onSubmit={handleKegiatanSubmit} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jadwal *</label>
                  <select
                    value={kegiatanForm.jadwal_id}
                    onChange={(e) => setKegiatanForm({ ...kegiatanForm, jadwal_id: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    required
                  >
                    <option value="">Pilih Jadwal</option>
                    {jadwalList.map(jadwal => {
                      const sesi = sesiList.find(s => s.id === jadwal.sesi_id);
                      return (
                        <option key={jadwal.id} value={jadwal.id}>
                          {sesi?.nama_sesi} ({jadwal.jam_mulai}-{jadwal.jam_selesai})
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Kegiatan *</label>
                  <textarea
                    value={kegiatanForm.deskripsi_kegiatan}
                    onChange={(e) => setKegiatanForm({ ...kegiatanForm, deskripsi_kegiatan: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    rows={4}
                    placeholder="Contoh: Memastikan santri menjalankan adab bangun tidur seperti berdoa."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urutan *</label>
                  <input
                    type="number"
                    min="1"
                    value={kegiatanForm.urutan}
                    onChange={(e) => setKegiatanForm({ ...kegiatanForm, urutan: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="flex gap-2 sm:gap-3 pt-4">
                  <button type="button" onClick={resetForm} className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 text-sm sm:text-base">
                    Batal
                  </button>
                  <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg text-sm sm:text-base">
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    {editMode ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
