import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Calendar, Ship, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Assignment } from '@/types/dashboard';

interface ActiveAssignmentCardProps {
  assignment?: Assignment;
  userRank?: string;
  userName?: string;
}

export function ActiveAssignmentCard({ assignment, userRank, userName }: ActiveAssignmentCardProps) {
  if (!assignment) {
    return <NoAssignmentCard />;
  }

  const joinDate = new Date(assignment.join_date);
  const expectedSignoffDate = new Date(assignment.expected_signoff_date);
  const now = new Date();
  
  // Calculate contract progress
  const totalDays = Math.ceil((expectedSignoffDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
  const progress = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);
  
  // Calculate days remaining
  const daysRemaining = Math.max(Math.ceil((expectedSignoffDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)), 0);
  
  // Status badge styling
  const getStatusBadge = () => {
    switch (assignment.status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary">
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  // Contract countdown styling
  const getCountdownColor = () => {
    if (daysRemaining <= 7) return 'text-red-600';
    if (daysRemaining <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Ship className="h-5 w-5 text-primary" />
              Current Assignment
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {userRank} • {userName}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Vessel Information */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg p-4 border">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              {assignment.vessels?.vessel_name || 'Unknown Vessel'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{assignment.vessels?.vessel_type || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Flag:</span>
                <span className="font-medium">{assignment.vessels?.flag || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">IMO:</span>
                <span className="font-medium">{assignment.vessels?.imo_number || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Contract Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Contract Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined:</span>
                <span className="font-medium">{joinDate.toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Sign-off:</span>
                <span className="font-medium">{expectedSignoffDate.toLocaleDateString()}</span>
              </div>
              
              <div className={`flex items-center gap-2 text-sm font-semibold ${getCountdownColor()}`}>
                <AlertTriangle className="h-4 w-4" />
                <span>Days Left:</span>
                <span className="text-lg">{daysRemaining}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button size="sm" variant="outline">
              View Assignment Details
            </Button>
            <Button size="sm" variant="outline">
              Sign-off Checklist
            </Button>
            {assignment.contract_reference && (
              <Button size="sm" variant="ghost" className="text-muted-foreground">
                Contract: {assignment.contract_reference}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NoAssignmentCard() {
  return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Ship className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Active Assignment</h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          You don't have any active vessel assignments at the moment.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            View All Assignments
          </Button>
          <Button size="sm">
            Apply for Assignment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


