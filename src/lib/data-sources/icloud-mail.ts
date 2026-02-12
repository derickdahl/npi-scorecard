import { ImapFlow } from 'imapflow';
import { UnifiedMessage } from '../supabase';

// iCloud IMAP settings
const ICLOUD_IMAP_CONFIG = {
  host: 'imap.mail.me.com',
  port: 993,
  secure: true,
  auth: {
    user: process.env.ICLOUD_EMAIL || '',
    pass: process.env.ICLOUD_APP_PASSWORD || '',
  },
  logger: false as const,
};

// Ad filtering patterns (same as microsoft-graph)
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
  /@.*\.hubspot/i,
  /@.*mailchimp/i,
  /@.*constantcontact/i,
  /@.*sendgrid/i,
  /training@/i,
  /webinar@/i,
  /@campaign\./i,
];

const AUTOMATED_SUBJECT_PATTERNS = [
  /^(Accepted|Declined|Tentative):/i,
  /^Daily Bookings/i,
  /^Weekly Report/i,
  /^Monthly Report/i,
  /invited you to edit/i,
  /shared .* with you/i,
];

function isAdOrNewsletter(email: string, subject: string, preview: string): boolean {
  const content = `${subject} ${preview}`;
  
  for (const pattern of AUTOMATED_SUBJECT_PATTERNS) {
    if (pattern.test(subject)) return true;
  }
  
  for (const pattern of AD_PATTERNS) {
    if (pattern.test(content)) return true;
  }
  
  for (const pattern of AD_SENDER_PATTERNS) {
    if (pattern.test(email)) return true;
  }
  
  return false;
}

export async function getICloudEmails(limit = 50): Promise<UnifiedMessage[]> {
  if (!ICLOUD_IMAP_CONFIG.auth.user || !ICLOUD_IMAP_CONFIG.auth.pass) {
    console.log('iCloud credentials not configured');
    return [];
  }

  const client = new ImapFlow(ICLOUD_IMAP_CONFIG);
  const messages: UnifiedMessage[] = [];

  try {
    await client.connect();
    
    // Select INBOX
    const mailbox = await client.mailboxOpen('INBOX');
    
    if (!mailbox.exists || mailbox.exists === 0) {
      await client.logout();
      return [];
    }

    // Fetch latest messages (newest first)
    const startSeq = Math.max(1, mailbox.exists - limit + 1);
    const range = `${startSeq}:*`;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchedMessages: any[] = [];

    for await (const message of client.fetch(range, {
      envelope: true,
      flags: true,
      source: { start: 0, maxLength: 2000 }, // Fetch partial body
    })) {
      fetchedMessages.push(message);
    }

    // Sort by date descending (newest first)
    fetchedMessages.sort((a, b) => {
      const dateA = a.envelope?.date ? new Date(a.envelope.date).getTime() : 0;
      const dateB = b.envelope?.date ? new Date(b.envelope.date).getTime() : 0;
      return dateB - dateA;
    });

    for (const msg of fetchedMessages) {
      try {
        const from = msg.envelope?.from?.[0];
        const senderEmail = from?.address || 'unknown';
        const senderName = from?.name || senderEmail.split('@')[0];
        const subject = msg.envelope?.subject || '(No Subject)';
        const isRead = msg.flags?.has('\\Seen') || false;
        const date = msg.envelope?.date || new Date();

        // Extract preview from body
        let preview = '';
        if (msg.source) {
          const text = msg.source.toString('utf-8');
          const bodyStart = text.indexOf('\r\n\r\n');
          if (bodyStart > 0) {
            preview = text.slice(bodyStart + 4, bodyStart + 300)
              .replace(/\r?\n/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
          }
        }

        // Filter out ads/newsletters
        if (isAdOrNewsletter(senderEmail, subject, preview)) {
          continue;
        }

        messages.push({
          id: `icloud-${msg.uid}`,
          source: 'email_personal',
          external_id: String(msg.uid),
          sender_name: senderName,
          sender_email: senderEmail,
          subject,
          preview: preview.slice(0, 200),
          received_at: new Date(date).toISOString(),
          status: isRead ? 'read' : 'unread',
          priority: 'normal',
          is_direct_message: true,
          deep_link: 'https://www.icloud.com/mail/',
        });

        // Stop if we have enough filtered messages
        if (messages.length >= 20) break;
      } catch (err) {
        console.error('Error processing iCloud message:', err);
      }
    }

    await client.logout();
  } catch (error) {
    console.error('iCloud IMAP error:', error);
    try {
      await client.logout();
    } catch {
      // Ignore logout errors
    }
  }

  return messages;
}
