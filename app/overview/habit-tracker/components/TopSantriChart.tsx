interface TopSantriChartProps {
  data: Array<{
    nama: string;
    nilai: number;
  }>;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#22C55E', '#6366F1', '#F97316', '#14B8A6', '#A855F7'];

export default function TopSantriChart({ data }: TopSantriChartProps) {
  // Calculate percentage for each santri (max 70)
  const maxValue = 70;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
      {/* Header - Clean & Simple */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-700">Top 10 Santri Terbaik</h3>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Peringkat berdasarkan rata-rata nilai</p>
      </div>

      {/* Clean Bar List */}
      <div className="space-y-3 sm:space-y-4">
        {data.map((item, index) => {
          const percentage = (item.nilai / maxValue) * 100;
          const displayName = item.nama.length > 20 ? item.nama.substring(0, 18) + '...' : item.nama;
          
          return (
            <div key={index} className="group">
              {/* Label & Value Row */}
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors truncate mr-2">
                  {displayName}
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-800 flex-shrink-0">
                  {Math.round(percentage)}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="relative h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out group-hover:opacity-90"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
