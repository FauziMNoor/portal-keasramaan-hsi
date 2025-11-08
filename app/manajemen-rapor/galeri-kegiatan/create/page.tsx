'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateKegiatanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_kegiatan: '',
    deskripsi: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    tahun_ajaran: '',
    semester: 'Ganjil',
    scope: 'seluruh_sekolah',
    kelas_id: '',
    asrama_id: '',
  });

  // Auto-populate tahun ajaran based on current date
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 0-indexed
    
    // If month is July-December, it's the first semester (Ganjil) of year/year+1
    // If month is January-June, it's the second semester (Genap) of year-1/year
    let tahunAjaran = '';
    let semester = 'Ganjil';
    
    if (month >= 7) {
      tahunAjaran = `${year}/${year + 1}`;
      semester = 'Ganjil';
    } else {
      tahunAjaran = `${year - 1}/${year}`;
      semester = 'Genap';
    }
    
    setFormData(prev => ({
      ...prev,
      tahun_ajaran: tahunAjaran,
      semester: semester,
    }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nama_kegiatan || !formData.tanggal_mulai || !formData.tanggal_selesai) {
      alert('Nama kegiatan dan tanggal harus diisi');
      return;
    }

    if (new Date(formData.tanggal_selesai) < new Date(formData.tanggal_mulai)) {
      alert('Tanggal selesai tidak boleh lebih awal dari tanggal mulai');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/rapor/kegiatan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Kegiatan berhasil dibuat');
        router.push('/manajemen-rapor/galeri-kegiatan');
      } else {
        alert(result.error || 'Gagal membuat kegiatan');
      }
    } catch (error) {
      console.error('Error creating kegiatan:', error);
      alert('Terjadi kesalahan saat membuat kegiatan');
    } finally {
      setLoading(false);
    }
  };

  const scopeRequiresKelas = ['kelas_10', 'kelas_11', 'kelas_12'].includes(formData.scope);
  const scopeRequiresAsrama = ['asrama_putra', 'asrama_putri'].includes(formData.scope);

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/manajemen-rapor/galeri-kegiatan"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Daftar Kegiatan
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tambah Kegiatan Baru</h1>
        <p className="text-gray-600">Buat kegiatan baru untuk dokumentasi asrama</p>
      </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama Kegiatan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama_kegiatan"
                value={formData.nama_kegiatan}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Susur Sungai"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Deskripsi singkat tentang kegiatan..."
              />
            </div>

            {/* Tanggal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal_mulai"
                  value={formData.tanggal_mulai}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal_selesai"
                  value={formData.tanggal_selesai}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tahun Ajaran & Semester */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun Ajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tahun_ajaran"
                  value={formData.tahun_ajaran}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: 2024/2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
            </div>

            {/* Scope */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cakupan Peserta <span className="text-red-500">*</span>
              </label>
              <select
                name="scope"
                value={formData.scope}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="seluruh_sekolah">Seluruh Sekolah</option>
                <option value="kelas_10">Kelas 10</option>
                <option value="kelas_11">Kelas 11</option>
                <option value="kelas_12">Kelas 12</option>
                <option value="asrama_putra">Asrama Putra</option>
                <option value="asrama_putri">Asrama Putri</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Tentukan siapa saja yang mengikuti kegiatan ini
              </p>
            </div>

            {/* Conditional Fields */}
            {scopeRequiresKelas && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelas ID (Opsional)
                </label>
                <input
                  type="text"
                  name="kelas_id"
                  value={formData.kelas_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="UUID kelas (jika ada)"
                />
              </div>
            )}

            {scopeRequiresAsrama && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asrama ID (Opsional)
                </label>
                <input
                  type="text"
                  name="asrama_id"
                  value={formData.asrama_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="UUID asrama (jika ada)"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Menyimpan...' : 'Simpan Kegiatan'}
              </button>
              <Link
                href="/manajemen-rapor/galeri-kegiatan"
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </Link>
            </div>
          </form>
        </div>
    </>
  );
}
