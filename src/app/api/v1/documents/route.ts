import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { apiSuccess, apiPaginatedSuccess, apiError } from '@/lib/api-response';
import { createApiHandler } from '@/middleware/api-middleware';
import { withValidation } from '@/lib/api/validation';
import { 
  documentCreateSchema,
  documentFilterSchema,
  documentSearchSchema,
  paginationSchema 
} from '@/lib/api/validation';
import { DocumentData } from '@/lib/api/types';

// Get documents handler
async function getDocumentsHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = paginationSchema.parse(Object.fromEntries(searchParams.entries()));
    const filters = documentFilterSchema.parse(Object.fromEntries(searchParams.entries()));

    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (!user) {
      throw new Error('Authentication required');
    }

    let query = supabase
      .from('documents')
      .select('*')
      .or(`user_id.eq.${user.id},is_public.eq.true`);

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.tags) {
      query = query.contains('tags', filters.tags.split(','));
    }
    if (filters.isPublic !== undefined) {
      query = query.eq('is_public', filters.isPublic);
    }
    if (filters.uploadedBefore) {
      query = query.lte('uploaded_at', filters.uploadedBefore);
    }
    if (filters.uploadedAfter) {
      query = query.gte('uploaded_at', filters.uploadedAfter);
    }

    // Apply pagination
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch documents');
    }

    return apiPaginatedSuccess(data || [], {
      page: pagination.page,
      limit: pagination.limit,
      total: count || 0,
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to fetch documents'), 500);
  }
}

// Create document handler
async function createDocumentHandler(data: Omit<DocumentData, 'id' | 'fileSize' | 'mimeType' | 'uploadedAt'>) {
  try {
    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (!user) {
      throw new Error('Authentication required');
    }

    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        ...data,
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create document');
    }

    return apiSuccess(document, 'Document created successfully');
  } catch (error) {
    console.error('Create document error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to create document'), 500);
  }
}

// Create handlers with middleware
const getHandler = createApiHandler(getDocumentsHandler, {
  requireAuth: true,
});

const postHandler = createApiHandler(
  withValidation(documentCreateSchema, 'body')(createDocumentHandler),
  {
    requireAuth: true,
    rateLimit: 10,
  }
);

export { getHandler as GET, postHandler as POST };
