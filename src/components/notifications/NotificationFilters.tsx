'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { 
  NotificationFilter,
  NotificationType,
  NotificationPriority,
  NOTIFICATION_TYPE_LABELS,
  PRIORITY_LABELS
} from '@/lib/notifications/types';

interface NotificationFiltersProps {
  filters: NotificationFilter;
  onFiltersChange: (filters: NotificationFilter) => void;
  isLoading?: boolean;
}

export function NotificationFilters({ 
  filters, 
  onFiltersChange, 
  isLoading = false 
}: NotificationFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleTypeChange = (type: NotificationType | 'all') => {
    onFiltersChange({ 
      ...filters, 
      type: type === 'all' ? undefined : type
    });
  };

  const handlePriorityChange = (priority: NotificationPriority | 'all') => {
    onFiltersChange({ 
      ...filters, 
      priority: priority === 'all' ? undefined : priority
    });
  };

  const handleReadStatusChange = (isRead: string) => {
    let readStatus: boolean | undefined;
    switch (isRead) {
      case 'read':
        readStatus = true;
        break;
      case 'unread':
        readStatus = false;
        break;
      default:
        readStatus = undefined;
    }
    
    onFiltersChange({ ...filters, isRead: readStatus });
  };

  const handleDateRangeChange = (dateRange: NotificationFilter['dateRange']) => {
    onFiltersChange({ ...filters, dateRange });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = !!(
    filters.search || 
    filters.type || 
    filters.priority ||
    filters.isRead !== undefined ||
    filters.dateRange
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search notifications..."
          value={filters.search || ''}
          onChange={handleSearchChange}
          disabled={isLoading}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Type Filter */}
        <Select 
          value={filters.type || 'all'} 
          onValueChange={handleTypeChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(NOTIFICATION_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select 
          value={filters.priority || 'all'} 
          onValueChange={handlePriorityChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Read Status Filter */}
        <Select 
          value={
            filters.isRead === true ? 'read' : 
            filters.isRead === false ? 'unread' : 
            'all'
          } 
          onValueChange={handleReadStatusChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Select 
          value={filters.dateRange || 'all'} 
          onValueChange={handleDateRangeChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}

        {/* Filter Badge */}
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          className="gap-1"
        >
          <Filter className="h-4 w-4" />
          {(Object.values(filters).filter(Boolean).length)} Filters
        </Button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary">
              Search: "{filters.search}"
              <button 
                onClick={() => onFiltersChange({ ...filters, search: undefined })}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.type && (
            <Badge variant="secondary">
              Type: {NOTIFICATION_TYPE_LABELS[filters.type]}
              <button 
                onClick={() => onFiltersChange({ ...filters, type: undefined })}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.priority && (
            <Badge variant="secondary">
              Priority: {PRIORITY_LABELS[filters.priority]}
              <button 
                onClick={() => onFiltersChange({ ...filters, priority: undefined })}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.isRead !== undefined && (
            <Badge variant="secondary">
              Status: {filters.isRead ? 'Read' : 'Unread'}
              <button 
                onClick={() => onFiltersChange({ ...filters, isRead: undefined })}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.dateRange && (
            <Badge variant="secondary">
              Period: {filters.dateRange.replace('_', ' ')}
              <button 
                onClick={() => onFiltersChange({ ...filters, dateRange: undefined })}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
