export interface Document {
  id: string;
  userId: string;
  documentType: DocumentType;
  documentName: string;
  uploadDate: string;
  documentUrl: string;
  tags: string[];
  isArchived: boolean;
  size?: number;
  mimeType?: string;
  description?: string;
  folder?: string;
  createdAt: string;
  updatedAt?: string;
}

export type DocumentType = 
  | 'certificate' 
  | 'contract' 
  | 'medical' 
  | 'passport'
  | 'other' 

export type DocumentView = 'grid' | 'list';

export interface DocumentFilters {
  search?: string;
  documentType?: DocumentType;
  tags?: string[];
  uploadDateFrom?: string;
  uploadDateTo?: string;
  folder?: string;
  folderType?: DocumentFolderType;
  size?: 'small' | 'medium' | 'large';
  sortBy?: 'uploadDate' | 'documentName' | 'size' | 'documentType';
  sortOrder?: 'asc' | 'desc';
}

export type DocumentFolderType = 
  | 'personal_documents'
  | 'contracts' 
  | 'pay_slips'
  | 'training_certificates'
  | 'medical_records'
  | 'travel_documents'
  | 'correspondence';

export interface DocumentUpload {
  file: File;
  documentType: DocumentType;
  folder: DocumentFolderType;
  tags: string[];
  description?: string;
  customFolderName?: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  uploadedAt: string;
  uploadedBy: string;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  isCurrent: boolean;
}

export interface SecureShare {
  id: string;
  documentId: string;
  shareToken: string;
  expiresAt: string;
  downloadCount: number;
  maxDownloads?: number;
  createdBy: string;
  createdAt: string;
  accessedAt?: string;
}

export interface Folder {
  id: string;
  name: string;
  type: DocumentFolderType;
  userId: string;
  documentCount: number;
  createdAt: string;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  certificate: 'Certificate',
  contract: 'Contract',
  medical: 'Medical Record',
  passport: 'Passport',
  other: 'Other'
};

export const FOLDER_TYPE_LABELS: Record<DocumentFolderType, string> = {
  personal_documents: 'Personal Documents',
  contracts: 'Contracts',
  pay_slips: 'Pay Slips',
  training_certificates: 'Training Certificates',
  medical_records: 'Medical Records',
  travel_documents: 'Travel Documents',
  correspondence: 'Correspondence'
};

export const FOLDER_TYPE_ICONS: Record<DocumentFolderType, string> = {
  personal_documents: '📁',
  contracts: '📋',
  pay_slips: '💰',
  training_certificates: '🎓',
  medical_records: '🏥',
  travel_documents: '✈️',
  correspondence: '📬'
};

export const FOLDER_TYPE_COLORS: Record<DocumentFolderType, string> = {
  personal_documents: 'bg-blue-50 text-blue-700 border-blue-200',
  contracts: 'bg-purple-50 text-purple-700 border-purple-200',
  pay_slips: 'bg-green-50 text-green-700 border-green-200',
  training_certificates: 'bg-orange-50 text-orange-700 border-orange-200',
  medical_records: 'bg-red-50 text-red-700 border-red-200',
  travel_documents: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  correspondence: 'bg-gray-50 text-gray-700 border-gray-200'
};

export const SUPPORTED_FILE_TYPES = {
  pdf: ['application/pdf'],
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  document: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  sheet: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  presentation: ['application/vnd.openxmlformats-officedocument.presentationml.presentation']
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_UPLOAD = 10;

export interface DocumentStats {
  totalDocuments: number;
  totalSize: number;
  documentsByType: Record<DocumentType, number>;
  documentsByFolder: Record<DocumentFolderType, number>;
  recentUploads: Document[];
  archivedDocuments: number;
}

export interface DocumentShareInfo {
  shareToken: string;
  expiresAt: string;
  maxDownloads?: number;
  remainingDownloads?: number;
  downloadUrl: string;
}
