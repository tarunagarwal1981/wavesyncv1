'use server';

import { supabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { circularAcknowledgmentSchema, idSchema } from '@/lib/api/validation';

// Acknowledge circular action
export async function acknowledgeCircularAction(circularId: string, formData: FormData) {
  try {
    const validatedId = idSchema.parse(circularId);
    const acknowledgmentNote = formData.get('acknowledgmentNote') as string || undefined;

    // Validate input
    const validatedData = circularAcknowledgmentSchema.parse({
      circularId: validatedId,
      acknowledgmentNote,
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Check if circular exists
    const { data: existingCircular, error: fetchError } = await supabase
      .from('circulars')
      .select('id, title')
      .eq('id', validatedId)
      .single();

    if (fetchError || !existingCircular) {
      return {
        success: false,
        error: 'Circular not found',
      };
    }

    // Check if already acknowledged
    const { data: existingAcknowledgment } = await supabase
      .from('circular_acknowledgments')
      .select('id')
      .eq('circular_id', validatedId)
      .eq('user_id', user.id)
      .single();

    if (existingAcknowledgment) {
      return {
        success: false,
        error: 'Circular already acknowledged',
      };
    }

    // Create acknowledgment
    const { data: acknowledgment, error } = await supabase
      .from('circular_acknowledgments')
      .insert({
        circular_id: validatedId,
        user_id: user.id,
        acknowledgment_note: validatedData.acknowledgmentNote,
        acknowledged_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Update circular read status
    await supabase
      .from('circular_reads')
      .upsert({
        circular_id: validatedId,
        user_id: user.id,
        read_at: new Date().toISOString(),
      });

    // Revalidate circular data
    revalidatePath('/circulars');
    revalidatePath(`/circulars/${validatedId}`);
    revalidatePath('/dashboard');

    return {
      success: true,
      data: acknowledgment,
      message: 'Circular acknowledged successfully',
    };
  } catch (error) {
    console.error('Acknowledge circular action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to acknowledge circular',
    };
  }
}

// Mark circular as read action
export async function markCircularAsReadAction(circularId: string) {
  try {
    const validatedId = idSchema.parse(circularId);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Upsert read status
    const { data: readData, error } = await supabase
      .from('circular_reads')
      .upsert({
        circular_id: validatedId,
        user_id: user.id,
        read_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate circular data
    revalidatePath('/circulars');
    revalidatePath(`/circulars/${validatedId}`);
    revalidatePath('/dashboard'); // Update unread count

    return {
      success: true,
      data: readData,
      message: 'Circular marked as read',
    };
  } catch (error) {
    console.error('Mark circular as read action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark circular as read',
    };
  }
}

// Mark all circulars as read action
export async function markAllCircularsAsReadAction() {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Get all unread circulars for user
    const { data: unreadCirculars } = await supabase
      .from('circulars')
      .select('id')
      .not('id', 'in', `(SELECT circular_id FROM circular_reads WHERE user_id = '${user.id}')`);

    if (unreadCirculars && unreadCirculars.length > 0) {
      // Batch insert read records
      const readRecords = unreadCirculars.map(circular => ({
        circular_id: circular.id,
        user_id: user.id,
        read_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('circular_reads')
        .insert(readRecords);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    }

    // Revalidate paths
    revalidatePath('/circulars');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: `Marked ${unreadCirculars?.length || 0} circulars as read`,
    };
  } catch (error) {
    console.error('Mark all circulars as read action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark all circulars as read',
    };
  }
}

// Get circular acknowledgment status
export async function getCircularAcknowledgmentStatus(circularId: string) {
  try {
    const validatedId = idSchema.parse(circularId);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Get acknowledgment status
    const { data: acknowledgment } = await supabase
      .from('circular_acknowledgments')
      .select('*')
      .eq('circular_id', validatedId)
      .eq('user_id', user.id)
      .single();

    return {
      success: true,
      data: {
        acknowledged: !!acknowledgment,
        acknowledgedAt: acknowledgment?.acknowledged_at,
        acknowledgmentNote: acknowledgment?.acknowledgment_note,
      },
    };
  } catch (error) {
    console.error('Get circular acknowledgment status error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get acknowledgment status',
    };
  }
}
