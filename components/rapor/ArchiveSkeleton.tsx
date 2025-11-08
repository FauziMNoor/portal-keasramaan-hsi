// Skeleton loading component for Archive Rapor page

export default function ArchiveSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-64"></div>
      </div>

      {/* Actions Bar Skeleton */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 animate-pulse">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="h-10 bg-gray-200 rounded flex-1 w-full md:w-auto"></div>
          <div className="h-10 bg-gray-200 rounded w-full md:w-32"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Desktop Table Skeleton */}
        <div className="hidden md:block">
          <div className="bg-gray-50 border-b border-gray-200 p-4 animate-pulse">
            <div className="grid grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="border-b border-gray-200 p-4 animate-pulse">
              <div className="grid grid-cols-6 gap-4 items-center">
                <div className="col-span-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Cards Skeleton */}
        <div className="md:hidden divide-y divide-gray-200">
          {[1, 2, 3, 4, 5].map((card) => (
            <div key={card} className="p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
