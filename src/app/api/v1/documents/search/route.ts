import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { apiSuccess, apiPaginatedSuccess, apiError } from '@/lib/api-response';
import { createApiHandler } from '@/middleware/api-middleware';
import { withValidation } from '@/lib/api/validation';
import { documentSearchSchema, paginationSchema } from '@/lib/api/validation';

// Search documents handler
async function searchDocumentsHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = paginationSchema.parse(Object.fromEntries(searchParams.entries()));
    const searchData = documentSearchSchema.parse(Object.fromEntries(searchParams.entries()));

    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (!user) {
      throw new Error('Authentication required');
    }

    const { query, category } = searchData;

    // Build search query
    let searchQuery = supabase
      .from('documents')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .or(`user_id.eq.${user.id},is_public.eq.true`);

    if (category) {
      searchQuery = searchQuery.eq('category', category);
    }

    // Apply pagination
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;

    const { data, error, count } = await searchQuery
      .range(from, to)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw new Error('Failed to search documents');
    }

    return apiPaginatedSuccess(data || [], {
      page: pagination.page,
      limit: pagination.limit,
      total: count || 0,
    });
  } catch (error) {
    console.error('Search documents error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to search documents'), 500);
  }
}

// Create handler with middleware
const searchHandler = createApiHandler(searchDocumentsHandler, {
  requireAuth: true,
  rateLimit: 50, // Higher limit for search
});

export { searchHandler as GET };



