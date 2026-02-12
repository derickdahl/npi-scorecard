# Executive OS

> The operating system for your AI Executive Assistant: configure behavior, set rules, automate responses, and measure results.

## Features

### Admin Panel (Private)
- **Executive Profile** — Your preferences, VIPs, calendar settings, and personal info
- **Response Rules** — Configure auto-response rules and conditions
- **Templates** — Manage response templates and copy
- **Channel Settings** — Configure Email, Teams, Slack, and iMessage
- **VIP Contacts** — Manage priority contacts and relationships
- **Delegation** — Set what the AI can handle autonomously

### Public Dashboard (Employee-Visible)
- Response time metrics by channel
- Time allocation charts
- AI assistant performance stats
- Availability status

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Auth**: Supabase Auth (coming soon)

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── admin/
│   │   ├── page.tsx          # Admin dashboard
│   │   └── profile/
│   │       └── page.tsx      # Executive profile editor
│   └── dashboard/
│       └── [slug]/
│           └── page.tsx      # Public dashboard
├── lib/
│   └── supabase.ts           # Supabase client & types
└── components/               # Shared components (coming soon)
```

## Database Schema

- `executives` — Executive profiles and settings
- `response_rules` — Auto-response rule definitions
- `response_templates` — Message templates
- `messages` — Message tracking for metrics
- `tasks` — Task tracking (synced from Asana)
- `daily_metrics` — Aggregated daily stats
- `vip_contacts` — VIP contact list

## Roadmap

- [x] Phase 1: Foundation + Profile
- [ ] Phase 2: Response Rules Engine
- [ ] Phase 3: Data Collection & Sync
- [ ] Phase 4: Real-time Dashboard

---

Built with ❤️ by L3 for Derick
