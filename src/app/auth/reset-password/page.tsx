'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { updatePassword } from '@/lib/auth/actions';
import { updatePasswordSchema, type UpdatePasswordFormData } from '@/lib/auth/validation';
import { AuthLayout, AuthField, AuthInput, AuthButton, AuthAlert, AuthLink } from '@/components/auth/AuthLayout';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<UpdatePasswordFormData>({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<UpdatePasswordFormData>>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if we have required URL parameters for password reset
    const fragment = window.location.hash;
    if (!fragment.includes('access_token=')) {
      router.push('/auth/login?error=Invalid reset link');
    }
  }, [router]);

  const validateField = (field: keyof UpdatePasswordFormData, value: string) => {
    try {
      const fieldSchema = updatePasswordSchema.pick({ [field]: true });
      fieldSchema.parse({ [field]: value });
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (err) {
      if (err instanceof Error) {
        setErrors(prev => ({ ...prev, [field]: err.message }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    setError(''); // Clear error when user starts typing

    // Validate field
    validateField(name as keyof UpdatePasswordFormData, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate entire form
      const validatedData = updatePasswordSchema.parse(formData);
      
      const result = await updatePassword(validatedData);

      if (result.success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login?message=Password updated successfully. Please sign in.');
        }, 3000);
      } else {
        setError(result.error || 'Failed to update password');
      }
    } catch (err) {
      if (err instanceof Error && 'errors' in err) {
        // Zod validation errors
        const zodError = err as any;
        const fieldErrors: Partial<UpdatePasswordFormData> = {};
        
        zodError.errors.forEach((error: any) => {
          fieldErrors[error.path[0] as keyof UpdatePasswordFormData] = error.message;
        });
        
        setErrors(fieldErrors);
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Password Updated!"
        subtitle="Your password has been successfully reset"
      >
        <div className="space-y-6">
          <AuthAlert variant="success">
            <div className="text-sm">
              <p>Your password has been updated successfully.</p>
              <p className="mt-2">You will be redirected to the sign-in page shortly...</p>
            </div>
          </AuthAlert>

          <AuthButton
            onClick={() => router.push('/auth/login')}
            fullWidth
          >
            Sign In Now
          </AuthButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your new password below"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {searchParams.get('error') && (
          <AuthAlert variant="error">
            {searchParams.get('error')}
          </AuthAlert>
        )}

        {error && (
          <AuthAlert variant="error">
            {error}
          </AuthAlert>
        )}

        <div className="space-y-4">
          <AuthField 
            label="New Password" 
            error={errors.password} 
            required
          >
            <AuthInput
              type="password"
              name="password"
              placeholder="Enter your new password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
              autoComplete="new-password"
              autoFocus
            />
          </AuthField>

          <AuthField 
            label="Confirm New Password" 
            error={errors.confirmPassword} 
            required
          >
            <AuthInput
              type="password"
              name="confirmPassword"
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              required
              autoComplete="new-password"
            />
          </AuthField>

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

        <div className="space-y-4">
          <AuthButton
            type="submit"
            loading={isLoading}
            disabled={isLoading || !formData.password || !formData.confirmPassword}
            fullWidth
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </AuthButton>

          <div className="text-center">
            <AuthLink href="/auth/login">
              Remember your password? Sign in
            </AuthLink>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>Make sure to use a strong password that you haven't used before.</p>
        </div>
      </form>
    </AuthLayout>
  );
}


