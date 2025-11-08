// Skeleton loading component for Template List page

export default function TemplateListSkeleton() {
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
          <div className="flex gap-2 w-full md:w-auto">
            <div className="h-10 bg-gray-200 rounded flex-1 md:w-32"></div>
            <div className="h-10 bg-gray-200 rounded flex-1 md:w-40"></div>
          </div>
        </div>
      </div>

      {/* Template Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
