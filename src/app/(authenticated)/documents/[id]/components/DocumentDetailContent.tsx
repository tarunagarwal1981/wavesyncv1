'use client';

import React, { useState, useEffect } from 'react';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Share2, 
  Trash2, 
  Edit,
  Archive,
  ExternalLink,
  FileText,
  Calendar,
  Tag,
  Clock,
  FolderOpen,
  User,
  Copy,
  Send
} from 'lucide-react';
import { 
  Document, 
  DocumentStats,
  DocumentShareInfo, 
  SecureShare 
} from '@/lib/documents/types';
import { 
  getDocumentById, 
  getDocumentStats,
  updateDocument, 
  deleteDocument,
  archiveDocument,
  createSecureShare
} from '@/lib/documents/queries';
import { 
  formatFileSize, 
  getFileIcon, 
  formatDistanceToNow,
  canPreviewInBrowser 
} from '@/lib/documents/utils';
import { DOCUMENT_TYPE_LABELS, FOLDER_TYPE_LABELS } from '@/lib/documents/types';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';

interface DocumentDetailContentProps {
  documentId: string;
}

export function DocumentDetailContent({ documentId }: DocumentDetailContentProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [shareInfo, setShareInfo] = useState<SecureShare | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [documentData, statsData] = await Promise.all([
        getDocumentById(documentId),
        getDocumentStats()
      ]);

      if (!documentData) {
        setError('Document not found');
        return;
      }

      setDocument(documentData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading document:', error);
      setError('Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      const link = document.createElement('a');
      link.href = document.documentUrl;
      link.download = document.documentName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  };

  const handleShare = async () => {
    if (!document) return;

    try {
      // Create secure share link (valid for 7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const share = await createSecureShare(
        document.id,
        expiresAt.toISOString(),
        10 // max downloads
      );

      const shareUrl = `${window.location.origin}/documents/${document.id}/share/${share.shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      
      setShareInfo(share);
      setShowShareDialog(true);
      toast.success('Share link copied to clipboard');
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to create share link');
    }
  };

  const handleArchive = async () => {
    if (!document) return;

    if (!confirm(`Are you sure you want to archive "${document.documentName}"?`)) {
      return;
    }

    try {
      setIsArchiving(true);
      await archiveDocument(document.id);
      toast.success('Document archived successfully');
      
      // Redirect back to documents list
      window.location.href = '/documents';
    } catch (error) {
      console.error('Archive failed:', error);
      toast.error('Failed to archive document');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (!document) return;

    if (!confirm(`Are you sure you want to permanently delete "${document.documentName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteDocument(document.id);
      toast.success('Document deleted successfully');
      
      // Redirect back to documents list
      window.location.href = '/documents';
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete document');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async () => {
    if (!document) return;

    const newName = prompt('Enter new document name:', document.documentName);
    if (!newName || newName === document.documentName) return;

    // Add tags input in a real implementation
    const newTags = prompt('Enter tags (comma-separated):', document.tags.join(', '));
    const tags = newTags ? newTags.split(',').map(tag => tag.trim()) : document.tags;

    try {
      await updateDocument(document.id, { 
        documentName: newName,
        tags 
      });
      
      // Reload document
      await loadDocument();
      toast.success('Document updated successfully');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update document');
    }
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/documents/${documentId}`;
    await navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !document) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-red-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          {error || 'Document Not Found'}
        </h2>
        <p className="text-muted-foreground mb-4">
          {error || 'The document you\'re looking for doesn\'t or has been removed.'}
        </p>
        <Link href="/documents">
          <Button variant="outline">
            Back to Documents
          </Button>
        </Link>
      </div>
    );
  }

  const fileIcon = getFileIcon(document.mimeType || '');
  const canPreview = canPreviewInBrowser(document.mimeType || '');
  const uploadedAgo = formatDistanceToNow(new Date(document.uploadDate), { addSuffix: true });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
            {fileIcon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{document.documentName}</h1>
            <p className="text-muted-foreground">
              Uploaded {uploadedAgo}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCopyLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Share Dialog */}
      {showShareDialog && shareInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Share Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Share Link</label>
                <div className="flex gap-2 mt-1">
                  <input 
                    type="text" 
                    value={`${window.location.origin}/documents/${document.id}/share/${shareInfo.shareToken}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    readOnly
                  />
                  <Button size="sm" onClick={() => navigator.clipboard.writeText(
                    `${window.location.origin}/documents/${document.id}/share/${shareInfo.shareToken}`
                  )}>
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Expires:</span>
                  <span className="ml-1">{format(new Date(shareInfo.expiresAt), 'PPP')}</span>
                </div>
                <div>
                  <span className="font-medium">Max Downloads:</span>
                  <span className="ml-1">{shareInfo.maxDownloads || 'Unlimited'}</span>
                </div>
              </div>
              
              <Button onClick={() => setShowShareDialog(false)} className="w-full">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Preview
                {!canPreview && (
                  <Badge variant="outline" className="ml-auto">
                    Download Required
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentViewer
                document={document}
                onDownload={handleDownload}
                height="600px"
              />
            </CardContent>
          </Card>
        </div>

        {/* Document Details */}
        <div className="space-y-6">
          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium">Upload Date</div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(document.uploadDate), 'PPP')}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium">File Size</div>
                  <div className="text-sm text-gray-500">
                    {formatFileSize(document.size || 0)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium">Document Type</div>
                  <div className="text-sm text-gray-500">
                    {DOCUMENT_TYPE_LABELS[document.documentType]}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium">Folder</div>
                  <div className="text-sm text-gray-500">
                    {document.folder ? FOLDER_TYPE_LABELS[document.folder as any] : 'No folder'}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <>
                  <div>
                    <div className="font-medium mb-2 flex items-center gap-1">
                      <Tag className="h-4 w-4 text-gray-400" />
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {document.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Description */}
              {document.description && (
                <>
                  <div>
                    <div className="font-medium mb-2">Description</div>
                    <div className="text-sm text-gray-500">
                      {document.description}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <Button variant="destructive" onClick={handleArchive} disabled={isArchiving} className="w-full">
                  <Archive className="h-4 w-4 mr-2" />
                  {isArchiving ? 'Archiving...' : 'Archive Document'}
                </Button>
                
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete Document'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Repository Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Documents</span>
                  <span className="font-medium">{stats.totalDocuments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Storage Used</span>
                  <span className="font-medium">{formatFileSize(stats.totalSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Folders</span>
                  <span className="font-medium">{Object.keys(stats.documentsByFolder).length}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
