'use client';

import { useEffect, useState } from 'react';

interface HydrationBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Component to prevent hydration mismatches
export function HydrationBoundary({ children, fallback = null }: HydrationBoundaryProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return fallback;
  }

  return <>{children}</>;
}

// For dropdowns and modals that generate dynamic IDs
export function ClientOnlyWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
