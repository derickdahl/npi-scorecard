import { UnifiedMessage } from '../supabase';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

interface SlackConversation {
  id: string;
  name?: string;
  is_im?: boolean;
  is_private?: boolean;
  is_channel?: boolean;
  is_group?: boolean;
  user?: string;
  latest?: SlackMessage;
}

interface SlackMessage {
  type?: string;
  ts: string;
  user?: string;
  text?: string;
  thread_ts?: string;
  reply_count?: number;
  subtype?: string;
}

interface SlackUser {
  id: string;
  name: string;
  real_name?: string;
  profile?: {
    email?: string;
    display_name?: string;
    real_name?: string;
  };
}

async function getSlackToken(): Promise<string> {
  // Try environment variable first (Vercel), then fall back to local file (Mac Studio)
  if (process.env.SLACK_TOKEN) {
    return process.env.SLACK_TOKEN.trim();
  }
  
  try {
    const token = await fs.readFile('/Users/derickdahl/.clawdbot/credentials/slack-token', 'utf8');
    return token.trim();
  } catch (error) {
    throw new Error('Slack token not found. Set SLACK_TOKEN env var or ensure local credentials file exists.');
  }
}

async function callSlackAPI(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const token = await getSlackToken();
  
  const queryParams = new URLSearchParams(params);
  const url = `https://slack.com/api/${endpoint}?${queryParams}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error || 'Unknown error'}`);
  }
  
  return data;
}

async function getCurrentUserId(): Promise<string> {
  const response = await callSlackAPI('auth.test');
  return response.user_id;
}

async function getUsers(): Promise<Map<string, SlackUser>> {
  const response = await callSlackAPI('users.list');
  const users = new Map<string, SlackUser>();
  
  for (const user of response.members || []) {
    users.set(user.id, user);
  }
  
  return users;
}

function formatSlackMessage(text: string): string {
  // Remove Slack formatting and convert to plain text
  return text
    .replace(/<@U[A-Z0-9]+>/g, '@user') // Replace user mentions
    .replace(/<#C[A-Z0-9]+\|([^>]+)>/g, '#$1') // Replace channel mentions
    .replace(/<([^|>]+)\|([^>]+)>/g, '$2') // Replace links with text
    .replace(/<([^>]+)>/g, '$1') // Replace remaining angle brackets
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .trim();
}

export async function getSlackDirectMessages(limit = 20): Promise<UnifiedMessage[]> {
  try {
    const [currentUserId, users] = await Promise.all([
      getCurrentUserId(),
      getUsers()
    ]);

    // Get all conversations (DMs and group DMs)
    const conversationsResponse = await callSlackAPI('conversations.list', {
      types: 'im,mpim',
      exclude_archived: 'true',
      limit: '200'
    });

    const conversations: SlackConversation[] = conversationsResponse.channels || [];
    const messages: UnifiedMessage[] = [];

    for (const conversation of conversations.slice(0, limit)) {
      try {
        // Get recent messages from this conversation
        const historyResponse = await callSlackAPI('conversations.history', {
          channel: conversation.id,
          limit: '10'
        });

        const conversationMessages: SlackMessage[] = historyResponse.messages || [];

        for (const msg of conversationMessages) {
          // Skip messages from current user or system messages
          if (msg.user === currentUserId || msg.subtype) continue;
          
          const user = msg.user ? users.get(msg.user) : null;
          const senderName = user?.real_name || user?.profile?.real_name || user?.name || 'Unknown User';
          const senderEmail = user?.profile?.email || '';
          const preview = msg.text ? formatSlackMessage(msg.text).slice(0, 200) : '';
          const receivedAt = new Date(parseFloat(msg.ts) * 1000).toISOString();

          // Check if message mentions current user
          const mentions = msg.text?.includes(`<@${currentUserId}>`) || false;

          messages.push({
            id: `slack-dm-${msg.ts}`,
            source: 'slack',
            external_id: msg.ts,
            sender_name: senderName,
            sender_email: senderEmail,
            preview,
            received_at: receivedAt,
            status: 'unread',
            priority: mentions ? 'high' : 'normal',
            is_direct_message: conversation.is_im || false,
            channel_name: conversation.is_im ? undefined : conversation.name,
            deep_link: `https://app.slack.com/client/T123/${conversation.id}/thread/${msg.ts}`,
          });
        }
      } catch (error) {
        console.warn(`Failed to fetch history for conversation ${conversation.id}:`, error);
        continue;
      }
    }

    return messages
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())
      .slice(0, limit);

  } catch (error) {
    console.error('Failed to fetch Slack direct messages:', error);
    return [];
  }
}

export async function getSlackMentions(limit = 20): Promise<UnifiedMessage[]> {
  try {
    const [currentUserId, users] = await Promise.all([
      getCurrentUserId(),
      getUsers()
    ]);

    // Get all conversations (channels and groups)
    const conversationsResponse = await callSlackAPI('conversations.list', {
      types: 'public_channel,private_channel',
      exclude_archived: 'true',
      limit: '100'
    });

    const conversations: SlackConversation[] = conversationsResponse.channels || [];
    const mentions: UnifiedMessage[] = [];

    for (const conversation of conversations) {
      try {
        // Get recent messages from this conversation
        const historyResponse = await callSlackAPI('conversations.history', {
          channel: conversation.id,
          limit: '20'
        });

        const conversationMessages: SlackMessage[] = historyResponse.messages || [];

        for (const msg of conversationMessages) {
          // Skip messages from current user
          if (msg.user === currentUserId) continue;

          // Check if message mentions current user
          if (msg.text?.includes(`<@${currentUserId}>`)) {
            const user = msg.user ? users.get(msg.user) : null;
            const senderName = user?.real_name || user?.profile?.real_name || user?.name || 'Unknown User';
            const senderEmail = user?.profile?.email || '';
            const preview = msg.text ? formatSlackMessage(msg.text).slice(0, 200) : '';
            const receivedAt = new Date(parseFloat(msg.ts) * 1000).toISOString();

            mentions.push({
              id: `slack-mention-${msg.ts}`,
              source: 'slack',
              external_id: msg.ts,
              sender_name: senderName,
              sender_email: senderEmail,
              preview,
              received_at: receivedAt,
              status: 'unread',
              priority: 'high',
              is_direct_message: false,
              channel_name: conversation.name,
              deep_link: `https://app.slack.com/client/T123/${conversation.id}/thread/${msg.ts}`,
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch history for conversation ${conversation.id}:`, error);
        continue;
      }
    }

    return mentions
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())
      .slice(0, limit);

  } catch (error) {
    console.error('Failed to fetch Slack mentions:', error);
    return [];
  }
}

export async function getAllSlackMessages(): Promise<UnifiedMessage[]> {
  try {
    const [directMessages, mentions] = await Promise.all([
      getSlackDirectMessages(15),
      getSlackMentions(15)
    ]);

    return [...directMessages, ...mentions];
  } catch (error) {
    console.error('Failed to fetch Slack messages:', error);
    return [];
  }
}