import { Badge } from '@/components/ui/badge';
import { PriorityLevel, PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/circulars/types';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const colors = PRIORITY_COLORS[priority];
  const label = PRIORITY_LABELS[priority];
  
  return (
    <Badge 
      variant="outline" 
      className={`${colors} ${className}`}
    >
      {label}
    </Badge>
  );
}
