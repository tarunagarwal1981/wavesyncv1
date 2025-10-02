'use client';

import { Home, FileText, Bell, FolderOpen, Navigation, CheckSquare, Ticket, User } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MobileNavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
}

interface MobileNavProps {
  notificationCount?: number;
  className?: string;
}

export function MobileNav({ notificationCount = 0, className }: MobileNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: MobileNavItemProps[] = [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: 'Certificates',
      href: '/certificates',
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: 'Circulars',
      href: '/circulars',
      badge: notificationCount,
    },
    {
      icon: <FolderOpen className="h-5 w-5" />,
      label: 'Documents',
      href: '/documents',
    },
    {
      icon: <Navigation className="h-5 w-5" />,
      label: 'Ports',
      href: '/ports',
    },
    {
      icon: <CheckSquare className="h-5 w-5" />,
      label: 'Sign-off',
      href: '/signoff',
    },
    {
      icon: <Ticket className="h-5 w-5" />,
      label: 'Tickets',
      href: '/tickets',
    },
  ];

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t safe-area-bottom z-40",
      className
    )}>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
                          (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          
          return (
            <MobileNavButton
              key={item.href}
              {...item}
              isActive={isActive}
              onClick={() => router.push(item.href)}
            />
          );
        })}
        
        {/* Profile button */}
        <MobileNavButton
          icon={<User className="h-5 w-5" />}
          label="Profile"
          href="/profile"
          isActive={pathname === '/profile'}
          onClick={() => router.push('/profile')}
        />
      </div>
    </nav>
  );
}

function MobileNavButton({ 
  icon, 
  label, 
  badge, 
  isActive, 
  onClick 
}: MobileNavItemProps & { 
  isActive: boolean; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 min-w-[44px] py-2 px-1 rounded-lg transition-all duration-200",
        "active:scale-95 active:bg-accent",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <div className="relative">
        <div className={cn(
          "transition-colors",
          isActive ? "text-primary" : "text-muted-foreground"
        )}>
          {icon}
        </div>
        {badge && badge > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs min-w-[16px]"
          >
            {badge > 9 ? '9+' : badge}
          </Badge>
        )}
      </div>
      
      <span className={cn(
        "text-xs font-medium transition-colors",
        isActive ? "text-primary" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </button>
  );
}

// Bottom navigation for specific sections
export function SectionMobileNav({ 
  items, 
  className 
}: { 
  items: MobileNavItemProps[]; 
  className?: string; 
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t safe-area-bottom z-40",
      className
    )}>
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <MobileNavButton
              key={item.href}
              {...item}
              isActive={isActive}
              onClick={() => router.push(item.href)}
            />
          );
        })}
      </div>
    </nav>
  );
}
