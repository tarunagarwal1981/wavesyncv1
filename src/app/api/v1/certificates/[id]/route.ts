import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { apiSuccess, apiNotFound, apiError } from '@/lib/api-response';
import { createApiHandler } from '@/middleware/api-middleware';
import { withValidation } from '@/lib/api/validation';
import { certificateUpdateSchema, idSchema } from '@/lib/api/validation';
import { CertificateData } from '@/lib/api/types';

interface RouteParams {
  params: { id: string };
}

// Get certificate handler
async function getCertificateHandler(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const validatedId = idSchema.parse(id);

    const autorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (!user) {
      throw new Error('Authentication required');
    }

    const { data: certificate, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', validatedId)
      .eq('user_id', user.id)
      .single();

    if (error || !certificate) {
      return apiNotFound('Certificate not found');
    }

    return apiSuccess(certificate);
  } catch (error) {
    console.error('Get certificate error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to fetch certificate'), 500);
  }
}

// Update certificate handler
async function updateCertificateHandler(
  request: NextRequest, 
  { params }: RouteParams,
  data: Partial<CertificateData>
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

    // Check if certificate exists and belongs to user
    const { data: existingCertificate, error: fetchError } = await supabase
      .from('certificates')
      .select('id')
      .eq('id', validatedId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingCertificate) {
      return apiNotFound('Certificate not found');
    }

    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    // Recalculate status if expiry date is updated
    if (data.expiryDate) {
      const expiryDate = new Date(data.expiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      updateData.status = daysUntilExpiry < 0 ? 'expired' :
                         daysUntilExpiry <= 30 ? 'expiring_soon' : 'valid';
    }

    const { data: certificate, error } = await supabase
      .from('certificates')
      .update(updateData)
      .eq('id', validatedId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update certificate');
    }

    return apiSuccess(certificate, 'Certificate updated successfully');
  } catch (error) {
    console.error('Update certificate error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to update certificate'), 500);
  }
}

// Delete certificate handler
async function deleteCertificateHandler(request: NextRequest, { params }: RouteParams) {
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
      .from('certificates')
      .delete()
      .eq('id', validatedId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error('Failed to delete certificate');
    }

    return apiSuccess({}, 'Certificate deleted successfully');
  } catch (error) {
    console.error('Delete certificate error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to delete certificate'), 500);
  }
}

// Create handlers with middleware
const getHandler = createApiHandler(getCertificateHandler, {
  requireAuth: true,
});

const putHandler = createApiHandler(
  withValidation(certificateUpdateSchema, 'body')(updateCertificateHandler),
  {
    requireAuth: true,
  }
);

const deleteHandler = createApiHandler(deleteCertificateHandler, {
  requireAuth: true,
});

export { getHandler as GET, putHandler as PUT, deleteHandler as DELETE };



