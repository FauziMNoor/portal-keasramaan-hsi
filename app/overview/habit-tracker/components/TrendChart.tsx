import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface TrendChartProps {
  data: Array<{
    periode: string;
    ubudiyah: number;
    akhlaq: number;
    kedisiplinan: number;
    kebersihan: number;
  }>;
}

export default function TrendChart({ data }: TrendChartProps) {
  // PENJELASAN PERHITUNGAN PERSENTASE:
  // =====================================
  // 1. Hitung rata-rata nilai per kategori dari semua periode (minggu)
  //    Contoh: Jika ada 4 minggu dengan nilai Ubudiyah [23, 24, 22, 24]
  //    Maka avgUbudiyah = (23+24+22+24)/4 = 23.25 ≈ 23

  const avgUbudiyah = Math.round(data.reduce((sum, d) => sum + d.ubudiyah, 0) / data.length);
  const avgAkhlaq = Math.round(data.reduce((sum, d) => sum + d.akhlaq, 0) / data.length);
  const avgKedisiplinan = Math.round(data.reduce((sum, d) => sum + d.kedisiplinan, 0) / data.length);
  const avgKebersihan = Math.round(data.reduce((sum, d) => sum + d.kebersihan, 0) / data.length);

  // 2. Hitung total (untuk ditampilkan di tengah chart)
  const total = avgUbudiyah + avgAkhlaq + avgKedisiplinan + avgKebersihan;

  // 3. Hitung persentase total keseluruhan
  //    Total maksimal = 28 + 12 + 21 + 9 = 70 poin
  //    Persentase = (Total / 70) × 100%
  const totalPersentase = Math.round((total / 70) * 100);

  // 4. Konversi ke PERSENTASE berdasarkan nilai maksimal masing-masing kategori:
  //    - Ubudiyah: max 28 poin (8 indikator)
  //    - Akhlaq: max 12 poin (4 indikator)
  //    - Kedisiplinan: max 21 poin (6 indikator)
  //    - Kebersihan: max 9 poin (3 indikator)
  //
  //    Rumus: (Nilai Rata-rata / Nilai Maksimal) × 100%
  //
  //    Contoh perhitungan:
  //    - Jika avgUbudiyah = 23, maka persentase = (23/28) × 100% = 82.14% ≈ 82%
  //    - Jika avgAkhlaq = 12, maka persentase = (12/12) × 100% = 100%
  //    - Jika avgKedisiplinan = 18, maka persentase = (18/21) × 100% = 85.71% ≈ 86%
  //    - Jika avgKebersihan = 9, maka persentase = (9/9) × 100% = 100%

  const radialData = [
    {
      name: 'Ubudiyah',
      value: Math.round((avgUbudiyah / 28) * 100), // Persentase dari max 28
      actualValue: avgUbudiyah,
      maxValue: 28,
      fill: '#22C55E',
    },
    {
      name: 'Akhlaq',
      value: Math.round((avgAkhlaq / 12) * 100), // Persentase dari max 12
      actualValue: avgAkhlaq,
      maxValue: 12,
      fill: '#F59E0B',
    },
    {
      name: 'Kedisiplinan',
      value: Math.round((avgKedisiplinan / 21) * 100), // Persentase dari max 21
      actualValue: avgKedisiplinan,
      maxValue: 21,
      fill: '#3B82F6',
    },
    {
      name: 'Kebersihan',
      value: Math.round((avgKebersihan / 9) * 100), // Persentase dari max 9
      actualValue: avgKebersihan,
      maxValue: 9,
      fill: '#EC4899',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      {/* Header - Clean & Simple */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-700">Perkembangan Nilai Habit</h3>
        <p className="text-xs text-gray-500 mt-1">Rata-rata persentase pencapaian per kategori</p>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={450}>
          <RadialBarChart
            cx="50%"
            cy="48%"
            innerRadius="35%"
            outerRadius="95%"
            data={radialData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              background={{ fill: '#F3F4F6' }}
              dataKey="value"
              cornerRadius={10}
            />
            <Legend
              iconSize={12}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: '30px', fontSize: '13px' }}
              formatter={(value, entry: any) => (
                <span style={{ color: '#374151', fontWeight: 500 }}>
                  {value} ({entry.payload.value}%)
                </span>
              )}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                padding: '8px 12px',
              }}
              formatter={(value: any, name: any, props: any) => [
                `${value}% (${props.payload.actualValue}/${props.payload.maxValue})`,
                'Pencapaian'
              ]}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center Text - Persentase Total */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
          style={{ marginTop: '-10px' }}
        >
          <p className="text-5xl font-bold text-gray-800">
            {totalPersentase}%
          </p>
        </div>
      </div>
    </div>
  );
}
