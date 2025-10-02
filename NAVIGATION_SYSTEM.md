# Navigation System Documentation

## 🧭 Overview

The WaveSync navigation system provides a comprehensive, responsive navigation experience for the maritime operations platform. It includes desktop sidebar navigation, mobile bottom tab bar, and contextual header actions.

## 📱 Responsive Design

### Desktop (≥1024px)
- **Sidebar Navigation**: Collapsible left sidebar with full navigation tree
- **Header**: Minimalist header with theme toggle, notifications, and user menu
- **Layout**: Sidebar + main content area

### Tablet (768px - 1023px)  
- **Sidebar Navigation**: Hamburger menu on left, sidebar slides in from right
- **Header**: Full header with search, theme toggle, notifications
- **Layout**: Header + main content + bottom tab bar

### Mobile (<768px)
- **Mobile Tab Bar**: Bottom navigation with main sections
- **Header**: Compact header with hamburger menu and user avatar
- **Layout**: Header + main content + bottom tab bar

## 🏗️ Architecture

### Core Components

```
src/components/navigation/
├── types.ts                 # TypeScript interfaces
├── constants.ts             # Navigation data and configuration
├── LayoutProvider.tsx       # React context for layout state
├── NavigationLayout.tsx     # Main layout orchestration
├── Sidebar.tsx             # Desktop sidebar with collapse
├── Header.tsx              # Top header with actions
├── MobileTabBar.tsx        # Bottom navigation for mobile
├── UserMenu.tsx            # User profile dropdown
├── NotificationBell.tsx    # Notification system
└── index.ts               # Exports and shortcuts
```

### Layout States

```typescript
interface LayoutContextValue {
  user: User | null;
  profile: Profile | null;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  notifications: number;
  setNotifications: (count: number) => void;
}
```

## 🧩 Component Breakdown

### Sidebar Navigation

**Features:**
- ✅ Collapsible sidebar (toggles between 256px and 64px width)
- ✅ Active state highlighting 
- ✅ Badge support for counts/alerts
- ✅ Accessibility with ARIA labels
- ✅ Smooth transitions and animations
- ✅ Icon + label design with hover states

**Usage:**
```tsx
import { Sidebar } from '@/components/navigation';

<Sidebar
  collapsed={isCollapsed}
  onCollapse={() => setIsCollapsed(!isCollapsed)}
  className="desktop-only"
/>
```

### Mobile Tab Bar

**Features:**
- ✅ Bottom fixed navigation
- ✅ Selected state highlighting
- ✅ Badge indicators for unread items
- ✅ Safe area padding for notched devices
- ✅ Touch-friendly button sizes
- ✅ Smooth animations and transitions

**Usage:**
```tsx
import { MobileTabBar } from '@/components/navigation';

<MobileTabBar className="mobile-only" />
```

### Header Component

**Features:**
- ✅ Responsive design (full on desktop, compact on mobile)
- ✅ Theme toggle integration
- ✅ Notification bell with dropdown
- ✅ User menu with profile actions
- ✅ Mobile hamburger menu
- ✅ Search button (placeholder)

**Usage:**
```tsx
import { Header, CompactHeader, DashboardHeader } from '@/components/navigation';

<Header
  user={user}
  notificationCount={3}
  onMenuToggle={() => setMobileMenuOpen(true)}
  onProfileClick={() => {}}
  onNotificationClick={() => {}}
/>
```

### User Menu

**Features:**
- ✅ Avatar with fallback initials
- ✅ User information display
- ✅ Profile and settings links
- ✅ Account security section
- ✅ Logout functionality
- ✅ Compact variant for smaller spaces

**Usage:**
```tsx
import { UserMenu } from '@/components/navigation';

<UserMenu
  user={user}
  onProfile={() => navigate('/dashboard/profile')}
  onSettings={() => navigate('/dashboard/settings')}
  onLogout={() => handleLogout()}
/>
```

### Notification Bell

**Features:**
- 🔔 Badge indicator for unread count
- 📋 Notification dropdown with categorized list
- 🎯 Click-to-navigate functionality
- ⏰ Time formatting (just now, 2h ago, etc.)
- 🎨 Color-coded notification types
- ✅ Mark as read workflow

**Usage:**
```tsx
import { NotificationBell } from '@/components/navigation';

<NotificationBell
  count={unreadNotifications}
  onClick={() => navigate('/dashboard/notifications')}
/>
```

## 🧭 Navigation Items

### Main Navigation Structure

```typescript
const MAIN_NAVIGATION = {
  dashboard: '/',
  tickets: '/dashboard/tickets', 
  certificates: '/dashboard/certificates',
  ports: '/dashboard/ports',
  circulars: '/dashboard/circulars',
  signoff: '/dashboard/signoff',
  documents: '/dashboard/documents',
} as const;
```

### Icon Mapping

| Section | Icon | Description |
|---------|------|-------------|
| Dashboard | `LayoutDashboard` | Main dashboard overview |
| Tickets | `TicketIcon` | Travel bookings |
| Certificates | `Award` | Professional certifications |
| Ports | `Anchor` | Port information and agents |
| Circulars | `FileText` | Company communications |
| Sign-off | `CheckSquare` | Departure checklist |
| Documents | `FolderOpen` | Personal document storage |
| Profile | `User` | User account management |

## 🎨 Design System

### Color Scheme (Maritime Theme)

```css
/* Primary Colors */
--primary: 215 25% 25%;         /* Navy blue */
--primary-foreground: 0 0% 98%; /* Light text */

/* Secondary Colors */  
--secondary: 210 40% 95%;       /* Light blue-gray */
--secondary-foreground: 222 84% 20%; /* Navy text */

/* Accent Colors */
--accent: 43 96% 85%;           /* Light gold */
--ac цент-foreground: 222 84% 20%; /* Navy text */

/* State Colors */
--success: hsl(142, 76%, 50%);  /* Success green */
--warning: hsl(43, 96%, 70%);   /* Gold warning */
--destructive: hsl(0, 84%, 60%); /* Maritime red */
```

### Typography Scale

```css
/* Headers */
h1: text-3xl font-bold (30px)    /* Page titles */
h2: text-2xl font-semibold (24px) /* Section headers */
h3: text-xl font-semibold (20px)  /* Card titles */

/* Body Text */
body: text-base (16px)           /* Main content */
small: text-sm (14px)            /* Supporting text */
xs: text-xs (12px)               /* Captions and labels */
```

### Spacing System

```css
/* Standard spacing scale */
p-2: 0.5rem (8px)    /* Tight spacing */
p-4: 1rem (16px)     /* Standard spacing */
p-6: 1.5rem (24px)   /* Comfortable spacing */
p-8: 2rem (32px)     /* Generous spacing */
```

## ⚡ Interactions & Animations

### Transitions

```css
/* Standard transition timing */
transition-all duration-200     /* Quick micro-interactions */
transition-all duration-300     /* Component state changes */
transition-transform duration-200 /* Slide animations */

/* Smooth cubic-bezier curves */
ease-smooth: cubic-bezier(0.4, 0, 0.2, 1)
ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Hover States

- **Buttons**: Background color change + slight scale transform
- **Navigation Items**: Background highlight + color transition
- **Cards**: Subtle shadow elevation increase
- **Icons**: Color transition + slight rotation (when appropriate)

### Active States

- **Current Page**: Primary color background + white text
- **Open Dropdown**: Rotated arrow + highlight background
- **Selected Tab**: Underline indicator + bold text weight
- **Notification Badge**: Pulse animation for new items

## 🔧 Technical Implementation

### State Management

```typescript
// Layout state managed via React Context
const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

// Provide centralized state for all navigation components
export function LayoutProvider({ children, user, profile }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);

  return (
    <LayoutContext.Provider value={{
      user, profile, sidebarCollapsed, setSidebarCollapsed,
      mobileMenuOpen, setMobileMenuOpen, notifications, setNotifications,
    }}>
      {children}
    </LayoutContext.Provider>
  );
}
```

### Responsive Behavior

```typescript
// Tailwind breakpoints
sm: 640px    /* Small devices */
md: 768px    /* Medium devices */
lg: 1024px   /* Large devices */
xl: 1280px   /* Extra large devices */

// Component visibility
className="hidden lg:flex"        /* Desktop only */
className="lg:hidden"           /* Mobile only */
className="hidden md:block"      /* Tablet and up */
```

### Accessibility Features

- **ARIA Labels**: All interactive elements have descriptive labels
- **Keyboard Navigation**: Focus management for dropdown menus
- **Screen Reader Support**: Semantic HTML structure with landmarks
- **Color Contrast**: WCAG AA compliant color combinations
- **Touch Targets**: Minimum 44px touch targets for mobile interaction

## 🚀 Usage Patterns

### Basic Layout Setup

```tsx
// In your layout.tsx
export default async function AuthenticatedLayout({ children }) {
  const { user, profile } = await ensureAuthenticated();
  
  return (
    <LayoutProvider user={user} profile={profile}>
      <NavigationLayout>
        {children}
      </NavigationLayout>
    </LayoutProvider>
  );
}
```

### Customizing Navigation Items

```tsx
// Add badges to navigation items
const navigationItems = [
  {
    id: 'tickets',
    label: 'Travel & Tickets',
    href: '/dashboard/tickets',
    icon: TicketIcon,
    badge: pendingTicketsCount, // Will show count badge
  },
];
```

### Handling Notifications

```tsx
// In your notification context
const { notifications, setNotifications } = useLayout();

useEffect(() => {
  // Fetch notifications from API
  fetchNotifications().then(setNotifications);
}, []);

// Display in header
<NotificationBell 
  count={notifications.length} 
  onClick={() => navigate('/notifications')} 
/>
```

## 🎯 Business Logic

### Navigation Priority (Mobile Tab Bar)

1. **Dashboard** - Main overview (always visible)
2. **Tickets** - Travel management (high priority)
3. **Certificates** - Professional compliance (high priority)  
4. **Circulars** - Company communications (medium priority)

### Notification Categories

- 🟡 **Warning**: Certificate expirations, deadlines
- 🔵 **Info**: Assignment updates, new messages
- 🟢 **Success**: Confirmed actions, approvals
- 🔴 **Error**: Critical alerts, urgent actions

### User Access Patterns

- **Frequent**: Dashboard (daily), Certificates (weekly)
- **Situational**: Tickets (before trips), Sign-off (at departure)
- **Administrative**: Profile (occasional), Settings (rare)

## 📱 Device Considerations

### Mobile Optimization

- **Touch-first design**: Large hit targets (44px minimum)
- **Safe areas**: Proper padding for iPhone notches/home indicators
- **Gesture support**: Swipe actions where appropriate
- **Fast switching**: Instant tab changes for core navigation

### Desktop Enhancements

- **Keyboard shortcuts**: Quick access to main sections
- **Multi-column layouts**: Better space utilization
- **Hover previews**: Contextual information on hover
- **Drag & drop**: File operations, list reordering

## 🔒 Security & Privacy

- **Route protection**: Automatic redirects for unauthorized access
- **Data isolation**: User-specific navigation state
- **Secure authentication**: Proper session management
- **Privacy by design**: Minimal data collection in navigation

The navigation system provides a professional, maritime-focused experience that scales beautifully across all devices while maintaining security and accessibility standards.
