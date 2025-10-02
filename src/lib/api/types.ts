// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  statusCode: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl?: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  };
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

// Certificate Types
export interface CertificateData {
  id?: string;
  name: string;
  type: string;
  issuer: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'expiring_soon';
  fileUrl?: string;
  description?: string;
}

export interface CertificateUploadRequest {
  certificate: File;
  data: Omit<CertificateData, 'id' | 'status'>;
}

// Document Types
export interface DocumentData {
  id?: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt?: string;
  isPublic?: boolean;
}

export interface DocumentUploadRequest {
  file: File;
  metadata: Omit<DocumentData, 'id' | 'fileSize' | 'mimeType' | 'uploadedAt'>;
}

// Circular Types  
export interface CircularData {
  id?: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  publishedAt: string;
  expiresAt?: string;
  attachments?: string[];
  isRead?: boolean;
  acknowledgedAt?: string;
}

export interface CircularAcknowledgmentRequest {
  circularId: string;
  acknowledgmentNote?: string;
}

// Notification Types
export interface NotificationData {
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high';
  readAt?: string;
  createdAt?: string;
  actionUrl?: string;
  metadata?: any;
}

export interface NotificationCreateRequest {
  title: string;
  message: string;
  type: NotificationData['type'];
  priority?: NotificationData['priority'];
  userId: string;
  actionUrl?: string;
  metadata?: any;
}

// Weather Types
export interface WeatherData {
  location: {
    name: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  current: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    description: string;
    icon: string;
  };
  forecast?: {
    date: string;
    high: number;
    low: number;
    description: string;
    icon: string;
  }[];
}

// Export Types
export interface ExportRequest {
  type: 'certificates' | 'circulars' | 'documents' | 'profile';
  format: 'pdf' | 'csv' | 'xlsx';
  filters?: {
    dateRange?: {
      start: string;
      end: string;
    };
    status?: string[];
    category?: string[];
  };
}

export interface ExportResponse {
  downloadUrl: string;
  expiresAt: string;
  fileSize: number;
}

// Profile Types
export interface ProfileData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  department?: string;
  position?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    language: string;
    timezone: string;
  };
}

// Sign-off Types
export interface SignoffChecklistData {
  id?: string;
  category: string;
  items: {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    completedAt?: string;
    notes?: string;
  }[];
  progress: number;
}

export interface SignoffUpdateRequest {
  checklistId: string;
  itemId: string;
  completed: boolean;
  notes?: string;
}
