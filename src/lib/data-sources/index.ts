import { UnifiedMessage, SourceMetrics, MessageSource } from '../supabase';
import { getAllMicrosoftMessages } from './microsoft-graph';
import { getAllSlackMessages } from './slack';
import { getICloudEmails } from './icloud-mail';
import { upsertMessages, DbMessage } from '../supabase-server';
// DISABLED: These run on Mac Studio which has Clawdbot's accounts, not Derick's
// import { getAlliMessages } from './imessage';
// import { getAllAppleMailMessages } from './apple-mail';

export async function getAllMessages(): Promise<UnifiedMessage[]> {
  try {
    console.log('Fetching messages from all sources...');
    
    // Fetch from enabled sources in parallel
    // NOTE: iMessage and Apple Mail disabled - Mac Studio has Clawdbot's accounts
    // To enable: run dashboard on Derick's MBP or set up account access
    const [microsoftMessages, slackMessages, icloudMessages] = await Promise.allSettled([
      getAllMicrosoftMessages(),
      getAllSlackMessages(),
      getICloudEmails(),
    ]);

    const allMessages: UnifiedMessage[] = [];

    // Process Microsoft messages (Derick's Sonance account)
    if (microsoftMessages.status === 'fulfilled') {
      allMessages.push(...microsoftMessages.value);
      console.log(`✅ Microsoft Graph: ${microsoftMessages.value.length} messages`);
    } else {
      const errMsg = microsoftMessages.reason instanceof Error 
        ? microsoftMessages.reason.message 
        : String(microsoftMessages.reason);
      console.error('❌ Microsoft Graph failed:', errMsg);
      console.error('Full error:', microsoftMessages.reason);
    }

    // Process Slack messages
    if (slackMessages.status === 'fulfilled') {
      allMessages.push(...slackMessages.value);
      console.log(`✅ Slack: ${slackMessages.value.length} messages`);
    } else {
      const errMsg = slackMessages.reason instanceof Error 
        ? slackMessages.reason.message 
        : String(slackMessages.reason);
      console.error('❌ Slack failed:', errMsg);
    }

    // Process iCloud email (personal)
    if (icloudMessages.status === 'fulfilled') {
      allMessages.push(...icloudMessages.value);
      console.log(`✅ iCloud Mail: ${icloudMessages.value.length} messages`);
    } else {
      const errMsg = icloudMessages.reason instanceof Error 
        ? icloudMessages.reason.message 
        : String(icloudMessages.reason);
      console.error('❌ iCloud Mail failed:', errMsg);
    }

    // iMessage DISABLED - shows Clawdbot's inbox, not Derick's
    // Apple Mail DISABLED - same issue

    // Remove duplicates and sort by received date
    const uniqueMessages = allMessages.filter((message, index, self) => 
      index === self.findIndex(m => m.id === message.id)
    );

    const sortedMessages = uniqueMessages.sort(
      (a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
    );

    console.log(`📧 Total unique messages: ${sortedMessages.length}`);
    
    // Store messages in Supabase for response tracking
    const dbMessages: DbMessage[] = sortedMessages.map(m => ({
      channel: m.source,
      external_id: m.external_id || m.id,
      sender: m.sender_name,
      sender_email: m.sender_email,
      subject: m.subject,
      received_at: m.received_at,
      requires_response: m.is_direct_message, // DMs require response, channels maybe not
      thread_id: m.thread_id,
    }));
    
    // Fire and forget - don't block on database
    upsertMessages(dbMessages).catch(err => {
      console.error('Background message upsert failed:', err);
    });
    
    return sortedMessages;

  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return [];
  }
}

export function calculateMetrics(messages: UnifiedMessage[]): SourceMetrics[] {
  const sources: MessageSource[] = ["slack", "teams_mention", "teams_dm", "email_work", "email_personal", "imessage"];

  return sources.map((source) => {
    const sourceMessages = messages.filter((m) => m.source === source);
    const respondedMessages = sourceMessages.filter((m) => m.status === "responded");
    const pendingMessages = sourceMessages.filter((m) => m.status !== "responded");

    const avgResponseTime = respondedMessages.length > 0
      ? respondedMessages.reduce((sum, m) => sum + (m.response_time_minutes || 0), 0) / respondedMessages.length
      : 0;

    // Find oldest pending message
    const oldestPending = pendingMessages.length > 0
      ? Math.max(...pendingMessages.map((m) => {
          const received = new Date(m.received_at).getTime();
          return Math.floor((Date.now() - received) / 60000);
        }))
      : undefined;

    return {
      source,
      total_received: sourceMessages.length,
      total_responded: respondedMessages.length,
      avg_response_time_minutes: avgResponseTime,
      pending_count: pendingMessages.length,
      oldest_pending_minutes: oldestPending,
    };
  });
}

export function getSummaryMetrics(messages: UnifiedMessage[]) {
  const responded = messages.filter((m) => m.status === "responded");
  const pending = messages.filter((m) => m.status !== "responded");

  const avgResponseTime = responded.length > 0
    ? responded.reduce((sum, m) => sum + (m.response_time_minutes || 0), 0) / responded.length
    : 0;

  const under30 = responded.filter((m) => (m.response_time_minutes || 0) <= 30).length;
  const under2Hours = responded.filter((m) => (m.response_time_minutes || 0) <= 120).length;
  const over2Hours = responded.filter((m) => (m.response_time_minutes || 0) > 120).length;

  return {
    totalMessages: messages.length,
    pendingMessages: pending.length,
    respondedMessages: responded.length,
    avgResponseTime,
    responseRate: messages.length > 0 ? (responded.length / messages.length) * 100 : 0,
    under30MinCount: under30,
    under2HoursCount: under2Hours,
    over2HoursCount: over2Hours,
  };
}