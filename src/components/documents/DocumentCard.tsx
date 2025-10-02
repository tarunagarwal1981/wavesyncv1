'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Document, DOCUMENT_TYPE_LABELS, FOLDER_TYPE_LABELS } from '@/lib/documents/types';
import { formatFileSize, getFileIcon, canPreviewInBrowser, getDocumentTypeColor } from '@/lib/documents/utils';
import { 
  MoreVertical, 
  Download, 
  Eye, 
  Share2, 
  Trash2, 
  Edit,
  Copy,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface DocumentCardProps {
  document: Document;
  onDownload?: (document: Document) => void;
  onShare?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  variant?: 'grid' | 'list';
}

export function DocumentCard({ 
  document, 
  onDownload, 
  onShare, 
  onDelete, 
  onEdit,
  variant = 'grid' 
}: DocumentCardProps) {
  const fileIcon = getFileIcon(document.mimeType || '');
  const documentTypeColor = getDocumentTypeColor(document.documentType);
  const canPreview = canPreviewInBrowser(document.mimeType || '');
  const timeAgo = formatDistanceToNow(new Date(document.uploadDate), { addSuffix: true });

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDownload?.(document);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(document);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(document);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(document);
  };

  if (variant === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* File Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                {fileIcon}
              </div>
            </div>

            {/* Document Info */}
            <div className="flex-1 min-w-0">
              <Link href={`/documents/${document.id}`}>
                <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors truncate">
                  {document.documentName}
                </h3>
              </Link>
              
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className={`text-xs ${documentTypeColor}`}
                >
                  {DOCUMENT_TYPE_LABELS[document.documentType]}
                </Badge>
                
                {document.folder && (
                  <Badge variant="outline" className="text-xs">
                    {FOLDER_TYPE_LABELS[document.folder as any] || document.folder}
                  </Badge>
                )}

                <span className="text-xs text-gray-500">
                  {document.size ? formatFileSize(document.size) : 'Unknown size'}
                </span>
                
                <span className="text-xs text-gray-500">•</span>
                
                <span className="text-xs text-gray-500">
                  {timeAgo}
                </span>
              </div>

              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {document.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                  {document.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{document.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  
                  {canPreview && (
                    <DropdownMenuItem onClick={() => window.open(`/documents/${document.id}`, '_blank')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.location.origin + `/documents/${document.id}`)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid variant (default)
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* File Icon and Actions */}
          <div className="flex items-start justify-between">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl group-hover:bg-gray-200 transition-colors">
              {fileIcon}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                
                {canPreview && (
                  <DropdownMenuItem onClick={() => window.open(`/documents/${document.id}`, '_blank')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigator.clipboard.writeText(window.location.origin + `/documents/${document.id}`);
                }}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Document Name */}
          <Link href={`/documents/${document.id}`}>
            <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
              {document.documentName}
            </h3>
          </Link>

          {/* Metadata */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`text-xs ${documentTypeColor}`}
              >
                {DOCUMENT_TYPE_LABELS[document.documentType]}
              </Badge>
              
              {document.folder && (
                <Badge variant="outline" className="text-xs">
                  {FOLDER_TYPE_LABELS[document.folder as any] || document.folder}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{document.size ? formatFileSize(document.size) : 'Unknown size'}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {document.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
                {document.tags.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{document.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
