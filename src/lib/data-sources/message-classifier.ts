import { UnifiedMessage } from '../supabase';

export interface ClassificationResult {
  requires_response: 'yes' | 'no' | 'maybe';
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  method: 'rule' | 'llm';
}

// Rule-based patterns
const NO_RESPONSE_PATTERNS = [
  /\b(fyi|for your information|just sharing|no response needed|no action needed)\b/i,
  /\b(auto-?generated|automated message|do not reply)\b/i,
  /\b(has been (scheduled|canceled|updated|accepted|declined))\b/i,
  /\b(reminder|notification|alert):/i,
  /\b(out of office|ooo)\b/i,
  /\bthank(s| you)\b.*!?$/i, // Just "thanks!" at end
  /\b(sounds good|perfect|great|got it|noted|will do)\b.*!?$/i, // Acknowledgments
];

const NEEDS_RESPONSE_PATTERNS = [
  /\?$/, // Ends with question mark
  /\b(can you|could you|would you|will you|please|pls)\b/i,
  /\b(what do you think|your thoughts|your opinion|your feedback)\b/i,
  /\b(need|require|request|asking)\b.*\b(your|you to)\b/i,
  /\b(urgent|asap|time.?sensitive|by (today|tomorrow|eod|eow|friday))\b/i,
  /\b(approve|sign.?off|review|confirm|decision)\b/i,
  /\b(waiting for|awaiting|pending) (your|you)\b/i,
  /\b(let me know|lmk|get back to me)\b/i,
];

const CALENDAR_PATTERNS = [
  /\b(meeting|invite|calendar|scheduled for)\b/i,
  /\b(accepted|declined|tentative)\b.*\binvitation\b/i,
];

const NEWSLETTER_PATTERNS = [
  /\bunsubscribe\b/i,
  /\bview in browser\b/i,
  /\bnewsletter\b/i,
  /\bdigest\b/i,
  /\bweekly roundup\b/i,
  /\bdaily summary\b/i,
  /\bmonthly update\b/i,
];

const ADVERTISEMENT_PATTERNS = [
  /\b(sale|discount|offer|promo|deal|% off|free shipping)\b/i,
  /\b(limited time|act now|don't miss|expires|last chance)\b/i,
  /\b(shop now|buy now|order now|get yours)\b/i,
  /\b(sponsored|advertisement|partner content)\b/i,
  /\b(webinar|register now|sign up today|join us for)\b/i,
  /\b(we miss you|come back|haven't seen you)\b/i,
  /\b(new arrivals|just dropped|now available)\b/i,
  /\b(black friday|cyber monday|holiday sale)\b/i,
];

const READ_ONLY_PATTERNS = [
  /\b(has been (shipped|delivered|completed|processed))\b/i,
  /\b(order confirmation|shipping confirmation|delivery update)\b/i,
  /\b(receipt|invoice|statement) (for|from)\b/i,
  /\b(security alert|login from|new sign-?in)\b/i,
  /\b(password (changed|reset|updated))\b/i,
  /\b(your (report|summary|statement) is ready)\b/i,
  /\b(successfully (created|updated|deleted|completed))\b/i,
  /\b(build (passed|failed|succeeded))\b/i,
  /\b(deployed to|deployment complete)\b/i,
  /\b(commented on|mentioned you in|reacted to)\b.*(?!.*\?)/i, // Notifications without questions
  /\b(joined|left|added|removed) (the|a) (channel|group|team)\b/i,
  /\b(shared a (file|document|link) with you)\b/i,
  /\b(daily report|weekly report|automated report)\b/i,
];

function applyRules(message: UnifiedMessage): ClassificationResult | null {
  const text = `${message.subject || ''} ${message.preview || ''}`.toLowerCase();
  
  // Check for obvious no-response patterns
  for (const pattern of NO_RESPONSE_PATTERNS) {
    if (pattern.test(text)) {
      return {
        requires_response: 'no',
        confidence: 'high',
        reason: 'Appears to be informational/acknowledgment',
        method: 'rule',
      };
    }
  }
  
  // Check for calendar notifications
  for (const pattern of CALENDAR_PATTERNS) {
    if (pattern.test(text)) {
      return {
        requires_response: 'no',
        confidence: 'high',
        reason: 'Calendar notification',
        method: 'rule',
      };
    }
  }
  
  // Check for newsletters
  for (const pattern of NEWSLETTER_PATTERNS) {
    if (pattern.test(text)) {
      return {
        requires_response: 'no',
        confidence: 'high',
        reason: 'Newsletter/marketing email',
        method: 'rule',
      };
    }
  }
  
  // Check for advertisements
  for (const pattern of ADVERTISEMENT_PATTERNS) {
    if (pattern.test(text)) {
      return {
        requires_response: 'no',
        confidence: 'high',
        reason: 'Advertisement/promotional',
        method: 'rule',
      };
    }
  }
  
  // Check for read-only notifications
  for (const pattern of READ_ONLY_PATTERNS) {
    if (pattern.test(text)) {
      return {
        requires_response: 'no',
        confidence: 'high',
        reason: 'Read-only notification',
        method: 'rule',
      };
    }
  }
  
  // Check for needs-response patterns
  for (const pattern of NEEDS_RESPONSE_PATTERNS) {
    if (pattern.test(text)) {
      return {
        requires_response: 'yes',
        confidence: 'medium',
        reason: 'Contains question or action request',
        method: 'rule',
      };
    }
  }
  
  // If direct message and not caught by rules, likely needs response
  if (message.is_direct_message && message.source !== 'email_work') {
    return {
      requires_response: 'maybe',
      confidence: 'low',
      reason: 'Direct message - may need response',
      method: 'rule',
    };
  }
  
  return null; // Rules inconclusive, need LLM
}

async function classifyWithLLM(message: UnifiedMessage): Promise<ClassificationResult> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (!anthropicKey && !openaiKey) {
    return {
      requires_response: 'maybe',
      confidence: 'low',
      reason: 'Unable to determine - LLM not configured',
      method: 'rule',
    };
  }
  
  const prompt = `Analyze this message and determine if it requires a response from the recipient (an executive named Derick).

From: ${message.sender_name}
Subject: ${message.subject || '(no subject)'}
Message: ${message.preview}

Respond with JSON only:
{"requires_response": "yes" or "no" or "maybe", "reason": "brief explanation"}`;

  try {
    // Prefer Claude
    if (anthropicKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 150,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      
      const data = await response.json();
      const content = data.content?.[0]?.text || '';
      
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return {
          requires_response: parsed.requires_response || 'maybe',
          confidence: 'high',
          reason: parsed.reason || 'Claude analysis',
          method: 'llm',
        };
      }
    }
    
    // Fallback to OpenAI
    if (openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
          temperature: 0,
        }),
      });
      
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return {
          requires_response: parsed.requires_response || 'maybe',
          confidence: 'medium',
          reason: parsed.reason || 'GPT analysis',
          method: 'llm',
        };
      }
    }
  } catch (error) {
    console.error('LLM classification error:', error);
  }
  
  return {
    requires_response: 'maybe',
    confidence: 'low',
    reason: 'Unable to classify',
    method: 'rule',
  };
}

// Cache for classifications to avoid re-analyzing
const classificationCache = new Map<string, ClassificationResult>();

export async function classifyMessage(message: UnifiedMessage): Promise<ClassificationResult> {
  // Check cache first
  const cached = classificationCache.get(message.id);
  if (cached) return cached;
  
  // Try rules first
  const ruleResult = applyRules(message);
  if (ruleResult && ruleResult.confidence !== 'low') {
    classificationCache.set(message.id, ruleResult);
    return ruleResult;
  }
  
  // Use LLM for uncertain cases
  const llmResult = await classifyWithLLM(message);
  classificationCache.set(message.id, llmResult);
  return llmResult;
}

export async function classifyMessages(messages: UnifiedMessage[]): Promise<Map<string, ClassificationResult>> {
  const results = new Map<string, ClassificationResult>();
  
  // Classify in parallel but with concurrency limit
  const batchSize = 5;
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (msg) => ({
        id: msg.id,
        result: await classifyMessage(msg),
      }))
    );
    
    for (const { id, result } of batchResults) {
      results.set(id, result);
    }
  }
  
  return results;
}
