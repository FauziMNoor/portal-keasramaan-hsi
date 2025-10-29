'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Users, X, Upload, User } from 'lucide-react';

interface DataSiswa {
  id: string;
  nama_siswa: string;
  nis: string;
  lokasi: string;
  kelas: string;
  rombel: string;
  asrama: string;
  kepala_asrama: string;
  musyrif: string;
  foto: string;
}

interface Lokasi {
  id: string;
  lokasi: string;
}

interface Kelas {
  id: string;
  nama_kelas: string;
}

interface Rombel {
  id: string;
  nama_rombel: string;
  kelas: string;
}

interface Asrama {
  id: string;
  asrama: string;
  lokasi: string;
  kelas: string;
}

interface Musyrif {
  id: string;
  nama_musyrif: string;
  lokasi: string;
  kelas: string;
  asrama: string;
}

interface KepalaAsrama {
  id: string;
  nama: string;
  lokasi: string;
}

export default function DataSiswaPage() {
  const [data, setData] = useState<DataSiswa[]>([]);
  const [filteredData, setFilteredData] = useState<DataSiswa[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [allKelasList, setAllKelasList] = useState<Kelas[]>([]);
  const [filteredKelasList, setFilteredKelasList] = useState<Kelas[]>([]);
  const [allRombelList, setAllRombelList] = useState<Rombel[]>([]);
  const [filteredRombelList, setFilteredRombelList] = useState<Rombel[]>([]);
  const [allAsramaList, setAllAsramaList] = useState<Asrama[]>([]);
  const [filteredAsramaList, setFilteredAsramaList] = useState<Asrama[]>([]);
  const [allKepalaAsramaList, setAllKepalaAsramaList] = useState<KepalaAsrama[]>([]);
  const [filteredKepalaAsramaList, setFilteredKepalaAsramaList] = useState<KepalaAsrama[]>([]);
  const [allMusyrifList, setAllMusyrifList] = useState<Musyrif[]>([]);
  const [filteredMusyrifList, setFilteredMusyrifList] = useState<Musyrif[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    nama_siswa: '',
    nis: '',
    lokasi: '',
    kelas: '',
    rombel: '',
    asrama: '',
    kepala_asrama: '',
    musyrif: '',
    foto: '',
  });

  useEffect(() => {
    fetchData();
    fetchLokasi();
    fetchAllKelas();
    fetchAllRombel();
    fetchAllAsrama();
    fetchAllKepalaAsrama();
    fetchAllMusyrif();
  }, []);

  // Filter data berdasarkan search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(data);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = data.filter(
        (siswa) =>
          siswa.nama_siswa.toLowerCase().includes(query) ||
          siswa.nis.toLowerCase().includes(query) ||
          siswa.lokasi?.toLowerCase().includes(query) ||
          siswa.kelas?.toLowerCase().includes(query) ||
          siswa.rombel?.toLowerCase().includes(query) ||
          siswa.asrama?.toLowerCase().includes(query) ||
          siswa.kepala_asrama?.toLowerCase().includes(query) ||
          siswa.musyrif?.toLowerCase().includes(query)
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, data]);

  // Filter cascading berdasarkan lokasi
  useEffect(() => {
    if (formData.lokasi) {
      // Filter kelas dari asrama yang ada di lokasi ini
      const asramaByLokasi = allAsramaList.filter(a => a.lokasi === formData.lokasi);
      const kelasFromAsrama = [...new Set(asramaByLokasi.map(a => a.kelas).filter(k => k))];
      const filtered = allKelasList.filter(k => kelasFromAsrama.includes(k.nama_kelas));
      setFilteredKelasList(filtered);
      
      if (formData.kelas && !kelasFromAsrama.includes(formData.kelas)) {
        setFormData(prev => ({ ...prev, kelas: '', rombel: '', asrama: '', musyrif: '' }));
      }
    } else {
      setFilteredKelasList([]);
      setFormData(prev => ({ ...prev, kelas: '', rombel: '', asrama: '', musyrif: '' }));
    }
  }, [formData.lokasi, allAsramaList, allKelasList]);

  // Filter rombel dan asrama berdasarkan kelas
  useEffect(() => {
    if (formData.lokasi && formData.kelas) {
      // Filter rombel
      const filteredRombel = allRombelList.filter(r => r.kelas === formData.kelas);
      setFilteredRombelList(filteredRombel);
      
      // Filter asrama
      const filteredAsrama = allAsramaList.filter(
        a => a.lokasi === formData.lokasi && a.kelas === formData.kelas
      );
      setFilteredAsramaList(filteredAsrama);
      
      if (formData.rombel && !filteredRombel.find(r => r.nama_rombel === formData.rombel)) {
        setFormData(prev => ({ ...prev, rombel: '' }));
      }
      if (formData.asrama && !filteredAsrama.find(a => a.asrama === formData.asrama)) {
        setFormData(prev => ({ ...prev, asrama: '', musyrif: '' }));
      }
    } else {
      setFilteredRombelList([]);
      setFilteredAsramaList([]);
      setFormData(prev => ({ ...prev, rombel: '', asrama: '', musyrif: '' }));
    }
  }, [formData.lokasi, formData.kelas, allRombelList, allAsramaList]);

  // Filter kepala asrama berdasarkan lokasi
  useEffect(() => {
    if (formData.lokasi) {
      const filtered = allKepalaAsramaList.filter(k => k.lokasi === formData.lokasi);
      setFilteredKepalaAsramaList(filtered);
      
      if (formData.kepala_asrama && !filtered.find(k => k.nama === formData.kepala_asrama)) {
        setFormData(prev => ({ ...prev, kepala_asrama: '' }));
      }
    } else {
      setFilteredKepalaAsramaList([]);
      setFormData(prev => ({ ...prev, kepala_asrama: '' }));
    }
  }, [formData.lokasi, allKepalaAsramaList]);

  // Filter musyrif berdasarkan lokasi, kelas, dan asrama
  useEffect(() => {
    if (formData.lokasi && formData.kelas && formData.asrama) {
      const filtered = allMusyrifList.filter(
        m => m.lokasi === formData.lokasi && 
             m.kelas === formData.kelas && 
             m.asrama === formData.asrama
      );
      setFilteredMusyrifList(filtered);
      
      if (formData.musyrif && !filtered.find(m => m.nama_musyrif === formData.musyrif)) {
        setFormData(prev => ({ ...prev, musyrif: '' }));
      }
    } else {
      setFilteredMusyrifList([]);
      setFormData(prev => ({ ...prev, musyrif: '' }));
    }
  }, [formData.lokasi, formData.kelas, formData.asrama, allMusyrifList]);

  // Load foto preview
  useEffect(() => {
    if (formData.foto) {
      loadFotoPreview(formData.foto);
    } else {
      setFotoPreview('');
    }
  }, [formData.foto]);

  const fetchData = async () => {
    setLoading(true);
    const { data: result, error } = await supabase
      .from('data_siswa_keasramaan')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Error:', error);
    else {
      setData(result || []);
      setFilteredData(result || []);
    }
    setLoading(false);
  };

  const fetchLokasi = async () => {
    const { data: result } = await supabase
      .from('lokasi_keasramaan')
      .select('*')
      .eq('status', 'aktif')
      .order('lokasi', { ascending: true });
    setLokasiList(result || []);
  };

  const fetchAllKelas = async () => {
    const { data: result } = await supabase
      .from('kelas_keasramaan')
      .select('*')
      .eq('status', 'aktif')
      .order('nama_kelas', { ascending: true });
    setAllKelasList(result || []);
  };

  const fetchAllRombel = async () => {
    const { data: result } = await supabase
      .from('rombel_keasramaan')
      .select('*')
      .eq('status', 'aktif')
      .order('nama_rombel', { ascending: true });
    setAllRombelList(result || []);
  };

  const fetchAllAsrama = async () => {
    const { data: result } = await supabase
      .from('asrama_keasramaan')
      .select('*')
      .eq('status', 'aktif')
      .order('asrama', { ascending: true });
    setAllAsramaList(result || []);
  };

  const fetchAllKepalaAsrama = async () => {
    const { data: result } = await supabase
      .from('kepala_asrama_keasramaan')
      .select('*')
      .eq('status', 'aktif')
      .order('nama', { ascending: true });
    setAllKepalaAsramaList(result || []);
  };

  const fetchAllMusyrif = async () => {
    const { data: result } = await supabase
      .from('musyrif_keasramaan')
      .select('*')
      .eq('status', 'aktif')
      .order('nama_musyrif', { ascending: true });
    setAllMusyrifList(result || []);
  };

  const loadFotoPreview = async (fotoPath: string) => {
    if (!fotoPath) {
      setFotoPreview('');
      return;
    }

    if (fotoPath.startsWith('http')) {
      setFotoPreview(fotoPath);
      return;
    }

    const { data } = supabase.storage.from('foto-siswa').getPublicUrl(fotoPath);
    if (data?.publicUrl) {
      setFotoPreview(data.publicUrl);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar!');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB!');
      return;
    }

    setUploading(true);

    try {
      if (formData.foto && !formData.foto.startsWith('http')) {
        await supabase.storage.from('foto-siswa').remove([formData.foto]);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `foto-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('foto-siswa')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setFormData({ ...formData, foto: fileName });
    } catch (error: any) {
      console.error('Error uploading:', error);
      alert('Gagal upload foto: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFoto = async () => {
    if (!formData.foto) return;

    if (confirm('Yakin ingin menghapus foto?')) {
      try {
        if (!formData.foto.startsWith('http')) {
          await supabase.storage.from('foto-siswa').remove([formData.foto]);
        }
        setFormData({ ...formData, foto: '' });
        setFotoPreview('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error removing foto:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editMode && currentId) {
        const { error } = await supabase
          .from('data_siswa_keasramaan')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', currentId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('data_siswa_keasramaan')
          .insert([formData]);
        if (error) throw error;
      }

      setShowModal(false);
      resetForm();
      fetchData();
      alert('Data berhasil disimpan!');
    } catch (error: any) {
      console.error('Error:', error);
      alert('Gagal menyimpan data: ' + error.message);
    }
  };

  const handleEdit = (item: DataSiswa) => {
    setEditMode(true);
    setCurrentId(item.id);
    setFormData({
      nama_siswa: item.nama_siswa,
      nis: item.nis,
      lokasi: item.lokasi || '',
      kelas: item.kelas || '',
      rombel: item.rombel || '',
      asrama: item.asrama || '',
      kepala_asrama: item.kepala_asrama || '',
      musyrif: item.musyrif || '',
      foto: item.foto || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus data siswa ini?')) {
      const siswa = data.find(s => s.id === id);
      
      try {
        if (siswa?.foto && !siswa.foto.startsWith('http')) {
          await supabase.storage.from('foto-siswa').remove([siswa.foto]);
        }
        
        await supabase.from('data_siswa_keasramaan').delete().eq('id', id);
        fetchData();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nama_siswa: '',
      nis: '',
      lokasi: '',
      kelas: '',
      rombel: '',
      asrama: '',
      kepala_asrama: '',
      musyrif: '',
      foto: '',
    });
    setFotoPreview('');
    setFilteredKelasList([]);
    setFilteredRombelList([]);
    setFilteredAsramaList([]);
    setFilteredKepalaAsramaList([]);
    setFilteredMusyrifList([]);
    setEditMode(false);
    setCurrentId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Siswa</h1>
              <p className="text-gray-600">Kelola data siswa keasramaan</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Tambah Siswa
            </button>
          </div>

          {/* Search Box */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama, NIS, lokasi, kelas, rombel, asrama, kepala asrama, atau musyrif/ah..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Ditemukan {filteredData.length} dari {data.length} siswa
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Memuat data...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">No</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Foto</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">NIS</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Nama</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Lokasi</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Kelas</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Rombel</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Asrama</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Kepala Asrama</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Musyrif/ah</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-6 py-8 text-center text-gray-500">
                          {searchQuery ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data siswa'}
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-6 py-4 text-gray-700">{index + 1}</td>
                          <td className="px-6 py-4">
                            <FotoSiswa foto={item.foto} nama={item.nama_siswa} />
                          </td>
                          <td className="px-6 py-4 text-gray-700 font-mono">{item.nis}</td>
                          <td className="px-6 py-4 text-gray-800 font-medium">{item.nama_siswa}</td>
                          <td className="px-6 py-4 text-gray-700">{item.lokasi || '-'}</td>
                          <td className="px-6 py-4 text-gray-700">{item.kelas || '-'}</td>
                          <td className="px-6 py-4 text-gray-700">{item.rombel || '-'}</td>
                          <td className="px-6 py-4 text-gray-700">{item.asrama || '-'}</td>
                          <td className="px-6 py-4 text-gray-700">{item.kepala_asrama || '-'}</td>
                          <td className="px-6 py-4 text-gray-700">{item.musyrif || '-'}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editMode ? 'Edit Data Siswa' : 'Tambah Data Siswa'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Foto Upload */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {fotoPreview ? (
                    <div className="relative group">
                      <img
                        src={fotoPreview}
                        alt="Foto Siswa"
                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveFoto}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="foto-upload"
                  />
                  <label
                    htmlFor="foto-upload"
                    className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama_siswa}
                    onChange={(e) => setFormData({ ...formData, nama_siswa: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nama Siswa"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIS <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nomor Induk Siswa"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi</label>
                  <select
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Pilih Lokasi</option>
                    {lokasiList.map((lokasi) => (
                      <option key={lokasi.id} value={lokasi.lokasi}>{lokasi.lokasi}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                  <select
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                    disabled={!formData.lokasi}
                  >
                    <option value="">{formData.lokasi ? 'Pilih Kelas' : 'Pilih Lokasi Dulu'}</option>
                    {filteredKelasList.map((kelas) => (
                      <option key={kelas.id} value={kelas.nama_kelas}>{kelas.nama_kelas}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rombel</label>
                  <select
                    value={formData.rombel}
                    onChange={(e) => setFormData({ ...formData, rombel: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                    disabled={!formData.kelas}
                  >
                    <option value="">{formData.kelas ? 'Pilih Rombel' : 'Pilih Kelas Dulu'}</option>
                    {filteredRombelList.map((rombel) => (
                      <option key={rombel.id} value={rombel.nama_rombel}>{rombel.nama_rombel}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asrama</label>
                  <select
                    value={formData.asrama}
                    onChange={(e) => setFormData({ ...formData, asrama: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                    disabled={!formData.lokasi || !formData.kelas}
                  >
                    <option value="">
                      {!formData.lokasi ? 'Pilih Lokasi Dulu' : !formData.kelas ? 'Pilih Kelas Dulu' : 'Pilih Asrama'}
                    </option>
                    {filteredAsramaList.map((asrama) => (
                      <option key={asrama.id} value={asrama.asrama}>{asrama.asrama}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kepala Asrama</label>
                  <select
                    value={formData.kepala_asrama}
                    onChange={(e) => setFormData({ ...formData, kepala_asrama: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                    disabled={!formData.lokasi}
                  >
                    <option value="">
                      {!formData.lokasi ? 'Pilih Lokasi Dulu' : 'Pilih Kepala Asrama'}
                    </option>
                    {filteredKepalaAsramaList.map((kepala) => (
                      <option key={kepala.id} value={kepala.nama}>{kepala.nama}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Musyrif/ah</label>
                  <select
                    value={formData.musyrif}
                    onChange={(e) => setFormData({ ...formData, musyrif: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                    disabled={!formData.asrama}
                  >
                    <option value="">
                      {!formData.asrama ? 'Pilih Asrama Dulu' : 'Pilih Musyrif/ah'}
                    </option>
                    {filteredMusyrifList.map((musyrif) => (
                      <option key={musyrif.id} value={musyrif.nama_musyrif}>{musyrif.nama_musyrif}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  {uploading ? 'Mengupload...' : editMode ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Component untuk menampilkan foto siswa di tabel
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
      <img
        src={fotoUrl}
        alt={nama}
        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
      <User className="w-5 h-5 text-gray-400" />
    </div>
  );
}
