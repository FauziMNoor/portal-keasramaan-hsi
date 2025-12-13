'use client';

import { useState, useEffect } from 'react';
import { Eye, FileText, Download, Loader2, User, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LeggerData {
  nis: string;
  nama_siswa: string;
  foto_url: string;
  kelas: string;
  asrama: string;
  status: 'ready' | 'incomplete' | 'error';
  statusDetails: {
    santri: boolean;
    habit: boolean;
    kegiatan: number;
    catatan: boolean;
  };
  pdfUrl?: string;
  generating?: boolean;
}

interface LeggerTableProps {
  data: LeggerData[];
  selectedRows: string[];
  onSelectRow: (nis: string) => void;
  onSelectAll: () => void;
  onPreview: (nis: string) => void;
  onGenerate: (nis: string) => void;
  onDelete: (nis: string) => void;
}

export default function LeggerTable({
  data,
  selectedRows,
  onSelectRow,
  onSelectAll,
  onPreview,
  onGenerate,
  onDelete,
}: LeggerTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">✅ Siap</span>;
      case 'incomplete':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">⚠️ Kurang</span>;
      case 'error':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">❌ Error</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={onSelectAll}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Foto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nama Santri</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Kelas</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Action</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row) => (
              <tr key={row.nis} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.nis)}
                    onChange={() => onSelectRow(row.nis)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <FotoSantri foto={row.foto_url} nama={row.nama_siswa} />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{row.nama_siswa}</div>
                  <div className="text-xs text-gray-500">{row.nis}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">{row.kelas}</div>
                  <div className="text-xs text-gray-500">{row.asrama}</div>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(row.status)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onPreview(row.nis)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onGenerate(row.nis)}
                      disabled={row.generating || row.status === 'error'}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Generate Rapor"
                    >
                      {row.generating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {row.pdfUrl ? (
                    <div className="flex items-center justify-center gap-2">
                      <a
                        href={row.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                      <button
                        onClick={() => onDelete(row.nis)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus rapor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Component untuk menampilkan foto santri
function FotoSantri({ foto, nama }: { foto: string; nama: string }) {
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
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
        <img
          src={fotoUrl}
          alt={nama}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
      <User className="w-5 h-5 text-gray-400" />
    </div>
  );
}
