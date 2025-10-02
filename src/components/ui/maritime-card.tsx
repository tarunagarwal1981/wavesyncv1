import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const maritimeCardVariants = cva(
  'rounded-lg border shadow-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground border-border hover:shadow-md',
        navy: 'bg-primary text-primary-foreground border-primary shadow-lg hover:shadow-xl',
        ocean: 'bg-gradient-to-br from-chart-2/10 to-chart-3/10 border-chart-2/20 text-card-foreground hover:shadow-lg',
        gold: 'bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20 text-card-foreground hover:shadow-lg',
        success: 'bg-chart-5/10 border-chart-5/20 text-card-foreground hover:border-chart-5/30',
        warning: 'bg-chart-4/10 border-chart-4/20 text-card-foreground hover:border-chart-4/30',
        destructive: 'bg-destructive/10 border-destructive/20 text-card-foreground hover:border-destructive/30',
        glass: 'bg-white/80 backdrop-blur-sm border-white/20 shadow-lg',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      elevation: {
        flat: 'shadow-none',
        sm: 'shadow-sm',
        default: 'shadow-maritime',
        lg: 'shadow-md',
        xl: 'shadow-lg',
        '2xl': 'shadow-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
      elevation: 'default',
    },
  }
);

export interface MaritimeCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof maritimeCardVariants> {}

const MaritimeCard = React.forwardRef<HTMLDivElement, MaritimeCardProps>(
  ({ className, variant, padding, elevation, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(maritimeCardVariants({ variant, padding, elevation, className }))}
      {...props}
    />
  )
);
MaritimeCard.displayName = 'MaritimeCard';

const MaritimeCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
MaritimeCardHeader.displayName = 'MaritimeCardHeader';

const MaritimeCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
MaritimeCardTitle.displayName = 'MaritimeCardTitle';

const MaritimeCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
MaritimeCardDescription.displayName = 'MaritimeCardDescription';

const MaritimeCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
MaritimeCardContent.displayName = 'MaritimeCardContent';

const MaritimeCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
MaritimeCardFooter.displayName = 'MaritimeCardFooter';

export {
  MaritimeCard,
  MaritimeCardHeader,
  MaritimeCardFooter,
  MaritimeCardTitle,
  MaritimeCardDescription,
  MaritimeCardContent,
};
