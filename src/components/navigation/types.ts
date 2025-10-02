import { type LucideIcon } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
  secondary?: boolean;
}

export interface NavigationGroup {
  id: string;
  title?: string;
  items: NavigationItem[];
}

export interface HeaderProps {
  user?: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  } | null;
  notificationCount?: number;
  onProfileClick?: () => void;
  onNotificationClick?: () => void;
  onMenuToggle?: () => void;
}

export interface SidebarProps {
  className?: string;
  isMobile?: boolean;
  collapsed?: boolean;
  onCollapse?: () => void;
}

export interface UserMenuProps {
  user?: HeaderProps['user'];
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

export interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
  className?: string;
}

export type NavigationVariant = 'sidebar' | 'tabbar' | 'header';
export type NavigationOrientation = 'vertical' | 'horizontal';
export type NavigationSize = 'sm' | 'md' | 'lg';

export interface NavigationConfig {
  variant: NavigationVariant;
  orientation: NavigationOrientation;
  size: NavigationSize;
  showLabels: boolean;
  collapsed: boolean;
  sticky: boolean;
}
