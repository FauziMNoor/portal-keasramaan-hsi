import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RadarProfileChartProps {
  data: {
    santriTerbaik: Array<{
      kategori: string;
      nilai: number;
      maxNilai: number;
    }>;
    rataRataKelas: Array<{
      kategori: string;
      nilai: number;
      maxNilai: number;
    }>;
  };
}

export default function RadarProfileChart({ data }: RadarProfileChartProps) {
  // Combine data for radar chart
  const radarData = data.santriTerbaik.map((item, index) => ({
    kategori: item.kategori,
    'Santri Terbaik': Math.round((item.nilai / item.maxNilai) * 100),
    'Rata-rata Kelas': Math.round((data.rataRataKelas[index].nilai / data.rataRataKelas[index].maxNilai) * 100),
  }));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      {/* Header - Clean & Simple */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-700">Profil Habit Santri</h3>
        <p className="text-xs text-gray-500 mt-1">Perbandingan aspek kuat & lemah (dalam %)</p>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis 
            dataKey="kategori" 
            tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#6B7280' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: 'none', 
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px',
              padding: '8px 12px'
            }}
            formatter={(value: any) => `${value}%`}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="circle"
          />
          <Radar 
            name="Santri Terbaik" 
            dataKey="Santri Terbaik" 
            stroke="#8B5CF6" 
            fill="#8B5CF6" 
            fillOpacity={0.6}
            strokeWidth={2}
          />
          <Radar 
            name="Rata-rata Kelas" 
            dataKey="Rata-rata Kelas" 
            stroke="#10B981" 
            fill="#10B981" 
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
