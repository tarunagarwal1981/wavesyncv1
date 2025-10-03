import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { apiSuccess, apiNotFound, apiError } from '@/lib/api-response';
import { createApiHandler } from '@/middleware/api-middleware';
import { withValidation } from '@/lib/api/validation';
import { documentCreateSchema, idSchema } from '@/lib/api/validation';
import { DocumentData } from '@/lib/api/types';

interface RouteParams {
  params: { id: string };
}

// Get document handler
async function getDocumentHandler(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const validatedId = idSchema.parse(id);

    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (!user) {
      throw new Error('Authentication required');
    }

    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', validatedId)
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .single();

    if (error || !document) {
      return apiNotFound('Document not found');
    }

    return apiSuccess(document);
  } catch (error) {
    console.error('Get document error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to fetch document'), 500);
  }
}

// Update document handler
async function updateDocumentHandler(
  request: NextRequest,
  { params }: RouteParams,
  data: Partial<DocumentData>
) {
  try {
    const { id } = params;
    const validatedId = idSchema.parse(id);

    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (!user) {
      throw new Error('Authentication required');
    }

    // Check if document exists and belongs to user
    const { data: existingDocument, error: fetchError } = await supabase
      .from('documents')
      .select('id')
      .eq('id', validatedId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingDocument) {
      return apiNotFound('Document not found or access denied');
    }

    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { data: document, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', validatedId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update document');
    }

    return apiSuccess(document, 'Document updated successfully');
  } catch (error) {
    console.error('Update document error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to update document'), 500);
  }
}

// Delete document handler
async function deleteDocumentHandler(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const validatedId = idSchema.parse(id);

    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (!user) {
      throw new Error('Authentication required');
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', validatedId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error('Failed to delete document');
    }

    return apiSuccess({}, 'Document deleted successfully');
  } catch (error) {
    console.error('Delete document error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to delete document'), 500);
  }
}

// Create handlers with middleware
const getHandler = createApiHandler(getDocumentHandler, {
  requireAuth: true,
});

const putHandler = createApiHandler(
  withValidation(documentCreateSchema.partial(), 'body')(updateDocumentHandler),
  {
    requireAuth: true,
  }
);

const deleteHandler = createApiHandler(deleteDocumentHandler, {
  requireAuth: true,
});

export { getHandler as GET, putHandler as PUT, deleteHandler as DELETE };



