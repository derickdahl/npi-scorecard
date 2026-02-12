import { UnifiedMessage } from '../supabase';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface iMessageChat {
  id: number;
  identifier: string;
  service: string;
  name?: string;
  last_message_at?: string;
  participants?: string[];
}

interface iMessageRecord {
  id: number;
  guid: string;
  text?: string;
  sender?: string;
  created_at: string;
  is_from_me: boolean;
  chat_id: number;
  attachments?: Array<{
    filename?: string;
    mime_type?: string;
  }>;
}

function formatPhoneNumber(phone: string): string {
  // Clean and format phone number
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

function extractContactName(handle: string): string {
  // Handle could be email or phone number
  if (handle.includes('@')) {
    // For emails, use the part before @
    return handle.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  } else {
    // For phone numbers, try to format nicely
    return formatPhoneNumber(handle);
  }
}

function generateDeepLink(handle: string): string {
  if (handle.includes('@')) {
    return `sms:${handle}`;
  } else {
    // Clean phone number for SMS link
    const cleaned = handle.replace(/\D/g, '');
    return `sms:+1${cleaned}`;
  }
}

async function getRecentChats(limit = 20): Promise<iMessageChat[]> {
  try {
    const { stdout } = await execAsync('imsg chats --json', {
      timeout: 10000,
    });
    
    // Parse NDJSON (newline-delimited JSON)
    const lines = stdout.trim().split('\n');
    const chats: iMessageChat[] = lines.map(line => JSON.parse(line));
    
    // Filter and sort by last message date
    return chats
      .filter(chat => chat.last_message_at)
      .sort((a, b) => new Date(b.last_message_at!).getTime() - new Date(a.last_message_at!).getTime())
      .slice(0, limit);
      
  } catch (error) {
    console.error('Failed to fetch iMessage chats:', error);
    return [];
  }
}

async function getMessagesForChat(chatId: number, limit = 10): Promise<iMessageRecord[]> {
  try {
    const { stdout } = await execAsync(`imsg history --chat-id ${chatId} --limit ${limit} --json`, {
      timeout: 10000,
    });
    
    // Parse NDJSON (newline-delimited JSON)
    const lines = stdout.trim().split('\n').filter(line => line.length > 0);
    const messages: iMessageRecord[] = lines.map(line => JSON.parse(line));
    return messages;
    
  } catch (error) {
    console.warn(`Failed to fetch messages for chat ${chatId}:`, error);
    return [];
  }
}

export async function getRecentMessages(limit = 30): Promise<UnifiedMessage[]> {
  try {
    console.log('📱 Fetching iMessage chats...');
    
    // Get recent chats first
    const chats = await getRecentChats(10);
    console.log(`📱 Found ${chats.length} recent chats`);
    
    if (chats.length === 0) {
      return [];
    }

    // Get messages from each chat
    const allMessages: iMessageRecord[] = [];
    
    for (const chat of chats) {
      const messages = await getMessagesForChat(chat.id, 5);
      
      // Add chat info to messages
      for (const msg of messages) {
        (msg as any).chat_info = chat;
      }
      
      allMessages.push(...messages);
    }
    
    console.log(`📱 Found ${allMessages.length} total messages`);

    const unifiedMessages: UnifiedMessage[] = [];

    for (const msg of allMessages) {
      // Skip messages sent by user (is_from_me = true)
      if (msg.is_from_me) continue;

      // Skip messages without text content
      if (!msg.text || msg.text.trim() === '') continue;

      const chatInfo = (msg as any).chat_info as iMessageChat;
      const handle = msg.sender || chatInfo.identifier;
      
      const senderName = extractContactName(handle);
      const preview = msg.text.slice(0, 200);
      
      // Use the created_at timestamp directly
      const receivedAt = msg.created_at;
      
      // For now, assume all messages are read (no read status info available)
      const status: 'unread' | 'read' | 'responded' | 'archived' = 'read';

      // Determine if it's a group chat (rough heuristic: if name doesn't look like phone/email)
      const isGroupChat = chatInfo.participants && chatInfo.participants.length > 2;
      const channelName = isGroupChat ? (chatInfo.name || 'Group Chat') : undefined;

      unifiedMessages.push({
        id: `imessage-${msg.guid}`,
        source: 'imessage',
        external_id: msg.guid,
        sender_name: senderName,
        sender_email: handle.includes('@') ? handle : undefined,
        preview,
        received_at: receivedAt,
        status,
        priority: 'normal',
        is_direct_message: !isGroupChat,
        channel_name: channelName,
        attachments_count: msg.attachments?.length || 0,
        deep_link: generateDeepLink(handle),
      });
    }

    return unifiedMessages
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())
      .slice(0, limit);

  } catch (error) {
    console.error('Failed to fetch iMessage history:', error);
    
    // If the command fails, return empty array rather than crashing
    if ((error as any).code === 'ENOENT') {
      console.warn('imsg command not found - skipping iMessage integration');
      return [];
    }
    
    return [];
  }
}

export async function getAlliMessages(): Promise<UnifiedMessage[]> {
  return getRecentMessages(50);
}