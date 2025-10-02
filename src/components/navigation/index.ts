// Main navigation components
export { Sidebar, MobileSidebar } from './Sidebar';
export { Header, CompactHeader, DashboardHeader } from './Header';
export { MobileTabBar, EnhancedMobileTabBar, MobileTabBarMore, MobileTabBarFooter } from './MobileTabBar';
export { UserMenu, UserMenuCompact } from './UserMenu';
export { NotificationBell, NotificationBellCompact } from './NotificationBell';

// Layout components
export { LayoutProvider, useLayout } from './LayoutProvider';
export { NavigationLayout, CompactNavigationLayout, FullscreenNavigationLayout } from './NavigationLayout';

// Types and constants
export type * from './types';
export { MAIN_NAVIGATION, USER_NAVIGATION, NAVIGATION_ICONS, NAVIGATION_BREAKPOINTS, NAVIGATION_TRANSITIONS, NAVIGATION_LAYERS } from './constants';

// Re-export commonly used components for convenience
export { default as NavigationLayout } from './NavigationLayout';
export { default as Sidebar } from './Sidebar';
export { default as Header } from './Header';
export { default as MobileTabBar } from './MobileTabBar';
