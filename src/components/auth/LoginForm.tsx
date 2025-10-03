'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn as serverSignIn } from '@/lib/auth/actions';
import { loginSchema, type LoginFormData } from '@/lib/auth/validation';
import { AuthButton, AuthField, AuthInput, AuthAlert, AuthLink } from './AuthLayout';

interface LoginFormProps {
  onSignUpClick?: () => void;
  onForgotPasswordClick?: () => void;
}

export function LoginForm({ onSignUpClick, onForgotPasswordClick }: LoginFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const validateField = (field: keyof LoginFormData, value: any) => {
    try {
      const fieldSchema = loginSchema.pick({ [field]: true });
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
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError('');
    }

    // Validate field on change (with debounce)
    if (name !== 'rememberMe') {
      validateField(name as keyof LoginFormData, fieldValue);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name as keyof LoginFormData, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError('');

    try {
      // Validate entire form
      const validatedData = loginSchema.parse(formData);
      
      const result = await serverSignIn({
        email: validatedData.email,
        password: validatedData.password,
        rememberMe: validatedData.rememberMe || false,
      });

      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setSubmitError(result.error || 'Login failed');
      }
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        // Zod validation errors
        const zodError = error as any;
        const fieldErrors: Partial<LoginFormData> = {};
        
        zodError.errors.forEach((err: any) => {
          fieldErrors[err.path[0] as keyof LoginFormData] = err.message;
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
          label="Password" 
          error={errors.password} 
          required
        >
          <AuthInput
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            required
            autoComplete="current-password"
          />
        </AuthField>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <AuthLink href="/auth/forgot-password">
            Forgot your password?
          </AuthLink>
        </div>
      </div>

      <div className="space-y-4">
        <AuthButton
          type="submit"
          loading={isLoading}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </AuthButton>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Don't have an account?{' '}
            <AuthLink href="/auth/signup">
              Sign up
            </AuthLink>
          </span>
        </div>
      </div>

      {/* Demo Credentials */}
      <div className="border-t pt-4">
        <AuthAlert variant="info">
          <div className="text-sm">
            <div className="font-medium mb-2">Demo Credentials:</div>
            <div className="space-y-1">
              <div><strong>Email:</strong> demo@wavesync.com</div>
              <div><strong>Password:</strong> demo123</div>
            </div>
          </div>
        </AuthAlert>
      </div>
    </form>
  );
}


