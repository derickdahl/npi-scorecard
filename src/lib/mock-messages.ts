import { UnifiedMessage, MessageSource, SourceMetrics } from "./supabase";

// Helper to generate dates relative to now
const minutesAgo = (mins: number) => new Date(Date.now() - mins * 60000).toISOString();
const hoursAgo = (hours: number) => minutesAgo(hours * 60);

export const mockMessages: UnifiedMessage[] = [
  // Slack messages
  {
    id: "slack-1",
    source: "slack",
    sender_name: "Sarah Chen",
    sender_email: "sarah.chen@sonance.com",
    preview: "Hey Derick, quick question about the Q1 projections. Can we sync for 15 minutes today?",
    received_at: minutesAgo(5),
    status: "unread",
    priority: "normal",
    is_direct_message: true,
    channel_name: undefined,
    deep_link: "slack://channel?team=T123&id=D456",
  },
  {
    id: "slack-2",
    source: "slack",
    sender_name: "Mike Johnson",
    sender_email: "mike.j@sonance.com",
    preview: "The new product spec is ready for your review. I've attached the PDF and marked the sections that need your input.",
    received_at: minutesAgo(23),
    status: "unread",
    priority: "high",
    is_direct_message: true,
    deep_link: "slack://channel?team=T123&id=D789",
  },
  {
    id: "slack-3",
    source: "slack",
    sender_name: "Emily Rodriguez",
    sender_email: "emily.r@sonance.com",
    preview: "Thanks for the feedback on the marketing proposal! I'll incorporate those changes and send the updated version by EOD.",
    received_at: hoursAgo(2),
    read_at: hoursAgo(1.5),
    responded_at: hoursAgo(1),
    response_time_minutes: 60,
    status: "responded",
    priority: "normal",
    is_direct_message: true,
    deep_link: "slack://channel?team=T123&id=D101",
  },
  {
    id: "slack-4",
    source: "slack",
    sender_name: "Alex Kim",
    preview: "@derick The client meeting has been moved to 3pm. Please confirm you can make it.",
    received_at: minutesAgo(45),
    status: "read",
    priority: "urgent",
    is_direct_message: false,
    channel_name: "executive-team",
    deep_link: "slack://channel?team=T123&id=C102",
  },

  // Teams @ mentions
  {
    id: "teams-mention-1",
    source: "teams_mention",
    sender_name: "David Park",
    sender_email: "david.park@sonance.com",
    preview: "@Derick Dahl can you approve the budget request for the audio lab expansion? We need sign-off by Friday.",
    received_at: minutesAgo(15),
    status: "unread",
    priority: "high",
    is_direct_message: false,
    channel_name: "Operations",
    deep_link: "msteams://teams.microsoft.com/l/message/...",
  },
  {
    id: "teams-mention-2",
    source: "teams_mention",
    sender_name: "Lisa Thompson",
    preview: "@Derick Dahl FYI - the investor deck has been updated with Q4 numbers",
    received_at: hoursAgo(1),
    read_at: minutesAgo(45),
    status: "read",
    priority: "normal",
    is_direct_message: false,
    channel_name: "Finance",
    deep_link: "msteams://teams.microsoft.com/l/message/...",
  },

  // Teams DMs
  {
    id: "teams-dm-1",
    source: "teams_dm",
    sender_name: "Jennifer Walsh",
    sender_email: "jennifer.walsh@sonance.com",
    preview: "Hi Derick, I wanted to discuss the new hire onboarding process. Do you have 30 minutes this week?",
    received_at: minutesAgo(38),
    status: "unread",
    priority: "normal",
    is_direct_message: true,
    deep_link: "msteams://teams.microsoft.com/l/chat/...",
  },
  {
    id: "teams-dm-2",
    source: "teams_dm",
    sender_name: "Robert Martinez",
    preview: "The partnership agreement is ready for your signature. I've scheduled a DocuSign for you.",
    received_at: hoursAgo(3),
    read_at: hoursAgo(2.5),
    responded_at: hoursAgo(2),
    response_time_minutes: 60,
    status: "responded",
    priority: "high",
    is_direct_message: true,
    deep_link: "msteams://teams.microsoft.com/l/chat/...",
  },

  // Work Email (derickd@sonance.com)
  {
    id: "email-work-1",
    source: "email_work",
    sender_name: "Amanda Foster",
    sender_email: "amanda.foster@audiopartners.com",
    subject: "Re: Partnership Proposal - Sonance x Audio Partners",
    preview: "Dear Derick, Thank you for taking the time to review our proposal. We're excited about the potential collaboration and would love to schedule a follow-up call...",
    received_at: minutesAgo(12),
    status: "unread",
    priority: "high",
    is_direct_message: true,
    deep_link: "mailto:amanda.foster@audiopartners.com",
  },
  {
    id: "email-work-2",
    source: "email_work",
    sender_name: "Chris Williams",
    sender_email: "chris.w@sonance.com",
    subject: "Weekly Engineering Update",
    preview: "Hi Derick, Here's the weekly engineering update: Sprint velocity is up 15%, we shipped the new IPORT feature ahead of schedule...",
    received_at: hoursAgo(4),
    read_at: hoursAgo(3),
    responded_at: hoursAgo(2.5),
    response_time_minutes: 90,
    status: "responded",
    priority: "normal",
    is_direct_message: true,
    deep_link: "mailto:chris.w@sonance.com",
  },
  {
    id: "email-work-3",
    source: "email_work",
    sender_name: "Board Secretary",
    sender_email: "board@sonance.com",
    subject: "ACTION REQUIRED: Board Meeting Materials",
    preview: "Dear Board Members, Please review the attached materials for our upcoming Q1 board meeting. Your feedback is requested by...",
    received_at: hoursAgo(1.5),
    status: "unread",
    priority: "urgent",
    is_direct_message: true,
    deep_link: "mailto:board@sonance.com",
  },

  // Personal Email (derickdahl@me.com)
  {
    id: "email-personal-1",
    source: "email_personal",
    sender_name: "John Dahl",
    sender_email: "johnd@gmail.com",
    subject: "Family reunion planning",
    preview: "Hey bro! Mom wanted me to reach out about the family reunion in July. We're thinking Lake Tahoe again...",
    received_at: hoursAgo(5),
    read_at: hoursAgo(4),
    status: "read",
    priority: "low",
    is_direct_message: true,
    deep_link: "mailto:johnd@gmail.com",
  },
  {
    id: "email-personal-2",
    source: "email_personal",
    sender_name: "Dr. Smith's Office",
    sender_email: "appointments@drsmith.com",
    subject: "Appointment Reminder",
    preview: "This is a reminder of your appointment scheduled for next Tuesday at 2:00 PM. Please arrive 15 minutes early...",
    received_at: hoursAgo(8),
    read_at: hoursAgo(7),
    responded_at: hoursAgo(6),
    response_time_minutes: 120,
    status: "responded",
    priority: "normal",
    is_direct_message: true,
    deep_link: "mailto:appointments@drsmith.com",
  },

  // Apple Messages
  {
    id: "imessage-1",
    source: "imessage",
    sender_name: "Katie Dahl",
    preview: "Don't forget dinner at mom's tonight at 7! She's making your favorite.",
    received_at: minutesAgo(8),
    status: "unread",
    priority: "normal",
    is_direct_message: true,
    deep_link: "sms:+15551234567",
  },
  {
    id: "imessage-2",
    source: "imessage",
    sender_name: "Tom Harris",
    preview: "Golf Sunday? Tee time at 8am if you're in.",
    received_at: hoursAgo(6),
    read_at: hoursAgo(5),
    responded_at: hoursAgo(4.5),
    response_time_minutes: 90,
    status: "responded",
    priority: "low",
    is_direct_message: true,
    deep_link: "sms:+15559876543",
  },
  {
    id: "imessage-3",
    source: "imessage",
    sender_name: "Steve Morrison",
    preview: "Hey Derick, saw the Sonance news - congrats! Let's catch up over coffee soon.",
    received_at: minutesAgo(52),
    status: "read",
    priority: "normal",
    is_direct_message: true,
    deep_link: "sms:+15555555555",
  },
];

// Calculate metrics from mock data
export function calculateMockMetrics(): SourceMetrics[] {
  const sources: MessageSource[] = ["slack", "teams_mention", "teams_dm", "email_work", "email_personal", "imessage"];

  return sources.map((source) => {
    const sourceMessages = mockMessages.filter((m) => m.source === source);
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

export function getSummaryMetrics() {
  const responded = mockMessages.filter((m) => m.status === "responded");
  const pending = mockMessages.filter((m) => m.status !== "responded");

  const avgResponseTime = responded.length > 0
    ? responded.reduce((sum, m) => sum + (m.response_time_minutes || 0), 0) / responded.length
    : 0;

  const under30 = responded.filter((m) => (m.response_time_minutes || 0) <= 30).length;
  const under2Hours = responded.filter((m) => (m.response_time_minutes || 0) <= 120).length;
  const over2Hours = responded.filter((m) => (m.response_time_minutes || 0) > 120).length;

  return {
    totalMessages: mockMessages.length,
    pendingMessages: pending.length,
    respondedMessages: responded.length,
    avgResponseTime,
    responseRate: mockMessages.length > 0 ? (responded.length / mockMessages.length) * 100 : 0,
    under30MinCount: under30,
    under2HoursCount: under2Hours,
    over2HoursCount: over2Hours,
  };
}
