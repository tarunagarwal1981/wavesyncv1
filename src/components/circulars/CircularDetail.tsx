'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PriorityBadge } from './PriorityBadge';
import { AcknowledgmentButton } from './AcknowledgmentButton';
import { CircularAttachments } from './CircularAttachments';
import { CircularWithStatus, CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/circulars/types';
import { Share2, Download, Printer, Eye, Clock, User } from 'lucide-react';

interface CircularDetailProps {
  circular: CircularWithStatus;
  onMarkAsRead: () => Promise<void>;
  onAcknowledge: () => Promise<void>;
}

export function CircularDetail({ circular, onMarkAsRead, onAcknowledge }: CircularDetailProps) {
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleMarkAsRead = async () => {
    if (circular.isRead) return;
    
    setIsMarkingRead(true);
    try {
      await onMarkAsRead();
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: circular.title,
          text: circular.content.substring(0, 200),
          url: window.location.href
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDownload = () => {
    // Create a downloadable text version
    const content = `
${circular.title}
${circular.referenceNumber ? `Reference: ${circular.referenceNumber}` : ''}
Category: ${CATEGORY_LABELS[circular.category]}
Priority: ${circular.priority.toUpperCase()}
Date: ${formatDate(circular.issueDate)}
Publisher: ${circular.publisherName}

${circular.content}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${circular.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // Auto-mark as read when component mounts (if not already read)
  React.useEffect(() => {
    if (!circular.isRead) {
      handleMarkAsRead();
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2 flex items-center gap-2">
                {circular.title}
                {circular.requiresAcknowledgment && !circular.isAcknowledged && (
                  <Badge variant="destructive" className="animate-pulse">
                    Acknowledgment Required
                  </Badge>
                )}
              </CardTitle>
              
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <PriorityBadge priority={circular.priority} />
                <Badge 
                  variant="secondary" 
                  className={`${CATEGORY_COLORS[circular.category]}`}
                >
                  {CATEGORY_LABELS[circular.category]}
                </Badge>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDate(circular.issueDate)}
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {circular.publisherName}
                </div>
                {circular.referenceNumber && (
                  <div className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {circular.referenceNumber}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-gray max-w-none">
            <div dangerouslySetInnerHTML={{ __html: circular.content }} />
          </div>
        </CardContent>
      </Card>

      {/* Attachments */}
      {circular.attachments && circular.attachments.length > 0 && (
        <CircularAttachments attachments={circular.attachments} />
      )}

      {/* Acknowledgment Section */}
      {circular.requiresAcknowledgment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acknowledgment</CardTitle>
          </CardHeader>
          <CardContent>
            <AcknowledgmentButton
              circularId={circular.id}
              isAcknowledged={circular.isAcknowledged}
              acknowledgedAt={circular.acknowledgedAt}
              onAcknowledge={onAcknowledge}
            />
          </CardContent>
        </Card>
      )}

      {/* Status Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {circular.isRead ? 'Read' : 'Unread'}
            {circular.readAt && (
              <span className="ml-1">• {formatDate(circular.readAt)}</span>
            )}
          </div>
          {circular.isAcknowledged && (
            <div className="flex items-center gap-1 text-green-600">
              <span>Acknowledged</span>
              {circular.acknowledgedAt && (
                <span>• {formatDate(circular.acknowledgedAt)}</span>
              )}
            </div>
          )}
        </div>
        
        <div className="text-xs">
          Created {formatDate(circular.createdAt)}
        </div>
      </div>
    </div>
  );
}
