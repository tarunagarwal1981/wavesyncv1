'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function completeChecklistItem(itemId: string, notes?: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('signoff_checklist_items')
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
      notes: notes || null
    })
    .eq('id', itemId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to complete checklist item');
  }

  revalidatePath('/signoff');
}

export async function uncompleteChecklistItem(itemId: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('signoff_checklist_items')
    .update({
      is_completed: false,
      completed_at: null
    })
    .eq('id', itemId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to uncomplete checklist item');
  }

  revalidatePath('/signoff');
}

export async function updateChecklistItemNotes(itemId: string, notes: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('signoff_checklist_items')
    .update({ notes })
    .eq('id', itemId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to update notes');
  }

  revalidatePath('/signoff');
}

export async function addCustomChecklistItem(
  assignmentId: string, 
  itemText: string, 
  category: string, 
  description?: string
): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Get the next order index for this category
  const { data: maxOrder } = await supabase
    .from('signoff_checklist_items')
    .select('order_index')
    .eq('assignment_id', assignmentId)
    .eq('category', category)
    .eq('user_id', user.id)
    .order('order_index', { ascending: false })
    .limit(1);

  const nextOrderIndex = (maxOrder?.[0]?.order_index || 0) + 1;

  const { error } = await supabase
    .from('signoff_checklist_items')
    .insert({
      user_id: user.id,
      assignment_id: assignmentId,
      item_text: `Custom: ${itemText}`,
      category,
      is_completed: false,
      notes: description || null,
      order_index: nextOrderIndex,
      is_custom: true
    });

  if (error) {
    throw new Error('Failed to add custom checklist item');
  }

  revalidatePath('/signoff');
}

export async function completeCategoryItems(assignmentId: string, category: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('signoff_checklist_items')
    .update({
      is_completed: true,
      completed_at: new Date().toISOString()
    })
    .eq('assignment_id', assignmentId)
    .eq('category', category)
    .eq('user_id', user.id)
    .eq('is_completed', false);

  if (error) {
    throw new Error('Failed to complete category items');
  }

  revalidatePath('/signoff');
}

export async function reorderChecklistItems(
  assignmentId: string, 
  itemIds: string[]
): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Update order index for each item
  const updates = itemIds.map((itemId, index) => ({
    id: itemId,
    order_index: index + 1
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from('signoff_checklist_items')
      .update({ order_index: update.order_index })
      .eq('id', update.id)
      .eq('user_id', user.id);

    if (error) {
      throw new Error('Failed to reorder items');
    }
  }

  revalidatePath('/signoff');
}

export async function deleteCustomChecklistItem(itemId: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Only allow deletion of custom items
  const { data: item } = await supabase
    .from('signoff_checklist_items')
    .select('item_text')
    .eq('id', itemId)
    .eq('user_id', user.id)
    .single();

  if (!item?.item_text?.startsWith('Custom:')) {
    throw new Error('Cannot delete default checklist items');
  }

  const { error } = await supabase
    .from('signoff_checklist_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to delete checklist item');
  }

  revalidatePath('/signoff');
}

export async function uploadAttachment(
  itemId: string, 
  file: File
): Promise<string> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Upload file to Supabase Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `signoff-attachments/${itemId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (uploadError) {
    throw new Error('Failed to upload attachment');
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);

  // Create attachment record (you'll need to add this table to your schema)
  // For now, return the URL
  return publicUrl;
}
