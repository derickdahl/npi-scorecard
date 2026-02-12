import { UnifiedMessage, MessageSource } from '../supabase';
import { graphCall as serverGraphCall, isConfigured } from './microsoft-auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const execAsync = promisify(exec);

interface GraphMessage {
  id: string;
  subject?: string;
  bodyPreview?: string;
  from?: {
    emailAddress?: {
      name?: string;
      address?: string;
    };
  };
  receivedDateTime?: string;
  isRead?: boolean;
  webLink?: string;
}

interface GraphChat {
  id: string;
  topic?: string;
  chatType?: string;
  members?: Array<{
    displayName?: string;
    email?: string;
  }>;
  lastMessagePreview?: {
    body?: {
      content?: string;
    };
    from?: {
      user?: {
        displayName?: string;
        userPrincipalName?: string;
      };
    };
    createdDateTime?: string;
  };
  webUrl?: string;
}

interface GraphChatMessage {
  id: string;
  body?: {
    content?: string;
  };
  from?: {
    user?: {
      displayName?: string;
      userPrincipalName?: string;
    };
  };
  createdDateTime?: string;
  chatId?: string;
  mentions?: Array<{
    mentioned?: {
      user?: {
        displayName?: string;
        userPrincipalName?: string;
      };
    };
  }>;
}

// Check if running locally with msgraph.sh available
const LOCAL_SCRIPT = join(homedir(), '.clawdbot', 'scripts', 'msgraph.sh');
let isLocalMode = false;
try {
  isLocalMode = existsSync(LOCAL_SCRIPT);
} catch {
  isLocalMode = false;
}

async function callMsGraph(endpoint: string): Promise<any> {
  // Clean the endpoint - remove shell escapes if present
  const cleanEndpoint = endpoint.replace(/\\\$/g, '$');
  
  console.log(`[Microsoft Graph] Mode: ${isLocalMode ? 'local' : 'server'}, Endpoint: ${cleanEndpoint}`);
  
  // Use local script if available (Mac Studio), otherwise use server-side auth (Vercel)
  if (isLocalMode) {
    try {
      const { stdout } = await execAsync(`${LOCAL_SCRIPT} call "${endpoint}"`);
      return JSON.parse(stdout);
    } catch (error) {
      console.error('Local Microsoft Graph API error:', error);
      throw error;
    }
  } else if (isConfigured()) {
    console.log('[Microsoft Graph] Using server-side auth');
    return serverGraphCall(cleanEndpoint);
  } else {
    console.log('[Microsoft Graph] Not configured - missing env vars');
    throw new Error('Microsoft Graph not configured. Set environment variables or ensure msgraph.sh is available.');
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

// Patterns to identify ads/newsletters/marketing/automated emails
const AD_PATTERNS = [
  /unsubscribe/i,
  /view in browser/i,
  /email preferences/i,
  /manage your subscription/i,
  /no longer wish to receive/i,
  /opt.?out/i,
  /\bnewsletter\b/i,
  /\bdigest\b/i,
  /\bweekly update\b/i,
  /\bmonthly update\b/i,
  /\bpromotion\b/i,
  /\bspecial offer\b/i,
  /\blimited time\b/i,
  /\bexclusive offer\b/i,
  /\byou're.*eligible\b/i,
  /\bcapital.*offer\b/i,
  /\bwebinar\b/i,
  /\blive training\b/i,
  /\bregister now\b/i,
];

const AD_SENDER_PATTERNS = [
  /noreply|no-reply|donotreply/i,
  /newsletter/i,
  /marketing/i,
  /notifications?@/i,
  /updates?@/i,
  /info@/i,
  /hello@/i,
  /team@/i,
  /offers?@/i,
  /promo@/i,
  /capital.*@.*shopify/i,
  /email\.shopify/i,
  /@.*\.hubspot/i,
  /@.*mailchimp/i,
  /@.*constantcontact/i,
  /@.*sendgrid/i,
  /training@/i,
  /webinar@/i,
  /@campaign\./i,
];

// Patterns for automated emails (calendar, reports)
const AUTOMATED_SUBJECT_PATTERNS = [
  /^(Accepted|Declined|Tentative):/i,  // Calendar responses
  /^Daily Bookings/i,                   // Reports
  /^Weekly Report/i,
  /^Monthly Report/i,
  /invited you to edit/i,              // SharePoint
  /shared .* with you/i,               // OneDrive shares
];

function isAdOrNewsletter(email: string, subject: string, preview: string): boolean {
  const content = `${subject} ${preview}`;
  
  // Check automated email patterns (calendar responses, reports)
  for (const pattern of AUTOMATED_SUBJECT_PATTERNS) {
    if (pattern.test(subject)) return true;
  }
  
  // Check content patterns
  for (const pattern of AD_PATTERNS) {
    if (pattern.test(content)) return true;
  }
  
  // Check sender patterns
  for (const pattern of AD_SENDER_PATTERNS) {
    if (pattern.test(email)) return true;
  }
  
  return false;
}

// Your email addresses to filter out sent messages
const MY_EMAILS = [
  'derickd@sonance.com',
  'derick@sonance.com',
  'derick.dahl@sonance.com',
];

export async function getOutlookEmails(limit = 100): Promise<UnifiedMessage[]> {
  try {
    // Get from Inbox folder only (excludes sent items), request more to account for filtering
    const response = await callMsGraph(`/me/mailFolders/inbox/messages?\\$top=${limit}&\\$orderby=receivedDateTime desc&\\$select=id,subject,bodyPreview,from,receivedDateTime,isRead,webLink`);
    const messages: GraphMessage[] = response.value || [];

    return messages
      .filter((msg) => {
        const senderEmail = msg.from?.emailAddress?.address?.toLowerCase() || '';
        
        // Filter out messages from myself
        if (MY_EMAILS.some(e => senderEmail.includes(e.toLowerCase()))) {
          return false;
        }
        
        // Filter out ads/newsletters
        const subject = msg.subject || '';
        const preview = msg.bodyPreview || '';
        if (isAdOrNewsletter(senderEmail, subject, preview)) {
          return false;
        }
        
        return true;
      })
      .slice(0, 20) // Return max 20 after filtering
      .map((msg): UnifiedMessage => {
        const senderName = msg.from?.emailAddress?.name || 'Unknown Sender';
        const senderEmail = msg.from?.emailAddress?.address || '';
        const preview = msg.bodyPreview ? stripHtml(msg.bodyPreview).slice(0, 200) : '';
        const receivedAt = msg.receivedDateTime || new Date().toISOString();

        return {
          id: `outlook-${msg.id}`,
          source: 'email_work' as MessageSource,
          external_id: msg.id,
          sender_name: senderName,
          sender_email: senderEmail,
          subject: msg.subject,
          preview,
          received_at: receivedAt,
          status: msg.isRead ? 'read' : 'unread',
          priority: 'normal',
          is_direct_message: true,
          deep_link: msg.webLink || `https://outlook.office365.com/mail/deeplink/read/${msg.id}`,
        };
      });
  } catch (error) {
    console.error('Failed to fetch Outlook emails:', error);
    return [];
  }
}

export async function getTeamsChats(limit = 20): Promise<UnifiedMessage[]> {
  try {
    const response = await callMsGraph(`/me/chats?\\$top=${limit}&\\$expand=lastMessagePreview`);
    const chats: GraphChat[] = response.value || [];

    const messages: UnifiedMessage[] = [];

    for (const chat of chats) {
      if (!chat.lastMessagePreview) continue;

      const lastMessage = chat.lastMessagePreview;
      const isDirect = chat.chatType === 'oneOnOne';
      const senderName = lastMessage.from?.user?.displayName || 'Unknown Sender';
      const senderEmail = lastMessage.from?.user?.userPrincipalName || '';
      const preview = lastMessage.body?.content ? stripHtml(lastMessage.body.content).slice(0, 200) : '';
      const receivedAt = lastMessage.createdDateTime || new Date().toISOString();

      messages.push({
        id: `teams-chat-${chat.id}`,
        source: 'teams_dm' as MessageSource,
        external_id: chat.id,
        sender_name: senderName,
        sender_email: senderEmail,
        preview,
        received_at: receivedAt,
        status: 'unread',
        priority: 'normal',
        is_direct_message: isDirect,
        channel_name: isDirect ? undefined : (chat.topic || 'Group Chat'),
        deep_link: chat.webUrl || `https://teams.microsoft.com/l/chat/${chat.id}`,
      });
    }

    return messages;
  } catch (error) {
    console.error('Failed to fetch Teams chats:', error);
    return [];
  }
}

export async function getTeamsMentions(limit = 50): Promise<UnifiedMessage[]> {
  try {
    // Get recent chat messages that mention the current user
    const userResponse = await callMsGraph('/me');
    const currentUserName = userResponse.displayName || '';
    const currentUserEmail = userResponse.userPrincipalName || '';

    const chatsResponse = await callMsGraph('/me/chats?\\$top=50');
    const chats: GraphChat[] = chatsResponse.value || [];

    const mentions: UnifiedMessage[] = [];

    for (const chat of chats) {
      try {
        // Get recent messages from this chat
        const messagesResponse = await callMsGraph(`/chats/${chat.id}/messages?\\$top=20&\\$orderby=createdDateTime desc`);
        const messages: GraphChatMessage[] = messagesResponse.value || [];

        for (const message of messages) {
          // Check if message mentions current user
          const hasMention = message.mentions?.some(
            mention => 
              mention.mentioned?.user?.userPrincipalName === currentUserEmail ||
              mention.mentioned?.user?.displayName === currentUserName
          );

          // Also check if message content contains @mention
          const contentMention = message.body?.content && (
            message.body.content.includes(`@${currentUserName}`) ||
            message.body.content.includes(`@${currentUserEmail}`)
          );

          if (hasMention || contentMention) {
            const senderName = message.from?.user?.displayName || 'Unknown Sender';
            const senderEmail = message.from?.user?.userPrincipalName || '';
            const preview = message.body?.content ? stripHtml(message.body.content).slice(0, 200) : '';
            const receivedAt = message.createdDateTime || new Date().toISOString();
            const isDirect = chat.chatType === 'oneOnOne';

            mentions.push({
              id: `teams-mention-${message.id}`,
              source: 'teams_mention' as MessageSource,
              external_id: message.id,
              sender_name: senderName,
              sender_email: senderEmail,
              preview,
              received_at: receivedAt,
              status: 'unread',
              priority: 'high',
              is_direct_message: isDirect,
              channel_name: isDirect ? undefined : (chat.topic || 'Group Chat'),
              deep_link: `https://teams.microsoft.com/l/message/${chat.id}/${message.id}`,
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch messages for chat ${chat.id}:`, error);
        continue;
      }
    }

    // Sort by most recent and limit
    return mentions
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())
      .slice(0, limit);

  } catch (error) {
    console.error('Failed to fetch Teams mentions:', error);
    return [];
  }
}

export async function getAllMicrosoftMessages(): Promise<UnifiedMessage[]> {
  try {
    const [outlookEmails, teamsChats, teamsMentions] = await Promise.all([
      getOutlookEmails(20),
      getTeamsChats(20),
      getTeamsMentions(20)
    ]);

    return [...outlookEmails, ...teamsChats, ...teamsMentions];
  } catch (error) {
    console.error('Failed to fetch Microsoft messages:', error);
    return [];
  }
}