'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award,
  TicketIcon,
  CheckSquare,
  FolderOpen,
  ArrowRight,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Settings,
  ChevronRight
} from 'lucide-react';

interface QuickActionsProps {
  pendingTasks?: number;
  expiringCertificates?: number;
  unreadCirculars?: number;
  onClick?: (action: string) => void;
}

export function QuickActions({ 
  pendingTasks = 0, 
  expiringCertificates = 0, 
  unreadCirculars = 0,
  onClick 
}: QuickActionsProps) {
  const actions = [
    {
      id: 'certificates',
      title: 'Certificates',
      description: 'Manage professional certifications',
      icon: Award,
      href: '/dashboard/certificates',
      badge: expiringCertificates > 0 ? `${expiringCertificates} expiring` : undefined,
      badgeColor: 'destructive',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      urgent: expiringCertificates > 0
    },
    {
      id: 'tickets',
      title: 'Travel & Tickets',
      description: 'View flight and travel bookings',
      icon: TicketIcon,
      href: '/dashboard/tickets',
      badge: undefined,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      urgent: false
    },
    {
      id: 'sign-off',
      title: 'Sign-off Checklist',
      description: 'Complete departure requirements',
      icon: CheckSquare,
      href: '/dashboard/signoff',
      badge: pendingTasks > 0 ? `${pendingTasks} pending` : undefined,
      badgeColor: 'secondary',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      urgent: pendingTasks > 5
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Personal document storage',
      icon: FolderOpen,
      href: '/dashboard/documents',
      badge: undefined,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      urgent: false
    }
  ];

  const secondaryActions = [
    {
      id: 'circulars',
      title: 'Circulars',
      description: 'Company communications',
      icon: FileText,
      href: '/dashboard/circulars',
      badge: unreadCirculars > 0 ? `${unreadCirculars} unread` : undefined,
      badgeColor: 'secondary'
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'Update personal information',
      icon: User,
      href: '/dashboard/profile',
      badge: undefined,
      badgeColor: 'outline'
    }
  ];

  const handleActionClick = (actionId: string) => {
    onClick?.(actionId);
    // In a real app, this would navigate to the action's href
    console.log(`Navigate to ${actionId}`);
  };

  return (
    <div className="space-y-4">
      {/* Primary Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Common tasks and shortcuts
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action) => {
              const IconComponent = action.icon;
              
              return (
                <div
                  key={action.id}
                  className={`group cursor-pointer transition-all hover:shadow-md rounded-lg p-4 border ${
                    action.urgent ? 'border-orange-200 bg-orange-50' : 'border-border hover:border-primary/20'
                  }`}
                  onClick={() => handleActionClick(action.id)}
                >
                  <div className="text-center space-y-3">
                    {/* Icon */}
                    <div className={`${action.bgColor} rounded-lg p-3 w-fit mx-auto group-hover:scale-110 transition-transform ${
                      action.urgent ? 'ring-2 ring-orange-200' : ''
                    }`}>
                      <IconComponent className={`h-6 w-6 ${action.color}`} />
                      {action.urgent && (
                        <div className="absolute -top-1 -right-1">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-1">
                        <h3 className="font-medium text-sm">{action.title}</h3>
                        {action.badge && (
                          <Badge variant={action.badgeColor as any} className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {action.description}
                      </p>
                    </div>

                    {/* Action Indicator */}
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      <span>View details</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            More Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {secondaryActions.map((action) => {
              const IconComponent = action.icon;
              
              return (
                <div
                  key={action.id}
                  className="group cursor-pointer transition-all hover:shadow-sm rounded-lg p-3 border border-border hover:border-primary/20 bg-card hover:bg-accent/50"
                  onClick={() => handleActionClick(action.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`bg-muted rounded-lg p-2 group-hover:bg-primary/10 transition-colors`}>
                      <IconComponent className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{action.title}</h4>
                        {action.badge && (
                          <Badge variant={action.badgeColor as any} className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {action.description}
                      </p>
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ActionButton({
  icon: Icon,
  title,
  description,
  onClick,
  badge,
  variant = 'default',
  disabled = false
}: {
  icon: any;
  title: string;
  description: string;
  onClick?: () => void;
  badge?: string;
  variant?: 'default' | 'destructive' | 'warning';
  disabled?: boolean;
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return 'border-red-200 bg-red-50 hover:bg-red-100 text-red-900';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100 text-yellow-900';
      default:
        return 'border-border hover:border-primary/20 hover:bg-accent/50';
    }
  };

  return (
    <div
      className={`w-full text-center p-4 rounded-lg border transition-all ${getVariantStyles()} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
      }`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="space-y-3">
        <div className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center ${
          variant === 'destructive' ? 'bg-red-100' :
          variant === 'warning' ? 'bg-yellow-100' :
          'bg-primary/10'
        }`}>
          <Icon className={`h-6 w-6 ${
            variant === 'destructive' ? 'text-red-600' :
            variant === 'warning' ? 'text-yellow-600' :
            'text-primary'
          }`} />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h3 className="font-medium text-sm">{title}</h3>
            {badge && (
              <Badge variant="outline" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function UrgentActions({ urgentItems }: { urgentItems: string[] }) {
  if (urgentItems.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <AlertTriangle className="h-5 w-5" />
          Attention Required
        </CardTitle>
        <p className="text-sm text-orange-700">
          {urgentItems.length} item{urgentItems.length > 1 ? 's' : ''} need your immediate attention
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {urgentItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-orange-800">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <Button variant="default" size="sm" className="mt-4">
          Resolve All
        </Button>
      </CardContent>
    </Card>
  );
}


