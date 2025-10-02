'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut as clientSignOut } from '@/lib/auth/actions';
import { AuthButton } from './AuthLayout';

interface LogoutButtonProps {
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function LogoutButton({ onClick, className = '', variant = 'secondary' }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      await clientSignOut();
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login even if logout fails
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
      if (onClick) {
        onClick();
      }
    }
  };

  return (
    <AuthButton
      onClick={handleLogout}
      loading={isLoading}
      disabled={isLoading}
      variant={variant}
      className={className}
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </AuthButton>
  );
}
