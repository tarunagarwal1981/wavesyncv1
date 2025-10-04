'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveDashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveDashboardLayout({ 
  children, 
  className 
}: ResponsiveDashboardLayoutProps) {
  return (
    <div className={cn(
      // Mobile & Tablet: Full width within constraints
      "w-full min-h-screen",
      // Large screens: Constrained width with center alignment
      "lg:max-w-7xl lg:mx-auto",
      // Very large screens: Add some margin
      "xl:max-w-6xl",
      className
    )}>
      <div className={cn(
        // Content wrapper with proper padding
        "px-4 sm:px-6 lg:px-8",
        // Space between sections
        "space-y-6",
        // Ensure content is visible
        "min-h-screen py-6"
      )}>
        {children}
      </div>
    </div>
  );
}

// For individual dashboard sections
export function ResponsiveSection({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <section className={cn(
      "w-full",
      // Ensure sections are properly responsive
      "min-h-fit",
      className
    )}>
      {children}
    </section>
  );
}

// For grid layouts that adapt to screen size
export function ResponsiveGrid({ 
  children, 
  cols = { base: 1, md: 2, lg: 3 },
  className 
}: { 
  children: ReactNode; 
  cols?: { base?: number; md?: number; lg?: number };
  className?: string; 
}) {
  const baseCols = cols.base || 1;
  const mdCols = cols.md || 2;
  const lgCols = cols.lg || 3;

  return (
    <div className={cn(
      "grid gap-4 sm:gap-6",
      `grid-cols-${baseCols}`,
      `md:grid-cols-${mdCols}`,
      `lg:grid-cols-${lgCols}`,
      className
    )}>
      {children}
    </div>
  );
}
