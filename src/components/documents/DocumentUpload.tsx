'use client';

import { useState, DragEvent, ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  File as FileIcon, 
  X, 
  Plus, 
  AlertCircle,
  CloudUpload,
  Image,
  FileText,
  Archive
} from 'lucide-react';
import { 
  DocumentUpload as IDocumentUpload, 
  DocumentFolderType, 
  DocumentType,
  FOLDER_TYPE_LABELS,
  DOCUMENT_TYPE_LABELS,
  MAX_FILE_SIZE,
  MAX_FILES_PER_UPLOAD
} from '@/lib/documents/types';
import { 
  isValidFileType, 
  isValidFileSize, 
  formatFileSize, 
  getFileIcon,
  suggestTags 
} from '@/lib/documents/utils';
import { Badge } from '@/components/ui/badge';

interface DocumentUploadProps {
  onUpload: (uploads: IDocumentUpload[]) => Promise<void>;
  isLoading?: boolean;
  acceptedFileTypes?: string[];
  multiple?: boolean;
  className?: string;
}

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  error?: string;
  tags: string[];
}

export function DocumentUpload({ 
  onUpload, 
  isLoading = false,
  acceptedFileTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  multiple = true,
  className 
}: DocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [folderType, setFolderType] = useState<DocumentFolderType>('personal_documents');
  const [customFolderName, setCustomFolderName] = useState('');
  const [globalTags, setGlobalTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // Validate file count
    if (selectedFiles.length + files.length > MAX_FILES_PER_UPLOAD) {
      alert(`Cannot upload more than ${MAX_FILES_PER_UPLOAD} files at once`);
      return;
    }

    const validatedFiles: FileWithPreview[] = files.map(async (file) => {
      const fileId = Math.random().toString(36).substring(2);
      const newFile = file as FileWithPreview;
      newFile.id = fileId;
      newFile.tags = suggestTags(file);
      
      // Validate file
      if (!isValidFileType(file)) {
        newFile.error = 'File type not supported';
      } else if (!isValidFileSize(file)) {
        newFile.error = `File too large (max ${formatFileSize(MAX_FILE_SIZE)})`;
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        newFile.preview = URL.createObjectURL(file);
      }

      return newFile;
    });

    const resolvedFiles = await Promise.all(validatedFiles);
    setSelectedFiles(prev => [...prev, ...resolvedFiles]);
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const updateFileTags = (fileId: string, tags: string[]) => {
    setSelectedFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, tags } : f)
    );
  };

  const addTag = (tag: string) => {
    if (!tag.trim() || globalTags.includes(tag.trim())) return;
    setGlobalTags(prev => [...prev, tag.trim()]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setGlobalTags(prev => prev.filter(t => t !== tag));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const uploads: IDocumentUpload[] = selectedFiles
        .filter(file => !file.error)
        .map(file => ({
          file,
          documentType: file.type === 'application/pdf' ? 'certificate' : 'document',
          folder: folderType,
          tags: [...file.tags, ...globalTags],
          customFolderName: customFolderName || undefined
        }));

      await onUpload(uploads);
      
      // Reset form
      setSelectedFiles([]);
      setGlobalTags([]);
      setTagInput('');
      setCustomFolderName('');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className={className}>
      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragOver 
          ? 'border-blue-400 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
      }`}>
        <CardContent className="p-8">
          <div 
            className="text-center cursor-pointer"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <CloudUpload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragOver ? 'Drop files here' : 'Upload Documents'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop files here, or click to browse
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Image className="h-4 w-4" />
                <span>Images</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </div>
              <div className="flex items-center gap-1">
                <Archive className="h-4 w-4" />
                <span>Docs</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Max {formatFileSize(MAX_FILE_SIZE)} per file, up to {MAX_FILES_PER_UPLOAD} files
            </p>
          </div>

          <input
            id="file-input"
            type="file"
            multiple={multiple}
            accept={acceptedFileTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
            disabled={isLoading || isUploading}
          />
        </CardContent>
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Selected Files ({selectedFiles.length})</h4>
              <div className="text-sm text-gray-500">
                Total: {formatFileSize(totalSize)}
              </div>
            </div>

            <div className="space-y-3">
              {selectedFiles.map(file => (
                <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {/* Preview or Icon */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img src={file.preview} alt={file.name} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-lg">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-gray-900 truncate">{file.name}</h5>
                      {file.error ? (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {formatFileSize(file.size)}
                        </Badge>
                      )}
                    </div>
                    {file.error && (
                      <p className="text-xs text-red-600 mt-1">{file.error}</p>
                    )}
                    
                    {/* Tags */}
                    <div className="flex gap-1 mt-2">
                      {file.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Upload Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Folder Category</label>
                <Select value={folderType} onValueChange={(value) => setFolderType(value as DocumentFolderType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FOLDER_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Folder Name (Optional)</label>
                <Input
                  value={customFolderName}
                  onChange={(e) => setCustomFolderName(e.target.value)}
                  placeholder="Enter custom folder name"
                />
              </div>
            </div>

            {/* Global Tags */}
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium">Add Tags</label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                />
                <Button size="sm" onClick={() => addTag(tagInput)} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Tag Display */}
              {globalTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {globalTags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button 
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Actions */}
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setSelectedFiles([])}
                disabled={isUploading}
              >
                Clear All
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading || selectedFiles.some(f => f.error)}
                className="gap-2"
              >
                {isUploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
