import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { apiSuccess, apiPaginatedSuccess, apiError } from '@/lib/api-response';
import { createApiHandler } from '@/middleware/api-middleware';
import { withValidation } from '@/lib/api/validation';
import { 
  certificateCreateSchema, 
  certificateUpdateSchema, 
  certificateFilterSchema,
  paginationSchema 
} from '@/lib/api/validation';
import { CertificateData } from '@/lib/api/types';

// Get certificates handler
async function getCertificatesHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = paginationSchema.parse(Object.fromEntries(searchParams.entries()));
    const filters = certificateFilterSchema.parse(Object.fromEntries(searchParams.entries()));

    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (!user) {
      throw new Error('Authentication required');
    }

    let query = supabase
      .from('certificates')
      .select('*')
      .eq('user_id', user.id);

    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filers.issuer) {
      query = query.eq('issuer', filters.issuer);
    }
    if (filters.expiryBefore) {
      query = query.lte('expiry_date', filters.expiryBefore);
    }
    if (filters.expiryAfter) {
      query = query.gte('expiry_date', filters.expiryAfter);
    }

    // Apply pagination
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch certificates');
    }

    return apiPaginatedSuccess(data || [], {
      page: pagination.page,
      limit: pagination.limit,
      total: count || 0,
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to fetch certificates'), 500);
  }
}

// Create certificate handler
async function createCertificateHandler(data: Omit<CertificateData, 'id' | 'status'>) {
  try {
    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (!user) {
      throw new Error('Authentication required');
    }

    // Calculate status based on expiry date
    const expiryDate = new Date(data.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const status = daysUntilExpiry < 0 ? 'expired' :
                  daysUntilExpiry <= 30 ? 'expiring_soon' : 'valid';

    const { data: certificate, error } = await supabase
      .from('certificates')
      .insert({
        user_id: user.id,
        ...data,
        status,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create certificate');
    }

    return apiSuccess(certificate, 'Certificate created successfully');
  } catch (error) {
    console.error('Create certificate error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to create certificate'), 500);
  }
}

// Create handlers with middleware
const getHandler = createApiHandler(getCertificatesHandler, {
  requireAuth: true,
});

const postHandler = createApiHandler(
  withValidation(certificateCreateSchema, 'body')(createCertificateHandler),
  {
    requireAuth: true,
    rateLimit: 10,
  }
);

export { getHandler as GET, postHandler as POST };



