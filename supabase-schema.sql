-- Executive OS Database Schema
-- Run this in your Supabase SQL editor to set up the tables

-- Create unified_messages table for tracking all message sources
CREATE TABLE IF NOT EXISTS unified_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  executive_id UUID REFERENCES executives(id),
  source TEXT NOT NULL, -- 'slack', 'teams_mention', 'teams_dm', 'email_work', 'email_personal', 'imessage'
  external_id TEXT NOT NULL, -- Platform-specific message ID
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  sender_avatar TEXT,
  subject TEXT,
  preview TEXT NOT NULL,
  full_content TEXT,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  response_time_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded', 'archived')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  thread_id TEXT,
  channel_name TEXT,
  is_direct_message BOOLEAN DEFAULT false,
  attachments_count INTEGER DEFAULT 0,
  tags TEXT[],
  deep_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(external_id, source)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_unified_messages_status ON unified_messages(status);
CREATE INDEX IF NOT EXISTS idx_unified_messages_received_at ON unified_messages(received_at);
CREATE INDEX IF NOT EXISTS idx_unified_messages_source ON unified_messages(source);
CREATE INDEX IF NOT EXISTS idx_unified_messages_external_id ON unified_messages(external_id);

-- Create settings table for system configuration
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_heartbeats table for tracking component health
CREATE TABLE IF NOT EXISTS system_heartbeats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  component TEXT NOT NULL,
  status TEXT NOT NULL,
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on component for upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_system_heartbeats_component ON system_heartbeats(component);

-- Update function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for unified_messages
DROP TRIGGER IF EXISTS update_unified_messages_updated_at ON unified_messages;
CREATE TRIGGER update_unified_messages_updated_at 
    BEFORE UPDATE ON unified_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for settings
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
  ('message_reset_cutoff', '0'),
  ('response_tracking_enabled', 'true'),
  ('auto_mark_done_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- Create view for response metrics
CREATE OR REPLACE VIEW response_metrics_summary AS
SELECT 
  COUNT(*) as total_messages,
  COUNT(*) FILTER (WHERE status = 'responded') as total_responded,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'responded')::DECIMAL / 
    NULLIF(COUNT(*), 0) * 100, 2
  ) as response_rate,
  ROUND(AVG(response_time_minutes)) as avg_response_time_minutes,
  COUNT(*) FILTER (WHERE response_time_minutes <= 30) as under_30_min_count,
  COUNT(*) FILTER (WHERE response_time_minutes <= 120) as under_2_hours_count,
  COUNT(*) FILTER (WHERE response_time_minutes > 120) as over_2_hours_count
FROM unified_messages
WHERE received_at >= CURRENT_DATE - INTERVAL '30 days';

-- Create view for metrics by source
CREATE OR REPLACE VIEW response_metrics_by_source AS
SELECT 
  source,
  COUNT(*) as total_received,
  COUNT(*) FILTER (WHERE status = 'responded') as total_responded,
  ROUND(AVG(response_time_minutes)) as avg_response_time_minutes,
  COUNT(*) FILTER (WHERE status IN ('unread', 'read')) as pending_count,
  EXTRACT(EPOCH FROM (NOW() - MIN(received_at)) / 60) FILTER (
    WHERE status IN ('unread', 'read')
  )::INTEGER as oldest_pending_minutes
FROM unified_messages
WHERE received_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY source;

-- RLS policies (if needed)
-- ALTER TABLE unified_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE system_heartbeats ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE unified_messages IS 'Centralized tracking of all messages across platforms';
COMMENT ON TABLE settings IS 'System configuration settings';
COMMENT ON TABLE system_heartbeats IS 'Component health tracking';

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL ON unified_messages TO authenticated;
-- GRANT ALL ON settings TO authenticated;
-- GRANT ALL ON system_heartbeats TO authenticated;