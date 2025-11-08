// Reusable skeleton loading components

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6">
        <div className="h-6 skeleton-shimmer rounded w-3/4 mb-3"></div>
        <div className="h-4 skeleton-shimmer rounded w-full mb-2"></div>
        <div className="h-4 skeleton-shimmer rounded w-2/3 mb-4"></div>
        <div className="flex gap-2 mb-4">
          <div className="h-6 skeleton-shimmer rounded-full w-20"></div>
          <div className="h-6 skeleton-shimmer rounded-full w-20"></div>
        </div>
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <div className="flex-1 h-10 skeleton-shimmer rounded-lg"></div>
          <div className="h-10 w-10 skeleton-shimmer rounded-lg"></div>
          <div className="h-10 w-10 skeleton-shimmer rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-gray-200">
        <div className="h-6 skeleton-shimmer rounded w-1/4"></div>
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 border-b border-gray-200 flex items-center gap-4">
          <div className="h-4 skeleton-shimmer rounded w-1/4"></div>
          <div className="h-4 skeleton-shimmer rounded w-1/3"></div>
          <div className="h-4 skeleton-shimmer rounded w-1/6"></div>
          <div className="flex-1"></div>
          <div className="h-8 w-20 skeleton-shimmer rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-4 skeleton-shimmer rounded w-1/4 mb-2"></div>
            <div className="h-10 skeleton-shimmer rounded w-full"></div>
          </div>
        ))}
        <div className="flex gap-2 pt-4">
          <div className="h-10 skeleton-shimmer rounded flex-1"></div>
          <div className="h-10 skeleton-shimmer rounded flex-1"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-3 stagger-fade-in">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 skeleton-shimmer rounded"></div>
            <div className="flex-1 h-5 skeleton-shimmer rounded"></div>
            <div className="h-8 w-8 skeleton-shimmer rounded"></div>
            <div className="h-8 w-8 skeleton-shimmer rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 animate-fade-in">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 skeleton-shimmer rounded"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        ></div>
      ))}
    </div>
  );
}

export function SkeletonButton() {
  return <div className="h-10 skeleton-shimmer rounded-lg w-32"></div>;
}

export function SkeletonInput() {
  return (
    <div className="space-y-2 animate-fade-in">
      <div className="h-4 skeleton-shimmer rounded w-1/4"></div>
      <div className="h-10 skeleton-shimmer rounded w-full"></div>
    </div>
  );
}
