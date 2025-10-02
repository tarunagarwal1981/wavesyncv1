import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckSquare, 
  AlertTriangle, 
  FileText, 
  Calendar,
  Clock,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';
import type { DashboardStats } from '@/types/dashboard';

interface QuickStatsGridProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

export function QuickStatsGrid({ stats, isLoading }: QuickStatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="animate-pulse bg-muted h-4 w-20 rounded"></div>
              <div className="animate-pulse bg-muted h-8 w-8 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse bg-muted h-8 w-16 mb-1 rounded"></div>
              <div className="animate-pulse bg-muted h-3 w-24 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks,
      description: 'Sign-off checklist items',
      icon: CheckSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/dashboard/signoff'
    },
    {
      title: 'Certificates Expiring',
      value: stats.expiringCertificates,
      description: 'Within 90 days',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      href: '/dashboard/certificates'
    },
    {
      title: 'Unread Circulars',
      value: stats.unreadCirculars,
      description: 'Company communications',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/dashboard/circulars'
    },
    {
      title: 'Next Travel',
      value: stats.upcomingTravel 
        ? `${Math.ceil((stats.upcomingTravel.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`
        : 'N/A',
      description: 'upcoming departure',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/dashboard/tickets'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {quickActions.map((action) => {
        const IconComponent = action.icon;
        
        return (
          <Card 
            key={action.title}
            className="hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => {
              // In a real app, this would navigate to the href
              console.log(`Navigate to ${action.href}`);
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {action.title}
              </CardTitle>
              <div className={`${action.bgColor} rounded-lg p-2 group-hover:scale-110 transition-transform`}>
                <IconComponent className={`h-4 w-4 ${action.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {typeof action.value === 'number' ? action.value : action.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {action.description}
              </p>
              {stats.expiringCertificates > 0 && action.title === 'Certificates Expiring' && (
                <Badge variant="destructive" className="mt-2 text-xs">
                  Requires Attention
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color = 'text-blue-600',
  bgColor = 'bg-blue-100',
  href,
  onClick
}: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  color?: string;
  bgColor?: string;
  href?: string;
  onClick?: () => void;
}) {
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`${bgColor} rounded-lg p-2 group-hover:scale-110 transition-transform`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">
          {value}
        </div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export function StatsOverview({
  stats,
  className
}: {
  stats: DashboardStats;
  className?: string;
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Quick Overview</h2>
        <Badge variant="outline" className="text-xs">
          Real-time Data
        </Badge>
      </div>
      
      <QuickStatsGrid stats={stats} />
      
      {/* Summary */}
      {stats.expiringCertificates > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">
                Action Required
              </h4>
              <p className="text-sm text-yellow-700">
                You have {stats.expiringCertificates} certificate{stats.expiringCertificates > 1 ? 's' : ''} expiring soon. 
                Review them now to avoid disruptions to your assignments.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
