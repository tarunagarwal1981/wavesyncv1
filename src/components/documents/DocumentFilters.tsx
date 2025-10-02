'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  X,
  Check,
  Tag,
  FolderOpen,
  FileIcon,
  HardDrive 
} from 'lucide-react';
import { DocumentFilters as IFilters, DocumentType, DocumentFolderType, DOCUMENT_TYPE_LABELS, FOLDER_TYPE_LABELS } from '@/lib/documents/types';
import { format } from 'date-fns';

interface DocumentFiltersProps {
  filters: IFilters;
  onFiltersChange: (filters: IFilters) => void;
  isLoading?: boolean;
  totalDocuments?: number;
}

export function DocumentFilters({ 
  filters, 
  onFiltersChange, 
  isLoading = false,
  totalDocuments = 0
}: DocumentFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleTypeChange = (type: DocumentType | 'all') => {
    onFiltersChange({ 
      ...filters, 
      documentType: type === 'all' ? undefined : type
    });
  };

  const handleFolderChange = (folder: DocumentFolderType | 'all') => {
    onFiltersChange({ 
      ...filters, 
      folderType: folder === 'all' ? undefined : folder
    });
  };

  const handleSortChange = (sortBy: IFilters['sortBy']) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handleSortOrderChange = (order: IFilters['sortOrder']) => {
    onFiltersChange({ ...filters, sortOrder: order });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    onFiltersChange({ 
      ...filters, 
      uploadDateFrom: date ? date.toISOString().split('T')[0] : undefined
    });
    setDateFromOpen(false);
  };

  const handleDateToChange = (date: Date | undefined) => {
    onFiltersChange({ 
      ...filters, 
      uploadDateTo: date ? date.toISOString().split('T')[0] : undefined
    });
    setDateToOpen(false);
  };

  const handleSizeChange = (size: 'small' | 'medium' | 'large' | 'all') => {
    onFiltersChange({ 
      ...filters, 
      size: size === 'all' ? undefined : size
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setShowAdvanced(false);
  };

  const addTag = (tag: string) => {
    const currentTags = filters.tags || [];
    if (!currentTags.includes(tag)) {
      onFiltersChange({ 
        ...filters, 
        tags: [...currentTags, tag]
      });
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = filters.tags || [];
    onFiltersChange({ 
      ...filters, 
      tags: currentTags.filter(t => t !== tag)
    });
  };

  const hasActiveFilters = !!(
    filters.search || 
    filters.documentType || 
    filters.folderType ||
    filters.uploadDateFrom ||
    filters.uploadDateTo ||
    filters.size ||
    (filters.tags && filters.tags.length > 0)
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search documents by name, content, or tags..."
          value={filters.search || ''}
          onChange={handleSearchChange}
          disabled={isLoading}
          className="pl-10 w-full"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Select 
          value={filters.documentType || 'all'} 
          onValueChange={handleTypeChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.folderType || 'all'} 
          onValueChange={handleFolderChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Folders</SelectItem>
            {Object.entries(FOLDER_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.sortBy || 'uploadDate'} 
          onValueChange={handleSortChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="uploadDate">Upload Date</SelectItem>
            <SelectItem value="documentName">Name</SelectItem>
            <SelectItem value="size">Size</SelectItem>
            <SelectItem value="documentType">Type</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.sortOrder || 'desc'} 
          onValueChange={handleSortOrderChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest</SelectItem>
            <SelectItem value="asc">Oldest</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Advanced
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary">
              Search: {filters.search}
              <button 
                onClick={() => onFiltersChange({ ...filters, search: undefined })}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.documentType && (
            <Badge variant="secondary">
              Type: {DOCUMENT_TYPE_LABELS[filters.documentType]}
            </Badge>
          )}

          {filters.folderType && (
            <Badge variant="secondary">
              Folder: {FOLDER_TYPE_LABELS[filters.folderType]}
            </Badge>
          )}

          {filters.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Results Summary */}
      {totalDocuments > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileIcon className="h-4 w-4" />
          <span>{totalDocuments} document{totalDocuments !== 1 ? 's' : ''} found</span>
        </div>
      )}

      {/* Advanced Search */}
      {showAdvanced && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium">File Size</label>
              <Select 
                value={filters.size || 'all'} 
                onValueChange={handleSizeChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Size</SelectItem>
                  <SelectItem value="small">Small (&lt; 1MB)</SelectItem>
                  <SelectItem value="medium">Medium (1-5MB)</SelectItem>
                  <SelectItem value="large">Large (&gt; 5MB)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Tag Suggestions */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Popular Tags</label>
              <div className="flex flex-wrap gap-1">
                {['important', 'contract', 'medical', 'training', 'payment'].map(tag => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(tag)}
                    disabled={filters.tags?.includes(tag)}
                    className="text-xs h-6"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Date Range</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.uploadDateFrom ? format(new Date(filters.uploadDateFrom), 'PPP') : 'From date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.uploadDateFrom ? new Date(filters.uploadDateFrom) : undefined}
                    onSelect={handleDateFromChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.uploadDateTo ? format(new Date(filters.uploadDateTo), 'PPP') : 'To date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.uploadDateTo ? new Date(filters.uploadDateTo) : undefined}
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
