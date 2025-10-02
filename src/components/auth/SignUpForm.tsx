'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth/actions';
import { signUpSchema, type SignUpFormData } from '@/lib/auth/validation';
import { AuthButton, AuthField, AuthInput, AuthAlert, AuthLink } from './AuthLayout';

interface SignUpFormProps {
  onLoginClick?: () => void;
}

export function SignUpForm({ onLoginClick }: SignUpFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    rank: '',
    nationality: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
  });
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [includeEmergencyContact, setIncludeEmergencyContact] = useState(false);

  const validateField = (field: keyof SignUpFormData, value: any) => {
    try {
      const fieldSchema = signUpSchema.pick({ [field]: true });
      fieldSchema.parse({ [field]: value });
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        const zodError = error as any;
        const fieldError = zodError.errors.find((e: any) => e.path[0] === field);
        if (fieldError) {
          setErrors(prev => ({ ...prev, [field]: fieldError.message }));
        }
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError('');
    }

    // Validate field on change
    validateField(name as keyof SignUpFormData, value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name as keyof SignUpFormData, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError('');

    try {
      // Only include emergency contact if it's provided
      const submissionData = { ...formData };
      if (!includeEmergencyContact) {
        submissionData.emergencyContactName = '';
        submissionData.emergencyContactPhone = '';
        submissionData.emergencyContactRelationship = '';
      }

      // Validate entire form
      const validatedData = signUpSchema.parse(submissionData);
      
      const result = await signUp(validatedData);

      if (result.success) {
        // Redirect to login with success message
        router.push('/auth/login?message=Account created successfully. Please sign in.');
      } else {
        setSubmitError(result.error || 'Sign up failed');
      }
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        // Zod validation errors
        const zodError = error as any;
        const fieldErrors: Partial<SignUpFormData> = {};
        
        zodError.errors.forEach((err: any) => {
          fieldErrors[err.path[0] as keyof SignUpFormData] = err.message;
        });
        
        setErrors(fieldErrors);
      } else {
        setSubmitError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <AuthAlert variant="error">
          {submitError}
        </AuthAlert>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <AuthField 
            label="Email Address" 
            error={errors.email} 
            required
          >
            <AuthInput
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              required
              autoComplete="email"
            />
          </AuthField>

          <AuthField 
            label="Employee ID" 
            error={errors.employeeId} 
            required
          >
            <AuthInput
              type="text"
              name="employeeId"
              placeholder="Enter your employee ID"
              value={formData.employeeId}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              required
            />
          </AuthField>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AuthField 
            label="Rank/Position" 
            error={errors.rank} 
            required
          >
            <AuthInput
              type="text"
              name="rank"
              placeholder="e.g., Captain, Engineer, etc."
              value={formData.rank}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              required
            />
          </AuthField>

          <AuthField 
            label="Nationality" 
            error={errors.nationality} 
            required
          >
            <AuthInput
              type="text"
              name="nationality"
              placeholder="Enter your nationality"
              value={formData.nationality}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              required
            />
          </AuthField>
        </div>

        <AuthField 
          label="Phone Number" 
          error={errors.phone}
        >
          <AuthInput
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            autoComplete="tel"
          />
        </AuthField>

        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900">Security Information</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <AuthField 
              label="Password" 
              error={errors.password} 
              required
            >
              <AuthInput
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                required
                autoComplete="new-password"
              />
            </AuthField>

            <AuthField 
              label="Confirm Password" 
              error={errors.confirmPassword} 
              required
            >
              <AuthInput
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                required
                autoComplete="new-password"
              />
            </AuthField>
          </div>

          <div className="text-sm text-gray-600">
            <p>Password requirements:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>At least 6 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center">
            <input
              id="includeEmergencyContact"
              type="checkbox"
              checked={includeEmergencyContact}
              onChange={(e) => setIncludeEmergencyContact(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeEmergencyContact" className="ml-2 block text-sm text-gray-700">
              Include emergency contact information
            </label>
          </div>

          {includeEmergencyContact && (
            <div className="space-y-4 pl-6">
              <div className="grid grid-cols-1 gap-4">
                <AuthField 
                  label="Emergency Contact Name" 
                  error={errors.emergencyContactName} 
                  required
                >
                  <AuthInput
                    type="text"
                    name="emergencyContactName"
                    placeholder="Full name"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                  />
                </AuthField>

                <AuthField 
                  label="Relationship" 
                  error={errors.emergencyContactRelationship}
                >
                  <AuthInput
                    type="text"
                    name="emergencyContactRelationship"
                    placeholder="e.g., Spouse, Parent, Friend"
                    value={formData.emergencyContactRelationship}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                  />
                </AuthField>
              </div>

              <AuthField 
                label="Emergency Contact Phone" 
                error={errors.emergencyContactPhone} 
                required
              >
                <AuthInput
                  type="tel"
                  name="emergencyContactPhone"
                  placeholder="Phone number"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  autoComplete="tel"
                />
              </AuthField>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <AuthButton
          type="submit"
          loading={isLoading}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </AuthButton>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
            <AuthLink href="/auth/login">
              Sign in
            </AuthLink>
          </span>
        </div>
      </div>
    </form>
  );
}
