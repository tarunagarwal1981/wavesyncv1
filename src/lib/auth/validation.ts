import { z } from 'zod';

// Base validation schemas
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])/, 'Password must contain at least one uppercase and one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number');

const employeeIdSchema = z
  .string()
  .min(3, 'Employee ID must be at least 3 characters')
  .max(50, 'Employee ID must be less than 50 characters')
  .regex(/^[A-Za-z0-9-_]+$/, 'Employee ID can only contain letters, numbers, hyphens, and underscores');

// Login form validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Sign up form validation
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  employeeId: employeeIdSchema,
  rank: z.string().min(1, 'Rank/Position is required').max(100, 'Rank must be less than 100 characters'),
  nationality: z.string().min(1, 'Nationality is required').max(100, 'Nationality must be less than 100 characters'),
  phone: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

// Password reset request validation
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Update password validation
export const updatePasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

// Phone number validation
export const phoneSchema = z
  .string()
  .optional()
  .refine((val) => {
    if (!val) return true;
    // International phone number format
    return /^\+?[1-9]\d{1,14}$/.test(val.replace(/\s/g, ''));
  }, 'Please enter a valid phone number');

// Emergency contact validation
export const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Emergency contact name is required'),
  phone: z.string().min(1, 'Emergency contact phone is required'),
  relationship: z.string().min(1, 'Relationship is required'),
});

// Validation helpers
export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validatePassword = (password: string): boolean => {
  return passwordSchema.safeParse(password).success;
};

export const validateEmployeeId = (employeeId: string): boolean => {
  return employeeIdSchema.safeParse(employeeId).success;
};

// Form field validation errors
export interface ValidationErrors {
  [key: string]: string[];
}

export function getValidationErrors(errors: z.ZodError): ValidationErrors {
  const result: ValidationErrors = {};
  
  errors.errors.forEach((error) => {
    const path = error.path.join('.');
    if (!result[path]) {
      result[path] = [];
    }
    result[path].push(error.message);
  });
  
  return result;
}
