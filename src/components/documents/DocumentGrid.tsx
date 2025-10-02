'use client';

import { Document } from '@/lib/documents/types';
import { DocumentCard } from './DocumentCard';

interface DocumentGridProps {
  documents: Document[];
  onDownload?: (document: Document) => void;
  onShare?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  variant?: 'grid' | 'list';
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DocumentGrid({ 
  documents, 
  onDownload, 
  onShare, 
  onDelete, 
  onEdit,
  variant = 'grid',
  isLoading = false,
  emptyMessage = "No documents found"
}: DocumentGridProps) {
  if (isLoading) {
    return <DocumentGridSkeleton />;
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500 max-w-sm">
          Upload your first document to get started managing your files.
        </p>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {documents.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onDownload={onDownload}
            onShare={onShare}
            onDelete={onDelete}
            onEdit={onEdit}
            variant="list"
          />
        ))}
      </div>
    );
  }

  // Grid variant
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          onDownload={onDownload}
          onShare={onShare}
          onDelete={onDelete}
          onEdit={onEdit}
          variant="grid"
        />
      ))}
    </div>
  );
}

interface DocumentGridSkeletonProps {
  variant?: 'grid' | 'list';
}

function DocumentGridSkeleton({ variant = 'grid' }: DocumentGridSkeletonProps) {
  const SkeletonCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="flex gap-1">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
          </div>
        </div>
      </div>
    </div>
  );

  const SkeletonListItem = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
        
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
            <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-5 bg-gray-200 rounded animate-pulse w-12" />
          </div>
        </div>
        
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
