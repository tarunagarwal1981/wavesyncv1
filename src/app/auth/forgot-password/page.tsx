'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { requestPasswordReset } from '@/lib/auth/actions';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/auth/validation';
import { AuthLayout, AuthField, AuthInput, AuthButton, AuthAlert, AuthLink } from '@/components/auth/AuthLayout';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate email
      const validatedData = resetPasswordSchema.parse({ email });
      
      const result = await requestPasswordReset(validatedData);

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(''); // Clear error when user starts typing
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent a password reset link to your email address"
      >
        <div className="space-y-6">
          <AuthAlert variant="info">
            <div className="text-sm">
              <p>If you have an account with us, you'll receive a password reset email shortly.</p>
              <p className="mt-2">
                <strong>Email:</strong> {email}
              </p>
            </div>
          </AuthAlert>

          <div className="space-y-4">
            <AuthButton
              onClick={() => router.push('/auth/login')}
              fullWidth
            >
              Back to Sign In
            </AuthButton>

            <div className="text-center">
              <AuthLink 
                href="#"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
              >
                Didn't receive the email? Try again
              </AuthLink>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>If you don't see the email, check your spam folder or contact support.</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Your Password?"
      subtitle="Enter your email address and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <AuthAlert variant="error">
            {error}
          </AuthAlert>
        )}

        <div className="space-y-4">
          <AuthField 
            label="Email Address" 
            error={searchParams.get('error') || undefined}
            required
          >
            <AuthInput
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
              required
              autoComplete="email"
              autoFocus
            />
          </AuthField>
        </div>

        <div className="space-y-4">
          <AuthButton
            type="submit"
            loading={isLoading}
            disabled={isLoading || !email.trim()}
            fullWidth
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </AuthButton>

          <div className="text-center">
            <AuthLink href="/auth/login">
              Remember your password? Sign in
            </AuthLink>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>This will send a secure password reset link to your registered email address.</p>
        </div>
      </form>
    </AuthLayout>
  );
}
