'use client';

import React, { useState } from 'react';
import { CircularFilters } from '@/components/circulars/CircularFilters';
import { CircularCard } from '@/components/circulars/CircularCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CircularListResponse, CircularFilters as IFilters } from '@/lib/circulars/types';
import { getCirculars, getUnreadCount, getUnreadAcknowledgmentCount } from '@/lib/circulars/queries';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export function CircularsContent() {
  const [filters, setFilters] = useState<IFilters>({ page: 1, limit: 20 });
  const [data, setData] = useState<CircularListResponse | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [acknowledgmentCount, setAcknowledgmentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [circularsData, unreadData, acknowledgmentData] = await Promise.all([
        getCirculars(filters),
        getUnreadCount(),
        getUnreadAcknowledgmentCount()
      ]);
      
      setData(circularsData);
      setUnreadCount(unreadData);
      setAcknowledgmentCount(acknowledgmentData);
    } catch (error) {
      console.error('Failed to load circulars:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount and when filters change
  React.useEffect(() => {
    loadData();
  }, [filters]);

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleFiltersChange = (newFilters: IFilters) => {
    setFilters(newFilters);
  };

  const totalPages = data?.pagination.totalPages || 0;
  const currentPage = filters.page || 1;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Circulars</p>
              <p className="text-2xl font-bold text-blue-900">
                {data?.pagination.total || 0}
              </p>
            </div>
            <div className="text-blue-400">
              📋
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Unread</p>
              <p className="text-2xl font-bold text-orange-900">
                {unreadCount}
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-orange-100 text-orange-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Awaiting Acknowledgment</p>
              <p className="text-2xl font-bold text-red-900">
                {acknowledgmentCount}
              </p>
            </div>
            {acknowledgmentCount > 0 && (
              <Badge className="bg-red-100 text-red-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                {acknowledgmentCount}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <CircularFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
      />

      {/* Circulars List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : data?.circulars.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-2">
              No circulars found
            </div>
            <div className="text-muted-foreground text-sm">
              Try adjusting your filters to see more results
            </div>
          </div>
        ) : (
          <>
            {data?.circulars.map((circular) => (
              <CircularCard key={circular.id} circular={circular} />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
