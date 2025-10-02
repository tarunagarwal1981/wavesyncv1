'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Only render after mounting to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function ThemeToggleMaritime() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Only render after mounting to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    { name: 'light', label: 'Day Mode' },
    { name: 'dark', label: 'Night Mode' },
    { name: 'system', label: 'System' },
  ] as const;

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="h-8">
        <Sun className="h-3 w-3 mr-2" />
        Day Mode
      </Button>
    );
  }

  const currentTheme = themes.find(t => t.name === theme) || themes[0];

  return (
    <div className="flex items-center space-x-2">
      {themes.map((themeOption) => (
        <Button
          key={themeOption.name}
          variant={theme === themeOption.name ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme(themeOption.name)}
          className={`h-8 ${
            theme === themeOption.name 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground'
          }`}
        >
          {themeOption.name === 'light' && (
            <Sun className="h-3 w-3 mr-1" />
          )}
          {themeOption.name === 'dark' && (
            <Moon className="h-3 w-3 mr-1" />
          )}
          {themeOption.name === 'system' && (
            <span className="h-3 w-3 mr-1 rounded-full bg-muted-foreground" />
          )}
          {themeOption.label}
        </Button>
      ))}
    </div>
  );
}
