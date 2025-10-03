'use client';

import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  fallback?: string;
  skeleton?: boolean;
  eager?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  containerClassName?: string;
}

export function LazyImage({
  src,
  alt,
  fallback,
  skeleton = true,
  eager = false,
  onLoad,
  onError,
  className,
  containerClassName,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(eager);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (eager || !imgRef.current) return;

    // Create intersection observer for lazy loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.01,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [eager]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const imageSrc = hasError && fallback ? fallback : src;

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {/* Skeleton placeholder */}
      {skeleton && !isLoaded && (
        <Skeleton 
          className={cn("absolute inset-0", className)}
          {...props}
        />
      )}

      {/* Image */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={eager ? 'eager' : 'lazy'}
          {...props}
        />
      )}

      {/* Loading indicator */}
      {!isLoaded && !hasError && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {hasError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 3 2-2 3 7z" clipRule="evenodd" />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Preset configurations for common image types
export function AvatarImage({ src, alt, size = 32, ...props }: LazyImageProps & { size?: number }) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      className={`rounded-full object-cover`}
      style={{ width: size, height: size }}
      fallback="/icons/avatar-placeholder.png"
      {...props}
    />
  );
}

export function CertificateImage({ src, alt, ...props }: LazyImageProps) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      className="w-full h-40 object-contain bg-background border rounded-lg"
      fallback="/icons/certificate-placeholder.png"
      skeleton={true}
      {...props}
    />
  );
}

export function DocumentThumbnail({ src, alt, ...props }: LazyImageProps) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      className="w-16 h-16 object-cover rounded bg-primary/5 border"
      fallback="/icons/document-placeholder.png"
      skeleton={true}
      {...props}
    />
  );
}



