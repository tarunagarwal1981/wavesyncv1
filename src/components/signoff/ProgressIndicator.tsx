'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SignoffProgress, CATEGORY_COLORS } from '@/lib/signoff/types';
import { CheckCircle, TrendingUp, Target } from 'lucide-react';

interface ProgressIndicatorProps {
  progress: SignoffProgress;
}

export function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    if (percentage >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMotivationalMessage = (percentage: number) => {
    if (percentage === 100) return { 
      emoji: '🎉', 
      message: "Congratulations! All tasks completed!",
      submessage: "You're all set for a smooth sign-off."
    };
    if (percentage >= 90) return { 
      emoji: '🔥', 
      message: "Almost there! Final push!",
      submessage: "You're in the home stretch."
    };
    if (percentage >= 75) return { 
      emoji: '🚀', 
      message: "Great progress! Keep going!",
      submessage: "You're making excellent progress."
    };
    if (percentage >= 50) return { 
      emoji: '💪', 
      message: "Halfway there! Good work!",
      submessage: "Stay focused and keep completing tasks."
    };
    if (percentage >= 25) return { 
      emoji: '⭐', 
      message: "Making good progress!",
      submessage: "Every completed task brings you closer to your goal."
    };
    return { 
      emoji: '🎯', 
      message: "Let's get started!",
      submessage: "Begin with the high-priority tasks."
    };
  };

  const motivational = getMotivationalMessage(progress.progressPercentage);

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Overall Progress
            </CardTitle>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">
                {progress.completedItems}/{progress.totalItems} complete
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Main Progress Circle/Bar */}
          <div className="relative mb-6">
            {/* Circular Progress */}
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className={getProgressColor(progress.progressPercentage)}
                  strokeDasharray={`${progress.progressPercentage * 2.51}px 251px`}
                  style={{
                    strokeDashoffset: 0,
                    transition: 'stroke-dasharray 0.3s ease'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getProgressColor(progress.progressPercentage)}`}>
                    {progress.progressPercentage}%
                  </div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>
            </div>

            {/* Linear Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBgColor(progress.progressPercentage)}`}
                  style={{ width: `${progress.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="text-center mb-6">
            <div className="text-2xl mb-2">{motivational.emoji}</div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {motivational.message}
            </h3>
            <p className="text-sm text-gray-600">
              {motivational.submessage}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Progress by Category
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(progress.categoryProgress).map(([category, catProgress]) => {
              const label = Object.keys(CATEGORY_COLORS)[Object.values(CATEGORY_COLORS).indexOf(CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS])];
              const colors = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS];
              
              return (
                <div key={category} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {label?.replace('_', ' ') || category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {catProgress.completed}/{catProgress.total}
                      </span>
                    </span>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressBgColor(catProgress.percentage)}`}
                        style={{ width: `${catProgress.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-700 min-w-[3rem] text-center">
                    {catProgress.percentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Urgent Items Alert */}
      {progress.urgentItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Urgent Items ({progress.urgentItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 text-sm mb-3">
              These items require immediate attention before your sign-off date:
            </p>
            <div className="space-y-2">
              {progress.urgentItems.slice(0, 3).map((item) => (
                <div key={item.id} className="text-sm text-red-600">
                  • {item.itemText}
                </div>
              ))}
              {progress.urgentItems.length > 3 && (
                <div className="text-sm text-red-500 font-medium">
                  +{progress.urgentItems.length - 3} more urgent items
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
