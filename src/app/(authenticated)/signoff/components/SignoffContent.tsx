'use client';

import { useState, useEffect } from 'react';
import { 
  SignoffTimeline, 
  ProgressIndicator, 
  ChecklistCategory,
  RelievingOfficerCard,
  SignoffSummary 
} from '@/components/signoff';
import { 
  SignoffTimeline as ISignoffTimeline,
  SignoffProgress,
  SignoffChecklistItem,
  SignoffSummary as ISignoffSummary,
  RelievingOfficer,
  SignoffCategory
} from '@/lib/signoff/types';
import { 
  getSignoffProgress,
  getSignoffTimeline,
  getSignoffChecklistItems,
  getSignoffSummary,
  createDefaultChecklist
} from '@/lib/signoff/queries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function SignoffContent() {
  const [timeline, setTimeline] = useState<ISignoffTimeline | null>(null);
  const [progress, setProgress] = useState<SignoffProgress | null>(null);
  const [checklistItems, setChecklistItems] = useState<SignoffChecklistItem[]>([]);
  const [summary, setSummary] = useState<ISignoffSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignmentId] = useState('demo-assignment-123'); // In real app, get from context/params

  const loadSignoffData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all sign-off data
      const [timelineData, progressData, checklistData, summaryData] = await Promise.all([
        getSignoffTimeline(assignmentId),
        getSignoffProgress(assignmentId),
        getSignoffChecklistItems(assignmentId),
        getSignoffSummary(assignmentId)
      ]);

      setTimeline(timelineData);
      setProgress(progressData);
      setChecklistItems(checklistData);
      setSummary(summaryData);

      // Create default checklist if none exists
      if (checklistData.length === 0) {
        await createDefaultChecklist(assignmentId);
        // Reload checklist items
        const newChecklistData = await getSignoffChecklistItems(assignmentId);
        setChecklistItems(newChecklistData);
        
        // Update progress
        const newProgressData = await getSignoffProgress(assignmentId);
        setProgress(newProgressData);
      }
    } catch (err) {
      console.error('Failed to load sign-off data:', err);
      setError('Failed to load sign-off data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSignoffData();
  }, [assignmentId]);

  const handleRefresh = () => {
    loadSignoffData();
  };

  const handleUpdate = () => {
    // Refresh progress and checklist items
    Promise.all([
      getSignoffProgress(assignmentId),
      getSignoffChecklistItems(assignmentId),
      getSignoffSummary(assignmentId)
    ]).then(([progressData, checklistData, summaryData]) => {
      setProgress(progressData);
      setChecklistItems(checklistData);
      setSummary(summaryData);
    });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Error Loading Sign-off Data
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Group checklist items by category
  const itemsByCategory = checklistItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    };
    acc[item.category].push(item);
    return acc;
  }, {} as Record<SignoffCategory, SignoffChecklistItem[]>);

  return (
    <div className="space-y-6">
      {/* Quick Status Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {progress?.progressPercentage === 100 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-blue-600" />
              )}
              <span className="font-semibold text-gray-900">
                {progress?.progressPercentage === 100 
                  ? 'Ready for Sign-off!' 
                  : `${progress?.completedItems}/${progress?.totalItems} tasks completed`}
              </span>
            </div>
            
            <Badge className={
              progress?.progressPercentage === 100 
                ? 'bg-green-100 text-green-800 border-green-200'
                : progress && progress.progressPercentage >= 75
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
            }>
              {progress?.progressPercentage}% Complete
            </Badge>
          </div>

          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="checklist" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        {/* Checklist Tab */}
        <TabsContent value="checklist" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Sign-off Checklist</h2>
            {summary && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{summary.relievingOfficer?.name}</span>
                <span className="text-gray-400"> • </span>
                <span>{summary.vesselName}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {([
              'personal_preparation',
              'financial', 
              'documentation',
              'handover',
              'administrative'
            ] as SignoffCategory[]).map((category) => {
              const items = itemsByCategory[category] || [];
              const categoryProgress = progress?.categoryProgress[category];

              if (items.length === 0 && !categoryProgress) {
                return null;
              }

              return (
                <ChecklistCategory
                  key={category}
                  category={category}
                  items={items}
                  categoryProgress={categoryProgress || { total: 0, completed: 0, percentage: 0 }}
                  onUpdate={handleUpdate}
                />
              );
            })}
          </div>

          {/* Relieving Officer Info */}
          {summary?.relievingOfficer && (
            <RelievingOfficerCard 
              relievingOfficer={summary.relievingOfficer}
              onContact={() => {
                // Handle contact action
                console.log('Contact relieving officer');
              }}
            />
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress">
          {progress && <ProgressIndicator progress={progress} />}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          {timeline && <SignoffTimeline timeline={timeline} />}
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary">
          {summary && (
            <SignoffSummary 
              summary={summary}
              onExport={() => {
                // Handle export action
                console.log('Export summary');
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}



