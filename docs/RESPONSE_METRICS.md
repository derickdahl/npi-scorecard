# Response Metrics Dashboard

> Track and visualize communication responsiveness across all channels.

**Goal:** Provide data-driven proof that responsiveness has been addressed and improved, shareable with leadership.

---

## Data Sources

| Channel | API | What to Track |
|---------|-----|---------------|
| **Email** | Microsoft Graph | Incoming emails → my replies |
| **Teams DM** | Microsoft Graph | Direct messages → my responses |
| **Teams @mentions** | Microsoft Graph | Channel posts mentioning me → my replies |
| **Slack DM** | Slack API | Direct messages → my responses |
| **Slack @mentions** | Slack API | Channel mentions → my replies |
| **iMessage/Text** | imsg CLI | Texts received → my replies |

---

## Key Metrics

### Per Message
- `received_at` — When message arrived
- `responded_at` — When I replied (null if no response yet)
- `response_time_minutes` — Delta between received and responded
- `channel` — Which platform
- `sender` — Who sent it (anonymized for dashboard?)
- `requires_response` — Boolean (filter out FYIs, automated msgs)

### Aggregated
- **Average Response Time** — By channel, by day/week/month
- **Median Response Time** — Less skewed by outliers
- **Response Rate** — % of messages that got a reply
- **Volume** — Messages received per day/week
- **Time to First Response** — For threads
- **Business Hours vs After Hours** — Response patterns

### Benchmarks
- Industry standard: < 24 hours for email, < 4 hours for IM
- Personal targets: Set and track against goals
- Trend lines: Show improvement over time

---

## Dashboard Views

### 1. Executive Summary
```
┌─────────────────────────────────────────────────────────┐
│  RESPONSE METRICS - January 2026                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Overall Response Time:  2.4 hours (▼ 40% vs Dec)      │
│  Response Rate:          94%                            │
│  Messages This Month:    847                            │
│                                                         │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐   │
│  │  Email  │ Teams DM│ Teams @ │ Slack DM│ Slack @ │   │
│  │  3.2h   │  1.1h   │  2.8h   │  0.8h   │  1.5h   │   │
│  │  ▼ 35%  │  ▼ 22%  │  ▼ 45%  │  ▼ 15%  │  ▼ 30%  │   │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2. Trend Chart
- Line graph showing response time over weeks/months
- Separate lines per channel
- Clear "before/after" for 360 feedback date

### 3. Distribution View
- Histogram of response times
- Shows: "X% responded within 1 hour, Y% within 4 hours..."

### 4. Channel Breakdown
- Detailed stats per channel
- Top senders (optional, for internal use only)
- Busiest times/days

### 5. Shareable Report
- Clean, executive-friendly PDF export
- Key metrics only
- "Responsiveness Report: Q1 2026"

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DATA COLLECTION                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Email   │  │  Teams   │  │  Slack   │             │
│  │  Poller  │  │  Poller  │  │  Poller  │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │             │             │                    │
│       └─────────────┼─────────────┘                    │
│                     ▼                                   │
│            ┌─────────────────┐                         │
│            │  Message Store  │  (SQLite or Postgres)   │
│            │  - messages     │                         │
│            │  - responses    │                         │
│            │  - metrics      │                         │
│            └────────┬────────┘                         │
│                     │                                   │
│                     ▼                                   │
│            ┌─────────────────┐                         │
│            │  Metrics Engine │  (Calculate aggregates) │
│            └────────┬────────┘                         │
│                     │                                   │
│                     ▼                                   │
│            ┌─────────────────┐                         │
│            │   Dashboard     │  (Next.js / React)      │
│            │   Web App       │                         │
│            └─────────────────┘                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack
- **Backend:** Python (data collection) + FastAPI (API)
- **Database:** SQLite (simple) or PostgreSQL (scalable)
- **Frontend:** Next.js + Tailwind + Recharts
- **Hosting:** Local Mac Studio or Vercel (for sharing)
- **Auth:** Simple token or password for dashboard access

---

## Data Collection Logic

### Email (Microsoft Graph)
```python
# Poll inbox for new messages
GET /me/messages?$filter=receivedDateTime gt {last_check}

# For each incoming email:
# - Store message_id, sender, received_at, subject
# - Mark as "awaiting_response"

# Poll sent items
GET /me/mailFolders/sentitems/messages?$filter=sentDateTime gt {last_check}

# Match sent emails to received (by thread/conversation ID)
# Calculate response_time
```

### Teams (Microsoft Graph)
```python
# Get chats (DMs and group chats)
GET /me/chats

# Get messages in each chat
GET /me/chats/{chat_id}/messages?$filter=createdDateTime gt {last_check}

# For @mentions in channels
GET /me/joinedTeams
GET /teams/{team_id}/channels
GET /teams/{team_id}/channels/{channel_id}/messages
# Filter for messages containing @mention of me
```

### Slack
```python
# Get DMs
conversations.list (types=im)
conversations.history (channel=dm_id)

# Get @mentions
search.messages (query="<@USER_ID>")

# Match my replies by thread_ts
```

### iMessage
```bash
# Use imsg CLI
imsg history --since "2026-01-01" --json
# Parse and extract received vs sent
```

---

## Response Matching Logic

Determining "did I respond?" is tricky:

1. **Email:** Use conversationId — if I sent a reply in same thread, it's a response
2. **Teams DM:** Next message from me in same chat = response
3. **Teams Channel:** Reply in same thread = response
4. **Slack DM:** Next message from me = response
5. **Slack Channel:** Reply in thread OR message within X minutes = response
6. **iMessage:** Next outgoing message to same sender = response

### Edge Cases
- **FYI/No response needed:** Flag these manually or use heuristics (short messages, no question marks, CC'd emails)
- **Delegated responses:** Option to mark "delegated to X" 
- **Auto-responses:** Exclude from metrics
- **Group threads:** Count as responded if I contributed

---

## Privacy & Sharing

### For Personal Use
- Full detail: every message, every sender
- Drill down into specific conversations

### For Sharing with Leadership
- Aggregated metrics only
- No message content
- No specific sender names (unless relevant)
- Focus on trends and improvements

### Dashboard Access Levels
- **Admin (Derick):** Full access, all data
- **Viewer (Ari, etc.):** Summary view, trends, no raw data

---

## Implementation Phases

### Phase 1: Data Collection (Week 1)
- [ ] Set up SQLite database schema
- [ ] Email poller (Microsoft Graph)
- [ ] Teams DM/mention poller
- [ ] Slack DM/mention poller
- [ ] iMessage parser
- [ ] Basic CLI to view raw data

### Phase 2: Metrics Engine (Week 2)
- [ ] Response matching algorithm
- [ ] Aggregate calculations
- [ ] Historical backfill (if possible)
- [ ] Scheduled polling (every 5-15 min)

### Phase 3: Dashboard MVP (Week 3)
- [ ] Next.js app scaffold
- [ ] Executive summary view
- [ ] Trend charts
- [ ] Channel breakdown
- [ ] Basic auth

### Phase 4: Polish & Share (Week 4)
- [ ] PDF export for reports
- [ ] Shareable viewer mode
- [ ] Mobile-friendly design
- [ ] Alerts for long response times

---

## Sample Database Schema

```sql
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    channel TEXT NOT NULL,  -- email, teams_dm, teams_mention, slack_dm, slack_mention, imessage
    external_id TEXT,       -- ID from source system
    sender TEXT,
    sender_email TEXT,
    subject TEXT,
    received_at TIMESTAMP NOT NULL,
    requires_response BOOLEAN DEFAULT TRUE,
    responded_at TIMESTAMP,
    response_time_minutes INTEGER,
    thread_id TEXT,
    raw_data JSON
);

CREATE TABLE daily_metrics (
    date DATE PRIMARY KEY,
    channel TEXT,
    messages_received INTEGER,
    messages_responded INTEGER,
    avg_response_minutes REAL,
    median_response_minutes REAL,
    p90_response_minutes REAL
);

CREATE INDEX idx_messages_received ON messages(received_at);
CREATE INDEX idx_messages_channel ON messages(channel);
```

---

## Success Criteria

1. **Data Accuracy:** Correctly captures 95%+ of relevant messages
2. **Response Matching:** Accurately pairs responses to incoming messages
3. **Dashboard Usability:** Ari can understand it in 30 seconds
4. **Demonstrable Improvement:** Shows trend from "before" to "after"
5. **Shareable:** Can generate a clean report for leadership

---

## Questions to Resolve

1. **Historical Data:** How far back can we pull? (Graph API limits, Slack retention)
2. **What counts as "needs response"?** Filter criteria?
3. **Business hours only?** Or 24/7 measurement?
4. **Target benchmarks?** What response times are we aiming for?
5. **Who gets access?** Just Ari, or broader leadership?

---

*This is your receipts machine. 🧾*
