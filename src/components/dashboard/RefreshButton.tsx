'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function RefreshButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.location.reload()}
      className="gap-2"
    >
      <RefreshCw className="h-4 w-4" />
      <span className="hidden sm:inline">Refresh</span>
    </Button>
  );
}
