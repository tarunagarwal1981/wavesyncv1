'use client';

import React, { useState, useEffect } from 'react';
import { DocumentFilters, DocumentGrid, FolderStructure, DocumentUpload } from '@/components/documents';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  Grid3X3, 
  List, 
  FolderPlus,
  BarChart3,
  Clock
} from 'lucide-react';
import { 
  Document, 
  DocumentFilters as IFilters, 
  DocumentView,
  DocumentFolderType,
  DocumentUpload as IDocumentUpload
} from '@/lib/documents/types';
import { 
  getDocuments, 
  getDocumentStats, 
  getFolders,
  createDocument, 
  updateDocument, 
  deleteDocument,
  archiveDocument 
} from '@/lib/documents/queries';
import { DocumentStorageService } from '@/lib/documents/storage';
import { toast } from 'sonner';

export function DocumentsContent() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Array<{
    id: string;
    name: string;
    type: DocumentFolderType;
    documentCount: number;
  }>>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [filters, setFilters] = useState<IFilters>({});
  const [view, setView] = useState<DocumentView>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<DocumentFolderType | undefined>();
  const [showUpload, setShowUpload] = useState(false);

  const storageService = new DocumentStorageService();

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load filtered documents when filters change
  useEffect(() => {
    loadDocuments();
  }, [filters, selectedFolder]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [documentsData, statsData, foldersData] = await Promise.all([
        getDocuments({ ...filters, folderType: selectedFolder }),
        getDocumentStats(),
        getFolders()
      ]);

      setDocuments(documentsData);
      setStats(statsData);
      setFolders(foldersData);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const documentsData = await getDocuments({ ...filters, folderType: selectedFolder });
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleUpload = async (uploads: IDocumentUpload[]) => {
    setIsUploading(true);
    try {
      // Upload files to storage
      const uploadPromises = uploads.map(async (upload) => {
        try {
          const { url, fileName } = await storageService.uploadDocument(
            upload.file,
            upload
          );

          // Create document record in database
          return createDocument({
            userId: '', // Will be set in the query
            documentType: upload.documentType,
            documentName: upload.file.name,
            uploadDate: new Date().toISOString().split('T')[0],
            documentUrl: url,
            tags: upload.tags,
            isArchived: false,
            size: upload.file.size,
            mimeType: upload.file.type,
            description: upload.description,
            folder: upload.customFolderName || undefined
          });
        } catch (error) {
          console.error('Upload failed:', error);
          throw error;
        }
      });

      await Promise.all(uploadPromises);
      
      // Reload data
      await loadData();
      
      toast.success(`${uploads.length} document${uploads.length !== 1 ? 's' : ''} uploaded successfully`);
      setShowUpload(false);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const link = document.createElement('a');
      link.href = document.documentUrl;
      link.download = document.documentName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  };

  const handleShare = async (document: Document) => {
    try {
      // In a real implementation, you'd create a secure share link
      const shareUrl = `${window.location.origin}/documents/${document.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: document.documentName,
          text: 'Check out this document',
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Document link copied to clipboard');
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share document');
    }
  };

  const handleDelete = async (document: Document) => {
    if (!confirm(`Are you sure you want to delete "${document.documentName}"?`)) {
      return;
    }

    try {
      await deleteDocument(document.id);
      await loadData();
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleEdit = async (document: Document) => {
    // In a real implementation, you'd open an edit modal
    const newName = prompt('Enter new document name:', document.documentName);
    if (!newName || newName === document.documentName) return;

    try {
      await updateDocument(document.id, { documentName: newName });
      await loadData();
      toast.success('Document updated successfully');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update document');
    }
  };

  const handleFolderSelect = (folderType: DocumentFolderType) => {
    setSelectedFolder(selectedFolder === folderType ? undefined : folderType);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Total Documents</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalDocuments}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Recent Uploads</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.recentUploads.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-full">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-900">Folders</p>
                <p className="text-2xl font-bold text-purple-600">{folders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-full">
                <FolderPlus className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-900">Storage Used</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatBytes(stats.totalSize)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Documents</h2>
        <div className="flex items-center gap-2">
          <Select value={view} onValueChange={(value) => setView(value as DocumentView)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="list">List</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowUpload(!showUpload)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload {showUpload ? 'Hide' : ''}
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <DocumentUpload
          onUpload={handleUpload}
          isLoading={isUploading}
        />
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <FolderStructure
            folders={folders}
            selectedFolder={selectedFolder}
            onFolderSelect={handleFolderSelect}
            onCreateFolder={() => toast.info('Create folder functionality coming soon')}
            variant="sidebar"
          />
        </div>

        {/* Documents Grid/List */}
        <div className="lg:col-span-3 space-y-6">
          <DocumentFilters
            filters={filters}
            onFiltersChange={setFilters}
            isLoading={isLoading}
            totalDocuments={documents.length}
          />

          <DocumentGrid
            documents={documents}
            onDownload={handleDownload}
            onShare={handleShare}
            onDelete={handleDelete}
            onEdit={handleEdit}
            variant={view}
            isLoading={isLoading}
            emptyMessage={
              selectedFolder 
                ? `No documents in ${folders.find(f => f.type === selectedFolder)?.name} folder`
                : "No documents found"
            }
          />
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
