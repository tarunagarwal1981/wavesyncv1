import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

// Import dashboard components
import { ActiveAssignmentCard } from '@/components/dashboard/ActiveAssignmentCard';
import { QuickStatsGrid } from '@/components/dashboard/QuickStatsGrid';
import { UpcomingItems } from '@/components/dashboard/UpcomingItems';
import { RecentCirculars } from '@/components/dashboard/RecentCirculars';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { DashboardSkeleton } from '@/components/dashboard/SkeletonComponents';
import { RefreshButton } from '@/components/dashboard/RefreshButton';

// Import mobile components
import { MobileLayout, MobileContent, MobileSection, MobileGrid, MobileHeader } from '@/components/mobile';
import { cn } from '@/lib/utils';

// Import data service
import { getDashboardData } from '@/lib/dashboard-service';
import { getUserWithProfile } from '@/lib/auth/session';

// Main Dashboard Content Component
async function DashboardContent() {
  try {
    // Get current user session
    const { user, profile } = await getUserWithProfile();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Fetch dashboard data
    const dashboardData = await getDashboardData({ 
      userId: user.id 
    });

    const { 
      activeAssignment, 
      stats, 
      upcomingItems, 
      recentCirculars 
    } = dashboardData;

    // Check for urgent items requiring attention
    const urgentItems = [];
    if (stats.pendingTasks > 5) urgentItems.push(`${stats.pendingTasks} pending tasks`);
    if (stats.expiringCertificates > 0) urgentItems.push(`${stats.expiringCertificates} certificates expiring`);
    if (stats.unreadCirculars > 5) urgentItems.push(`${stats.unreadCirculars} unread circulars`);

    return (
      <div className="min-h-screen bg-background">
        {/* Desktop Header */}
        <div className="hidden lg:block border-b bg-background/95 backdrop-blur supports-[backdrop-blur]:bg-background/60">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Welcome back, {profile.rank} {profile.full_name || 'Seafarer'}
              </div>
              <RefreshButton />
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden">
          <MobileHeader
            title="Dashboard"
            user={{
              name: profile.full_name || 'Seafarer',
              avatar: profile.avatar_url
            }}
            notificationCount={stats.unreadNotifications}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Debug: Test visibility */}
            <div className="bg-red-100 p-4 border border-red-300 rounded">
              <h2 className="text-red-800 font-bold">Dashboard Loading Debug</h2>
              <p className="text-red-700">If you can see this box, the dashboard container is working.</p>
              <p className="text-red-700">Profile: {profile?.employee_id || 'No profile'}</p>
              <p className="text-red-700">Stats: {JSON.stringify(stats, null, 2)}</p>
            </div>
            
            {/* Test: Simple visible content */}
            <div className="bg-green-100 p-4 border border-green-300 rounded">
              <h2 className="text-green-800 font-bold">Test Content Visible</h2>
              <p className="text-green-700">This should be visible after the debug box.</p>
            </div>
            
            {/* Welcome Header - Responsive Layout */}
            <div className="space-y-4">
              {/* Responsive version */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                    Welcome back, {profile.rank} {profile.full_name || 'Seafarer'}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    Manage your maritime career and assignments
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Employee ID: <span className="font-mono font-medium">{profile.employee_id}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      • {profile.nationality}
                    </div>
                  </div>
                  <RefreshButton />
                </div>
              </div>

            </div>

            {/* Urgent Items Alert */}
            {urgentItems.length > 0 && (
              <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  <span className="font-medium block sm:inline">Action Required:</span>{' '}
                  <span className="block sm:inline">{urgentItems.join(', ')}.</span>
                  <span className="block mt-1 sm:inline sm:mt-0 sm:ml-1">
                    Please review and take necessary action to avoid any disruptions.
                  </span>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Test: Simplified content block */}
            <div className="bg-blue-100 p-6 border border-blue-300 rounded">
              <h2 className="text-xl font-bold text-blue-800 mb-4">Active Assignment</h2>
              <p className="text-blue-700">No Active Assignment</p>
              <p className="text-sm text-blue-600 mt-2">You don't have any active vessel assignments at the moment.</p>
            </div>
            
            {/* Test: Stats block */}
            <div className="bg-purple-100 p-6 border border-purple-300 rounded">
              <h2 className="text-xl font-bold text-purple-800 mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-purple-700">Pending Tasks: {stats.pendingTasks}</div>
                <div className="text-purple-700">Certificates: {stats.expiringCertificates}</div>
              </div>
            </div>

            {/* Mobile-first Layout */}
            <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
              {/* Upcoming Items Timeline */}
              <MobileSection title="Upcoming Items">
                <UpcomingItems items={upcomingItems} />
              </MobileSection>

              {/* Recent Circulars */}
              <MobileSection title="Recent Circulars">
                <RecentCirculars circulars={recentCirculars} />
              </MobileSection>
            </div>

            {/* Quick Actions */}
            <MobileSection title="Quick Actions">
              <QuickActions 
                pendingTasks={stats.pendingTasks}
                expiringCertificates={stats.expiringCertificates}
                unreadCirculars={stats.unreadCirculars}
              />
            </MobileSection>
            
            {/* Success State */}
            {urgentItems.length === 0 && (
              <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                <CardContent className="flex items-center gap-3 p-4 md:p-6">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-green-900 dark:text-green-100">All Systems Operational</p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      No urgent items requiring your attention at this time.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
    );

  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    
    return (
      <MobileLayout title="Dashboard Error">
        <MobileContent>
          <div className="space-y-4">
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-medium text-red-900 dark:text-red-100">Dashboard Error</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {error instanceof Error ? error.message : 'An unexpected error occurred'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">Welcome to WaveSync</h3>
                  <p className="text-muted-foreground">
                    Your maritime operations dashboard. Please try refreshing the page.
                  </p>
                  <RefreshButton />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
    );
  }
}

// Main Dashboard Page
export default async function DashboardPage() {
  return (
    <Suspense fallback={<MobileDashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}

// Mobile-optimized loading fallback
function MobileDashboardFallback() {
  return (
    <MobileLayout title="Loading...">
      <MobileContent>
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="space-y-3">
            <div className="h-6 w-2/3 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-2">
                <div className="h-8 w-12 bg-muted rounded animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Cards skeleton */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </MobileContent>
    </MobileLayout>
  );
}

// Metadata for SEO
export const metadata = {
  title: 'Dashboard | WaveSync - Maritime Operations',
  description: 'Your personalized maritime operations dashboard with assignments, certificates, and travel management.',
};