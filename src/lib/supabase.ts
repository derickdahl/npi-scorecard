import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    // Return a mock client that always throws (pages will catch and use fallback)
    throw new Error('Supabase not configured')
  }
  
  return createBrowserClient(url, key)
}

// Types for our database
export interface Executive {
  id: string
  name: string
  email: string
  title?: string
  company?: string
  slug?: string
  profile: ExecutiveProfile
  settings: ExecutiveSettings
  created_at: string
  updated_at: string
}

export interface ExecutiveProfile {
  phone?: string
  timezone?: string
  communication?: {
    style?: string
    signoff?: string
    tone?: string
  }
  calendar?: {
    default_meeting_length?: number
    buffer_minutes?: number
    earliest_meeting?: string
    latest_meeting?: string
    focus_time_blocks?: string[]
  }
  family?: {
    spouse?: string
    kids?: string[]
  }
  travel?: {
    airline_preference?: string
    seat_preference?: string
    hotel_preference?: string
  }
  vip_list?: string[]
}

export interface ExecutiveSettings {
  auto_respond_enabled?: boolean
  working_hours?: {
    start: string
    end: string
  }
  notification_channels?: string[]
}

export interface ResponseRule {
  id: string
  executive_id: string
  name: string
  enabled: boolean
  priority: number
  conditions: RuleConditions
  action: string
  template_id?: string
  created_at: string
}

export interface RuleConditions {
  channel?: string[]
  sender_contains?: string
  subject_contains?: string
  message_contains?: string
  time_of_day?: string
  is_vip?: boolean
}

export interface ResponseTemplate {
  id: string
  executive_id: string
  name: string
  category?: string
  subject?: string
  body: string
  channels: string[]
  created_at: string
}

export interface Message {
  id: string
  executive_id: string
  channel: string
  external_id?: string
  sender?: string
  sender_email?: string
  subject?: string
  received_at: string
  requires_response: boolean
  responded_at?: string
  response_time_minutes?: number
  handled_by?: string
  rule_applied?: string
  thread_id?: string
}

export interface DailyMetrics {
  id: string
  executive_id: string
  date: string
  channel?: string
  messages_received: number
  messages_responded: number
  messages_auto_handled: number
  avg_response_minutes?: number
  median_response_minutes?: number
  hours_worked?: number
  hours_saved?: number
}

export interface Task {
  id: string
  executive_id: string
  asana_gid?: string
  name?: string
  completed: boolean
  completed_at?: string
  estimated_hours?: number
  actual_hours?: number
  completed_by?: string
  department?: string
  work_theme?: string
  project_name?: string
}

// Unified Messaging Dashboard Types
export type MessageSource =
  | 'slack'
  | 'teams_mention'
  | 'teams_dm'
  | 'email_work'
  | 'email_personal'
  | 'imessage'

export type MessagePriority = 'urgent' | 'high' | 'normal' | 'low'

export type MessageStatus = 'unread' | 'read' | 'responded' | 'archived'

export interface UnifiedMessage {
  id: string
  source: MessageSource
  external_id?: string
  sender_name: string
  sender_email?: string
  sender_avatar?: string
  subject?: string
  preview: string
  full_content?: string
  received_at: string
  read_at?: string
  responded_at?: string
  response_time_minutes?: number
  status: MessageStatus
  priority: MessagePriority
  thread_id?: string
  channel_name?: string
  is_direct_message: boolean
  attachments_count?: number
  tags?: string[]
  deep_link?: string
}

export interface SourceMetrics {
  source: MessageSource
  total_received: number
  total_responded: number
  avg_response_time_minutes: number
  pending_count: number
  oldest_pending_minutes?: number
}

export interface ResponseMetricsSummary {
  total_messages: number
  total_responded: number
  response_rate: number
  avg_response_time_minutes: number
  under_30_min_count: number
  under_2_hours_count: number
  over_2_hours_count: number
  by_source: SourceMetrics[]
}

export const SOURCE_CONFIG: Record<MessageSource, {
  label: string
  shortLabel: string
  color: string
  bgColor: string
  icon: string
}> = {
  slack: {
    label: 'Slack',
    shortLabel: 'Slack',
    color: '#4A154B',
    bgColor: 'bg-[#4A154B]/10',
    icon: 'slack'
  },
  teams_mention: {
    label: 'Teams @ Mention',
    shortLabel: 'Teams @',
    color: '#6264A7',
    bgColor: 'bg-[#6264A7]/10',
    icon: 'teams'
  },
  teams_dm: {
    label: 'Teams DM',
    shortLabel: 'Teams DM',
    color: '#6264A7',
    bgColor: 'bg-[#6264A7]/10',
    icon: 'teams'
  },
  email_work: {
    label: 'Email (Work)',
    shortLabel: 'Work',
    color: '#00A3E1',
    bgColor: 'bg-sonance-blue/10',
    icon: 'mail'
  },
  email_personal: {
    label: 'Email (Personal)',
    shortLabel: 'Personal',
    color: '#007AFF',
    bgColor: 'bg-blue-500/10',
    icon: 'mail'
  },
  imessage: {
    label: 'Apple Messages',
    shortLabel: 'iMessage',
    color: '#34C759',
    bgColor: 'bg-green-500/10',
    icon: 'message'
  }
}
