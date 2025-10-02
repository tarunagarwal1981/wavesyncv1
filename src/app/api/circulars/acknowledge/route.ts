import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get circular ID from request body
    const { circularId } = await request.json();
    
    if (!circularId) {
      return NextResponse.json(
        { error: 'Circular ID is required' },
        { status: 400 }
      );
    }

    // Verify the circular exists and requires acknowledgment
    const { data: circular, error: circularError } = await supabase
      .from('circulars')
      .select('id, requires_acknowledgment')
      .eq('id', circularId)
      .single();

    if (circularError || !circular) {
      return NextResponse.json(
        { error: 'Circular not found' },
        { status: 404 }
      );
    }

    if (!circular.requires_acknowledgment) {
      return NextResponse.json(
        { error: 'This circular does not require acknowledgment' },
        { status: 400 }
      );
    }

    // Check if user has already acknowledged
    const { data: existingAcknowledgment } = await supabase
      .from('circular_acknowledgments')
      .select('id, acknowledged_at')
      .eq('circular_id', circularId)
      .eq('user_id', user.id)
      .single();

    if (existingAcknowledgment?.acknowledged_at) {
      return NextResponse.json(
        { 
          message: 'Already acknowledged',
          acknowledgedAt: existingAcknowledgment.acknowledged_at
        },
        { status: 200 }
      );
    }

    // Create or update acknowledgment
    const now = new Date().toISOString();
    
    if (existingAcknowledgment) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('circular_acknowledgments')
        .update({ 
          acknowledged_at: now,
          read_at: now // Auto-mark as read when acknowledging
        })
        .eq('id', existingAcknowledgment.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new acknowledgment record
      const { error: insertError } = await supabase
        .from('circular_acknowledgments')
        .insert({
          circular_id: circularId,
          user_id: user.id,
          acknowledged_at: now,
          read_at: now // Auto-mark as read when acknowledging
        });

      if (insertError) {
        throw insertError;
      }
    }

    return NextResponse.json({
      message: 'Circular acknowledged successfully',
      acknowledgedAt: now
    });

  } catch (error) {
    console.error('Error acknowledging circular:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge circular' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get circular ID from query params
    const { searchParams } = new URL(request.url);
    const circularId = searchParams.get('circularId');
    
    if (!circularId) {
      return NextResponse.json(
        { error: 'Circular ID is required' },
        { status: 400 }
      );
    }

    // Get acknowledgment status
    const { data: acknowledgment, error: acknowledgmentError } = await supabase
      .from('circular_acknowledgments')
      .select('acknowledged_at, read_at')
      .eq('circular_id', circularId)
      .eq('user_id', user.id)
      .single();

    if (acknowledgmentError && acknowledgmentError.code !== 'PGRST116') {
      throw acknowledgmentError;
    }

    return NextResponse.json({
      isAcknowledged: !!acknowledgment?.acknowledged_at,
      isRead: !!acknowledgment?.read_at,
      acknowledgedAt: acknowledgment?.acknowledged_at,
      readAt: acknowledgment?.read_at
    });

  } catch (error) {
    console.error('Error checking acknowledgment status:', error);
    return NextResponse.json(
      { error: 'Failed to check acknowledgment status' },
      { status: 500 }
    );
  }
}
