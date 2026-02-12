import { NextResponse } from 'next/server';
import { markResponded, upsertMessages, DbMessage } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messageId, externalId, receivedAt, channel, sender, subject } = body;

    if (!messageId && !externalId) {
      return NextResponse.json(
        { error: 'messageId or externalId required' },
        { status: 400 }
      );
    }

    const respondedAt = new Date();
    const id = externalId || messageId;

    // First, ensure the message exists in Supabase (upsert it)
    if (receivedAt) {
      const dbMessage: DbMessage = {
        external_id: id,
        channel: channel || 'unknown',
        sender: sender,
        subject: subject,
        received_at: receivedAt,
        requires_response: true,
      };
      await upsertMessages([dbMessage]);
    }

    // Mark as responded (pass all details so it can create if needed)
    await markResponded(id, respondedAt, receivedAt, channel, sender, subject);

    // Calculate response time for the response
    const receivedTime = receivedAt ? new Date(receivedAt).getTime() : Date.now();
    const responseTimeMinutes = Math.floor((respondedAt.getTime() - receivedTime) / 60000);

    console.log(`✅ Marked message ${id} as responded (${responseTimeMinutes} min)`);

    return NextResponse.json({
      success: true,
      messageId: id,
      respondedAt: respondedAt.toISOString(),
      responseTimeMinutes,
    });
  } catch (error) {
    console.error('Error marking message responded:', error);
    return NextResponse.json(
      { error: 'Failed to mark message as responded' },
      { status: 500 }
    );
  }
}
