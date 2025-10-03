'use client';

import { useState } from 'react';
import { Menu, Bell, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

interface MobileHeaderProps {
  title?: string;
  showNotifications?: boolean;
  showSearch?: boolean;
  showQuickActions?: boolean;
  notificationCount?: number;
  user?: {
    name: string;
    avatar?: string;
  };
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
  quickActions?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }>;
}

export function MobileHeader({
  title = 'WaveSync',
  showNotifications = true,
  showSearch = true,
  showQuickActions = false,
  notificationCount = 0,
  user,
  onMenuClick,
  onSearch,
  quickActions = []
}: MobileHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b safe-area-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left side - Menu and Title */}
        <div className="flex items-center gap-3 flex-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={onMenuClick}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 mb-6 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="font-semibold text-lg">{user?.name || 'User'}</h2>
                    <p className="text-sm text-muted-foreground">Welcome back</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4">
                  <div className="space-y-2">
                    <MobileNavItem icon="🏠" label="Dashboard" href="/dashboard" />
                    <MobileNavItem icon="📄" label="Certificates" href="/certificates" />
                    <MobileNavItem icon="📋" label="Circulars" href="/circulars" />
                    <MobileNavItem icon="📁" label="Documents" href="/documents" />
                    <MobileNavItem icon="🚢" label="Ports" href="/ports" />
                    <MobileNavItem icon="✅" label="Sign-off" href="/signoff" />
                    <MobileNavItem icon="🎫" label="Tickets" href="/tickets" />
                  </div>
                </nav>

                {/* Quick Actions */}
                {quickActions.length > 0 && (
                  <div className="px-4 py-4 border-t">
                    <h3 className="font-medium mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={action.onClick}
                          className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent transition-colors"
                        >
                          {action.icon}
                          <span className="text-sm">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {!searchOpen && (
            <div className="flex-1">
              <h1 className="text-lg font-semibold truncate">
                {title}
              </h1>
            </div>
          )}
        </div>

        {/* Right side - Search, Notifications, Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {showSearch && (
            <>
              {searchOpen ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="h-9"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch();
                      if (e.key === 'Escape') setSearchOpen(false);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSearch}
                  >
                    Search
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchOpen(false)}
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  className="h-9 w-9"
                >
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              )}
            </>
          )}

          {/* Notifications */}
          {showNotifications && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/notifications')}
                className="h-9 w-9"
              >
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
              )}
            </div>
          )}

          {/* Quick Add */}
          {showQuickActions && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/create')}
              className="h-9 w-9"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add new item</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

// Helper component for navigation items
function MobileNavItem({ 
  icon, 
  label, 
  href 
}: { 
  icon: string; 
  label: string; 
  href: string; 
}) {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.push(href)}
      className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-accent transition-colors text-left"
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}



