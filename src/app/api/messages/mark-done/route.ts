import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

/**
 * API endpoint to mark messages as "done" (status = 'responded')
 * This should be called whenever a response is sent via any channel
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      messageId, 
      externalId, 
      channel, 
      sender, 
      subject, 
      receivedAt,
      responseMethod = 'manual' // 'manual', 'auto', 'delegated'
    } = body;

    if (!messageId && !externalId) {
      return NextResponse.json(
        { error: 'messageId or externalId required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    const respondedAt = new Date();
    const id = externalId || messageId;

    // First, try to find existing message
    const { data: existingMessage } = await supabase
      .from('messages')
      .select('*')
      .eq('external_id', id)
      .single();

    let responseTimeMinutes: number | null = null;

    if (existingMessage) {
      // Calculate response time
      const msgReceivedAt = new Date(existingMessage.received_at);
      responseTimeMinutes = Math.floor((respondedAt.getTime() - msgReceivedAt.getTime()) / 60000);

      // Update existing message
      const { error: updateError } = await supabase
        .from('messages')
        .update({
          responded_at: respondedAt.toISOString(),
          response_time_minutes: responseTimeMinutes,
          handled_by: responseMethod,
        })
        .eq('external_id', id);

      if (updateError) {
        console.error('Error updating message status:', updateError);
        return NextResponse.json(
          { error: 'Failed to update message status' },
          { status: 500 }
        );
      }
    } else if (receivedAt) {
      // Create new message record (for messages that weren't tracked initially)
      const msgReceivedAt = new Date(receivedAt);
      responseTimeMinutes = Math.floor((respondedAt.getTime() - msgReceivedAt.getTime()) / 60000);

      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          external_id: id,
          channel: channel || 'unknown',
          sender: sender || 'Unknown',
          subject: subject,
          received_at: receivedAt,
          responded_at: respondedAt.toISOString(),
          response_time_minutes: responseTimeMinutes,
          requires_response: true,
          handled_by: responseMethod,
        });

      if (insertError) {
        console.error('Error inserting message:', insertError);
        return NextResponse.json(
          { error: 'Failed to create message record' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Message not found and no receivedAt provided' },
        { status: 404 }
      );
    }

    console.log(`✅ Marked message ${id} as done (${responseTimeMinutes} min, ${responseMethod})`);

    return NextResponse.json({
      success: true,
      messageId: id,
      respondedAt: respondedAt.toISOString(),
      responseTimeMinutes,
      responseMethod,
    });
  } catch (error) {
    console.error('Error marking message as done:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}