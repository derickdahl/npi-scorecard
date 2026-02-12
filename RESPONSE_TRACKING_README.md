# Executive OS - Automatic Response Tracking

> Automatically mark messages as "done" when you respond across all platforms

## Overview

This system automatically tracks when you respond to messages across different platforms and marks them as "done" in Executive OS. No more manual tracking - just respond naturally and the system handles the rest.

## Supported Platforms

| Platform | Channel Types | Detection Method | Status |
|----------|---------------|------------------|--------|
| **Email (Outlook)** | Work, Personal | Microsoft Graph API | ✅ Ready |
| **Microsoft Teams** | @mentions, DMs | Microsoft Graph API | ✅ Ready |
| **Slack** | DMs, @mentions | Slack API | ✅ Ready |
| **iMessage** | SMS, iMessage | imsg CLI | ✅ Ready |
| **WhatsApp** | Direct messages | WhatsApp API | 🔜 Future |
| **Signal** | Direct messages | Signal API | 🔜 Future |

## How It Works

### 1. Message Detection
- Each platform integration monitors for incoming messages that require your attention
- Messages are automatically categorized by urgency and type
- Metadata is stored in the `unified_messages` table

### 2. Response Detection
- System monitors outgoing messages on each platform
- When you reply to a tracked message, it's automatically detected
- Response time is calculated and stored

### 3. Status Updates
- Message status changes from "unread" → "responded"
- Response metrics are updated in real-time
- Executive OS dashboard reflects the changes immediately

## Quick Setup

```bash
# 1. Navigate to Executive OS directory
cd projects/executive-os

# 2. Set up the database
# Run supabase-schema.sql in your Supabase SQL editor

# 3. Run the setup script
chmod +x scripts/setup-response-tracking.sh
./scripts/setup-response-tracking.sh

# 4. Test the system
./scripts/message-tracking.sh "test-123" "email_work" "Test User" "Test Subject" "$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
```

## Manual Testing

```bash
# Mark a specific message as done
./scripts/message-tracking.sh \
  "message-id-123" \
  "email_work" \
  "John Doe <john@company.com>" \
  "Meeting Request" \
  "2026-02-05T10:30:00Z"

# Test L3/Clawdbot integration
./scripts/clawdbot-integration.sh \
  "slack-msg-456" \
  "slack" \
  "Jane Smith" \
  "Quick question about the project"
```

## Integration Details

### Email (Microsoft Graph)
- **Monitors**: Sent items folder
- **Detection**: Looks for "Re:" replies to tracked conversations
- **Channels**: `email_work`, `email_personal`
- **Requirements**: Microsoft Graph credentials

### Microsoft Teams
- **Monitors**: Chat messages and @mentions
- **Detection**: Checks for your responses in conversation threads
- **Channels**: `teams_mention`, `teams_dm`
- **Requirements**: Microsoft Graph credentials with Teams scope

### Slack
- **Monitors**: All channels and DMs
- **Detection**: Finds your replies to messages that mentioned/DMed you
- **Channels**: `slack`
- **Requirements**: Slack token with appropriate scopes

### iMessage
- **Monitors**: All conversations
- **Detection**: Checks for your responses to incoming messages
- **Channels**: `imessage`
- **Requirements**: `imsg` CLI tool

### L3/Clawdbot Integration
When L3 responds through Clawdbot, the system automatically:
1. Identifies the original message being responded to
2. Calls the mark-done API
3. Updates response metrics
4. Logs the AI-assisted response

## Automation Schedule

The system runs every **5 minutes** via cron:
```bash
# Cron job (added automatically by setup script)
*/5 * * * * /path/to/executive-os/scripts/run-response-tracking.sh
```

### Manual Runs
```bash
# Run all integrations once
./scripts/run-response-tracking.sh

# Run specific integration
./scripts/integrations/email-response-tracker.sh
./scripts/integrations/teams-response-tracker.sh
./scripts/integrations/slack-response-tracker.sh
./scripts/integrations/imessage-response-tracker.sh
```

## API Endpoints

### Mark Message as Done
```bash
POST /api/messages/mark-done
{
  "externalId": "message-123",
  "channel": "email_work", 
  "sender": "John Doe <john@company.com>",
  "subject": "Meeting Request",
  "receivedAt": "2026-02-05T10:30:00Z",
  "responseMethod": "manual"
}
```

### System Heartbeat
```bash
POST /api/system/heartbeat
{
  "component": "response-tracking",
  "status": "completed",
  "timestamp": "2026-02-05T15:45:00Z"
}
```

## Configuration

### Environment Variables
```bash
# Executive OS URL (for API calls)
export EXECUTIVE_OS_URL="http://localhost:3000"

# Or for production
export EXECUTIVE_OS_URL="https://executive-os.vercel.app"
```

### Credential Requirements
- `~/.clawdbot/credentials/microsoft-graph.json` - For email/Teams
- `~/.clawdbot/credentials/slack-token` - For Slack (optional)
- `imsg` CLI installed - For iMessage (optional)

## Monitoring & Logs

### Log Files
- `scripts/response-tracking-master.log` - Main system log
- `scripts/message-tracking.log` - Individual tracking events
- `scripts/integrations/.{platform}_response_state.json` - Platform state

### View Recent Activity
```bash
# Main log
tail -f scripts/response-tracking-master.log

# Specific integration
tail -f scripts/integrations/.email_response_state.json

# System status
curl http://localhost:3000/api/system/heartbeat
```

## Troubleshooting

### Common Issues

**"Supabase not configured"**
- Check `.env.local` has correct Supabase credentials
- Ensure database schema is applied

**"Microsoft Graph credentials missing"**
```bash
~/.clawdbot/scripts/msgraph.sh setup
```

**"imsg CLI not found"**
```bash
npm install -g imsg
```

**"Cron job not running"**
```bash
# Check crontab
crontab -l | grep response-tracking

# Check cron logs (macOS)
log stream --predicate 'process == "cron"' --info
```

### Testing Components

```bash
# Test database connection
curl -X POST http://localhost:3000/api/messages/mark-done \
  -H "Content-Type: application/json" \
  -d '{"externalId":"test","channel":"email_work","sender":"Test","subject":"Test"}'

# Test Microsoft Graph
~/.clawdbot/scripts/msgraph.sh token

# Test Slack
curl -H "Authorization: Bearer $(cat ~/.clawdbot/credentials/slack-token)" \
  https://slack.com/api/auth.test
```

## Dashboard Integration

The Executive OS dashboard automatically shows:
- **Response Rate**: Percentage of messages responded to
- **Average Response Time**: Across all platforms
- **Platform Breakdown**: Metrics per channel type
- **Recent Activity**: Latest responses and their timing

## Security & Privacy

- All processing happens locally on your machine
- Message content is only stored as previews (first 100 characters)
- Full message content never leaves your system
- Credentials are stored securely in `~/.clawdbot/credentials/`

## Future Enhancements

- [ ] WhatsApp Business API integration
- [ ] Signal integration via signal-cli
- [ ] LinkedIn message tracking
- [ ] Smart priority detection based on sender/content
- [ ] Automated response suggestions
- [ ] Response template matching
- [ ] Calendar integration for response time expectations

---

Built with ❤️ by L3 for efficient executive communication tracking.