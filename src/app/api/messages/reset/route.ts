import { NextResponse } from 'next/server';
import { resetResponseTracking, setResetCutoff } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    // Get optional cutoff timestamp from request body
    let cutoffTimestamp = Date.now();
    try {
      const body = await request.json();
      if (body.cutoff) {
        cutoffTimestamp = body.cutoff;
      }
    } catch {
      // No body or invalid JSON, use current time
    }

    // Reset response tracking in Supabase
    await resetResponseTracking();
    
    // Set the reset cutoff timestamp in Supabase
    await setResetCutoff(cutoffTimestamp);
    
    console.log('✅ Response tracking reset, cutoff set to:', new Date(cutoffTimestamp).toISOString());

    return NextResponse.json({
      success: true,
      resetAt: new Date().toISOString(),
      cutoff: cutoffTimestamp,
    });
  } catch (error) {
    console.error('Error resetting response tracking:', error);
    return NextResponse.json(
      { error: 'Failed to reset response tracking' },
      { status: 500 }
    );
  }
}
