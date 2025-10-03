export function NotificationsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="ml-3">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Card Skeleton */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg animate-pulse">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-40"></div>
          </div>

          {/* Search Bar */}
          <div className="h-10 bg-gray-200 rounded mb-4"></div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 bg-gray-200 rounded w-24 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List Skeleton */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, groupIndex) => (
          <div key={groupIndex} className="space-y-3">
            {/* Group Header */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>

            {/* Notification Items */}
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, itemIndex) => (
                <div key={itemIndex} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="flex gap-2 mt-3">
                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



