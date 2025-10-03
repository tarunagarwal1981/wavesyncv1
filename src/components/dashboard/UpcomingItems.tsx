import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plane,
  Award,
  FileCheck,
  Ship
} from 'lucide-react';
import type { UpcomingItem } from '@/types/dashboard';

interface UpcomingItemsProps {
  items: UpcomingItem[];
  isLoading?: boolean;
}

export function UpcomingItems({ items, isLoading }: UpcomingItemsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse bg-muted h-6 w-36 rounded"></div>
          <div className="animate-pulse bg-muted h-4 w-48 rounded"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="animate-pulse bg-muted h-8 w-8 rounded"></div>
              <div className="space-y-2 flex-1">
                <div className="animate-pulse bg-muted h-4 w-full max-w-48 rounded"></div>
                <div className="animate-pulse bg-muted h-3 w-full max-w-32 rounded"></div>
              </div>
              <div className="animate-pulse bg-muted h-6 w-16 rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Events
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Important dates and deadlines
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            No urgent upcoming events. Keep up the good work!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: UpcomingItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: UpcomingItem['priority']) => {
    const variants = {
      urgent: 'destructive' as const,
      high: 'default' as const,
      medium: 'secondary' as const,
      low: 'outline' as const,
    };
    return <Badge variant={variants[priority]} className="text-xs">{priority}</Badge>;
  };

  const getItemIcon = (type: UpcomingItem['type']) => {
    const iconProps = { className: "h-4 w-4" };
    switch (type) {
      case 'certificate_expiry':
        return <Award {...iconProps} />;
      case 'travel':
        return <Plane {...iconProps} />;
      case 'signoff':
        return <FileCheck {...iconProps} />;
      case 'assignment_reminder':
        return <Ship {...iconProps} />;
      default:
        return <Calendar {...iconProps} />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays < 7) return `${diffInDays} days`;
    if (diffInDays < 30) return `${Math.ceil(diffInDays / 7)} weeks`;
    return `${Math.ceil(diffInDays / 30)} months`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Events
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Important dates and deadlines
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`border-l-4 rounded-r-lg p-4 transition-colors hover:bg-accent cursor-pointer ${getPriorityColor(item.priority)}`}
            onClick={() => {
              if (item.link) {
                // In a real app, navigate to item.link
                console.log(`Navigate to ${item.link}`);
              }
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">
                  {getItemIcon(item.type)}
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="font-medium text-sm leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{item.date.toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{formatDate(item.date)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getPriorityBadge(item.priority)}
                {item.link && (
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    →
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {items.length > 3 && (
          <div className="pt-4 border-t">
            <Button variant="outline" size="sm" className="w-full">
              View All Events
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TimelineVisualization({ items }: { items: UpcomingItem[] }) {
  const sortedItems = items
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Timeline</h3>
        <Badge variant="outline" className="text-xs">
          Next {sortedItems.length} events
        </Badge>
      </div>
      
      <div className="space-y-3">
        {sortedItems.map((item, index) => (
          <div key={item.id} className="relative">
            {index !== sortedItems.length - 1 && (
              <div className="absolute left-4 top-8 w-px h-8 bg-border"></div>
            )}
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium bg-primary text-primary-foreground`}>
                {index + 1}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.date.toLocaleDateString()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


