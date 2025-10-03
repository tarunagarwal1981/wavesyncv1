export function DocumentDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 bg-gray-200 rounded w-20 animate-pulse"></div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Document Preview Skeleton */}
        <div className="lg:col-span-2">
          <div className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
            {/* Preview Header */}
            <div className="bg-gray-50 px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 rounded w-40"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            
            {/* Preview Content */}
            <div className="bg-gray-50" style={{ height: '600px' }}>
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Details Skeleton */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg animate-pulse">
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-32 ml-6"></div>
                    {i < 5 && <div className="h-px bg-gray-300"></div>}
                  </div>
                ))}
                
                {/* Action Buttons */}
                <div className="space-y-2 pt-4">
                  <div className="h-9 bg-gray-200 rounded w-full"></div>
                  <div className="h-9 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg animate-pulse">
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded w-28 mb-4"></div>
              
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



