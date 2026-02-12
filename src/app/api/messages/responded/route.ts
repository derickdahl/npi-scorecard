import { NextResponse } from 'next/server';
import { createServerClient, getResetCutoff } from '@/lib/supabase-server';

// GET - Fetch all responded message data and reset cutoff from Supabase
export async function GET() {
  try {
    const supabase = createServerClient();
    
    if (!supabase) {
      console.log('⚠️ Supabase not configured, returning empty');
      return NextResponse.json({ responded: {}, resetCutoff: null });
    }

    // Fetch responded messages
    const { data, error } = await supabase
      .from('messages')
      .select('external_id, responded_at')
      .not('responded_at', 'is', null);

    if (error) {
      console.error('Error fetching responded messages:', error);
      return NextResponse.json({ responded: {}, resetCutoff: null });
    }

    // Convert to { messageId: timestamp } format
    const responded: Record<string, number> = {};
    for (const row of data || []) {
      if (row.external_id && row.responded_at) {
        responded[row.external_id] = new Date(row.responded_at).getTime();
      }
    }

    // Fetch reset cutoff
    const resetCutoff = await getResetCutoff();

    console.log(`✅ Fetched ${Object.keys(responded).length} responded messages from Supabase`);

    return NextResponse.json({ responded, resetCutoff });
  } catch (error) {
    console.error('Error in responded messages API:', error);
    return NextResponse.json({ responded: {}, resetCutoff: null });
  }
}
