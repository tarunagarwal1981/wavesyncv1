'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Filter, 
  Search, 
  Calendar,
  Plane,
  X
} from 'lucide-react';
import type { TicketFilters } from '@/lib/tickets/types';

interface TicketFiltersProps {
  initialFilters?: TicketFilters;
  onFiltersChange?: (filters: TicketFilters) => void;
}

export function TicketFilters({ 
  initialFilters = {}, 
  onFiltersChange 
}: TicketFiltersProps) {
  const [filters, setFilters] = useState<TicketFilters>({
    status: 'all',
    ticket_type: 'all',
    travel_purpose: 'all',
    airline: 'all',
    search_term<｜tool▁call▁begin｜>
    ...initialFilters
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof TicketFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: TicketFilters = {
      status: 'all',
      ticket_type: 'all',
      travel_purpose: 'all',
      airline: 'all',
      search_term: '',
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value && value !== 'all' && value !== ''
    ).length;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets, flights, airports..."
            value={filters.search_term || ''}
            onChange={(e) => handleFilterChange('search_term', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="relative">
              {activeFilterCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Tickets
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={filters.status || 'all'} 
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ticket Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Travel Type</label>
                <Select 
                  value={filters.ticket_type || 'all'} 
                  onValueChange={(value) => handleFilterChange('ticket_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="flight">Flight</SelectItem>
                    <SelectItem value="ferry">Ferry</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="train">Train</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Travel Purpose Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Travel Purpose</label>
                <Select 
                  value={filters.travel_purpose || 'all'} 
                  onValueChange={(value) => handleFilterChange('travel_purpose', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Purposes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Purposes</SelectItem>
                    <SelectItem value="joining">Joining Assignment</SelectItem>
                    <SelectItem value="signoff">Sign-off</SelectItem>
                    <SelectItem value="shore_leave">Shore Leave</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Airline Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Airline</label>
                <Select 
                  value={filters.airline || 'all'} 
                  onValueChange={(value) => handleFilterChange('airline', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Airlines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Airlines</SelectItem>
                    <SelectItem value="Emirates">Emirates</SelectItem>
                    <SelectItem value="Singapore Airlines">Singapore Airlines</SelectItem>
                    <SelectItem value="Cathay Pacific">Cathay Pacific</SelectItem>
                    <SelectItem value="Turkish Airlines">Turkish Airlines</SelectItem>
                    <SelectItem value="Lufthansa">Lufthansa</SelectItem>
                    <SelectItem value="British Airways">British Airways</SelectItem>
                    <SelectItem value="Air France">Air France</SelectItem>
                    <SelectItem value="KLM">KLM</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">From</label>
                    <Input
                      type="date"
                      value={filters.date_from || ''}
                      onChange={(e) => handleFilterChange('date_from', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">To</label>
                    <Input
                      type="date"
                      value={filters.date_to || ''}
                      onChange={(e) => handleFilterChange('date_to', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Quick Date Filters */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleFilterChange('date_from', new Date().toISOString().split('T')[0])}
        >
          <Calendar className="h-4 w-4 mr-1" />
          Today
        </Button>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          <p className="text-sm text-muted-foreground mr-2">Active filters:</p>
          
          {filters.status && filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <button 
                onClick={() => handleFilterChange('status', 'all')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.ticket_type && filters.ticket_type !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              <Plane className="h-3 w-3" />
              {filters.ticket_type}
              <button 
                onClick={() => handleFilterChange('ticket_type', 'all')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.travel_purpose && filters.travel_purpose !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.travel_purpose.replace('_', ' ')}
              <button 
                onClick={() => handleFilterChange('travel_purpose', 'all')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.airline && filters.airline !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.airline}
              <button 
                onClick={() => handleFilterChange('airline', 'all')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.search_term && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.search_term}"
              <button 
                onClick={() => handleFilterChange('search_term', '')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
