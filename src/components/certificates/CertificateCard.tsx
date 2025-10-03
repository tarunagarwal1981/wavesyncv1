import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Building,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeDate } from '@/lib/certificates/utils';
import { CertificateStatusBadge } from './CertificateStatusBadge';
import { ExpiryCountdown } from './ExpiryCountdown';
import type { Certificate } from '@/types/dashboard';

interface CertificateCardProps {
  certificate: Certificate;
  variant?: 'default' | 'compact' | 'detailed';
  onView?: (certificate: Certificate) => void;
  onEdit?: (certificate: Certificate) => void;
  onDelete?: (certificate: Certificate) => void;
  onDownload?: (certificate: Certificate) => void;
  className?: string;
}

export function CertificateCard({
  certificate,
  variant = 'default',
  onView,
  onEdit,
  onDelete,
  onDownload,
  className
}: CertificateCardProps) {
  const actions = [
    { icon: Eye, label: 'View', onClick: () => onView?.(certificate) },
    { icon: Edit, label: 'Edit', onClick: () => onEdit?.(certificate) },
    { icon: Download, label: 'Download', onClick: () => onDownload?.(certificate) },
    { icon: Trash2, label: 'Delete', onClick: () => onDelete?.(certificate), variant: 'destructive' as const },
  ].filter(action => action.onClick);

  if (variant === 'compact') {
    return (
      <Card className={cn('hover:shadow-md transition-shadow cursor-pointer', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {certificate.certificate_name}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {certificate.issuing_authority}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CertificateStatusBadge 
                expiryDate={certificate.expiry_date} 
                variant="compact" 
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onView?.(certificate)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight">
                {certificate.certificate_name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {certificate.certificate_type}
                </Badge>
                {certificate.certificate_number && (
                  <Badge variant="secondary" className="text-xs">
                    #{certificate.certificate_number}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <CertificateStatusBadge expiryDate={certificate.expiry_date} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Information */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Issuing Authority:</span>
            <span className="font-medium">{certificate.issuing_authority}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Issue Date:</span>
            <span>{new Date(certificate.issue_date).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Expiry:</span>
            <span>{formatRelativeDate(certificate.expiry_date)}</span>
          </div>
        </div>

        {/* Expiry Countdown */}
        <ExpiryCountdown 
          expiryDate={certificate.expiry_date}
          issueDate={certificate.issue_date}
          variant="compact"
          showProgress={true}
        />

        {/* Document Preview */}
        {certificate.document_url && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Document available
            </span>
            {onDownload && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-6 px-2"
                onClick={() => onDownload(certificate)}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            )}
          </div>
        )}

        {/* Actions */}
        {variant === 'detailed' && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {actions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant || "outline"}
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={action.onClick}
                >
                  <IconComponent className="h-3 w-3" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}

        {/* Quick Actions for Default Variant */}
        {variant === 'default' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onView?.(certificate)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            {onDownload && certificate.document_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(certificate)}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CertificateGridItem({ 
  certificate,
  onClick
}: {
  certificate: Certificate;
  onClick?: () => void;
}) {
  const daysUntilExpiry = Math.ceil(
    (new Date(certificate.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card 
      className="hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <CertificateStatusBadge expiryDate={certificate.expiry_date} variant="compact" />
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm line-clamp-2">
            {certificate.certificate_name}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {certificate.issuing_authority}
          </p>
          <div className="flex items-center justify-between text-xs">
            <Badge variant="secondary" className="text-xs">
              {certificate.certificate_type}
            </Badge>
            <span className="text-muted-foreground">
              {daysUntilExpiry > 0 ? `${daysUntilExpiry}d left` : `${Math.abs(daysUntilExpiry)}d overdue`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


