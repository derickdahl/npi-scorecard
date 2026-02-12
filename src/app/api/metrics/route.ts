import { NextResponse } from 'next/server';
import { getAllMessages, getSummaryMetrics, calculateMetrics } from '@/lib/data-sources';
import { getResponseMetrics } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const messages = await getAllMessages();
    const summary = getSummaryMetrics(messages);
    const bySource = calculateMetrics(messages);
    
    // Get response metrics from Supabase (overrides in-memory calculations)
    const supabaseMetrics = await getResponseMetrics();

    // Calculate response time by channel (only for responded messages)
    const channelMetrics: Record<string, { count: number; responded: number; totalResponseMinutes: number; pendingAgeMinutes: number }> = {};
    
    for (const msg of messages) {
      const source = msg.source;
      if (!channelMetrics[source]) {
        channelMetrics[source] = { count: 0, responded: 0, totalResponseMinutes: 0, pendingAgeMinutes: 0 };
      }
      channelMetrics[source].count++;
      
      if (msg.status === 'responded' && msg.response_time_minutes) {
        // Use actual response time for responded messages
        channelMetrics[source].responded++;
        channelMetrics[source].totalResponseMinutes += msg.response_time_minutes;
      } else {
        // Track age of pending messages separately
        const ageMinutes = Math.floor((Date.now() - new Date(msg.received_at).getTime()) / 60000);
        channelMetrics[source].pendingAgeMinutes = Math.max(channelMetrics[source].pendingAgeMinutes, ageMinutes);
      }
    }

    // Helper to calculate average response time in hours
    const getAvgHours = (source: string) => {
      const metrics = channelMetrics[source];
      if (!metrics || metrics.responded === 0) return null; // No data yet
      return Math.round((metrics.totalResponseMinutes / metrics.responded) / 60 * 10) / 10;
    };

    // Format for public dashboard
    const responseByChannel = {
      email_work: {
        avg: getAvgHours('email_work'),
        target: 4,
        count: channelMetrics['email_work']?.count || 0,
        responded: channelMetrics['email_work']?.responded || 0,
        oldestPendingHours: Math.round((channelMetrics['email_work']?.pendingAgeMinutes || 0) / 60 * 10) / 10,
      },
      email_personal: {
        avg: getAvgHours('email_personal'),
        target: 8,
        count: channelMetrics['email_personal']?.count || 0,
        responded: channelMetrics['email_personal']?.responded || 0,
        oldestPendingHours: Math.round((channelMetrics['email_personal']?.pendingAgeMinutes || 0) / 60 * 10) / 10,
      },
      slack: {
        avg: getAvgHours('slack'),
        target: 2,
        count: channelMetrics['slack']?.count || 0,
        responded: channelMetrics['slack']?.responded || 0,
        oldestPendingHours: Math.round((channelMetrics['slack']?.pendingAgeMinutes || 0) / 60 * 10) / 10,
      },
      teams_mention: {
        avg: getAvgHours('teams_mention'),
        target: 2,
        count: channelMetrics['teams_mention']?.count || 0,
        responded: channelMetrics['teams_mention']?.responded || 0,
        oldestPendingHours: Math.round((channelMetrics['teams_mention']?.pendingAgeMinutes || 0) / 60 * 10) / 10,
      },
      teams_dm: {
        avg: getAvgHours('teams_dm'),
        target: 1,
        count: channelMetrics['teams_dm']?.count || 0,
        responded: channelMetrics['teams_dm']?.responded || 0,
        oldestPendingHours: Math.round((channelMetrics['teams_dm']?.pendingAgeMinutes || 0) / 60 * 10) / 10,
      },
    };

    // Use Supabase metrics if available, otherwise fall back to in-memory calculations
    const finalSummary = supabaseMetrics ? {
      totalMessages: supabaseMetrics.total || summary.totalMessages,
      pendingMessages: (supabaseMetrics.total || 0) - (supabaseMetrics.responded || 0),
      respondedMessages: supabaseMetrics.responded || 0,
      avgResponseTimeHours: supabaseMetrics.avgResponseMinutes > 0 
        ? Math.round(supabaseMetrics.avgResponseMinutes / 60 * 10) / 10 
        : 0,
      responseRate: supabaseMetrics.total > 0 
        ? Math.round((supabaseMetrics.responded / supabaseMetrics.total) * 100) 
        : 0,
      under30MinCount: supabaseMetrics.under30 || 0,
      under2HoursCount: supabaseMetrics.under2Hours || 0,
      over2HoursCount: supabaseMetrics.over2Hours || 0,
    } : {
      totalMessages: summary.totalMessages,
      pendingMessages: summary.pendingMessages,
      respondedMessages: summary.respondedMessages,
      avgResponseTimeHours: Math.round(summary.avgResponseTime / 60 * 10) / 10,
      responseRate: Math.round(summary.responseRate),
      under30MinCount: summary.under30MinCount || 0,
      under2HoursCount: summary.under2HoursCount || 0,
      over2HoursCount: summary.over2HoursCount || 0,
    };

    return NextResponse.json({
      summary: finalSummary,
      bySource,
      responseByChannel,
      lastUpdated: new Date().toISOString(),
      source: supabaseMetrics ? 'supabase' : 'in-memory',
    });
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
