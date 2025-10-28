import { TrendingUp, Users, Award, Target } from 'lucide-react';

interface StatsCardsProps {
  data: {
    totalSantriDisiplin: number;
    totalSantri: number;
    persentaseDisiplin: number;
    rataRataNilai: number;
    asramaTerbaik: { nama: string; nilai: number };
    musyrifTerbaik: { nama: string; jumlahSantri: number };
  };
}

export default function StatsCards({ data }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Card 1: Santri Disiplin */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
            {data.persentaseDisiplin}%
          </span>
        </div>
        <h3 className="text-3xl font-bold mb-1">{data.totalSantriDisiplin}/{data.totalSantri}</h3>
        <p className="text-green-100 text-sm">Santri Disiplin</p>
        <p className="text-xs text-green-200 mt-2">Rata-rata &gt; 2.5</p>
      </div>

      {/* Card 2: Rata-rata Nilai */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <h3 className="text-3xl font-bold mb-1">{data.rataRataNilai.toFixed(1)}/70</h3>
        <p className="text-blue-100 text-sm">Rata-rata Habit</p>
        <p className="text-xs text-blue-200 mt-2">Seluruh santri</p>
      </div>

      {/* Card 3: Asrama Terbaik */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-1">{data.asramaTerbaik.nama}</h3>
        <p className="text-yellow-100 text-sm">Asrama Terbaik</p>
        <p className="text-xs text-yellow-200 mt-2">Nilai: {data.asramaTerbaik.nilai.toFixed(1)}</p>
      </div>

      {/* Card 4: Musyrif Terbaik */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-1">{data.musyrifTerbaik.nama}</h3>
        <p className="text-purple-100 text-sm">Musyrif Terbaik</p>
        <p className="text-xs text-purple-200 mt-2">{data.musyrifTerbaik.jumlahSantri} santri</p>
      </div>
    </div>
  );
}
