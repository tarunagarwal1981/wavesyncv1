'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { SignoffChecklistItem } from '@/lib/signoff/types';
import { 
  completeChecklistItem, 
  uncompleteChecklistItem, 
  updateChecklistItemNotes 
} from '@/lib/signoff/actions';
import { 
  CheckCircle, 
  Circle, 
  FileText, 
  Upload, 
  MessageSquare,
  Calendar
} from 'lucide-react';
import { HoverCardTrigger, HoverCardContent, HoverCardProvider } from '@/components/ui/hover-card';
import { formatDistanceToNow } from 'date-fns';

interface ChecklistItemProps {
  item: SignoffChecklistItem;
  onUpdate: () => void;
}

export function ChecklistItem({ item, onUpdate }: ChecklistItemProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(item.notes || '');
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false);

  const handleToggleCompletion = async () => {
    setIsCompleting(true);
    try {
      if (item.isCompleted) {
        await uncompleteChecklistItem(item.id);
      } else {
        await completeChecklistItem(item.id, notesValue || undefined);
      }
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleNotesUpdate = async () => {
    setIsUpdatingNotes(true);
    try {
      await updateChecklistItemNotes(item.id, notesValue);
      onUpdate();
      setShowNotes(false);
    } catch (error) {
      console.error('Failed to update notes:', error);
    } finally {
      setIsUpdatingNotes(false);
    }
  };

  const handleCancelNotes = () => {
    setNotesValue(item.notes || '');
    setShowNotes(false);
  };

  const isOverdue = item.category === 'financial' || item.category === 'documentation';

  return (
    <div className={`transition-all duration-200 ${item.isCompleted ? 'opacity-75' : ''}`}>
      <Card className={`${item.isCompleted ? 'border-green-200 bg-green-50/30' : 'hover:shadow-sm'} transition-all`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <div className="flex-shrink-0 mt-1">
              <Checkbox
                id={item.id}
                checked={item.isCompleted}
                onCheckedChange={handleToggleCompletion}
                disabled={isCompleting}
                className={item.isCompleted ? 'border-green-500 bg-green-500' : ''}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <label
                  htmlFor={item.id}
                  className={`font-medium cursor-pointer select-none transition-colors ${
                    item.isCompleted 
                      ? 'line-through text-gray-500' 
                      : 'text-gray-900 hover:text-blue-700'
                  }`}
                >
                  {item.itemText}
                  {item.isCustom && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Custom
                    </span>
                  )}
                  {isOverdue && !item.isCompleted && (
                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                      Priority
                    </span>
                  )}
                </label>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {/* Notes Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotes(!showNotes)}
                    className="h-7 w-7 p-0 hover:bg-blue-100"
                  >
                    <MessageSquare className="h-3 w-3" />
                  </Button>

                  {/* Completion Timestamp */}
                  {item.isCompleted && item.completedAt && (
                    <HoverCardProvider>
                      <HoverCardTrigger asChild>
                        <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center cursor-pointer">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-64">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-green-800">Completed</h4>
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(new Date(item.completedAt))} ago
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCardProvider>
                  )}
                </div>
              </div>

              {/* Notes Section */}
              {showNotes && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    placeholder="Add notes for this task..."
                    className="min-h-[80px] resize-none"
                    disabled={isUpdatingNotes}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleNotesUpdate}
                      disabled={isUpdatingNotes}
                      className="h-7 px-3"
                    >
                      {isUpdatingNotes ? 'Saving...' : 'Save Notes'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelNotes}
                      disabled={isUpdatingNotes}
                      className="h-7 px-3"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Existing Notes */}
              {item.notes && !showNotes && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  <div className="flex items-start gap-2">
                    <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{item.notes}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
