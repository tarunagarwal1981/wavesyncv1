'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CertificateFiltersProps {
  onFiltersChange?: (filters: any) => void;
}

export function CertificateFilters({ onFiltersChange }: CertificateFiltersProps) {
  const [filters, setFilters] = useState({
    searchTerm: '',
    certificateType: 'all',
    issuingAuthority: 'all',
    status: 'all',
    sortBy: 'expiry_date',
    order: 'asc'
  });

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters & Sorting
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search certificates..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Certificate Type */}
          <Select value={filters.certificateType} onValueChange={(value) => updateFilter('certificateType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Certificate Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="STCW Basic Safety Training">STCW Basic Safety Training</SelectItem>
              <SelectItem value="STCW Advanced Fire Fighting">STCW Advanced Fire Fighting</SelectItem>
              <SelectItem value="Proficiency in Survival Craft">Proficiency in Survival Craft</SelectItem>
              <SelectItem value="Medical First Aid">Medical First Aid</SelectItem>
              <SelectItem value="Security Awareness">Security Awareness</SelectItem>
              <SelectItem value="Security Duties">Security Duties</SelectItem>
              <SelectItem value="GMDSS Radio Operator">GMDSS Radio Operator</SelectItem>
              <SelectItem value="Radar Observer">Radar Observer</SelectItem>
              <SelectItem value="ECDIS">ECDIS</SelectItem>
              <SelectItem value="Watchkeeping Officer">Watchkeeping Officer</SelectItem>
              <SelectItem value="Master Certificate">Master Certificate</SelectItem>
              <SelectItem value="Engineering Certificate">Engineering Certificate</SelectItem>
              <SelectItem value="Maritime English">Maritime English</SelectItem>
              <SelectItem value="Master's Certificate">Master's Certificate</SelectItem>
              <SelectItem value="Personal Survival Techniques">Personal Survival Techniques</SelectItem>
              <SelectItem value="Fire Prevention and Fire Fighting">Fire Prevention and Fire Fighting</SelectItem>
              <SelectItem value="Elementary First Aid">Elementary First Aid</SelectItem>
              <SelectItem value="Personal Safety and Social Responsibilities">Personal Safety and Social Responsibilities</SelectItem>
              <SelectItem value="Ship Security Officer">Ship Security Officer</SelectItem>
              <SelectItem value="Oil Tanker Familiarization">Oil Tanker Familiarization</SelectItem>
              <SelectItem value="Chemical Tanker Familiarization">Chemical Tanker Familiarization</SelectItem>
              <SelectItem value="LNG Tanker Familiarization">LNG Tanker Familiarization</SelectItem>
              <SelectItem value="Bulk Carrier Familiarization">Bulk Carrier Familiarization</SelectItem>
            </SelectContent>
          </Select>

          {/* Issuing Authority */}
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Issuing Authority..."
              value={filters.issuingAuthority === 'all' ? '' : filters.issuingAuthority}
              onChange={(e) => updateFilter('issuingAuthority', e.target.value || 'all')}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="valid">Valid</SelectItem>
              <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expiry_date">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Expiry Date
                </div>
              </SelectItem>
              <SelectItem value="certificate_name">Certificate Name</SelectItem>
              <SelectItem value="certificate_type">Certificate Type</SelectItem>
              <SelectItem value="created_at">Date Added</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Button
            variant="outline"
            onClick={() => updateFilter('order', filters.order === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2"
          >
            {filters.order === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
            {filters.order === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>
              {Object.entries(filters).filter(([key, value]) => value && value !== 'all' && value !== 'expiry_date' && value !== 'asc').length > 0
                ? `${Object.entries(filters).filter(([key, value]) => value && value !== 'all' && value !== 'expiry_date' && value !== 'asc').length} filter${Object.entries(filters).filter(([key, value]) => value && value !== 'all' && value !== 'expiry_date' && value !== 'asc').length === 1 ? '' : 's'} applied`
                : 'No filters applied'
              }
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              const resetFilters = {
                searchTerm: '',
                certificateType: 'all',
                issuingAuthority: 'all',
                status: 'all',
                sortBy: 'expiry_date',
                order: 'asc'
              };
              setFilters(resetFilters);
              onFiltersChange?.(resetFilters);
            }}
          >
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickFilters({ 
  onStatusChange,
  activeStatus 
}: {
  onStatusChange: (status: string) => void;
  activeStatus: string;
}) {
  const statusFilters = [
    { id: 'all', label: 'All', count: 0 },
    { id: 'valid', label: 'Valid', count: 0 },
    { id: 'expiring_soon', label: 'Expiring Soon', count: 0 },
    { id: 'expired', label: 'Expired', count: 0 },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {statusFilters.map((filter) => (
        <Button
          key={filter.id}
          variant={activeStatus === filter.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange(filter.id)}
          className="flex items-center gap-2"
        >
          {filter.label}
          {filter.count > 0 && (
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-xs font-medium',
              activeStatus === filter.id 
                ? 'bg-white/20 text-current' 
                : 'bg-muted text-muted-foreground'
            )}>
              {filter.count}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}

export function CertificateSearchBar({ 
  onSearch 
}: {
  onSearch: (searchTerm: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search by name, type, or authority..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-4"
      />
    </div>
  );
}


