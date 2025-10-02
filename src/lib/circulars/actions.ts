'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function markCircularAsRead(circularId: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Check if acknowledgment record exists
  const { data: existingAcknowledgment } = await supabase
    .from('circular_acknowledgments')
    .select('id')
    .eq('circular_id', circularId)
    .eq('user_id', user.id)
    .single();

  if (existingAcknowledgment) {
    // Update existing record with read_at timestamp
    const { error } = await supabase
      .from('circular_acknowledgments')
      .update({ read_at: new Date().toISOString() })
      .eq('id', existingAcknowledgment.id);

    if (error) {
      throw new Error('Failed to mark circular as read');
    }
  } else {
    // Create new acknowledgment record
    const { error } = await supabase
      .from('circular_acknowledgments')
      .insert({
        circular_id: circularId,
        user_id: user.id,
        read_at: new Date().toISOString()
      });

    if (error) {
      throw new Error('Failed to mark circular as read');
    }
  }

  revalidatePath('/circulars');
  revalidatePath(`/circulars/${circularId}`);
}

export async function acknowledgeCircular(circularId: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Verify the circular requires acknowledgment
  const { data: circular } = await supabase
    .from('circulars')
    .select('requires_acknowledgment')
    .eq('id', circularId)
    .single();

  if (!circular?.requires_acknowledgment) {
    throw new Error('This circular does not require acknowledgment');
  }

  // Check if acknowledgment record exists
  const { data: existingAcknowledgment } = await supabase
    .from('circular_acknowledgments')
    .select('id')
    .eq('circular_id', circularId)
    .eq('user_id', user.id)
    .single();

  if (existingAcknowledgment) {
    // Update existing record with acknowledged_at timestamp
    const { error } = await supabase
      .from('circular_acknowledgments')
      .update({ acknowledged_at: new Date().toISOString() })
      .eq('id', existingAcknowledgment.id);

    if (error) {
      throw new Error('Failed to acknowledge circular');
    }
  } else {
    // Create new acknowledgment record
    const { error } = await supabase
      .from('circular_acknowledgments')
      .insert({
        circular_id: circularId,
        user_id: user.id,
        acknowledged_at: new Date().toISOString(),
        read_at: new Date().toISOString() // Automatically mark as read
      });

    if (error) {
      throw new Error('Failed to acknowledge circular');
    }
  }

  revalidatePath('/circulars');
  revalidatePath(`/circulars/${circularId}`);
}

export async function toggleCircularFavorite(circularId: string): Promise<void> {
  // This would add a favorites/bookmarks feature
  // For now, we'll implement a simple toggle
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Note: This would require adding a favorites table to the database
  // Implementation would depend on requirements for bookmarking
  throw new Error('Favorites feature not yet implemented');
}

export async function downloadAttachment(attachmentUrl: string, filename: string): Promise<void> {
  // This would trigger a download
  // Actual download handling would be done on the client side
  // This server action could be used for audit logging
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Log download activity (could add to a downloads audit table)
  // For now, just ensure user is authenticated
}
