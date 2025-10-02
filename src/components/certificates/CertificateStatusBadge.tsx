import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCertificateStatus } from '@/lib/certificates/utils';
import type { CertificateStatus, CertificateStatusInfo } from '@/lib/certificates/utils';

interface CertificateStatusBadgeProps {
  expiryDate: string;
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export function CertificateStatusBadge({ 
  expiryDate, 
  className,
  showIcon = true,
  variant = 'default'
}: CertificateStatusBadgeProps) {
  const statusInfo = getCertificateStatus(expiryDate);
  
  const getStatusIcon = (status: CertificateStatus) => {
    if (!showIcon) return null;
    
    const iconProps = { className: 'h-3 w-3 mr-1' };
    
    switch (status) {
      case 'valid':
        return <CheckCircle2 {...iconProps} />;
      case 'expiring_soon':
        return <Clock {...iconProps} />;
      case 'expired':
        return <XCircle {...iconProps} />;
      default:
        return <AlertTriangle {...iconProps} />;
    }
  };

  const getBadgeVariant = (statusInfo: CertificateStatusInfo): "default" | "destructive" | "outline" | "secondary" => {
    switch (statusInfo.status) {
      case 'expired':
        return 'destructive';
      case 'expiring_soon':
        return statusInfo.urgencyLevel === 'critical' ? 'default' : 'secondary';
      case 'valid':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusText = (statusInfo: CertificateStatusInfo): string => {
    if (variant === 'detailed') {
      switch (statusInfo.status) {
        case 'expired':
          return `Expired ${Math.abs(statusInfo.daysUntilExpiry)} ${Math.abs(statusInfo.daysUntilExpiry) === 1 ? 'day' : 'days'} ago`;
        case 'expiring_soon':
          return `Expires in ${statusInfo.daysUntilExpiry} ${statusInfo.daysUntilExpiry === 1 ? 'day' : 'days'}`;
        case 'valid':
          return `${statusInfo.daysUntilExpiry} days remaining`;
        default:
          return statusInfo.status;
      }
    }
    
    return statusInfo.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <div className={cn(
          'w-2 h-2 rounded-full',
          statusInfo.status === 'expired' && 'bg-red-500',
          statusInfo.status === 'expiring_soon' && statusInfo.urgencyLevel === 'critical' && 'bg-orange-500',
          statusInfo.status === 'expiring_soon' && statusInfo.urgencyLevel !== 'critical' && 'bg-yellow-500',
          statusInfo.status === 'valid' && 'bg-green-500'
        )} />
        <span className="text-xs text-muted-foreground">
          {statusInfo.daysUntilExpiry > 0 ? `${statusInfo.daysUntilExpiry}d` : `-${Math.abs(statusInfo.daysUntilExpiry)}d`}
        </span>
      </div>
    );
  }

  return (
    <Badge 
      variant={getBadgeVariant(statusInfo)}
      className={cn(
        'text-xs font-medium',
        statusInfo.status === 'expired' && 'bg-red-100 text-red-800 border-red-200',
        statusInfo.status === 'expiring_soon' && statusInfo.urgencyLevel === 'critical' && 'bg-orange-100 text-orange-800 border-orange-200',
        statusInfo.status === 'expiring_soon' && statusInfo.urgencyLevel !== 'critical' && 'bg-yellow-100 text-yellow-800 border-yellow-200',
        statusInfo.status === 'valid' && statusInfo.urgencyLevel === 'low' && 'bg-green-100 text-green-800 border-green-200',
        statusInfo.status === 'valid' && statusInfo.urgencyLevel !== 'low' && 'bg-blue-100 text-blue-800 border-blue-200',
        className
      )}
    >
      {getStatusIcon(statusInfo.status)}
      {getStatusText(statusInfo)}
    </Badge>
  );
}

export function StatusIndicator({ 
  expiryDate,
  size = 'sm'
}: {
  expiryDate: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const statusInfo = getCertificateStatus(expiryDate);
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const getIndicatorColor = () => {
    switch (statusInfo.status) {
      case 'expired':
        return 'bg-red-500';
      case 'expiring_soon':
        return statusInfo.urgencyLevel === 'critical' ? 'bg-orange-500' : 'bg-yellow-500';
      case 'valid':
        return statusInfo.urgencyLevel === 'low' ? 'bg-green-500' : 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div 
      className={cn(
        'rounded-full',
        sizeClasses[size],
        getIndicatorColor()
      )}
      title={`${statusInfo.status}: ${statusInfo.daysUntilExpiry} days`}
    />
  );
}

export function StatusIcon({ 
  expiryDate,
  className
}: {
  expiryDate: string;
  className?: string;
}) {
  const statusInfo = getCertificateStatus(expiryDate);
  
  const iconProps = {
    className: cn('h-4 w-4', className),
  };

  switch (statusInfo.status) {
    case 'expired':
      return <XCircle {...iconProps} className={cn('text-red-500', iconProps.className)} />;
    case 'expiring_soon':
      return statusInfo.urgencyLevel === 'critical' 
        ? <AlertTriangle {...iconProps} className={cn('text-orange-500', iconProps.className)} />
        : <Clock {...iconProps} className={cn('text-yellow-500', iconProps.className)} />;
    case 'valid':
      return <CheckCircle2 {...iconProps} className={cn('text-green-500', iconProps.className)} />;
    default:
      return <Clock {...iconProps} />;
  }
}
