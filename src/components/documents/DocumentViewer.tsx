'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Document, canPreviewInBrowser } from '@/lib/documents/types';
import { getFileIcon } from '@/lib/documents/utils';
import { 
  Download, 
  ExternalLink, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX
} from 'lucide-react';

interface DocumentViewerProps {
  document: Document;
  onDownload?: (document: Document) => void;
  showControls?: boolean;
  height?: string;
  className?: string;
}

export function DocumentViewer({ 
  document, 
  onDownload,
  showControls = true,
  height = '500px',
  className 
}: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const canPreview = canPreviewInBrowser(document.mimeType || '');

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [document.id]);

  const handleDownload = () => {
    onDownload?.(document);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    setFullscreen(prev => !prev);
  };

  // Render content based on document type
  const renderContent = () => {
    if (!canPreview) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-6xl mb-4">
            {getFileIcon(document.mimeType || '')}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {document.documentName}
          </h3>
          <p className="text-gray-500 mb-4">
            This file type cannot be previewed in the browser
          </p>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download to View
          </Button>
        </div>
      );
    }

    if (document.mimeType === 'application/pdf') {
      return (
        <div className="relative w-full h-full">
          <iframe
            src={`${document.documentUrl}#toolbar=1&navpanes=0&scrollbar=0`}
            className="w-full h-full border-0"
            style={{ 
              transform: `rotate(${rotation}deg) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
            onLoad={() => {
              setIsLoading(false);
            }}
            onError={() => {
              setError('Failed to load PDF');
              setIsLoading(false);
            }}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      );
    }

    if (document.mimeType?.startsWith('image/')) {
      return (
        <div className="relative w-full h-full overflow-auto">
          <img
            src={document.documentUrl}
            alt={document.documentName}
            className="w-full h-full object-contain"
            style={{ 
              transform: `rotate(${rotation}deg) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
            onLoad={() => {
              setIsLoading(false);
            }}
            onError={() => {
              setError('Failed to load image');
              setIsLoading(false);
            }}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      );
    }

    // Fallback for other previewable types
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-6xl mb-4">
          {getFileIcon(document.mimeType || '')}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {document.documentName}
        </h3>
        <p className="text-gray-500 mb-4">
          Open externally to view this document
        </p>
        <Button onClick={() => window.open(document.documentUrl, '_blank')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Externally
        </Button>
      </div>
    );
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Preview Error
            </h3>
            <p className="text-gray-500 mb-4">
              {error}
            </p>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download Instead
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const containerClass = fullscreen 
    ? 'fixed inset-0 z-50 bg-white' 
    : `border border-gray-200 rounded-lg overflow-hidden ${className}`;

  return (
    <div className={containerClass} style={{ height: fullscreen ? '100vh' : height }}>
      {/* Header */}
      {showControls && (
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 truncate">
              {document.documentName}
            </h3>
            
            <div className="flex items-center gap-2">
              {/* PDF Controls */}
              {document.mimeType === 'application/pdf' && (
                <>
                  <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-500 min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRotate}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-300" />
                </>
              )}

              {/* Image Controls */}
              {document.mimeType?.startsWith('image/') && (
                <>
                  <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-500 min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRotate}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-300" />
                </>
              )}

              {/* Common Controls */}
              <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative w-full h-full bg-white" style={{ height: fullscreen ? 'calc(100vh - 57px)' : '100%' }}>
        {renderContent()}
      </div>
    </div>
  );
}
