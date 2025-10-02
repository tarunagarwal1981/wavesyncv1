export function DocumentsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Statistics Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-50 p-4 rounded-lg border animate-pulse">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="ml-3">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="flex items-center gap-2">
          <div className="h-9 bg-gray-200 rounded w-[100px] animate-pulse"></div>
          <div className="h-9 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 border rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 bg-gray-200 rounded w-16"></div>
              <div className="flex gap-1">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>

            <div className="border-t pt-3 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
                <div className="text-center">
                  <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Area Skeleton */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters Skeleton */}
          <div className="bg-gray-50 border rounded-lg p-4 animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-9 bg-gray-200 rounded w-24 animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Documents Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-50 border rounded-lg p-4 animate-pulse">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="flex gap-1">
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
