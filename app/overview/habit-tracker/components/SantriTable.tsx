import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from 'lucide-react';

interface SantriTableProps {
  data: Array<{
    ranking: number;
    nama_siswa: string;
    nis: string;
    kelas: string;
    asrama: string;
    foto: string;
    rata_rata: number;
    predikat: string;
  }>;
}

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

export default function SantriTable({ data }: SantriTableProps) {
  const getPredikatColor = (predikat: string) => {
    switch (predikat.toLowerCase()) {
      case 'sangat baik':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'baik':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'cukup':
        return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white';
      case 'kurang':
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">👥 Ranking Santri</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Total: {data.length} santri</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Santri</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asrama</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rata-rata</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Predikat</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((santri) => (
                <tr key={santri.nis} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {santri.ranking <= 3 ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold text-sm">
                        {santri.ranking}
                      </span>
                    ) : (
                      santri.ranking
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <FotoSiswa foto={santri.foto} nama={santri.nama_siswa} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{santri.nama_siswa}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{santri.nis}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{santri.kelas}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{santri.asrama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-gray-900">{Math.round(santri.rata_rata)}/70</span>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                          style={{ width: `${(santri.rata_rata / 70) * 100}%` }}
                        ></div>
                      </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getPredikatColor(santri.predikat)}`}>
                    {santri.predikat}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Mobile Card View */}
    <div className="lg:hidden bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-800">👥 Ranking Santri</h3>
        <p className="text-xs text-gray-600 mt-1">Total: {data.length} santri</p>
      </div>

      <div className="p-4 space-y-4">
        {data.map((santri) => (
          <div key={santri.nis} className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-all">
            {/* Header with Rank and Photo */}
            <div className="flex items-start gap-3 mb-3 pb-3 border-b border-gray-100">
              <div className="shrink-0">
                {santri.ranking <= 3 ? (
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold text-base shadow-md">
                    {santri.ranking}
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-600 font-bold text-base">
                    {santri.ranking}
                  </span>
                )}
              </div>
              <div className="shrink-0">
                <FotoSiswa foto={santri.foto} nama={santri.nama_siswa} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-base truncate">{santri.nama_siswa}</p>
                <p className="text-xs text-gray-500 font-mono">{santri.nis}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-gray-700">{santri.kelas}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{santri.asrama}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              {/* Rata-rata */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Rata-rata</span>
                  <span className="text-sm font-bold text-gray-900">{Math.round(santri.rata_rata)}/70</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${(santri.rata_rata / 70) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Predikat */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Predikat</span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getPredikatColor(santri.predikat)}`}>
                  {santri.predikat}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
  );
}
