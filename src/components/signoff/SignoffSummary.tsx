'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SignoffSummary as ISignoffSummary, CATEGORY_LABELS } from '@/lib/signoff/types';


import { 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  CheckCircle,
  Download,
  Share2,
  Printer 
} from 'lucide-react';

interface SignoffSummaryProps {
  summary: ISignoffSummary;
  onExport?: () => void;
}

export function SignoffSummary({ summary, onExport }: SignoffSummaryProps) {
  const isComplete = summary.totalProgress === 100;

  const formatSignoffDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const daysFromNow = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      formatted: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      daysRemaining: daysFromNow,
      isUrgent: daysFromNow <= 3 && !isComplete
    };
  };

  const signoffInfo = formatSignoffDate(summary.signoffDate);

  const getMotivationalMessage = (progress: number, daysRemaining: number) => {
    if (progress === 100) {
      return {
        emoji: '🎉',
        title: 'All Set for Sign-off!',
        message: 'Congratulations! You\'ve completed all required tasks and are ready for a smooth sign-off.',
        color: 'text-green-800',
        bgColor: 'bg-green-50 border-green-200'
      };
    }
    
    if (daysRemaining <= 0) {
      return {
        emoji: '⚠️',
        title: 'Sign-off Overdue',
        message: 'Your sign-off date has passed. Please contact your supervisor immediately.',
        color: 'text-red-800',
        bgColor: 'bg-red-50 border-red-200'
      };
    }
    
    if (daysRemaining <= 3) {
      return {
        emoji: '🚨',
        title: 'Sign-off in 3 Days or Less!',
        message: `Focus on completing the remaining ${summary.outstandingItems.length} tasks before your sign-off.`,
        color: 'text-red-800',
        bgColor: 'bg-red-50 border-red-200'
      };
    }
    
    if (progress >= 80) {
      return {
        emoji: '🔥',
        title: 'Almost There!',
        message: 'You\'re making excellent progress. Just a few more tasks to complete.',
        color: 'text-orange-800',
        bgColor: 'bg-orange-50 border-orange-200'
      };
    }
    
    if (progress >= 50) {
      return {
        emoji: '💪',
        title: 'Good Progress!',
        message: 'You\'re more than halfway there. Keep up the great work!',
        color: 'text-blue-800',
        bgColor: 'bg-blue-50 border-blue-200'
      };
    }

    return {
      emoji: '🎯',
      title: 'Let\'s Get Started',
      message: 'Begin working through your checklist to ensure a smooth sign-off process.',
      color: 'text-gray-800',
      bgColor: 'bg-gray-50 border-gray-200'
    };
  };

  const motivational = getMotivationalMessage(summary.totalProgress, signoffInfo.daysRemaining);

  const handleExport = async () => {
    // Create a printable/exportable version of the summary
    const content = `
SIGN-OFF SUMMARY REPORT
======================

Vessel: ${summary.vesselName}
Sign-off Date: ${signoffInfo.formatted}
Progress: ${summary.totalProgress}% Complete

Category Progress:
${summary.categorySummary.map(cat => 
  `- ${CATEGORY_LABELS[cat.category as keyof typeof CATEGORY_LABELS]}: ${cat.completed}/${cat.total} (${cat.percentage}%)`
).join('\n')}

${summary.outstandingItems.length > 0 ? `
Outstanding Tasks:
${summary.outstandingItems.map(item => `- ${item.itemText}`).join('\n')}
` : 'All tasks completed!'}

Generated on: ${new Date().toLocaleDateString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signoff-summary-${summary.vesselName.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={`border ${motivational.bgColor}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center gap-2 ${motivational.color}`}>
              <span className="text-2xl">{motivational.emoji}</span>
              Sign-off Status
            </CardTitle>
            <Badge className={`${motivational.color === 'text-green-800' ? 'bg-green-100 text-green-800 border-green-200' : 
              motivational.color === 'text-red-800' ? 'bg-red-100 text-red-800 border-red-200' :
              'bg-blue-100 text-blue-800 border-blue-200'
            }`}>
              {isComplete ? 'Ready for Sign-off' : 'In Progress'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Progress Summary */}
            <div>
              <h3 className={`font-semibold mb-2 ${motivational.color}`}>
                {motivational.title}
              </h3>
              <p className="text-sm mb-4">{motivational.message}</p>
              
              {/* Progress Circle */}
              <div className="relative w-20 h-20 mx-auto md:mx-0">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className={motivational.color}
                    strokeDasharray={`${summary.totalProgress * 2.19}px 219px`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`font-bold text-lg ${motivational.color}`}>
                      {summary.totalProgress}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sign-off Date Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-700">Sign-off Date</span>
              </div>
              <p className="text-lg mb-2">{signoffInfo.formatted}</p>
              <div className="flex items-center gap-2">
                {signoffInfo.isUrgent ? (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <span className={`text-sm ${signoffInfo.isUrgent ? 'text-red-600' : 'text-green-600'}`}>
                  {signoffInfo.daysRemaining > 0 
                    ? `${signoffInfo.daysRemaining} days remaining`
                    : 'Due now'
                  }
                </span>
              </div>
              
              {summary.relievingOfficer && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Relieving Officer</p>
                  <p className="text-sm text-blue-700">{summary.relievingOfficer.name}</p>
                  <p className="text-xs text-blue-600">{summary.relievingOfficer.rank}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Category Progress
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.categorySummary.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    category.percentage === 100 ? 'bg-green-500' :
                    category.percentage > 0 ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm font-medium text-gray-700">
                    {CATEGORY_LABELS[category.category as keyof typeof CATEGORY_LABELS]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {category.completed}/{category.total}
                  </span>
                  <span className="text-sm font-bold text-gray-700">
                    {category.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Tasks */}
      {summary.outstandingItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Outstanding Tasks ({summary.outstandingItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.outstandingItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  <span className="text-sm text-gray-700">{item.itemText}</span>
                </div>
              ))}
              {summary.outstandingItems.length > 5 && (
                <p className="text-sm text-gray-600 font-medium mt-2">
                  +{summary.outstandingItems.length - 5} more tasks
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Summary
            </Button>
            <Button variant="outline" onClick={() => navigator.share?.({ title: 'Sign-off Summary', text: 'My sign-off progress summary' })}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
