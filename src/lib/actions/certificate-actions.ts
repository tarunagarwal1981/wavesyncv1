'use server';

import { supabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { certificateCreateSchema, certificateUpdateSchema, idSchema } from '@/lib/api/validation';
import { CertificateData } from '@/lib/api/types';

// Create certificate action
export async function createCertificateAction(formData: FormData) {
  try {
    const data = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      issuer: formData.get('issuer') as string,
      certificateNumber: formData.get('certificateNumber') as string,
      issueDate: formData.get('issueDate') as string,
      expiryDate: formData.get('expiryDate') as string,
      description: formData.get('description') as string || undefined,
    };

    // Validate input
    const validatedData = certificateCreateSchema.parse(data);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Calculate status based on expiry date
    const expiryDate = new Date(validatedData.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const status = daysUntilExpiry < 0 ? 'expired' :
                  daysUntilExpiry <= 30 ? 'expiring_soon' : 'valid';

    const { data: certificate, error } = await supabase
      .from('certificates')
      .insert({
        user_id: user.id,
        ...validatedData,
        status => status,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if {error} {
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate certificates list
    revalidatePath('/certificates');
    revalidatePath('/dashboard'); // Certificate count might also affect dashboard

    return {
      success: true,
      data: certificate,
      message: 'Certificate created successfully',
    };
  } catch (error) {
    console.error('Create certificate action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create certificate',
    };
  }
}

// Update certificate action
export async function updateCertificateAction(certificateId: string, formData: FormData) {
  try {
    const validatedId = idSchema.parse(certificateId);
    
    const data = {
      name: formData.get('name') as string || undefined,
      type: formData.get('type') as string || undefined,
      issuer: formData.get('issuer') as string || undefined,
      certificateNumber: formData.get('certificateNumber') as string || undefined,
      issueDate: formData.get('issueDate') as string || undefined,
      expiryDate: formData.get('expiryDate') as string || undefined,
      description: formData.get('description') as string || undefined,
    };

    // Filter out undefined values for partial update
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        error: 'No valid fields to update',
      };
    }

    // Validate input
    const validatedData = certificateUpdateSchema.parse(updateData);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Check if certificate exists and belongs to user
    const { data: existingCertificate, error: fetchError } = await supabase
      .from('certificates')
      .select('id')
      .eq('id', validatedId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingCertificate) {
      return {
        success: false,
        error: 'Certificate not found',
      };
    }

    const dbUpdateData: any = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    // Recalculate status if expiry date is updated
    if (validatedData.expiryDate) {
      const expiryDate = new Date(validatedData.expiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      dbUpdateData.status = daysUntilExpiry < 0 ? 'expired' :
                             daysUntilExpiry <= 30 ? 'expiring_soon' : 'valid';
    }

    const { data: certificate, error } = await supabase
      .from('certificates')
      .update(dbUpdateData)
      .eq('id', validatedId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate certificates
    revalidatePath('/certificates');
    revalidatePath(`/certificates/${validatedId}`);

    return {
      success: true,
      data: certificate,
      message: 'Certificate updated successfully',
    };
  } catch (error) {
    console.error('Update certificate action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update certificate',
    };
  }
}

// Delete certificate action
export async function deleteCertificateAction(certificateId: string) {
  try {
    const validatedId = idSchema.parse(certificateId);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', validatedId)
      .eq('user_id', user.id);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate certificates list
    revalidatePath('/certificates');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Certificate deleted successfully',
    };
  } catch (error) {
    console.error('Delete certificate action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete certificate',
    };
  }
}

// Upload certificate file action
export async function uploadCertificateFileAction(certificateId: string, file: File) {
  try {
    const validatedId = idSchema.parse(certificateId);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Check if certificate exists and belongs to user
    const { data: existingCertificate, error: fetchError } = await sup supabase
      .from('certificates')
      .select('id')
      .eq('id', validatedId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingCertificate) {
      return {
        success: false,
        error: 'Certificate not found',
      };
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${validatedId}.${fileExt}`;
    const filePath = `certificates/${user.id}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      return {
        success: false,
        error: 'File upload failed',
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('certificates')
      .getPublicUrl(filePath);

    // Update certificate with file URL
    const { data: certificate, error: updateError } = await supabase
      .from('certificates')
      .update({ 
        file_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: 'Failed to update certificate with file info',
      };
    }

    revalidatePath(`/certificates/${validatedId}`);

    return {
      success: true,
      data: certificate,
      message: 'Certificate file uploaded successfully',
    };
  } catch (error) {
    console.error('Upload certificate file action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload certificate file',
    };
  }
}



