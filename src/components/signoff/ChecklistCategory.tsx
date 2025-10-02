'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';
import { ChecklistItem } from './ChecklistItem';
import { SignoffChecklistItem, SignoffCategory, CATEGORY_COLORS } from '@/lib/signoff/types';
import { addCustomChecklistItem, completeCategoryItems } from '@/lib/signoff/actions';
import { Badge } from '@/components/ui/badge';

interface ChecklistCategoryProps {
  category: SignoffCategory;
  items: SignoffChecklistItem[];
  onUpdate: () => void;
  categoryProgress: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export function ChecklistCategory({ 
  category, 
  items, 
  onUpdate, 
  categoryProgress 
}: ChecklistCategoryProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customItemText, setCustomItemText] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [isCompletingAll, setIsCompletingAll] = useState(false);

  const colors = CATEGORY_COLORS[category];
  const isCompleted = categoryProgress.percentage === 100;
  const hasBeenStarted = categoryProgress.completed > 0;

  const handleAddCustomItem = async () => {
    if (!customItemText.trim()) return;
    
    setIsAddingCustom(true);
    try {
      await addCustomChecklistItem(
        items[0]?.assignmentId || '',
        customItemText.trim(),
        category
      );
      setCustomItemText('');
      setShowAddCustom(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to add custom item:', error);
    } finally {
      setIsAddingCustom(false);
    }
  };

  const handleCompleteAll = async () => {
    setIsCompletingAll(true);
    try {
      await completeCategoryItems(items[0]?.assignmentId || '', category);
      onUpdate();
    } catch (error) {
      console.error('Failed to complete all items:', error);
    } finally {
      setIsCompletingAll(false);
    }
  };

  const handleCancelAdd = () => {
    setCustomItemText('');
    setShowAddCustom(false);
  };

  // Determine icon and color based on completion status
  const getCategoryIcon = () => {
    if (isCompleted) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (hasBeenStarted) return <div className="w-5 h-5 border-2 border-blue-600 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">{categoryProgress.completed}</div>;
    return <AlertCircle className="h-5 w-5 text-gray-400" />;
  };

  const getBadgeColor = () => {
    if (isCompleted) return 'bg-green-100 text-green-800 border-green-200';
    if (hasBeenStarted) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Card className={`transition-all duration-200 ${
      isCompleted ? 'border-green-200 ring-1 ring-green-200' : 
      hasBeenStarted ? 'border-blue-200' : 'border-gray-200'
    }`}>
      <CardHeader 
        className={`cursor-pointer hover:bg-gray-50/50 transition-colors ${colors}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
            
            {getCategoryIcon()}
            
            <CardTitle className="text-lg capitalize">
              {category.replace('_', ' ')} Tasks
            </CardTitle>

            <Badge className={`text-xs ${getBadgeColor()}`}>
              {categoryProgress.completed}/{categoryProgress.total}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Progress Bar */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' :
                    hasBeenStarted ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                  style={{ width: `${categoryProgress.percentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {categoryProgress.percentage}%
              </span>
            </div>

            {/* Complete All Button */}
            {categoryProgress.completed < categoryProgress.total && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompleteAll();
                }}
                disabled={isCompletingAll}
                className="hidden md:flex h-7 px-2 text-xs"
              >
                {isCompletingAll ? 'Completing...' : 'Complete All'}
              </Button>
            )}
          </div>
        </div>

        {/* Summary Text */}
        {!isCollapsed && (
          <div className="ml-8">
            <p className={`text-sm ${
              isCompleted ? 'text-green-700' :
              hasBeenStarted ? 'text-blue-700' : 'text-gray-600'
            }`}>
              {isCompleted && '🎉 All tasks completed!'}
              {!isCompleted && hasBeenStarted && `${categoryProgress.total - categoryProgress.completed} tasks remaining`}
              {!isCompleted && !hasBeenStarted && 'Start working through these tasks'}
            </p>
          </div>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="pl-8 space-y-3">
          {/* Checklist Items */}
          <div className="space-y-3">
            {items.sort((a, b) => a.orderIndex - b.orderIndex).map((item) => (
              <ChecklistItem key={item.id} item={item} onUpdate={onUpdate} />
            ))}
          </div>

          {/* Add Custom Item Section */}
          {showAddCustom ? (
            <div className="border-t pt-4 space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Add Custom Task
                </label>
                <Input
                  value={customItemText}
                  onChange={(e) => setCustomItemText(e.target.value)}
                  placeholder="Enter custom task..."
                  className="text-sm"
                  disabled={isAddingCustom}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddCustomItem}
                  disabled={!customItemText.trim() || isAddingCustom}
                  className="h-8 px-3"
                >
                  {isAddingCustom ? 'Adding...' : 'Add Task'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelAdd}
                  disabled={isAddingCustom}
                  className="h-8 px-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-t pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddCustom(true)}
                className="h-8 px-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Custom Task
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
