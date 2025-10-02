import { z } from 'zod';

/**
 * Certificate types enum for validation
 */
export const CERTIFICATE_TYPES = [
  'STCW Basic Safety Training',
  'STCW Advanced Fire Fighting',
  'Proficiency in Survival Craft',
  'Medical First Aid',
  'Security Awareness',
  'Security Duties',
  'GMDSS Radio Operator',
  'Radar Observer',
  'ECDIS',
  'Watchkeeping Officer',
  'Master Certificate',
  'Engineering Certificate',
  'Maritime English',
  'Personal Survival Techniques',
  'Fire Prevention and Fire Fighting',
  'Elementary First Aid',
  'Personal Safety and Social Responsibilities',
  'Ship Security Officer',
  'Oil Tanker Familiarization',
  'Chemical Tanker Familiarization',
  'LNG Tanker Familiarization',
  'Bulk Carrier Familiarization',
] as const;

export type CertificateType = typeof CERTIFICATE_TYPES[number];

/**
 * Schema for creating a new certificate
 */
export const createCertificateSchema = z.object({
  certificate_name: z.string()
    .min(1, 'Certificate name is required')
    .max(255, 'Certificate name must be less than 255 characters'),
  
  certificate_type: z.enum(CERTIFICATE_TYPES, {
    required_error: 'Certificate type is required',
    invalid_type_error: 'Please select a valid certificate type',
  }),
  
  issue_date: z.string()
    .min(1, 'Issue date is required')
    .refine(date => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid issue date format'),
  
  expiry_date: z.string()
    .min(1, 'Expiry date is required')
    .refine(date => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid expiry date format'),
  
  issuing_authority: z.string()
    .min(1, 'Issuing authority is required')
    .max(255, 'Issuing authority must be less than 255 characters'),
  
  certificate_number: z.string()
    .optional()
    .refine(val => !val || val.length <= 100, 'Certificate number must be less than 100 characters'),
  
  document_url: z.string()
    .optional()
    .refine(val => {
      if (!val) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, 'Invalid document URL format'),
}).refine(data => {
  const issueDate = new Date(data.issue_date);
  const expiryDate = new Date(data.expiry_date);
  return expiryDate > issueDate;
}, {
  message: 'Expiry date must be after issue date',
  path: ['expiry_date'],
});

/**
 * Schema for certificate filters
 */
export const certificateFiltersSchema = z.object({
  status: z.enum(['all', 'valid', 'expiring_soon', 'expired']).optional(),
  certificateType: z.string().optional(),
  issuingAuthority: z.string().optional(),
  searchTerm: z.string().max(255, 'Search term must be less than 255 characters').optional(),
});

/**
 * Schema for certificate sorting
 */
export const certificateSortSchema = z.object({
  sortBy: z.enum(['expiry_date', 'certificate_name', 'certificate_type', 'created_at', 'status']),
  order: z.enum(['asc', 'desc']),
});

/**
 * Type exports for TypeScript
 */
export type CreateCertificateData = z.infer<typeof createCertificateSchema>;
export type CertificateFilters = z.infer<typeof certificateFiltersSchema>;
export type CertificateSort = z.infer<typeof certificateSortSchema>;

/**
 * File upload validation helpers
 */
export const FILE_UPLOAD_CONSTRAINTS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
  ],
  maxFiles: 50,
} as const;