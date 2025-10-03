'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getCurrentUserWithProfile } from '@/lib/auth/session';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requireProfile = false,
  redirectTo = '/auth/login',
  fallback = <LoadingState />,
}: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (requireProfile) {
          const result = await getCurrentUserWithProfile();
          setIsAuthenticated(result !== null);
          setHasProfile(result?.profile !== null);
        } else {
          const user = await getCurrentUser();
          setIsAuthenticated(user !== null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requireProfile]);

  // Show loading state
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Allow access if authenticated and profile not required
  if (requireProfile === false && isAuthenticated === true) {
    return <>{children}</>;
  }

  // Allow access if authenticated and has profile
  if (requireProfile === true && isAuthenticated === true && hasProfile === true) {
    return <>{children}</>;
  }

  // Redirect if not authenticated
  if (isAuthenticated === false) {
    router.push(redirectTo);
    return null;
  }

  // Redirect if profile required but doesn't have one
  if (requireProfile && hasProfile === false) {
    router.push('/auth/complete-profile');
    return null;
  }

  // Show loading while redirecting
  return <>{fallback}</>;
}

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireProfile?: boolean;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  requireAuth = true,
  requireProfile = false,
  fallback = <LoadingState />,
}: AuthGuardProps) {
  return (
    <ProtectedRoute
      requireProfile={requireAuth && requireProfile}
      redirectTo={requireAuth ? '/auth/login' : '/dashboard'}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  userRole?: string;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  allowedRoles = [],
  userRole,
  fallback = <AccessDenied />,
}: RoleGuardProps) {
  // If no roles specified, allow access
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // If user role is not specified or not in allowed roles, deny access
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

function AccessDenied() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Access Denied
          </h3>
          <p className="text-gray-600 mt-2">
            You don't have permission to access this page.
          </p>
        </div>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

interface ConditionalRouteProps {
  children: React.ReactNode;
  condition: boolean;
  fallback?: React.ReactNode;
}

export function ConditionalRoute({
  children,
  condition,
  fallback = null,
}: ConditionalRouteProps) {
  if (!condition) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default ProtectedRoute;


