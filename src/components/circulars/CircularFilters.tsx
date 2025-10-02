'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, Calendar as CalendarIcon, X } from 'lucide-react';
import { CircularFilters as IFilters, CircularCategory, PriorityLevel, ReadStatus } from '@/lib/circulars/types';
import { format } from 'date-fns';

interface CircularFiltersProps {
  filters: IFilters;
  onFiltersChange: (filters: IFilters) => void;
  isLoading?: boolean;
}

export function CircularFilters({ filters, onFiltersChange, isLoading }: CircularFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value, page: 1 });
  };

  const handleCategoryChange = (category: CircularCategory | 'all') => {
    onFiltersChange({ 
      ...filters, 
      category: category === 'all' ? undefined : category,
      page: 1 
    });
  };

  const handlePriorityChange = (priority: PriorityLevel | 'all') => {
    onFiltersChange({ 
      ...filters, 
      priority: priority === 'all' ? undefined : priority,
      page: 1 
    });
  };

  const handleStatusChange = (status: ReadStatus) => {
    onFiltersChange({ 
      ...filters, 
      status: status === 'all' ? undefined : status,
      page: 1 
    });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    onFiltersChange({ 
      ...filters, 
      dateFrom: date ? date.toISOString().split('T')[0] : undefined,
      page: 1 
    });
    setDateFromOpen(false);
  };

  const handleDateToChange = (date: Date | undefined) => {
    onFiltersChange({ 
      ...filters, 
      dateTo: date ? date.toISOString().split('T')[0] : undefined,
      page: 1 
    });
    setDateToOpen(false);
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit
    });
    setShowAdvanced(false);
  };

  const hasActiveFilters = filters.category || filters.priority || filters.status || 
    filters.dateFrom || filters.dateTo || filters.search;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search circulars..."
          value={filters.search || ''}
          onChange={handleSearchChange}
          className="pl-10"
          disabled={isLoading}
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={showAdvanced ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-primary-foreground text-primary rounded-full h-5 w-5 text-xs flex items-center justify-center ml-1">
              !
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-muted/50 p-4 rounded-lg space-y-4">
          {/* Row 1: Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.category || 'all'}
                onValueChange={handleCategoryChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="operation">Operations</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="crew_change">Crew Change</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={filters.priority || 'all'}
                onValueChange={handlePriorityChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">Important</SelectItem>
                  <SelectItem value="medium">Normal</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Status and Per Page */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || 'all'}
                onValueChange={handleStatusChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Show per page</label>
              <Select
                value={filters.limit?.toString() || '20'}
                onValueChange={(value) => onFiltersChange({ ...filters, limit: parseInt(value), page: 1 })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(new Date(filters.dateFrom), 'PPP') : 'From date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                    onSelect={handleDateFromChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(new Date(filters.dateTo), 'PPP') : 'To date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                    onSelect={handleDateToChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
