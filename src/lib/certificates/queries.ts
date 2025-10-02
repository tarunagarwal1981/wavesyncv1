import { createClient } from '@/lib/supabase/server';
import type { Certificate } from '@/types/dashboard';

export interface CertificateFilters {
  status?: 'valid' | 'expiring_soon' | 'expired';
  certificateType?: string;
  searchTerm?: string;
  issuingAuthority?: string;
}

export interface CertificateSortOptions {
  sortBy: 'expiry_date' | 'certificate_name' | 'certificate_type' | 'created_at';
  order: 'asc' | 'desc';
}

/**
 * Get all certificates for a user with optional filters and sorting
 */
export async function getCertificates(
  userId: string,
  options: {
    filters?: CertificateFilters;
    sort?: CertificateSortOptions;
    limit?: number;
  } = {}
): Promise<{ certificates: Certificate[]; total: number }> {
  const supabase = await createClient();
  
  let query = supabase
    .from('certificates')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);
  
  // Apply filters
  if (options.filters) {
    const { status, certificateType, searchTerm, issuingAuthority } = options.filters;
    
    if (certificateType && certificateType !== 'all') {
      query = query.eq('certificate_type', certificateType);
    }
    
    if (issuingAuthority && issuingAuthority !== 'all') {
      query = query.eq('issuing_authority', issuingAuthority);
    }
    
    if (searchTerm) {
      query = query.or(
        `certificate_name.ilike.%${searchTerm}%,certificate_type.ilike.%${searchTerm}%,certificate_number.ilike.%${searchTerm}%,issuing_authority.ilike.%${searchTerm}%`
      );
    }
    
    // Status filter will be applied after data fetching since it requires calculation
  }
  
  // Apply sorting
  if (options.sort) {
    query = query.order(options.sort.sortBy, { ascending: options.sort.order === 'asc' });
  } else {
    query = query.order('expiry_date', { ascending: true });
  }
  
  // Apply limit
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  const { data: certificates, count, error } = await query;
  
  if (error) {
    console.error('Error fetching certificates:', error);
    return { certificates: [], total: 0 };
  }
  
  return { certificates: certificates || [], total: count || 0 };
}

/**
 * Get a single certificate by ID
 */
export async function getCertificateById(
  certificateId: string,
  userId: string
): Promise<Certificate | null> {
  const supabase = await createClient();
  
  const { data: certificate, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('id', certificateId)
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching certificate:', error);
    return null;
  }
  
  return certificate;
}

/**
 * Create a new certificate
 */
export async function createCertificate(
  userId: string,
  certificateData: Omit<Certificate, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'reminder_sent'>
): Promise<{ certificate: Certificate | null; error: string | null }> {
  const supabase = await createClient();
  
  const { data: certificate, error } = await supabase
    .from('certificates')
    .insert({
      user_id: userId,
      ...certificateData,
      reminder_sent: false,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating certificate:', error);
    return { certificate: null, error: error.message };
  }
  
  return { certificate: certificate as Certificate, error: null };
}

/**
 * Update an existing certificate
 */
export async function updateCertificate(
  certificateId: string,
  userId: string,
  updates: Partial<Omit<Certificate, 'id' | 'user_id' | 'created_at'>>
): Promise<{ certificate: Certificate | null; error: string | null }> {
  const supabase = await createClient();
  
  const { data: certificate, error } = await supabase
    .from('certificates')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', certificateId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating certificate:', error);
    return { certificate: null, error: error.message };
  }
  
  return { certificate: certificate as Certificate, error: null };
}

/**
 * Delete a certificate
 */
export async function deleteCertificate(
  certificateId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('certificates')
    .delete()
    .eq('id', certificateId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error deleting certificate:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, error: null };
}

/**
 * Mark certificate reminder as sent
 */
export async function markReminderSent(
  certificateId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('certificates')
    .update({ 
      reminder_sent: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', certificateId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error updating reminder status:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, error: null };
}

/**
 * Get certificates expiring soon (within specified days)
 */
export async function getCertificatesExpiringSoon(
  userId: string,
  daysAhead: number = 90
): Promise<Certificate[]> {
  const supabase = await createClient();
  
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  const { data: certificates, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .lte('expiry_date', futureDate.toISOString())
    .gt('expiry_date', new Date().toISOString())
    .order('expiry_date', { ascending: true });
  
  if (error) {
    console.error('Error fetching expiring certificates:', error);
    return [];
  }
  
  return certificates || [];
}

/**
 * Get certificates by status (requires calculation)
 */
export async function getCertificatesByStatus(
  userId: string,
  status: 'valid' | 'expiring_soon' | 'expired'
): Promise<Certificate[]> {
  const { certificates } = await getCertificates(userId);
  
  // Import the utility function here to avoid circular dependencies
  const { getCertificateStatus } = await import('./utils');
  
  return certificates.filter(cert => {
    const statusInfo = getCertificateStatus(cert.expiry_date);
    return statusInfo.status === status;
  });
}

/**
 * Get certificate statistics for dashboard
 */
export async function getCertificateStats(userId: string) {
  const { certificates } = await getCertificates(userId);
  
  // Import the utility function here to avoid circular dependencies
  const { calculateCertificateStats } = await import('./utils');
  
  return calculateCertificateStats(certificates);
}

/**
 * Get certificate type options for dropdowns
 */
export async function getCertificateTypes(userId: string): Promise<string[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('certificates')
    .select('certificate_type')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching certificate types:', error);
    return [];
  }
  
  // Extract unique types
  const uniqueTypes = [...new Set(data?.map(c => c.certificate_type) || [])];
  return uniqueTypes.sort();
}

/**
 * Get issuing authorities for filtering
 */
export async function getIssuingAuthorities(userId: string): Promise<string[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('certificates')
    .select('issuing_authority')
    .eq('user_id', userId)
    .not('issuing_authority', 'is', null);
  
  if (error) {
    console.error('Error fetching issuing authorities:', error);
    return [];
  }
  
  // Extract unique authorities
  const uniqueAuthorities = [...new Set(data?.map(c => c.issuing_authority) || [])];
  return uniqueAuthorities.filter(Boolean).sort();
}

/**
 * Bulk upload certificates
 */
export async function bulkCreateCertificates(
  userId: string,
  certificatesData: Array<Omit<Certificate, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'reminder_sent'>>
): Promise<{ 
  successful: Certificate[]; 
  failed: Array<{ data: any; error: string }>; 
  total: number;
}> {
  const supabase = await createClient();
  
  const results = await Promise.allSettled(
    certificatesData.map(data =>
      supabase
        .from('certificates')
        .insert({
          user_id: userId,
          ...data,
          reminder_sent: false,
        })
        .select()
        .single()
    )
  );
  
  const successful: Certificate[] = [];
  const failed: Array<{ data: any; error: string }> = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.data) {
      successful.push(result.value.data as Certificate);
    } else {
      const error = result.status === 'rejected' 
        ? result.reason.message 
        : result.value.error?.message || 'Unknown error';
      failed.push({ 
        data: certificatesData[index], 
        error 
      });
    }
  });
  
  return {
    successful: successful,
    failed: failed,
    total: certificatesData.length,
  };
}
