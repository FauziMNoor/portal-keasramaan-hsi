// Skeleton loading component for Template Builder

export default function TemplateBuilderSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar Skeleton */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm animate-pulse">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
          <div className="border-l border-gray-300 h-8"></div>
          <div>
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-20 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Main Content: Three-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Components Sidebar Skeleton */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 animate-pulse">
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Canvas Skeleton */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="bg-white rounded-lg shadow-lg mx-auto animate-pulse" style={{ width: '210mm', height: '297mm' }}>
            <div className="p-8 space-y-6">
              {/* Header area */}
              <div className="h-24 bg-gray-200 rounded"></div>
              
              {/* Content areas */}
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              
              {/* Table area */}
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
              
              {/* Image area */}
              <div className="grid grid-cols-3 gap-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Properties Panel Skeleton */}
        <div className="w-80 bg-white border-l border-gray-200 p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
          
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
