import { z } from 'zod';

// Common validation schemas
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(100)).default('10'),
});

export const idSchema = z.string().uuid('Invalid ID format');

export const emailSchema = z.string().email('Invalid email format');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

// Authentication validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  role: z.enum(['seafarer', 'admin' ]).optional(),
});

export const passwordResetSchema = z.object({
  email: emailSchema,
});

export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Certificate validation schemas
export const certificateCreateSchema = z.object({
  name: z.string().min(1, 'Certificate name is required').max(100, 'Name is too long'),
  type: z.string().min(1, 'Certificate type is required').max(50, 'Type is too long'),
  issuer: z.string().min(1, 'Issuer is required').max(100, 'Issuer is too long'),
  certificateNumber: z.string().min(1, 'Certificate number is required').max(50, 'Certificate number is too long'),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  description: z.string().max(500, 'Description is too long').optional(),
});

export const certificateUpdateSchema = certificateCreateSchema.partial();

export const certificateFilterSchema = z.object({
  type: z.string().optional(),
  status: z.enum(['valid', 'expired', 'expiring_soon']).optional(),
  issuer: z.string().optional(),
  expiryBefore: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  expiryAfter: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
});

export const certificateAcknowledgmentSchema = z.object({
  certificateId: idSchema,
  acknowledgmentNote: z.string().max(250, 'Note is too long').optional(),
});

// Document validation schemas
export const documentCreateSchema = z.object({
  title: z.string().min(1, 'Document title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  category: z.string().min(1, 'Category is required').max(50, 'Category is too long'),
  tags: z.array(z.string().max(30, 'Tag is too long')).max(10, 'Too many tags').optional(),
  isPublic: z.boolean().default(false),
});

export const documentUpdateSchema = documentCreateSchema.partial();

export const documentFilterSchema = z.object({
  category: z.string().optional(),
  tags: z.string().optional(),
  isPublic: z.string().pipe(z.literal('true').or(z.literal('false')).transform(val => val === 'true')).optional(),
  uploadedBefore: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  uploadedAfter: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
});

export const documentSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Query is too long'),
  category: z.string().optional(),
});

// Circular validation schemas
export const circularCreateSchema = z.object({
  title: z.string().min(1, 'Circular title is required').max(200, 'Title is too long'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content is too long'),
  priority: z.enum(['low', 'medium', 'high', 'critical'], {
    required_error: 'Priority is required',
  }),
  category: z.string().min(1, 'Category is required').max(50, 'Category is too long'),
  expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Invalid datetime format').optional(),
  attachments: z.array(z.string().url('Invalid attachment URL')).max(5, 'Too many attachments').optional(),
});

export const circularUpdateSchema = circularCreateSchema.partial();

export const circularFilterSchema = z.object({
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  category: z.string().optional(),
  status: z.enum(['read', 'unread', 'acknowledged']).optional(),
  publishedBefore: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  publishedAfter: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
});

export const circularAcknowledgmentSchema = z.object({
  circularId: idSchema,
  acknowledgmentNote: z.string().max(500, 'Note is too long').optional(),
});

// Notification validation schemas
export const notificationCreateSchema = z.object({
  title: z.string().min(1, 'Notification title is required').max(100, 'Title is too long'),
  message: z.string().min(1, 'Message is required').max(500, 'Message is too long'),
  type: z.enum(['info', 'warning', 'error', 'success'], {
    required_error: 'Notification type is required',
  }),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  userId: idSchema,
  actionUrl: z.string().__url('Invalid action URL').optional(),
  metadata: z.record(z.any()).optional(),
});

export const notificationUpdateSchema = z.object({
  readAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Invalid datetime format').optional(),
});

export const notificationFilterSchema = z.object({
  type: z.enum(['info', 'warning', 'error', 'success']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  read: z.string().pipe(z.literal('true').or(z.literal('false')).transform(val => val === 'true')).optional(),
  createdBefore: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  createdAfter: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
});

// Weather validation schemas
export const weatherLocationSchema = z.object({
  latitude: z.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude'),
});

export const weatherForecastSchema = z.object({
  location: z.string().min(1, 'Location is required').max(100, 'Location name is too long'),
  days: z.number().min(1).max(7, 'Cannot forecast more than 7 days').default(3),
});

// Export validation schemas
export const exportRequestSchema = z.object({
  type: z.enum(['certificates', 'circulars', 'documents', 'profile'], {
    required_error: 'Export type is required',
  }),
  format: z.enum(['pdf', 'csv', 'xlsx'], {
    required_error: 'Export format is required',
  }),
  filters: z.object({
    dateRange: z.object({
      start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format'),
      end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format'),
    }).optional(),
    status: z.array(z.string()).optional(),
    category: z.array(z.string()).optional(),
  }).optional(),
});

// Profile validation schemas
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max($50, 'First name is too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long').optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').max(20, 'Phone number is too long').optional(),
  department: z.string().max(50, 'Department name is too long').optional(),
  position: z.string().max(50, 'Position is too long').optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      sms: z.boolean().optional(),
    }).optional(),
    language: z.string().max(10, 'Language code is too long').optional(),
    timezone: z.string().max(50, 'Timezone is too long').optional(),
  }).optional(),
});

// Sign-off validation schemas
export const signoffUpdateSchema = z.object({
  checklistId: idSchema,
  itemId: z.string().min(1, 'Item ID is required'),
  completed: z.boolean(),
  notes: z.string().max(500, 'Notes are too string').optional(),
});

export const signoffProgressSchema = z.object({
  checklistId: idSchema,
  progress: z.number().min(0).max(100, 'Progress must be between 0 and 100'),
});

// File upload validation schemas
export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    file => file.size <= 10 * 1024 * 1024, // 10MB limit
    'File size must be less than 10MB'
  ),
  allowedTypes: z.array(z.string()).optional(),
});

// Validation helpers
export function validateId(id: string): string {
  return idSchema.parse(id);
}

export function validatePaginationParams(params: URLSearchParams) {
  return paginationSchema.parse(Object.fromEntries(params));
}

export function validateEmail(email: string): string {
  return emailSchema.parse(email);
}

export function validatePassword(password: string): string {
  return passwordSchema.parse(password);
}

// Error formatting helpers
export function formatValidationError(error: z.ZodError): { message: string; details: Record<string, string[]> } {
  const details: Record<string, string[]> = {};
  
  error.errors.forEach(err => {
    const path = err.path.join('.');
    if (!details[path]) {
      details[path] = [];
    }
    details[path].push(err.message);
  });

  return {
    message: 'Validation failed',
    details,
  };
}

// Middleware for validation
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return function(handler: (data: T, ...args: any[]) => any) {
    return async (request: NextRequest, ...args: any[]) => {
      try {
        let data: any;

        switch (source) {
          case 'body':
            data = await request.json();
            break;
          case 'query':
            data = Object.fromEntries(new URL(request.url).searchParams.entries());
            break;
          case 'params':
            data = args[0]; // Usually route params
            break;
          default:
            throw new Error('Invalid validation source');
        }

        const validatedData = schema.parse(data);
        return handler(validatedData, ...args);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formattedError = formatValidationError(error);
          return apiValidationError(formattedError.message, formattedError.details);
        }
        throw error;
      }
    };
  };
}
