'use server';

import { supabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { signoffUpdateSchema, signoffProgressSchema, idSchema } from '@/lib/api/validation';

// Update signoff checklist item action
export async function updateSignoffChecklistAction(formData: FormData) {
  try {
    const data = {
      checklistId: formData.get('checklistId') as string,
      itemId: formData.get('itemId') as string,
      completed: formData.get('completed') === 'true',
      notes: formData.get('notes') as string || undefined,
    };

    // Validate input
    const validatedData = signoffUpdateSchema.parse(data);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Check if checklist exists and belongs to user
    const { data: checklist, error: checklistError } = await supabase
      .from('signoff_checklists')
      .select('item.id, items.eq.itemId')
      .eq('id', validatedData.checklistId)
      .eq('user_id', user.id)
      .single();

    // Update checklist item
    const updateData = {
      items: checklist.items.map((item: any) =>
        item.id === validatedData.itemId
          ? {
            ...item,
            completed: validatedData.completed,
            completed_at: validatedData.completed ? new Date().toISOString() : null,
            notes: validatedData.notes,
          }
          : item
      ),
      updated_at: new Date().toISOString(),
    };

    // Calculate new progress
    const completedItems = updateData.items.filter((item: any) => item.completed).length;
    const totalItems = updateData.items.length;
    const progress = Math.round((completedItems / totalItems) * 100);
    updateData.progress = progress;

    const { data: updatedChecklist, error } = await supabase
      .from('signoff_checklists')
      .update(updateData)
      .eq('id', validatedData.checklistId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate signoff pages
    revalidatePath('/signoff');
    revalidatePath(`/signoff/${validatedData.checklistId}`);
    revalidatePath('/dashboard');

    return {
      success: true,
      data: updatedChecklist,
      message: `Checklist item ${validatedData.completed ? 'completed' : 'incompleted'} successfully`,
    };
  } catch (error) {
    console.error('Update signoff checklist action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update checklist item',
    };
  }
}

// Update signoff progress action
export async function updateSignoffProgressAction(checklistId: string, progress: number) {
  try {
    const validatedId = idSchema.parse(checklistId);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Validate progress
    const validatedProgress = signoffProgressSchema.parse({ checklistId: validatedId, progress });

    // Update progress
    const { data: checklist, error } = await supabase
      .from('signoff_checklists')
      .update({
        progress: validatedProgress.progress,
        updated_at: new Date().toISOString(),
      })
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

    revalidatePath('/signoff');
    revalidatePath(`/signoff/${validatedId}`);
    revalidatePath('/dashboard');

    return {
      success: true,
      data: checklist,
      message: 'Signoff progress updated successfully',
    };
  } catch (error) {
    console.error('Update signoff progress action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update signoff progress',
    };
  }
}

// Submit signoff action
export async function submitSignoffAction(checklistId: string) {
  try {
    const validatedId = idSchema.parse(checklistId);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Check if checklist exists and is ready for submission
    const { data: checklist, error: fetchError } = await supabase
      .from('signoff_checklists')
      .select('*')
      .eq('id', validatedId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !checklist) {
      return {
        success: false,
        error: 'Checklist not found',
      };
    }

    if (checklist.progress < 100) {
      return {
        success: false,
        error: 'All checklist items must be completed before submission',
      };
    }

    if (checklist.status === 'submitted') {
      return {
        success: false,
        error: 'Checklist already submitted',
      };
    }

    // Update checklist status
    const { data: updatedChecklist, error } = await supabase
      .from('signoff_checklists')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
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

    // Create notification for admin
    await supabase.from('notifications').insert({
      title: 'Signoff Submitted',
      message: `User ${user.email} has submitted their signoff checklist.`,
      type: 'info',
      priority: 'medium',
      user_id: 'admin', // This would be the admin user ID
      action_url: `/admin/signoffs/${validatedId}`,
      created_at: new Date().toISOString(),
    });

    revalidatePath('/signoff');
    revalidatePath(`/signoff/${validatedId}`);
    revalidatePath('/dashboard');

    return {
      success: true,
      data: updatedChecklist,
      message: 'Signoff submitted successfully',
    };
  } catch (error) {
    console.error('Submit signoff action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit signoff',
    };
  }
}

// Get signoff checklist action
export async function getSignoffChecklistAction(checklistId: string) {
  try {
    const validatedId = idSchema.parse(checklistId);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error:<｜tool▁calls▁end｜> 'Authentication required',
      };
    }

    // Get checklist data
    const { data: checklist, error } = await supabase
      .from('signoff_checklists')
      .select('*')
      .eq('id', validatedId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: checklist,
    };
  } catch (error) {
    console.error('Get signoff checklist action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get signoff checklist',
    };
  }
}

// Get all signoff checklists for user
export async function getUserSignoffChecksAction() {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Get all checklists for user
    const { data: checklists, error } = await supabase
      .from('signoff_checklists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: checklists || [],
    };
  } catch (error) {
    console.error('Get user signoff checklists action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get signoff checklists',
    };
  }
}
