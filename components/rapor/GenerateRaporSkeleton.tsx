// Skeleton loading component for Generate Rapor page

export default function GenerateRaporSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-64"></div>
      </div>

      {/* Main Form Skeleton */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 animate-pulse">
        {/* Template Selection Skeleton */}
        <div className="mb-6">
          <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
        </div>

        {/* Periode Selection Skeleton */}
        <div className="mb-6">
          <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Student Filter Skeleton */}
        <div className="mb-6">
          <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
            </div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Generate Button Skeleton */}
        <div className="flex justify-end">
          <div className="h-12 bg-gray-200 rounded w-full sm:w-48"></div>
        </div>
      </div>
    </div>
  );
}
