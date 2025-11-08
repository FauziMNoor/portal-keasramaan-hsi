'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, GripVertical, ChevronDown, ChevronRight, Save, X } from 'lucide-react';
import { SkeletonList } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContainer';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Kategori {
  id: string;
  nama_kategori: string;
  urutan: number;
  rapor_indikator?: Indikator[];
}

interface Indikator {
  id: string;
  kategori_id: string;
  nama_indikator: string;
  deskripsi: string | null;
  urutan: number;
}

interface KategoriWithIndikator extends Kategori {
  rapor_indikator_keasramaan?: Indikator[];
}

export default function IndikatorCapaianPage() {
  const toast = useToast();
  const [kategoriList, setKategoriList] = useState<KategoriWithIndikator[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedKategori, setExpandedKategori] = useState<Set<string>>(new Set());
  
  // Edit states
  const [editingKategori, setEditingKategori] = useState<string | null>(null);
  const [editingIndikator, setEditingIndikator] = useState<string | null>(null);
  const [editKategoriValue, setEditKategoriValue] = useState('');
  const [editIndikatorValue, setEditIndikatorValue] = useState({ nama: '', deskripsi: '' });
  
  // Add states
  const [showAddKategori, setShowAddKategori] = useState(false);
  const [newKategoriName, setNewKategoriName] = useState('');
  const [addingIndikatorTo, setAddingIndikatorTo] = useState<string | null>(null);
  const [newIndikator, setNewIndikator] = useState({ nama: '', deskripsi: '' });
  
  // Delete dialogs
  const [deleteKategoriDialog, setDeleteKategoriDialog] = useState<{ isOpen: boolean; id: string; nama: string }>({
    isOpen: false,
    id: '',
    nama: '',
  });
  const [deleteIndikatorDialog, setDeleteIndikatorDialog] = useState<{ isOpen: boolean; id: string; nama: string }>({
    isOpen: false,
    id: '',
    nama: '',
  });

  useEffect(() => {
    fetchKategori();
  }, []);

  const fetchKategori = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rapor/indikator/kategori');
      const result = await response.json();

      if (result.success) {
        setKategoriList(result.data);
        // Auto-expand all by default
        const allIds = new Set<string>(result.data.map((k: KategoriWithIndikator) => k.id));
        setExpandedKategori(allIds);
      } else {
        toast.error('Gagal memuat data kategori');
      }
    } catch (error) {
      console.error('Error fetching kategori:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const toggleKategori = (id: string) => {
    const newExpanded = new Set(expandedKategori);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedKategori(newExpanded);
  };

  // Kategori CRUD
  const handleAddKategori = async () => {
    if (!newKategoriName.trim()) {
      toast.warning('Nama kategori harus diisi');
      return;
    }

    try {
      const response = await fetch('/api/rapor/indikator/kategori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama_kategori: newKategoriName }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Kategori berhasil ditambahkan');
        setNewKategoriName('');
        setShowAddKategori(false);
        fetchKategori();
      } else {
        toast.error(result.error || 'Gagal menambah kategori');
      }
    } catch (error) {
      console.error('Error adding kategori:', error);
      toast.error('Terjadi kesalahan saat menambah kategori');
    }
  };

  const handleUpdateKategori = async (id: string) => {
    if (!editKategoriValue.trim()) {
      toast.warning('Nama kategori harus diisi');
      return;
    }

    try {
      const response = await fetch(`/api/rapor/indikator/kategori/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama_kategori: editKategoriValue }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Kategori berhasil diupdate');
        setEditingKategori(null);
        fetchKategori();
      } else {
        toast.error(result.error || 'Gagal mengupdate kategori');
      }
    } catch (error) {
      console.error('Error updating kategori:', error);
      toast.error('Terjadi kesalahan saat mengupdate kategori');
    }
  };

  const handleDeleteKategori = async () => {
    const { id } = deleteKategoriDialog;
    setDeleteKategoriDialog({ isOpen: false, id: '', nama: '' });

    try {
      const response = await fetch(`/api/rapor/indikator/kategori/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Kategori berhasil dihapus');
        fetchKategori();
      } else {
        toast.error(result.error || 'Gagal menghapus kategori');
      }
    } catch (error) {
      console.error('Error deleting kategori:', error);
      toast.error('Terjadi kesalahan saat menghapus kategori');
    }
  };

  // Indikator CRUD
  const handleAddIndikator = async (kategori_id: string) => {
    if (!newIndikator.nama.trim()) {
      toast.warning('Nama indikator harus diisi');
      return;
    }

    try {
      const response = await fetch('/api/rapor/indikator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kategori_id,
          nama_indikator: newIndikator.nama,
          deskripsi: newIndikator.deskripsi || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Indikator berhasil ditambahkan');
        setNewIndikator({ nama: '', deskripsi: '' });
        setAddingIndikatorTo(null);
        fetchKategori();
      } else {
        toast.error(result.error || 'Gagal menambah indikator');
      }
    } catch (error) {
      console.error('Error adding indikator:', error);
      toast.error('Terjadi kesalahan saat menambah indikator');
    }
  };

  const handleUpdateIndikator = async (id: string) => {
    if (!editIndikatorValue.nama.trim()) {
      toast.warning('Nama indikator harus diisi');
      return;
    }

    try {
      const response = await fetch(`/api/rapor/indikator/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_indikator: editIndikatorValue.nama,
          deskripsi: editIndikatorValue.deskripsi || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Indikator berhasil diupdate');
        setEditingIndikator(null);
        fetchKategori();
      } else {
        toast.error(result.error || 'Gagal mengupdate indikator');
      }
    } catch (error) {
      console.error('Error updating indikator:', error);
      toast.error('Terjadi kesalahan saat mengupdate indikator');
    }
  };

  const handleDeleteIndikator = async () => {
    const { id } = deleteIndikatorDialog;
    setDeleteIndikatorDialog({ isOpen: false, id: '', nama: '' });

    try {
      const response = await fetch(`/api/rapor/indikator/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Indikator berhasil dihapus');
        fetchKategori();
      } else {
        toast.error(result.error || 'Gagal menghapus indikator');
      }
    } catch (error) {
      console.error('Error deleting indikator:', error);
      toast.error('Terjadi kesalahan saat menghapus indikator');
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Indikator & Capaian</h1>
        <p className="text-gray-600">Kelola kategori dan indikator penilaian keasramaan</p>
      </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowAddKategori(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Tambah Kategori
              </button>
              <Link
                href="/manajemen-rapor/indikator-capaian/input-capaian"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Input Capaian Siswa
              </Link>
            </div>
          </div>
        </div>

        {/* Add Kategori Form */}
        {showAddKategori && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border-2 border-blue-500">
            <h3 className="font-semibold text-gray-800 mb-3">Tambah Kategori Baru</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nama kategori (contoh: UBUDIYAH)"
                value={newKategoriName}
                onChange={(e) => setNewKategoriName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKategori()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={handleAddKategori}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setShowAddKategori(false);
                  setNewKategoriName('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <SkeletonList />
        ) : kategoriList.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum Ada Kategori</h3>
            <p className="text-gray-600 mb-4">Mulai tambahkan kategori indikator penilaian</p>
            <button
              onClick={() => setShowAddKategori(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tambah Kategori Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {kategoriList.map((kategori) => (
              <div key={kategori.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Kategori Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleKategori(kategori.id)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      {expandedKategori.has(kategori.id) ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    
                    {editingKategori === kategori.id ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={editKategoriValue}
                          onChange={(e) => setEditKategoriValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdateKategori(kategori.id)}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateKategori(kategori.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingKategori(null)}
                          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="flex-1 text-lg font-semibold text-gray-800">
                          {kategori.nama_kategori}
                        </h3>
                        <span className="text-sm text-gray-600">
                          {kategori.rapor_indikator_keasramaan?.length || 0} indikator
                        </span>
                        <button
                          onClick={() => {
                            setEditingKategori(kategori.id);
                            setEditKategoriValue(kategori.nama_kategori);
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteKategoriDialog({ isOpen: true, id: kategori.id, nama: kategori.nama_kategori })}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setAddingIndikatorTo(kategori.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Indikator
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Indikator List */}
                {expandedKategori.has(kategori.id) && (
                  <div className="p-4">
                    {/* Add Indikator Form */}
                    {addingIndikatorTo === kategori.id && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-gray-800 mb-2 text-sm">Tambah Indikator Baru</h4>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Nama indikator"
                            value={newIndikator.nama}
                            onChange={(e) => setNewIndikator({ ...newIndikator, nama: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            autoFocus
                          />
                          <input
                            type="text"
                            placeholder="Deskripsi (opsional)"
                            value={newIndikator.deskripsi}
                            onChange={(e) => setNewIndikator({ ...newIndikator, deskripsi: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddIndikator(kategori.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => {
                                setAddingIndikatorTo(null);
                                setNewIndikator({ nama: '', deskripsi: '' });
                              }}
                              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Indikator Items */}
                    {kategori.rapor_indikator_keasramaan && kategori.rapor_indikator_keasramaan.length > 0 ? (
                      <div className="space-y-2">
                        {kategori.rapor_indikator_keasramaan.map((indikator) => (
                          <div
                            key={indikator.id}
                            className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <GripVertical className="w-5 h-5 text-gray-400 cursor-move mt-0.5" />
                            
                            {editingIndikator === indikator.id ? (
                              <div className="flex-1 space-y-2">
                                <input
                                  type="text"
                                  value={editIndikatorValue.nama}
                                  onChange={(e) => setEditIndikatorValue({ ...editIndikatorValue, nama: e.target.value })}
                                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  autoFocus
                                />
                                <input
                                  type="text"
                                  value={editIndikatorValue.deskripsi}
                                  onChange={(e) => setEditIndikatorValue({ ...editIndikatorValue, deskripsi: e.target.value })}
                                  placeholder="Deskripsi (opsional)"
                                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateIndikator(indikator.id)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingIndikator(null)}
                                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800 text-sm">{indikator.nama_indikator}</p>
                                  {indikator.deskripsi && (
                                    <p className="text-gray-600 text-xs mt-1">{indikator.deskripsi}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setEditingIndikator(indikator.id);
                                    setEditIndikatorValue({
                                      nama: indikator.nama_indikator,
                                      deskripsi: indikator.deskripsi || '',
                                    });
                                  }}
                                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteIndikatorDialog({ isOpen: true, id: indikator.id, nama: indikator.nama_indikator })}
                                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-4">
                        Belum ada indikator. Klik tombol &quot;+ Indikator&quot; untuk menambah.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Delete Kategori Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteKategoriDialog.isOpen}
          title="Hapus Kategori"
          message={`Apakah Anda yakin ingin menghapus kategori "${deleteKategoriDialog.nama}"? Semua indikator di dalamnya akan ikut terhapus.`}
          confirmText="Hapus"
          cancelText="Batal"
          confirmVariant="danger"
          onConfirm={handleDeleteKategori}
          onCancel={() => setDeleteKategoriDialog({ isOpen: false, id: '', nama: '' })}
        />

        {/* Delete Indikator Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteIndikatorDialog.isOpen}
          title="Hapus Indikator"
          message={`Apakah Anda yakin ingin menghapus indikator "${deleteIndikatorDialog.nama}"?`}
          confirmText="Hapus"
          cancelText="Batal"
          confirmVariant="danger"
          onConfirm={handleDeleteIndikator}
          onCancel={() => setDeleteIndikatorDialog({ isOpen: false, id: '', nama: '' })}
        />
    </>
  );
}
