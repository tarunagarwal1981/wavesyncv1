'use client';

import { useState, useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface MobileDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
}

export function MobileDialog({
  open,
  onClose,
  title,
  children,
  className,
  showCloseButton = true,
  closeOnBackdrop = true,
}: MobileDialogProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setIsAnimating(true);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!open && !isAnimating) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/50 transition-opacity",
        open ? "opacity-100" : "opacity-0"
      )}
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl transition-transform duration-300 ease-out",
          "safe-area-bottom",
          open ? "translate-y-0" : "translate-y-full",
          className
        )}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-muted rounded-full" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 py-3 border-b">
            {title && (
              <h2 className="text-lg font-semibold">{title}</h2>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-4 max-h-[70vh] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// Alternative bottom sheet using Sheet component
export function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className={cn("h-[80vh] rounded-t-2xl", className)}>
        {title && (
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
        )}
        <div className="mt-4 overflow-auto max-h-[calc(80vh-6rem)]">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Confirmation dialog for mobile
interface MobileConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function MobileConfirmDialog({
  open,
  onClose,
  title = 'Confirm',
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: MobileConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <MobileDialog
      open={open}
      onClose={onClose}
      title={title}
      className="h-[30vh]"
    >
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground text-center">
          {message}
        </p>
        
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleConfirm}
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            className="w-full"
          >
            {confirmText}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-full"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </MobileDialog>
  );
}

// Action sheet for multiple actions
interface MobileActionSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  actions: Array<{
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'secondary';
    disabled?: boolean;
  }>;
  showCancel?: boolean;
  cancelText?: string;
}

export function MobileActionSheet({
  open,
  onClose,
  title,
  actions,
  showCancel = true,
  cancelText = 'Cancel',
}: MobileActionSheetProps) {
  return (
    <MobileDialog
      open={open}
      onClose={onClose}
      className="h-auto"
    >
      <div className="space-y-4">
        {title && (
          <h3 className="text-lg font-semibold text-center">{title}</h3>
        )}
        
        <div className="space-y-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'ghost'}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              disabled={action.disabled}
              className={cn(
                "w-full justify-start",
                action.variant === 'destructive' && "text-destructive hover:text-destructive"
              )}
            >
              {action.icon && <span className="mr-3">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </div>
        
        {showCancel && (
          <>
            <div className="h-px bg-border" />
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              {cancelText}
            </Button>
          </>
        )}
      </div>
    </MobileDialog>
  );
}
