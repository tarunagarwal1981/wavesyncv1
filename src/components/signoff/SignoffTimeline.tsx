'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SignoffTimeline as ISignoffTimeline, TIMELINE_EVENT_TYPES, PRIORITY_COLORS } from '@/lib/signoff/types';
import { Calendar, Clock, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SignoffTimelineProps {
  timeline: ISignoffTimeline;
}

export function SignoffTimeline({ timeline }: SignoffTimelineProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemainingColor = (days: number) => {
    if (days <= 0) return 'text-red-600 bg-red-50 border-red-200';
    if (days <= 3) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (days <= 7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return '🎯';
      case 'deadline':
        return '⏰';
      case 'reminder':
        return '🔔';
      default:
        return '📅';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sign-off Timeline
          </CardTitle>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDaysRemainingColor(timeline.daysRemaining)}`}>
            {timeline.daysRemaining <= 0 
              ? "Past Due" 
              : `${timeline.daysRemaining} days remaining`}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Sign-off Date Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-1">
              Expected Sign-off Date
            </h3>
            <p className="text-2xl font-bold text-blue-800 mb-2">
              {formatDate(timeline.signoffDate)}
            </p>
            <p className="text-sm text-blue-600">
              {timeline.daysRemaining > 0 
                ? `${timeline.daysRemaining} days to go`
                : 'Sign-off is overdue!'}
            </p>
          </div>
        </div>

        {/* Timeline Events */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-3">Upcoming Events</h4>
          
          {timeline.timelineEvents.map((event, index) => {
                    const eventDate = new Date(event.dueDate);
            const isOverdue = eventDate < new Date();
            const isUpcoming = eventDate >= new Date() && eventDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            return (
              <div
                key={event.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  event.isCompleted
                    ? 'bg-green-50 border-green-200'
                    : isOverdue
                    ? 'bg-red-50 border-red-200'
                    : isUpcoming
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    event.isCompleted
                      ? 'bg-green-100 text-green-600'
                      : isOverdue
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {event.isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm">{getEventTypeIcon(event.type)}</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className={`font-medium ${
                      event.isCompleted
                        ? 'text-green-800'
                        : isOverdue
                        ? 'text-red-800'
                        : 'text-gray-800'
                    }`}>
                      {event.title}
                    </h5>
                    
                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      PRIORITY_COLORS[event.priority]
                    }`}>
                      {getPriorityIcon(event.priority)}
                      {event.priority}
                    </div>
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatDate(event.dueDate)}
                      {eventDate < new Date() && !event.isCompleted && (
                        <span className="ml-2 text-red-600 font-medium">
                          ({formatDistanceToNow(eventDate)} ago)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Motivation */}
        {timeline.daysRemaining > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="text-center">
              <p className="text-green-800 font-medium mb-1">
                🚀 You're doing great!
              </p>
              <p className="text-sm text-green-600">
                Keep up the momentum and stay organized as your sign-off date approaches.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
