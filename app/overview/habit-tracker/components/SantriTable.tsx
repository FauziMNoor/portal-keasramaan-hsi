import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronUp, ChevronDown, Minus, User } from 'lucide-react';

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
    trend: 'up' | 'down' | 'stable';
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
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">👥 Ranking Santri</h3>
        <p className="text-sm text-gray-600 mt-1">Total: {data.length} santri</p>
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
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Predikat</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((santri) => (
              <tr key={santri.nis} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {santri.ranking <= 3 ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold">
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
                    <span className="text-sm font-bold text-gray-900">{santri.rata_rata.toFixed(1)}/70</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                        style={{ width: `${(santri.rata_rata / 70) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {santri.trend === 'up' && <ChevronUp className="w-5 h-5 text-green-500 mx-auto" />}
                  {santri.trend === 'down' && <ChevronDown className="w-5 h-5 text-red-500 mx-auto" />}
                  {santri.trend === 'stable' && <Minus className="w-5 h-5 text-gray-400 mx-auto" />}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    santri.predikat === 'Mumtaz' ? 'bg-green-100 text-green-800' :
                    santri.predikat === 'Jayyid Jiddan' ? 'bg-blue-100 text-blue-800' :
                    santri.predikat === 'Jayyid' ? 'bg-yellow-100 text-yellow-800' :
                    santri.predikat === 'Dhaif' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {santri.predikat}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
