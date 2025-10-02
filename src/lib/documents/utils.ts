import { DocumentType, SUPPORTED_FILE_TYPES } from './types';

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Format a date to a human-readable relative time (e.g., "2 hours ago")
 */
export function formatDistanceToNow(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Get MIME type icon
 */
export function getFileIcon(mimeType: string): string {
  const baseIcons: Record<string, string> = {
    'application/pdf': '📄',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊',
    'image/jpeg': '🖼️',
    'image/jpg': '🖼️',
    'image/png': '🖼️',
    'image/webp': '🖼️',
  };

  return baseIcons[mimeType] || '📄';
}

/**
 * Validate file type against supported types
 */
export function isValidFileType(file: File): boolean {
  const allSupportedTypes = Object.values(SUPPORTED_FILE_TYPES).flat();
  return allSupportedTypes.includes(file.type);
}

/**
 * Validate file size against maximum limit
 */
export function isValidFileSize(file: File, maxSize: number = 10 * 1024 * 1024): boolean {
  return file.size <= maxSize;
}

/**
 * Get document type from MIME type
 */
export function getDocumentTypeFromMimeType(mimeType: string): DocumentType {
  if (mimeType === 'application/pdf') return 'certificate';
  if (mimeType.includes('image/')) return 'medical';
  if (mimeType.includes('wordprocessing') || mimeType.includes('sheet')) return 'contract';
  return 'passport';
}

/**
 * Generate secure file name to prevent conflicts
 */
export function generateSecureFileName(originalName: string, userId:

 string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(originalName);
  const baseName = originalName.replace(`.${extension}`, '').replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${userId}/${timestamp}-${randomId}-${baseName}.${extension}`;
}

/**
 * Create thumbnail for image files
 */
export function createThumbnail(file: File, size: number = 200): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File is not an image');
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const aspectRatio = img.width / img.height;
      canvas.width = size;
      canvas.height = size / aspectRatio;

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Extract text from uploaded files (basic implementation)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    // For PDF text extraction, you would typically use a library like pdf-parse
    // For now, return the filename as searchable text
    return file.name;
  }
  
  if (file.type.startsWith('text/')) {
    return file.text();
  }
  
  return file.name;
}

/**
 * Generate tags based on file content and metadata
 */
export function suggestTags(file: File, documentType?: DocumentType): string[] {
  const tags: string[] = [];
  const { name, type, size } = file;
  
  // Add tags based on document type
  if (documentType) {
    tags.push(documentType);
  }
  
  // Add tags based on file properties
  if (type.includes('image')) {
    tags.push('image');
  }
  
  if (type === 'application/pdf') {
    tags.push('pdf');
  }
  
  if (type.includes('sheet')) {
    tags.push('spreadsheet');
  }
  
  if (type.includes('wordprocessing')) {
    tags.push('document');
  }
  
  // Add size-based tags
  if (size > 1024 * 1024) { // > 1MB
    tags.push('large-file');
  }
  
  // Add filename-based tags (remove this in production for privacy)
  const lowerName = name.toLowerCase();
  if (lowerName.includes('contract')) tags.push('contract');
  if (lowerName.includes('medical')) tags.push('medical');
  if (lowerName.includes('training')) tags.push('training');
  if (lowerName.includes('pay')) tags.push('payment');
  if (lowerName.includes('passport')) tags.push('passport');
  
  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Validate folder name format
 */
export function isValidFolderName(name: string): boolean {
  if (!name || name.trim().length === 0) return false;
  if (name.length > 50) return false;
  if (/[<>:"/\\|?*]/.test(name)) return false;
  return true;
}

/**
 * Generate folder tree structure
 */
export function organizeFolderStructure(documents: Document[]): Record<string, Document[]> {
  const folders: Record<string, Document[]> = {};
  
  documents.forEach(doc => {
    const folder = doc.folder || 'uncategorized';
    if (!folders[folder]) {
      folders[folder] = [];
    }
    folders[folder].push(doc);
  });
  
  return folders;
}

/**
 * Search documents by text content
 */
export function searchDocuments(documents: Document[], searchTerm: string): Document[] {
  const term = searchTerm.toLowerCase();
  
  return documents.filter(doc => 
    doc.documentName.toLowerCase().includes(term) ||
    doc.tags.some(tag => tag.toLowerCase().includes(term)) ||
    doc.description?.toLowerCase().includes(term)
  );
}

/**
 * Sort documents based on criteria
 */
export function sortDocuments(
  documents: Document[], 
  sortBy: 'uploadDate' | 'documentName' | 'size' | 'documentType',
  order: 'asc' | 'desc' = 'desc'
): Document[] {
  return [...documents].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'uploadDate':
        comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        break;
      case 'documentName':
        comparison = a.documentName.localeCompare(b.documentName);
        break;
      case 'size':
        comparison = (a.size || 0) - (b.size || 0);
        break;
      case 'documentType':
        comparison = a.documentType.localeCompare(b.documentType);
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Generate download URL for secure sharing
 */
export function generateSecureDownloadUrl(documentId: string, token: string): string {
  return `/api/documents/${documentId}/download?token=${token}`;
}

/**
 * Check if a document can be previewed in browser
 */
export function canPreviewInBrowser(mimeType: string): boolean {
  const previewableTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];
  
  return previewableTypes.includes(mimeType);
}

/**
 * Get color scheme for document type
 */
export function getDocumentTypeColor(documentType: DocumentType): string {
  const colors: Record<DocumentType, string> = {
    certificate: 'bg-blue-100 text-blue-800',
    contract: 'bg-purple-100 text-purple-800',
    medical: 'bg-green-100 text-green-800',
    passport: 'bg-orange-100 text-orange-800',
    other: 'bg-gray-100 text-gray-800'
  };
  
  return colors[documentType];
}
