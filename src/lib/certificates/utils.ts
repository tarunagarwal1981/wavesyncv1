import type { Certificate } from '@/types/dashboard';

export type CertificateStatus = 'valid' | 'expiring_soon' | 'expired';

export interface CertificateStatusInfo {
  status: CertificateStatus;
  daysUntilExpiry: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  statusColor: string;
  backgroundColor: string;
}

/**
 * Calculate days until certificate expiry
 */
export function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determine certificate status based on expiry date
 */
export function getCertificateStatus(expiryDate: string): CertificateStatusInfo {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
  
  let status: CertificateStatus;
  let urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  let statusColor: string;
  let backgroundColor: string;

  if (daysUntilExpiry <= 0) {
    status = 'expired';
    urgencyLevel = 'critical';
    statusColor = 'text-red-600';
    backgroundColor = 'bg-red-50';
  } else if (daysUntilExpiry <= 30) {
    status = 'expiring_soon';
    urgencyLevel = 'critical';
    statusColor = 'text-orange-600';
    backgroundColor = 'bg-orange-50';
  } else if (daysUntilExpiry <= 90) {
    status = 'expiring_soon';
    urgencyLevel = 'high';
    statusColor = 'text-yellow-600';
    backgroundColor = 'bg-yellow-50';
  } else if (daysUntilExpiry <= 365) {
    status = 'valid';
    urgencyLevel = 'medium';
    statusColor = 'text-blue-600';
    backgroundColor = 'bg-blue-50';
  } else {
    status = 'valid';
    urgencyLevel = 'low';
    statusColor = 'text-green-600';
    backgroundColor = 'bg-green-50';
  }

  return {
    status,
    daysUntilExpiry,
    urgencyLevel,
    statusColor,
    backgroundColor,
  };
}

/**
 * Format relative date
 */
export function formatRelativeDate(date: string): string {
  const daysUntilExpiry = getDaysUntilExpiry(date);
  
  if (daysUntilExpiry < 0) {
    const daysOverdue = Math.abs(daysUntilExpiry);
    return daysOverdue === 1 ? 'Expired yesterday' : `Expired ${daysOverdue} days ago`;
  } else if (daysUntilExpiry === 0) {
    return 'Expires today';
  } else if (daysUntilExpiry === 1) {
    return 'Expires tomorrow';
  } else if (daysUntilExpiry < 7) {
    return `Expires in ${daysUntilExpiry} days`;
  } else if (daysUntilExpiry < 30) {
    const weeks = Math.ceil(daysUntilExpiry / 7);
    return `Expires in ${weeks} week${weeks > 1 ? 's' : ''}`;
  } else if (daysUntilExpiry < 365) {
    const months = Math.ceil(daysUntilExpiry / 30);
    return `Expires in ${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(daysUntilExpiry / 365);
    const remainingDays = daysUntilExpiry % 365;
    if (remainingDays === 0) {
      return `Expires in ${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `Expires in ${years}y ${Math.ceil(remainingDays / 30)}m`;
    }
  }
}

/**
 * Get renewal recommendation based on certificate status
 */
export function getRenewalRecommendation(certificate: Certificate): string {
  const daysUntilExpiry = getDaysUntilExpiry(certificate.expiry_date);
  
  if (daysUntilExpiry <= 0) {
    return 'Immediate renewal required - certificate has expired';
  } else if (daysUntilExpiry <= 30) {
    return 'Urgent renewal recommended - expires very soon';
  } else if (daysUntilExpiry <= 90) {
    return 'Renewal recommended within 30-60 days';
  } else if (daysUntilExpiry <= 180) {
    return 'Consider renewal planning soon';
  } else {
    return 'Validity period healthy - monitor expiry schedules';
  }
}

/**
 * Sort certificates by various criteria
 */
export function sortCertificates(
  certificates: Certificate[],
  sortBy: 'expiry_date' | 'certificate_name' | 'certificate_type' | 'status',
  order: 'asc' | 'desc' = 'asc'
): Certificate[] {
  return [...certificates].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'expiry_date':
        comparison = new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
        break;
      case 'certificate_name':
        comparison = a.certificate_name.localeCompare(b.certificate_name);
        break;
      case 'certificate_type':
        comparison = a.certificate_type.localeCompare(b.certificate_type);
        break;
      case 'status':
        const statusA = getCertificateStatus(a.expiry_date);
        const statusB = getCertificateStatus(b.expiry_date);
        comparison = statusA.status.localeCompare(statusB.status);
        break;
    }
    
    return order === 'desc' ? -comparison : comparison;
  });
}

/**
 * Filter certificates based on criteria
 */
export function filterCertificates(
  certificates: Certificate[],
  filters: {
    status?: CertificateStatus;
    certificateType?: string;
    searchTerm?: string;
  }
): Certificate[] {
  return certificates.filter(certificate => {
    // Status filter
    if (filters.status) {
      const certStatus = getCertificateStatus(certificate.expiry_date);
      if (certStatus.status !== filters.status) {
        return false;
      }
    }
    
    // Type filter
    if (filters.certificateType && filters.certificateType !== 'all') {
      if (certificate.certificate_type !== filters.certificateType) {
        return false;
      }
    }
    
    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return (
        certificate.certificate_name.toLowerCase().includes(searchLower) ||
        certificate.certificate_type.toLowerCase().includes(searchLower) ||
        (certificate.issuing_authority?.toLowerCase().includes(searchLower)) ||
        (certificate.certificate_number?.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });
}

/**
 * Group certificates by status
 */
export function groupCertificatesByStatus(certificates: Certificate[]) {
  const grouped = {
    valid: [] as Certificate[],
    expiring_soon: [] as Certificate[],
    expired: [] as Certificate[],
  };
  
  certificates.forEach(certificate => {
    const statusInfo = getCertificateStatus(certificate.expiry_date);
    grouped[statusInfo.status].push(certificate);
  });
  
  return grouped;
}

/**
 * Calculate certificate statistics
 */
export function calculateCertificateStats(certificates: Certificate[]) {
  const grouped = groupCertificatesByStatus(certificates);
  const total = certificates.length;
  
  return {
    total,
    valid: grouped.valid.length,
    expiringSoon: grouped.expiring_soon.length,
    expired: grouped.expired.length,
    expiringSoonCount: grouped.expiring_soon.length,
    expiredCount: grouped.expired.length,
    validPercentage: total > 0 ? Math.round((grouped.valid.length / total) * 100) : 0,
    urgencyPercentage: total > 0 ? Math.round(((grouped.expiring_soon.length + grouped.expired.length) / total) * 100) : 0,
  };
}

/**
 * Get certificate type categories
 */
export function getCertificateTypeCategories(): string[] {
  return [
    'STCW Basic Safety Training',
    'STCW Advanced Fire Fighting',
    'Proficiency in Survival Craft',
    'Medical First Aid',
    'Security Awareness',
    'Security Duties',
    'GMDSS Radio Operator',
    'Radar Observer',
    'ECDIS',
    'Watchkeeping Officer',
    'Master\'s Certificate',
    'Engineering Certificate',
    'Maritime English',
    'Personal Survival Techniques',
    'Fire Prevention and Fire Fighting',
    'Elementary First Aid',
    'Personal Safety and Social Responsibilities',
    'Ship Security Officer',
    'Oil Tanker Familiarization',
    'Chemical Tanker Familiarization',
    'LNG Tanker Familiarization',
    'Bulk Carrier Familiarization',
  ];
}

/**
 * Validate certificate data
 */
export function validateCertificate(certificate: Partial<Certificate>): string[] {
  const errors: string[] = [];
  
  if (!certificate.certificate_name?.trim()) {
    errors.push('Certificate name is required');
  }
  
  if (!certificate.certificate_type?.trim()) {
    errors.push('Certificate type is required');
  }
  
  if (!certificate.issue_date) {
    errors.push('Issue date is required');
  } else {
    const issueDate = new Date(certificate.issue_date);
    if (isNaN(issueDate.getTime())) {
      errors.push('Invalid issue date');
    }
  }
  
  if (!certificate.expiry_date) {
    errors.push('Expiry date is required');
  } else {
    const expiryDate = new Date(certificate.expiry_date);
    if (isNaN(expiryDate.getTime())) {
      errors.push('Invalid expiry date');
    } else if (certificate.issue_date) {
      const issueDate = new Date(certificate.issue_date);
      if (expiryDate.getTime() <= issueDate.getTime()) {
        errors.push('Expiry date must be after issue date');
      }
    }
  }
  
  if (!certificate.issuing_authority?.trim()) {
    errors.push('Issuing authority is required');
  }
  
  return errors;
}


