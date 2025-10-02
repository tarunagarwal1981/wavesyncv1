'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MoreVertical,
  ChevronRight,
  Clock,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Notification, 
  NOTIFICATION_TYPE_ICONS,
  PRIORITY_COLORS,
  PRIORITY_LABELS
} from '@/lib/notifications/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface NotificationItemProps {
  notification: Notification;
  variant?: 'default' | 'compact';
  onMarkAsRead?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  showActions?: boolean;
}

export function NotificationItem({ 
  notification, 
  variant = 'default',
  onMarkAsRead,
  onDelete,
  onClick,
  showActions = true
}: NotificationItemProps) {
  const isUnread = !notification.isRead;
  const icon = NOTIFICATION_TYPE_ICONS[notification.type];
  const priorityColors = PRIORITY_COLORS[notification.priority];
  const priorityLabel = PRIORITY_LABELS[notification.priority];
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  const handleClick = () => {
    // Mark as read when clicked
    if (isUnread && onMarkAsRead) {
      onMarkAsRead();
    }
    
    if (onClick) {
      onClick();
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, you'd handle external links
  };

  if (variant === 'compact') {
    return (
      <div 
        className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
          isUnread ? 'bg-blue-50 border border-blue-200' : 'border border-gray-100'
        }`}
        onClick={handleClick}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 text-sm ${
          isUnread ? 'text-blue-600' : 'text-gray-500'
        }`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium truncate ${
            isUnread ? 'text-blue-900' : 'text-gray-900'
          }`}>
                  {notification.title}
          </h4>
          
          {notification.message && (
            <p className={`text-xs truncate mt-1 ${
              isUnread ? 'text-blue-700' : 'text-gray-600'
            }`}>
              {notification.message}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{timeAgo}</span>
            
            {notification.priority === 'urgent' && (
              <Badge variant="destructive" className="text-xs px-1 py-0">
                Urgent
              </Badge>
            )}
          </div>
        </div>

        {/* Action */}
        {notification.actionUrl && (
          <ChevronRight className="flex-shrink-0 w-4 h-4 text-gray-400" />
        )}
      </div>
    );
  }

  // Default variant (full card)
  return (
    <Card className={`cursor-pointer transition-shadow hover:shadow-md ${
      isUnread ? 'border-blue-200 bg-blue-50/50' : 'hover:shadow-sm'
    }`}>
      <CardContent className="p-4" onClick={handleClick}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
            isUnread ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}>
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className={`font-medium ${
                  isUnread ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {notification.title}
                </h3>
                
                {notification.message && (
                  <p className={`text-sm mt-1 ${
                    isUnread ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {notification.message}
                  </p>
                )}
              </div>

              {/* Actions */}
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isUnread && (
                      <DropdownMenuItem onClick={handleMarkAsRead}>
                        <Clock className="h-4 w-4 mr-2" />
                        Mark as Read
                      </DropdownMenuItem>
                    )}
                    
                    {notification.actionUrl && (
                      <DropdownMenuItem 
                        onClick={handleExternalLink}
                        asChild
                      >
                        <Link href={notification.actionUrl}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {notification.actionText || 'View'}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                {timeAgo}
              </div>

              <Badge 
                variant="secondary"
                className={`text-xs px-2 py-1 ${priorityColors}`}
              >
                {priorityLabel}
              </Badge>

              {notification.type !== 'general' && (
                <Badge variant="outline" className="text-xs">
                  {notification.type.replace('_', ' ')}
                </Badge>
              )}
            </div>

            {/* Action Button */}
            {notification.actionUrl && notification.actionText && (
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExternalLink}
                  className="text-xs"
                >
                  {notification.actionText}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </div>

          {/* Unread indicator */}
          {isUnread && (
            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
