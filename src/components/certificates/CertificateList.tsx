'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Grid3x3,
  List,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { groupCertificatesByStatus, filterCertificates, sortCertificates } from '@/lib/certificates/utils';
import { CertificateCard } from './CertificateCard';
import type { Certificate } from '@/types/dashboard';

interface CertificateListProps {
  certificates: Certificate[];
  stats: {
    total: number;
    valid: number;
    expiringSoon: number;
    expired: number;
  };
  userId: string;
}

export function CertificateList({ certificates, stats, userId }: CertificateListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTab, setSelectedTab] = useState<'all' | 'valid' | 'expiring_soon' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter certificates based on selected tab and search
  const filteredCertificates = certificates.filter(cert => {
    const matchesTab = selectedTab === 'all' || selectedTab === cert.status;
    const matchesSearch = !searchTerm || 
      cert.certificate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificate_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.issuing_authority?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const groupedCertificates = groupCertificatesByStatus(certificates);

  const tabs = [
    { 
      id: 'all', 
      label: 'All Certificates', 
      count: stats.total,
      icon: CheckCircle2,
      color: 'text-blue-600'
    },
    { 
      id: 'valid', 
      label: 'Valid', 
      count: stats.valid,
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    { 
      id: 'expiring_soon', 
      label: 'Expiring Soon', 
      count: stats.expiringSoon,
      icon: Clock,
      color: 'text-yellow-600'
    },
    { 
      id: 'expired', 
      label: 'Expired', 
      count: stats.expired,
      icon: AlertTriangle,
      color: 'text-red-600'
    },
  ];

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'expiring_soon':
        return groupedCertificates.expiring_soon;
      case 'expired':
        return groupedCertificates.expired;
      case 'valid':
        return groupedCertificates.valid;
      default:
        return filteredCertificates;
    }
  };

  const tabContent = renderTabContent();

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Certificates
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search certificates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Badge variant="outline" className="ml-2">
                {tabContent.length} certificates
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={selectedTab === tab.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTab(tab.id as any)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className={cn('h-4 w-4', selectedTab === tab.id ? 'text-white' : tab.color)} />
                  {tab.label}
                  {tab.count > 0 && (
                    <Badge 
                      variant={selectedTab === tab.id ? 'secondary' : 'outline'} 
                      className={cn(
                        'ml-1',
                        selectedTab === tab.id ? 'text-white' : 'text-muted-foreground'
                      )}
                    >
                      {tab.count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Certificates Display */}
      {tabContent.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              {selectedTab === 'expired' ? (
                <AlertTriangle className="h-8 w-8 text-red-500" />
              ) : selectedTab === 'expiring_soon' ? (
                <Clock className="h-8 w-8 text-yellow-500" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {selectedTab === 'expired' ? 'No Expired Certificates' :
               selectedTab === 'expiring_soon' ? 'No Certificates Expiring Soon' :
               selectedTab === 'valid' ? 'No Valid Certificates' :
               'No Certificates Found'}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {selectedTab === 'all' ? 'No certificates match your search criteria' :
               selectedTab === 'expired' ? 'Great news! You have no expired certificates' :
               selectedTab === 'expiring_soon' ? 'No certificates are expiring soon' :
               selectedTab === 'valid' ? 'No valid certificates found' :
               'No certificates available'}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={cn({
          'grid gap-4 md:grid-cols-2 lg:grid-cols-3': viewMode === 'grid',
          'space-y-4': viewMode === 'list'
        })}>
          {tabContent.map((certificate) => (
            <CertificateCard
              key={certificate.id}
              certificate={certificate}
              variant={viewMode === 'grid' ? 'default' : 'compact'}
              onView={(cert) => {
                // Navigate to certificate detail page
                window.location.href = `/certificates/${cert.id}`;
              }}
              onEdit={(cert) => {
                // Navigate to edit page
                window.location.href = `/certificates/${cert.id}/edit`;
              }}
              onDownload={(cert) => {
                // Handle download
                if (cert.document_url) {
                  window.open(cert.document_url, '_blank');
                }
              }}
              onDelete={(cert) => {
                // Handle delete with confirmation
                if (confirm('Are you sure you want to delete this certificate?')) {
                  // Implement delete logic
                  console.log('Delete certificate:', cert.id);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function EmptyState({ 
  type = 'all',
  onAddCertificate 
}: {
  type?: 'all' | 'valid' | 'expiring_soon' | 'expired';
  onAddCertificate?: () => void;
}) {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'expired':
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-500',
          title: 'No Expired Certificates',
          description: 'Great news! You have no expired certificates.',
          showAddButton: false
        };
      case 'expiring_soon':
        return {
          icon: Clock,
          iconColor: 'text-yellow-500',
          title: 'No Certificates Expiring Soon',
          description: 'No certificates are approaching their expiry date.',
          showAddButton: false
        };
      case 'valid':
        return {
          icon: CheckCircle2,
          iconColor: 'text-green-500',
          title: 'No Valid Certificates',
          description: 'No valid certificates found. Add your certifications to get started.',
          showAddButton: true
        };
      default:
        return {
          icon: CheckCircle2,
          iconColor: 'text-muted-foreground',
          title: 'No Certificates',
          description: 'Start by adding your professional maritime certifications.',
          showAddButton: true
        };
    }
  };

  const config = getEmptyStateConfig();
  const IconComponent = config.icon;

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className={`w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4`}>
          <IconComponent className={`h-8 w-8 ${config.iconColor}`} />
        </div>
        <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {config.description}
        </p>
        {config.showAddButton && onAddCertificate && (
          <Button onClick={onAddCertificate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Certificate
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
