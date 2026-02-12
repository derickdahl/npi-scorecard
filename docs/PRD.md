# Executive OS — Product Requirements Document

> The operating system for your AI Executive Assistant: configure behavior, set rules, automate responses, and measure results.

**Owner:** Derick Dahl  
**Builder:** L3  
**Status:** PRD Review  
**Date:** January 29, 2026

---

## 1. Vision

**Executive OS is not just a dashboard — it's the control center for your virtual EA.**

Two sides:
1. **Admin Panel** (private) — Configure how the EA behaves, set rules, customize responses
2. **Public Dashboard** (employee-visible) — Shows results, responsiveness metrics, productivity data

Think of it like:
- Admin = Programming the robot
- Dashboard = Showing the robot's performance

---

## 2. Problem Statement

### For the Executive
- No centralized way to configure AI assistant behavior
- Can't set rules for auto-responses by message type
- No way to customize response tone/copy
- No visibility into what's being handled automatically vs manually

### For the Organization
- No transparency into executive availability/responsiveness
- No data on where executive time is allocated
- No proof that "responsiveness issues" have been addressed

---

## 3. Product Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      EXECUTIVE OS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────┐    ┌─────────────────────────┐    │
│  │      ADMIN PANEL        │    │    PUBLIC DASHBOARD     │    │
│  │      (Private)          │    │    (Employee-Visible)   │    │
│  │                         │    │                         │    │
│  │  • EA Behavior Config   │    │  • Response Metrics     │    │
│  │  • Auto-Response Rules  │    │  • Time Allocation      │    │
│  │  • Response Templates   │    │  • Availability Status  │    │
│  │  • Channel Settings     │    │  • Amplification Stats  │    │
│  │  • Delegation Rules     │    │  • Trends & History     │    │
│  │  • Notification Prefs   │    │                         │    │
│  │                         │    │                         │    │
│  └─────────────────────────┘    └─────────────────────────┘    │
│           ▲                              ▲                      │
│           │                              │                      │
│       Derick                         Employees                  │
│       (Admin)                        (Viewers)                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Admin Panel Features

### 4.1 Executive Profile (The "Brain File")

Everything the EA needs to know to truly support you — like a digital briefing book.

**Basic Info:**
- Full name, preferred name, pronouns
- Title, company, department
- Email, phone, time zone
- Photo (for public dashboard)
- Bio (for external communications)

**Communication Preferences:**
- Response style (formal, casual, brief, detailed)
- Preferred sign-off ("Best", "Thanks", "Cheers")
- Email signature
- Tone preferences (direct, warm, diplomatic)
- Pet peeves (what NOT to do)

**VIP List:**
- People who always get prioritized
- CEO, board members, key clients
- Family members
- How to handle each (immediate escalate, auto-respond, etc.)

**Calendar Preferences:**
- Preferred meeting lengths (30 min default?)
- Buffer time between meetings
- Focus time blocks (don't schedule)
- Meeting-free days
- Earliest/latest meeting times
- Lunch block preferences

**Travel Preferences:**
- Airline preferences, loyalty programs
- Seat preferences (aisle, window, class)
- Hotel preferences, loyalty programs
- Dietary restrictions for travel
- TSA PreCheck / Global Entry info
- Passport expiration date

**Food & Dining:**
- Dietary restrictions/allergies
- Favorite restaurants (by city)
- Coffee order
- Food for meetings (what to order)

**Family & Personal:**
- Spouse/partner name
- Kids names and ages
- Important family dates (for scheduling conflicts)
- Personal commitments (coaching, volunteering, etc.)

**Work Style:**
- Decision-making style (data-driven, intuitive, collaborative)
- Communication cadence preferences
- Status update frequency
- Meeting style (structured, free-flowing)
- Feedback style (direct, sandwich)

**Goals & Priorities:**
- Current top 3 priorities
- OKRs or key metrics
- Projects to protect time for
- Things to say "no" to

**Key Relationships:**
- Direct reports (names, roles)
- Key stakeholders
- Important clients/partners
- People to always make time for
- People to deprioritize

**Delegation Preferences:**
- What can be decided without me
- What always needs my approval
- Who can speak on my behalf
- Budget authority levels

---

### 4.2 EA Behavior Configuration

**General Settings:**
- EA Name/Persona (e.g., "L3", "Derick's Assistant")
- Working hours (when EA is active)
- Response style (formal, casual, brief, detailed)
- Signature line for auto-responses

**Channel Configuration:**
| Setting | Options |
|---------|---------|
| Email - Auto-respond | On/Off |
| Email - Auto-triage | On/Off |
| Teams DM - Auto-respond | On/Off |
| Teams @mention - Auto-respond | On/Off |
| Slack DM - Auto-respond | On/Off |
| Slack @mention - Auto-respond | On/Off |
| iMessage - Auto-respond | On/Off |

---

### 4.2 Auto-Response Rules Engine

**Rule Structure:**
```
IF [condition] THEN [action] WITH [template]
```

**Conditions (can combine with AND/OR):**
- Channel = (Email, Teams, Slack, iMessage)
- Sender is (specific person, department, external, internal)
- Subject contains (keywords)
- Message contains (keywords)
- Time is (business hours, after hours, weekend)
- Priority is (urgent, normal, low)
- Message type is (question, request, FYI, meeting invite)

**Actions:**
- Auto-respond with template
- Acknowledge and escalate to Derick
- Forward to delegate
- Mark as handled (no response needed)
- Add to task queue
- Schedule follow-up reminder

**Example Rules:**
| Rule Name | Condition | Action |
|-----------|-----------|--------|
| OOO Auto-Reply | Any message + Derick is OOO | Reply with OOO template |
| Meeting Request | Subject contains "meeting" or "schedule" | Reply with calendar link template |
| Urgent Escalation | Subject contains "urgent" or "ASAP" | Acknowledge + Escalate to Derick immediately |
| FYI Acknowledge | Subject starts with "FYI" | Auto-acknowledge, no response needed |
| Vendor Inquiry | Sender domain not @sonance.com | Reply with vendor inquiry template |
| Team Status Request | Message contains "status" + sender is internal | Generate and send status update |

---

### 4.3 Response Templates

**Template Editor:**
- Name
- Category (Acknowledgment, OOO, Meeting, Status, Custom)
- Subject line (for email)
- Body (with variables)
- Channels (where this template can be used)

**Available Variables:**
```
{{sender_name}} - First name of sender
{{sender_full_name}} - Full name
{{my_name}} - Derick Dahl
{{current_date}} - Today's date
{{current_time}} - Current time
{{calendar_link}} - Link to book time
{{response_time}} - Expected response time
{{delegate_name}} - Name of delegate if applicable
```

**Example Templates:**

**Acknowledgment (Quick):**
```
Hi {{sender_name}},

Got it — I'll review and get back to you within {{response_time}}.

Best,
{{my_name}}
```

**OOO Response:**
```
Hi {{sender_name}},

Thanks for reaching out. I'm currently out of office and will return on {{return_date}}.

For urgent matters, please contact {{delegate_name}}.

Best,
{{my_name}}
```

**Meeting Request:**
```
Hi {{sender_name}},

Happy to connect! Here's my calendar link to find a time that works:
{{calendar_link}}

Looking forward to it.

Best,
{{my_name}}
```

---

### 4.4 Delegation Rules

**Configure who can handle what:**

| Delegate | Can Handle |
|----------|------------|
| L3 (AI) | Research, drafts, scheduling, data analysis, status updates |
| EA (Human) | Expense reports, travel booking, confidential matters |
| Direct Reports | Technical questions in their domain |

**Auto-Delegation Rules:**
- If message type = "schedule meeting" → L3 handles
- If message type = "status request" → L3 handles
- If message type = "expense question" → Forward to EA
- If message type = "technical question" + about audio → Forward to Engineering lead

---

### 4.5 Notification Preferences

**When to alert Derick:**
- [ ] Urgent messages (always)
- [ ] Messages from VIPs (CEO, board, key clients)
- [ ] Messages waiting > X hours
- [ ] Daily digest of handled messages
- [ ] Weekly summary report

**Alert channels:**
- [ ] iMessage
- [ ] Email
- [ ] Slack DM
- [ ] Push notification

---

## 5. Public Dashboard Features

### 5.1 Access

- **URL:** `executiveos.vercel.app/dashboard/derick` (or similar)
- **No login required** for basic view
- **Shows:** Metrics only (no message content, no sender names)

### 5.2 Dashboard Sections

**Hero Stats:**
```
┌─────────────────────────────────────────────────────────────┐
│  DERICK DAHL — Head of Technology & Innovation              │
│  SONANCE                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  RESPONSE   │  │   HOURS     │  │  AMPLIFIED  │         │
│  │   2.4 hrs   │  │  This Week  │  │    1.8x     │         │
│  │  avg time   │  │     47      │  │  capacity   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Responsiveness by Channel:**
- Visual bars/charts showing response time per channel
- Trend line showing improvement over time

**Time Allocation:**
- Pie chart: Hours by department
- Bar chart: Strategic vs Operational vs Admin

**Availability Status:**
- Current status (Available, In Meeting, Focus Time, OOO)
- Best times to reach (based on historical response data)

**AI Assistance Stats:**
- Messages handled by EA this week
- Tasks completed by EA
- Time saved

---

## 6. Technical Architecture

### 6.1 Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 + TypeScript |
| Styling | Tailwind CSS + Sonance Brand MCP |
| Charts | Recharts |
| Backend | Next.js API Routes |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth (Admin only) |
| Hosting | Vercel |
| Version Control | GitHub |

### 6.2 Database Schema

```sql
-- Executives (supports multi-exec in future)
CREATE TABLE executives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    title TEXT,
    company TEXT,
    slug TEXT UNIQUE,  -- for public URL
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Response Rules
CREATE TABLE response_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    executive_id UUID REFERENCES executives(id),
    name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,  -- higher = checked first
    conditions JSONB NOT NULL,   -- {channel, sender, contains, time, etc}
    action TEXT NOT NULL,        -- auto_respond, escalate, delegate, etc
    template_id UUID REFERENCES response_templates(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Response Templates
CREATE TABLE response_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    executive_id UUID REFERENCES executives(id),
    name TEXT NOT NULL,
    category TEXT,
    subject TEXT,
    body TEXT NOT NULL,
    channels TEXT[],  -- {email, teams, slack, imessage}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages (for tracking)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    executive_id UUID REFERENCES executives(id),
    channel TEXT NOT NULL,
    external_id TEXT,
    sender TEXT,
    received_at TIMESTAMPTZ NOT NULL,
    responded_at TIMESTAMPTZ,
    response_time_minutes INTEGER,
    handled_by TEXT,  -- derick, l3, auto, delegated
    rule_applied UUID REFERENCES response_rules(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks (from Asana)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    executive_id UUID REFERENCES executives(id),
    asana_gid TEXT,
    name TEXT,
    completed_at TIMESTAMPTZ,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    completed_by TEXT,
    department TEXT,
    work_theme TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Metrics (aggregated)
CREATE TABLE daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    executive_id UUID REFERENCES executives(id),
    date DATE NOT NULL,
    channel TEXT,
    messages_received INTEGER DEFAULT 0,
    messages_responded INTEGER DEFAULT 0,
    messages_auto_handled INTEGER DEFAULT 0,
    avg_response_minutes DECIMAL(10,2),
    hours_worked DECIMAL(5,2),
    hours_saved DECIMAL(5,2),
    UNIQUE(executive_id, date, channel)
);
```

### 6.3 Page Structure

```
/                       → Landing/Marketing page
/login                  → Admin login
/admin                  → Admin dashboard (protected)
/admin/rules            → Response rules config
/admin/templates        → Template editor
/admin/channels         → Channel settings
/admin/delegation       → Delegation config
/admin/notifications    → Alert preferences
/dashboard/[slug]       → Public dashboard (e.g., /dashboard/derick)
/api/...                → Backend API routes
```

---

## 7. Implementation Plan

### Phase 1: Foundation (Days 1-3)
- [ ] Create GitHub repo `executive-os`
- [ ] Create Supabase project
- [ ] Scaffold Next.js app with Sonance branding
- [ ] Deploy to Vercel
- [ ] Basic auth for admin
- [ ] Database schema

### Phase 2: Admin Panel (Days 4-8)
- [ ] Executive profile settings
- [ ] Response rules CRUD
- [ ] Template editor
- [ ] Channel configuration
- [ ] Delegation settings
- [ ] Notification preferences

### Phase 3: Data Collection (Days 9-12)
- [ ] Microsoft Graph integration
- [ ] Slack integration
- [ ] iMessage integration  
- [ ] Asana sync
- [ ] Rule evaluation engine
- [ ] Auto-response execution

### Phase 4: Public Dashboard (Days 13-16)
- [ ] Dashboard UI with charts
- [ ] Responsiveness metrics
- [ ] Time allocation views
- [ ] Amplification stats
- [ ] Real-time updates

### Phase 5: Polish (Days 17-18)
- [ ] Mobile responsive
- [ ] PDF export
- [ ] Sonance branding polish
- [ ] Documentation
- [ ] Testing

---

## 8. Open Questions

1. **Multi-exec support?** Just you for now, or design for multiple execs from the start?
2. **Who configures rules?** Just you, or can EA/assistant also configure?
3. **Approval workflow?** Should auto-responses require approval before sending initially?
4. **Public dashboard privacy?** Any metrics that should NOT be public?
5. **Integration with Clawdbot?** Should this feed into/from your existing L3 setup?

---

## 9. Success Criteria

1. **Admin can configure** rules and templates without code
2. **EA executes** auto-responses based on rules
3. **Dashboard shows** real-time responsiveness metrics
4. **Employees can see** Derick's availability/responsiveness
5. **Data proves** improvement in responsiveness

---

## 10. Future Vision (V2+)

- **Multi-executive** — Other execs at Sonance can use it
- **Team rollup** — Department-level responsiveness
- **AI rule suggestions** — "You often respond X way to Y, create rule?"
- **Mobile app** — Configure on the go
- **Slack/Teams bot** — Check metrics via chat
- **Calendar integration** — Auto-set availability status

---

**This is the home base for your virtual EA.** Configure it, monitor it, prove it works. 🚀

Ready for approval? ✅
