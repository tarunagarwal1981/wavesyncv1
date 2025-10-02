import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { getCurrentUserWithProfile } from '@/lib/auth/session';
import { getCertificates, getCertificateStats } from '@/lib/certificates/queries';
import { groupCertificatesByStatus, calculateCertificateStats } from '@/lib/certificates/utils';
import { CertificateCard } from '@/components/certificates/CertificateCard';
import { CertificateList } from '@/components/certificates/CertificateList';
import { CertificateFilters } from '@/components/certificates/CertificateFilters';

// Certificate Stats Card Component
async function CertificateStats() {
  const userWithProfile = await getCurrentUserWithProfile();
  
  if (!userWithProfile?.user) {
    return <div>Authentication required</div>;
  }

  try {
    const stats = await getCertificateStats(userWithProfile.user.id);
    
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">
              {stats.validPercentage}% valid
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</div>
            <div className="text-xs text-muted-foreground">
              Within 90 days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <div className="text-xs text-muted-foreground">
              Requires immediate action
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error fetching certificate stats:', error);
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Error loading certificate statistics
          </div>
        </CardContent>
      </Card>
    );
  }
}

// Certificates List Component
async function CertificatesContent() {
  const userWithProfile = await getCurrentUserWithProfile();
  
  if (!userWithProfile?.user) {
    return <div>Authentication required</div>;
  }

  try {
    const { certificates } = await getCertificates(userWithProfile.user.id);
    const stats = await getCertificateStats(userWithProfile.user.id);
    
    if (certificates.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Certificates Found</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              You haven't added any certificates yet. Start by uploading your professional certifications.
            </p>
            <div className="flex gap-2">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Certificate
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <CertificateList 
        certificates={certificates}
        stats={stats}
        userId={userWithProfile.user.id}
      />
    );
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Error Loading Certificates</h3>
              <p className="text-sm text-muted-foreground">
                There was a problem loading your certificates. Please try again.
              </p>
            </div>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
}

// Loading Skeleton Component
function CertificatesLoading() {
  return (
    <div className="space-y-6">
      {/* Stats Loading */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1"></div>
              <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Header Loading */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
          <div className="h-4 w-64 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
          <div className="h-10 w-24 bg-muted animate-pulse rounded"></div>
        </div>
      </div>

      {/* Content Loading */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-muted animate-pulse rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                  <div className="h-3 w-2/3 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted animate-pulse rounded"></div>
                <div className="h-3 w-3/4 bg-muted animate-pulse rounded"></div>
                <div className="h-3 w-1/2 bg-muted animate-pulse rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Main Certificates Page
export default async function CertificatesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground">
            Manage your professional maritime certifications and track expiry dates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Certificate
          </Button>
        </div>
      </div>

      {/* Certificate Statistics */}
      <Suspense fallback={
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1"></div>
                <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <CertificateStats />
      </Suspense>

      {/* Filters and Search */}
      <CertificateFilters />

      {/* Certificates List */}
      <Suspense fallback={<CertificatesLoading />}>
        <CertificatesContent />
      </Suspense>
    </div>
  );
}

// Metadata
export const metadata = {
  title: 'Certificates | WaveSync - Maritime Operations',
  description: 'Manage your professional maritime certifications, track expiry dates, and ensure compliance.',
};
