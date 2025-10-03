'use client';

import * as React from 'react';

interface LayoutProviderProps {
  children: React.ReactNode;
  user?: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  } | null;
  profile?: {
    id: string;
    employee_id: string;
    rank: string;
    nationality: string;
    phone?: string;
    full_name?: string;
  } | null;
}

interface LayoutContextValue {
  user: LayoutProviderProps['user'];
  profile: LayoutProviderProps['profile'];
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  notifications: number;
  setNotifications: (count: number) => void;
}

const LayoutContext = React.createContext<LayoutContextValue | undefined>(undefined);

export function LayoutProvider({ children, user, profile }: LayoutProviderProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState(0);

  // Mock notification count - in real app, fetch from API
  React.useEffect(() => {
    // Simulate notifications
    setNotifications(3);
  }, []);

  // Close mobile menu on navigation
  React.useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuOpen(false);
    };

    // In a real app, you'd listen to router events here
    // For now, we'll just close on any click outside
    document.addEventListener('click', handleRouteChange);
    return () => document.removeEventListener('click', handleRouteChange);
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      profile,
      sidebarCollapsed,
      setSidebarCollapsed,
      mobileMenuOpen,
      setMobileMenuOpen,
      notifications,
      setNotifications,
    }),
    [
      user,
      profile,
      sidebarCollapsed,
      setSidebarCollapsed,
      mobileMenuOpen,
      setMobileMenuOpen,
      notifications,
      setNotifications,
    ]
  );

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = React.useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}


