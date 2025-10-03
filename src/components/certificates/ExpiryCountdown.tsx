import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDaysUntilExpiry, formatRelativeDate } from '@/lib/certificates/utils';

interface ExpiryCountdownProps {
  expiryDate: string;
  issueDate?: string;
  className?: string;
  variant?: 'card' | 'inline' | 'compact';
  showProgress?: boolean;
}

export function ExpiryCountdown({
  expiryDate,
  issueDate,
  className,
  variant = 'card',
  showProgress = true
}: ExpiryCountdownProps) {
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setToday(new Date());
    }, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(interval);
  }, []);

  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
  
  // Calculate progress if we have both dates
  let progressValue = 0;
  if (issueDate && showProgress) {
    const todayTime = today.getTime();
    const issueTime = new Date(issueDate).getTime();
    const expiryTime = new Date(expiryDate).getTime();
    const totalDuration = expiryTime - issueTime;
    const elapsedDuration = todayTime - issueTime;
    
    progressValue = Math.min(Math.max((elapsedDuration / totalDuration) * 100, 0), 100);
  }

  const getStatusInfo = () => {
    if (daysUntilExpiry <= 0) {
      return {
        status: 'expired',
        icon: AlertTriangle,
        iconColor: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        urgency: 'Critical',
      };
    } else if (daysUntilExpiry <= 7) {
      return {
        status: 'urgent',
        icon: AlertTriangle,
        iconColor: 'text-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        urgency: 'Critical',
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        status: 'warning',
        icon: Clock,
        iconColor: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        urgency: 'High',
      };
    } else if (daysUntilExpiry <= 90) {
      return {
        status: 'approaching',
        icon: Clock,
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        urgency: 'Medium',
      };
    } else {
      return {
        status: 'healthy',
        icon: CheckCircle2,
        iconColor: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        urgency: 'Low',
      };
    }
  };

  const statusInfo = getStatusInfo();
  const IconComponent = statusInfo.icon;

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <IconComponent className={cn('h-4 w-4', statusInfo.iconColor)} />
        <span className={cn('text-sm font-medium', statusInfo.textColor)}>
          {daysUntilExpiry <= 0 ? `Expired ${Math.abs(daysUntilExpiry)}d ago` : `${daysUntilExpiry}d left`}
        </span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        <IconComponent className={cn('h-4 w-4', statusInfo.iconColor)} />
        <span className={cn('font-medium', statusInfo.textColor)}>
          {formatRelativeDate(expiryDate)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-lg border p-4',
      statusInfo.bgColor,
      statusInfo.borderColor,
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconComponent className={cn('h-5 w-5', statusInfo.iconColor)} />
          <h4 className={cn('font-medium', statusInfo.textColor)}>
            Validity Status
          </h4>
        </div>
        <span className={cn('text-xs font-medium px-2 py-1 rounded-full', statusInfo.textColor, statusInfo.bgColor.replace('50', '200'))}>
          {statusInfo.urgency}
        </span>
      </div>

      <div className={cn('space-y-2', statusInfo.textColor)}>
        <div className="text-sm">
          {daysUntilExpiry <= 0 ? (
            <span>Certificate expired {Math.abs(daysUntilExpiry)} {Math.abs(daysUntilExpiry) === 1 ? 'day' : 'days'} ago</span>
          ) : (
            <span>Expires in {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}</span>
          )}
        </div>

        {showProgress && issueDate && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Validity Progress</span>
              <span>{Math.round(progressValue)}%</span>
            </div>
            <Progress 
              value={progressValue} 
              className="h-2"
              classNameBar={cn(
                daysUntilExpiry <= 7 && 'bg-red-500',
                daysUntilExpiry > 7 && daysUntilExpiry <= 30 && 'bg-yellow-500',
                daysUntilExpiry > 30 && daysUntilExpiry <= 90 && 'bg-blue-500',
                daysUntilExpiry > 90 && 'bg-green-500'
              )}
            />
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Expiry: {new Date(expiryDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

export function ExpiryBadge({ 
  expiryDate,
  size = 'sm'
}: {
  expiryDate: string;
  size?: 'sm' | 'md';
}) {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
  
  const getBadgeStyles = () => {
    if (daysUntilExpiry <= 0) {
      return {
        className: 'bg-red-100 text-red-800 border-red-200',
        text: `-${Math.abs(daysUntilExpiry)}d`
      };
    } else if (daysUntilExpiry <= 7) {
      return {
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        text: `${daysUntilExpiry}d`
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: `${daysUntilExpiry}d`
      };
    } else if (daysUntilExpiry <= 90) {
      return {
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        text: `${daysUntilExpiry}d`
      };
    } else {
      return {
        className: 'bg-green-100 text-green-800 border-green-200',
        text: `${daysUntilExpiry}d`
      };
    }
  };

  const badgeStyles = getBadgeStyles();
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1';

  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium',
      badgeStyles.className,
      sizeClasses
    )}>
      {badgeStyles.text}
    </span>
  );
}

export function CountdownTimer({ 
  expiryDate,
  className
}: {
  expiryDate: string;
  className?: string;
}) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiryDate).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft('EXPIRED');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiryDate]);

  return (
    <div className={cn('font-mono text-sm', className)}>
      {timeLeft}
    </div>
  );
}


