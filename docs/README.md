# L3 Executive Operating System

**Status:** 🚧 Phase 1 In Progress

Automated system to solve Derick's 360 feedback gaps through intelligent automation.

## Quick Start

```bash
# Check for emails needing acknowledgment
./email_monitor.sh

# Send an acknowledgment
./auto_acknowledge.sh "email@example.com" "John Doe" "Original Subject" "message-id"
```

## What's Built

### ✅ Phase 1: Email Auto-Acknowledge
- `email_monitor.sh` - Polls inbox, filters automated emails, identifies those needing ack
- `auto_acknowledge.sh` - Sends personalized acknowledgment with response timeline
- Different templates for internal vs external senders
- Skips no-reply, notifications, automated senders

### 🔲 Phase 2: Teams Monitoring
- Coming next

### 🔲 Phase 3: Request → Asana Pipeline
- Coming soon

### 🔲 Phase 4: Status Broadcaster
- Coming soon

### 🔲 Phase 5: Draft & Approve Workflow
- Planned

### 🔲 Phase 6: Working in Public
- Planned

## Tracking

Asana Project: https://app.asana.com/0/1213021736920925

## Files

```
executive-os/
├── SPEC.md              # Full architecture and spec
├── README.md            # This file
├── email_monitor.sh     # Email checking script
├── auto_acknowledge.sh  # Send acknowledgments
├── .email_state.json    # Tracks processed emails
└── email_monitor.log    # Activity log
```

## Integration

To add to heartbeat checks, add to HEARTBEAT.md:
```
- Run ~/clawd/projects/executive-os/email_monitor.sh
- Process any emails needing acknowledgment
```
