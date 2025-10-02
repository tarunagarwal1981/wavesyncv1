import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const maritimeButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-maritime',
        navy: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-maritime hover:shadow-maritime-lg',
        ocean: 'bg-chart-2 text-white hover:bg-chart-2/90 shadow-lg hover:shadow-xl',
        gold: 'bg-chart-4 text-primary-foreground hover:bg-chart-4/90 shadow-maritime hover:shadow-maritime-lg',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-maritime',
        success: 'bg-chart-5 text-white hover:bg-chart-5/90 shadow-maritime',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-maritime hover:shadow-maritime-lg',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface MaritimeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof maritimeButtonVariants> {
  asChild?: boolean;
}

const MaritimeButton = React.forwardRef<HTMLButtonElement, MaritimeButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(maritimeButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
MaritimeButton.displayName = 'MaritimeButton';

export { MaritimeButton, maritimeButtonVariants };
