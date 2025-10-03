'use client';

import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useOnline } from '@/hooks/mobile/useOnline';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const { isOnline } = useOnline();
  const router = useRouter();

  useEffect(() => {
    if (isOnline) {
      router.replace('/');
    }
  }, [isOnline, router]);

  const handleRetry = () => {
    if (isOnline) {
      router.replace('/');
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <WifiOff className="h-16 w-16 text-muted-foreground" />
            {isOnline && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Wifi className="h-16 w-16 text-primary animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            {isOnline ? 'You\'re Back Online!' : 'You\'re Offline'}
          </h1>
          
          <p className="text-muted-foreground">
            {isOnline 
              ? 'Your connection has been restored. Redirecting you back to the app...'
              : 'It looks like you\'re not connected to the internet. Please check your connection and try again.'
            }
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button 
            onClick={handleRetry}
            className="w-full"
            disabled={!isOnline && navigator.onLine === false}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isOnline ? 'Continue' : 'Retry'}
          </Button>

          {!isOnline && (
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="w-full"
            >
              Go Back
            </Button>
          )}
        </div>

        {/* Connection Status */}
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground space-y-2">
          <p>
            WaveSync works offline for viewing cached content. 
            Some features require an internet connection.
          </p>
          
          <div className="bg-muted/30 rounded-lg p-3 text-left">
            <h3 className="font-medium mb-2">What you can do offline:</h3>
            <ul className="space-y-1 text-xs">
              <li>• View cached certificates and documents</li>
              <li>• Browse circular notices</li>
              <li>• Access your profile</li>
              <li>• Complete sections of sign-off checklist</li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-lg p-3 text-left">
            <h3 className="font-medium mb-2 text-red-700 dark:text-red-300">Limited offline:</h3>
            <ul className="space-y-1 text-xs text-red-600 dark:text-red-400">
              <li>• Upload new files</li>
              <li>• Acknowledge new circulars</li>
              <li>• Sync data changes</li>
              <li>• Real-time notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}



