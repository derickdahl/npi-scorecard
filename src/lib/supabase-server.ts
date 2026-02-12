import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role key
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !serviceKey) {
    return null
  }
  
  return createClient(url, serviceKey, {
    auth: { persistSession: false }
  })
}

export interface DbMessage {
  id?: string
  executive_id?: string
  channel: string
  external_id: string
  sender?: string
  sender_email?: string
  subject?: string
  received_at: string
  requires_response?: boolean
  responded_at?: string | null
  response_time_minutes?: number | null
  handled_by?: string | null
  thread_id?: string | null
}

// Upsert messages from API sources into database
export async function upsertMessages(messages: DbMessage[]): Promise<void> {
  const supabase = createServerClient()
  if (!supabase || messages.length === 0) return

  try {
    // Upsert based on external_id + channel combo
    const { error } = await supabase
      .from('messages')
      .upsert(
        messages.map(m => ({
          channel: m.channel,
          external_id: m.external_id,
          sender: m.sender,
          sender_email: m.sender_email,
          subject: m.subject,
          received_at: m.received_at,
          requires_response: m.requires_response ?? true,
          thread_id: m.thread_id,
        })),
        { 
          onConflict: 'external_id',
          ignoreDuplicates: false 
        }
      )
    
    if (error) {
      console.error('Error upserting messages:', error)
    }
  } catch (err) {
    console.error('Supabase upsert error:', err)
  }
}

// Get response metrics from database
export async function getResponseMetrics(since?: Date): Promise<{
  total: number
  responded: number
  avgResponseMinutes: number
  under30: number
  under2Hours: number
  over2Hours: number
} | null> {
  const supabase = createServerClient()
  if (!supabase) return null

  try {
    let query = supabase
      .from('messages')
      .select('received_at, responded_at, response_time_minutes')
      .eq('requires_response', true)
    
    if (since) {
      query = query.gte('received_at', since.toISOString())
    }

    const { data, error } = await query

    if (error || !data) {
      console.error('Error fetching metrics:', error)
      return null
    }

    const responded = data.filter(m => m.responded_at != null)
    const responseTimes = responded
      .map(m => m.response_time_minutes)
      .filter((t): t is number => t != null)

    const avgResponseMinutes = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0

    return {
      total: data.length,
      responded: responded.length,
      avgResponseMinutes,
      under30: responseTimes.filter(t => t <= 30).length,
      under2Hours: responseTimes.filter(t => t <= 120).length,
      over2Hours: responseTimes.filter(t => t > 120).length,
    }
  } catch (err) {
    console.error('Supabase metrics error:', err)
    return null
  }
}

// Reset all response tracking (clear responded_at and response_time_minutes)
export async function resetResponseTracking(): Promise<void> {
  const supabase = createServerClient()
  if (!supabase) return

  try {
    const { error } = await supabase
      .from('messages')
      .update({
        responded_at: null,
        response_time_minutes: null,
      })
      .not('responded_at', 'is', null) // Only update messages that have been responded to

    if (error) {
      console.error('Error resetting response tracking:', error)
    } else {
      console.log('✅ Response tracking reset in Supabase')
    }
  } catch (err) {
    console.error('Supabase reset error:', err)
  }
}

// Get or set the reset cutoff timestamp
export async function getResetCutoff(): Promise<number | null> {
  const supabase = createServerClient()
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'message_reset_cutoff')
      .single()

    if (error || !data) return null
    return parseInt(data.value, 10)
  } catch (err) {
    console.error('Error getting reset cutoff:', err)
    return null
  }
}

export async function setResetCutoff(timestamp: number): Promise<void> {
  const supabase = createServerClient()
  if (!supabase) return

  try {
    await supabase
      .from('settings')
      .upsert({
        key: 'message_reset_cutoff',
        value: timestamp.toString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' })
  } catch (err) {
    console.error('Error setting reset cutoff:', err)
  }
}

// Mark a message as responded
export async function markResponded(
  externalId: string, 
  respondedAt: Date,
  receivedAt?: string,
  channel?: string,
  sender?: string,
  subject?: string
): Promise<void> {
  const supabase = createServerClient()
  if (!supabase) {
    console.log('⚠️ markResponded: Supabase not configured')
    return
  }

  try {
    // First try to get the message to calculate response time
    const { data: existingMessage } = await supabase
      .from('messages')
      .select('received_at')
      .eq('external_id', externalId)
      .single()

    let responseTimeMinutes: number | null = null
    
    if (existingMessage) {
      // Message exists - update it
      const msgReceivedAt = new Date(existingMessage.received_at)
      responseTimeMinutes = Math.floor((respondedAt.getTime() - msgReceivedAt.getTime()) / 60000)
      
      const { error } = await supabase
        .from('messages')
        .update({
          responded_at: respondedAt.toISOString(),
          response_time_minutes: responseTimeMinutes,
        })
        .eq('external_id', externalId)
      
      if (error) {
        console.error('Error updating responded message:', error)
      } else {
        console.log(`✅ Updated message ${externalId} as responded`)
      }
    } else if (receivedAt) {
      // Message doesn't exist - create it with responded data
      const msgReceivedAt = new Date(receivedAt)
      responseTimeMinutes = Math.floor((respondedAt.getTime() - msgReceivedAt.getTime()) / 60000)
      
      const { error } = await supabase
        .from('messages')
        .insert({
          external_id: externalId,
          channel: channel || 'unknown',
          sender: sender,
          subject: subject,
          received_at: receivedAt,
          responded_at: respondedAt.toISOString(),
          response_time_minutes: responseTimeMinutes,
          requires_response: true,
        })
      
      if (error) {
        console.error('Error inserting responded message:', error)
      } else {
        console.log(`✅ Inserted new message ${externalId} as responded`)
      }
    } else {
      console.log(`⚠️ Message ${externalId} not found and no receivedAt provided`)
    }
  } catch (err) {
    console.error('Error marking responded:', err)
  }
}
