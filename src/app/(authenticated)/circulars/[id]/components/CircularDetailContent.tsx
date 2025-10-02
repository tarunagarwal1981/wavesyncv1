'use client';

import React, { useState } from 'react';
import { CircularDetail } from '@/components/circulars/CircularDetail';
import { CircularWithStatus } from '@/lib/circulars/types';
import { getCircularById } from '@/lib/circulars/queries';
import { markCircularAsRead, acknowledgeCircular } from '@/lib/circulars/actions';

interface CircularDetailContentProps {
  circularId: string;
}

export function CircularDetailContent({ circularId }: CircularDetailContentProps) {
  const [circular, setCircular] = useState<CircularWithStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const loadCircular = async () => {
      try {
        setIsLoading(true);
        const data = await getCircularById(circularId);
        if (data) {
          setCircular(data);
        } else {
          setError('Circular not found');
        }
      } catch (err) {
        setError('Failed to load circular');
        console.error('Error loading circular:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCircular();
  }, [circularId]);

  const handleMarkAsRead = async () => {
    if (!circular) return;
    
    try {
      await markCircularAsRead(circularId);
      // Update local state
      setCircular(prev => prev ? { ...prev, isRead: true, readAt: new Date().toISOString() } : null);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleAcknowledge = async () => {
    if (!circular) return;
    
    try {
      await acknowledgeCircular(circularId);
      // Update local state
      setCircular(prev => prev ? { 
        ...prev, 
        isAcknowledged: true, 
        acknowledgedAt: new Date().toISOString(),
        isRead: true,
        readAt: prev.readAt || new Date().toISOString()
      } : null);
    } catch (error) {
      console.error('Failed to acknowledge:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Error Loading Circular
        </h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!circular) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Circular Not Found</h2>
        <p className="text-muted-foreground">
          The circular you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <CircularDetail
      circular={circular}
      onMarkAsRead={handleMarkAsRead}
      onAcknowledge={handleAcknowledge}
    />
  );
}
