'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface AcknowledgmentButtonProps {
  circularId: string;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  onAcknowledge: () => Promise<void>;
}

export function AcknowledgmentButton({ 
  circularId,
  isAcknowledged, 
  acknowledgedAt, 
  onAcknowledge
}: AcknowledgmentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onAcknowledge();
    } finally {
      setIsLoading(false);
    }
  };

  if (isAcknowledged) {
    return (
      <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div>
          <p className="font-medium text-green-800">Acknowledged</p>
          {acknowledgedAt && (
            <p className="text-sm text-green-600">
              Acknowledged on {new Date(acknowledgedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
        <div>
          <p className="font-medium text-orange-800">Acknowledgment Required</p>
          <p className="text-sm text-orange-600">
            This circular requires acknowledgment of receipt and understanding.
          </p>
        </div>
      </div>

      <Button 
        onClick={handleClick}
        disabled={isLoading}
        className="min-w-[200px]"
      >
        {isLoading ? 'Acknowledging...' : 'I Acknowledge'}
      </Button>

      <p className="text-xs text-muted-foreground">
        By clicking "I Acknowledge", you confirm that you have read and understood this circular.
      </p>
    </div>
  );
}
