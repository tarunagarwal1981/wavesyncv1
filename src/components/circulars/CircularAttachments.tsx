'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularAttachment } from '@/lib/circulars/types';
import { Download, FileText, ExternalLink } from 'lucide-react';

interface CircularAttachmentsProps {
  attachments: CircularAttachment[];
}

export function CircularAttachments({ attachments }: CircularAttachmentsProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'zip':
      case 'rar':
        return '📦';
      default:
        return '📎';
    }
  };

  const handleDownload = async (attachment: CircularAttachment) => {
    try {
      // For now, we'll open the URL in a new tab
      // In production, you might want to proxy through your server for security
      window.open(attachment.url, '_blank');
    } catch (error) {
      console.error('Failed to download attachment:', error);
    }
  };

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Attachments ({attachments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {attachments.map((attachment, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getFileIcon(attachment.filename)}</span>
                <div>
                  <p className="font-medium text-sm">{attachment.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.size)}
                    {attachment.type && ` • ${attachment.type}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(attachment.url, '_blank')}
                  className="gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => handleDownload(attachment)}
                  className="gap-1"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}



