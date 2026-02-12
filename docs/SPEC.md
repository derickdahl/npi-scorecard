# L3 Executive Operating System

**Mission:** Solve Derick's 360 feedback gaps through intelligent automation.

**Core Problems to Solve:**
1. Communication/responsiveness gaps → people feel ghosted
2. Follow-through visibility → stakeholders don't know status
3. Time management → mundane work consumes creative bandwidth

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    INCOMING CHANNELS                        │
│  Email │ Teams DM │ Teams Channel │ Slack │ iMessage        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  L3 INTAKE PROCESSOR                        │
│  • Parse sender, urgency, request type                      │
│  • Auto-acknowledge receipt                                  │
│  • Flag urgent for immediate attention                       │
│  • Create Asana task if actionable                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    ASANA TASK HUB                           │
│  • All requests become trackable tasks                      │
│  • Due dates, priorities, linked stakeholders               │
│  • Status changes trigger notifications                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 OUTBOUND BROADCASTER                        │
│  • Status updates to stakeholders                           │
│  • Route to preferred channel per person                    │
│  • "Working in public" digests                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Phases

### Phase 1: Email Auto-Acknowledge ✅ IN PROGRESS
- Poll inbox for new emails (every 5-15 min via heartbeat)
- Auto-reply to external senders with acknowledgment
- Flag internal urgent requests
- Store in tracking database

### Phase 2: Teams Monitoring
- Monitor Teams DMs and mentions
- Auto-acknowledge with response time estimate
- Integrate with Graph API

### Phase 3: Request → Asana Pipeline
- Parse email/message content for actionable requests
- Create Asana tasks with:
  - Title from subject/summary
  - Description with original message
  - Due date based on urgency
  - Tag with requester info

### Phase 4: Status Broadcaster
- Monitor Asana task changes
- Notify stakeholders when:
  - Task created (acknowledgment)
  - Status changes
  - Due date approaches
  - Task completed
- Route to stakeholder's preferred channel

### Phase 5: Draft & Approve Workflow
- Generate draft responses for routine requests
- Queue for Derick's approval
- Send on approval, learn from edits

### Phase 6: "Working in Public" Automation
- Daily/weekly digest of active work
- Post to relevant Teams channels
- Keep visibility high without manual effort

---

## Stakeholder Preferences Database

```json
{
  "stakeholders": {
    "email@example.com": {
      "name": "Jane Doe",
      "preferred_channel": "teams",
      "teams_id": "...",
      "urgency_threshold": "high",
      "update_frequency": "on_change"
    }
  }
}
```

---

## Auto-Acknowledge Templates

**Email (External):**
> Thanks for reaching out! Derick has received your message and will respond within [48 hours / by DATE]. If this is urgent, please reply with "URGENT" in the subject line.

**Email (Internal):**
> Got it! I'll get back to you by [DATE]. If you need something sooner, let me know.

**Teams DM:**
> 👋 Received! I'll follow up by [DATE]. Flag me if urgent.

---

## Technical Components

### 1. Email Monitor (`email_monitor.py`)
- Uses Microsoft Graph API
- Polls every 15 minutes (or webhook if available)
- Tracks processed message IDs to avoid duplicates

### 2. Auto-Responder (`auto_responder.py`)
- Determines if response needed
- Generates appropriate acknowledgment
- Sends via Graph API

### 3. Task Creator (`task_creator.py`)
- Parses requests using LLM
- Creates Asana tasks
- Links to original message

### 4. Status Tracker (`status_tracker.py`)
- Monitors Asana for changes
- Triggers notifications

### 5. Notification Router (`notification_router.py`)
- Looks up stakeholder preferences
- Routes to correct channel

---

## Heartbeat Integration

Add to HEARTBEAT.md:
```
- Check for new emails requiring acknowledgment
- Check Asana for status changes to broadcast
- Generate "working in public" updates if scheduled
```

---

## Success Metrics

1. **Response time perception:** Stakeholders feel acknowledged within 24h
2. **Follow-through visibility:** Status updates without being asked
3. **Derick's bandwidth:** Less time on "did you get my email?" conversations
4. **360 feedback improvement:** Next cycle shows improvement in communication scores

---

## Privacy & Control

- Derick approves all auto-response templates
- Draft mode for sensitive communications
- Easy override/disable for any automation
- Audit log of all automated actions
