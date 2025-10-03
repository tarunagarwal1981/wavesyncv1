import {
  LayoutDashboard,
  TicketIcon,
  Award,
  Anchor,
  FileText,
  CheckSquare,
  FolderOpen,
  User,
  Settings,
  LogOut,
  Bell,
  Menu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { NavigationGroup } from './types';

export const MAIN_NAVIGATION: NavigationGroup = {
  id: 'main',
  items: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'tickets',
      label: 'Travel & Tickets',
      href: '/dashboard/tickets',
      icon: TicketIcon,
    },
    {
      id: 'certificates',
      label: 'Certificates',
      href: '/dashboard/certificates',
      icon: Award,
    },
    {
      id: 'ports',
      label: 'Ports & Agents',
      href: '/dashboard/ports',
      icon: Anchor,
    },
    {
      id: 'circulars',
      label: 'Circulars',
      href: '/circulars',
      icon: FileText,
    },
    {
      id: 'documents',
      label: 'Documents',
      href: '/dashboard/documents',
      icon: FolderOpen,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      href: '/notifications',
      icon: Bell,
    },
    {
      id: 'signoff',
      label: 'Sign-off',
      href: '/signoff',
      icon: CheckSquare,
    },
  ],
};

export const USER_NAVIGATION: NavigationGroup = {
  id: 'user',
  items: [
    {
      id: 'profile',
      label: 'Profile',
      href: '/dashboard/profile',
      icon: User,
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ],
};

export const NAVIGATION_ICONS = {
  LayoutDashboard,
  TicketIcon,
  Award,
  Anchor,
  FileText,
  CheckSquare,
  FolderOpen,
  User,
  Settings,
  LogOut,
  Bell,
  Menu,
  ChevronLeft,
  ChevronRight,
} as const;

// Breakpoints for responsive navigation
export const NAVIGATION_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;

// Animation durations for smooth transitions
export const NAVIGATION_TRANSITIONS = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
} as const;

// Z-index layers for navigation elements
export const NAVIGATION_LAYERS = {
  sidebar: 40,
  header: 50,
  tabbar: 60,
  dropdown: 70,
  overlay: 80,
} as const;
