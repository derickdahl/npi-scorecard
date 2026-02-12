import { UnifiedMessage } from '../supabase';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface AppleMailMessage {
  id: string;
  subject: string;
  sender: string;
  sender_email: string;
  content: string;
  date_received: string;
  date_read?: string;
  account_name: string;
  mailbox_name: string;
}

// AppleScript to get recent messages from Apple Mail
const GET_MAIL_SCRIPT = `
tell application "Mail"
    set recentMessages to {}
    
    try
        -- Get messages from inbox of derickdahl@me.com account
        set targetAccount to account "derickdahl@me.com"
        set inboxMailbox to inbox of targetAccount
        set messageList to (messages 1 thru 20 of inboxMailbox)
        
        repeat with msg in messageList
            set msgSubject to subject of msg
            set msgSender to sender of msg
            set msgContent to content of msg
            set msgDateReceived to date received of msg
            set msgRead to read status of msg
            set msgId to id of msg as string
            
            -- Extract sender email from sender string
            set senderEmail to ""
            set senderName to ""
            try
                if msgSender contains "<" and msgSender contains ">" then
                    set emailStart to (offset of "<" in msgSender) + 1
                    set emailEnd to (offset of ">" in msgSender) - 1
                    set senderEmail to (text emailStart thru emailEnd of msgSender)
                    set senderName to (text 1 thru (emailStart - 3) of msgSender)
                else
                    set senderEmail to msgSender
                    set senderName to msgSender
                end if
            end try
            
            -- Clean up sender name
            if senderName starts with "\"" then
                set senderName to (text 2 thru -2 of senderName)
            end if
            
            -- Get preview from content (first 200 chars, remove HTML)
            set msgPreview to msgContent
            if length of msgPreview > 200 then
                set msgPreview to (text 1 thru 200 of msgPreview)
            end if
            
            -- Format date as ISO string
            set msgDateISO to ""
            try
                set msgDateISO to (year of msgDateReceived as string) & "-" & ¬
                    (my padZero(month of msgDateReceived as integer)) & "-" & ¬
                    (my padZero(day of msgDateReceived)) & "T" & ¬
                    (my padZero(hours of msgDateReceived)) & ":" & ¬
                    (my padZero(minutes of msgDateReceived)) & ":" & ¬
                    (my padZero(seconds of msgDateReceived)) & "Z"
            end try
            
            set msgRecord to msgId & "|||" & msgSubject & "|||" & senderName & "|||" & senderEmail & "|||" & msgPreview & "|||" & msgDateISO & "|||" & (msgRead as string)
            set end of recentMessages to msgRecord
        end repeat
        
    on error errMsg
        return "ERROR: " & errMsg
    end try
    
    return recentMessages
end tell

on padZero(num)
    if num < 10 then
        return "0" & (num as string)
    else
        return num as string
    end if
end padZero
`;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export async function getPersonalEmails(limit = 20): Promise<UnifiedMessage[]> {
  try {
    const { stdout, stderr } = await execAsync(`osascript -e '${GET_MAIL_SCRIPT.replace(/'/g, "\\'")}' 2>/dev/null`, {
      timeout: 30000, // 30 second timeout
    });

    if (stderr && stderr.includes('ERROR')) {
      throw new Error(`AppleScript error: ${stderr}`);
    }

    if (stdout.includes('ERROR:')) {
      throw new Error(stdout);
    }

    const lines = stdout.trim().split('\n').filter(line => line.length > 0);
    const messages: UnifiedMessage[] = [];

    for (const line of lines.slice(0, limit)) {
      try {
        const parts = line.split('|||');
        if (parts.length < 7) continue;

        const [id, subject, senderName, senderEmail, content, dateReceived, isRead] = parts;
        
        const preview = stripHtml(content).slice(0, 200);
        const receivedAt = dateReceived || new Date().toISOString();
        const status = isRead === 'true' ? 'read' : 'unread';

        messages.push({
          id: `apple-mail-${id}`,
          source: 'email_personal',
          external_id: id,
          sender_name: senderName || 'Unknown Sender',
          sender_email: senderEmail,
          subject: subject,
          preview,
          received_at: receivedAt,
          status: status as 'read' | 'unread',
          priority: 'normal',
          is_direct_message: true,
          deep_link: `message://%3c${id}%3e`,
        });
      } catch (error) {
        console.warn('Failed to parse mail message:', line, error);
        continue;
      }
    }

    return messages
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());

  } catch (error) {
    console.error('Failed to fetch Apple Mail messages:', error);
    
    // If Mail app is not available or permission denied, return empty array
    if ((error as any).message?.includes('not allowed assistive access') || 
        (error as any).message?.includes('Application "Mail" was not found')) {
      console.warn('Apple Mail access not available - skipping personal email integration');
      return [];
    }
    
    return [];
  }
}

export async function getAllAppleMailMessages(): Promise<UnifiedMessage[]> {
  return getPersonalEmails(20);
}