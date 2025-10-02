'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import type { UserMenuProps } from './types';

export function UserMenu({
  user,
  onProfile,
  onSettings,
  onLogout,
  compact = false,
}: UserMenuProps & { compact?: boolean }) {
  const [open, setOpen] = React.useState(false);

  if (!user) {
    return (
      <Button variant="ghost" size={compact ? 'sm' : 'default'} asChild>
        <Link href="/auth/login">
          Sign In
        </Link>
      </Button>
    );
  }

  const userInitials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email[0].toUpperCase();

  const dropdownContent = (
    <DropdownMenuContent 
      align="end" 
      className="w-56"
      alignOffset={5}
    >
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">
            {user.name || 'User'}
          </p>
          <p className="text-xs leading-none text-muted-foreground">
            {user.email}
          </p>
        </div>
      </DropdownMenuLabel>
      
      <DropdownMenuSeparator />
      
      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <Shield className="mr-2 h-4 w-4" />
          <span>Account Security</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      
      <DropdownMenuSeparator />
      
      <DropdownMenuItem asChild className="cursor-pointer text-destructive">
        <LogoutButton />
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  if (compact) {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        {dropdownContent}
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-9 px-2 justify-start gap-2"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium">
              {user.name?.split(' ')[0] || 'User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {user.email.split('@')[0]}
            </span>
          </div>
          
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      {dropdownContent}
    </DropdownMenu>
  );
}

export function UserMenuCompact({
  user,
  onProfile,
  onSettings,
  onLogout,
}: UserMenuProps) {
  const [open, setOpen] = React.useState(false);

  if (!user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/auth/login">
          Sign In
        </Link>
      </Button>
    );
  }

  const userInitials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="cursor-pointer">
            <User className="mr<｜tool▁sep｜>2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Linkself="/dashboard/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild className="cursor-pointer text-destructive">
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
