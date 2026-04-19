# CLAUDE.md — PM Tool

> This file gives Claude Code persistent context about the PM Tool project.
> Read this file at the start of every session before making any changes.

---

## What We Are Building

PM Tool is a web-based project management platform for project managers and cross-functional teams. It combines dependency-aware Gantt timelines, automated deadline notifications, and team collaboration in one place.

The core problem we are solving: project managers spend too much time manually following up with task owners. PM Tool puts accountability on autopilot — the system sends reminders automatically so the PM can focus on strategy, not status updates.

Full product details are in the PRD document. Always refer to the PRD for feature requirements before building anything.

---

## Project Documents

These files live in the root of this project folder. Read the relevant ones at the start of each session based on what you are working on.

| Document | Purpose | When to Read |
|----------|---------|--------------|
| [PRD](./PRD.md) | Full product requirements, user stories, feature specs, and release phases | Before building any new feature |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical structure, data flow diagrams, and key architectural decisions | Before making any structural or technical changes |
| [STATUS.md](./STATUS.md) | Current build phase, feature progress tracker, and session goals | At the start of every session |
| [CHANGELOG.md](./CHANGELOG.md) | Running log of what was built, changed, or fixed | At the end of every session before closing |

> All documents are kept up to date by the product owner. Always read the latest version — never rely on memory from a previous session.

---

## Who I Am

I am the product owner and a non-developer learning to build with AI assistance. I understand product thinking and user experience well, but I am not a professional engineer. This means:

- Always explain what you are doing and why in plain terms
- Technical terms are fine — but briefly explain them when first used
- Never assume I know why a technical decision was made. Tell me
- If something could be done multiple ways, tell me the options and your recommendation before proceeding

---

## How I Want You to Work With Me

**Always ask before making changes.**

Before writing or modifying any code, tell me:
1. What you are about to do
2. Which files will be created or changed
3. Why this approach makes sense

Wait for my confirmation before proceeding. This applies to every change — small or large.

**One step at a time.**

Do not build multiple features in one go unless I explicitly ask. Complete one piece, show me the result, wait for my feedback, then move to the next.

**Explain errors in plain language.**

If something breaks, tell me what went wrong in plain English before showing me the error message. Then walk me through how to fix it step by step.

**Never delete or overwrite files without asking first.**

If a change requires deleting or significantly restructuring existing code, flag this explicitly and explain why before doing anything.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14+ with TypeScript | Full-stack — frontend and backend in one project |
| Styling | Tailwind CSS | Utility-first CSS, no separate stylesheet files |
| State Management | TanStack Query | For fetching and caching server data |
| Database | Supabase (PostgreSQL) | Already configured — use existing Supabase project |
| Authentication | Supabase Auth | Email/password for MVP, Google OAuth in v1 |
| Email | Resend | For transactional notification emails |
| Job Scheduling | node-cron | For scheduled notification delivery (MVP) |
| Gantt Chart | Frappe Gantt | Open source Gantt library |
| Hosting | Vercel + Supabase | Deployed from GitHub automatically |

---

## Project Structure

```
pm-tool/
├── app/                  # Next.js app router pages and layouts
│   ├── (auth)/           # Login, signup, password reset pages
│   ├── dashboard/        # Project dashboard page
│   ├── timeline/[id]/    # Individual timeline/Gantt view
│   └── api/              # API route handlers
├── components/           # Reusable UI components
│   ├── gantt/            # Gantt chart components
│   ├── tasks/            # Task list and task row components
│   └── ui/               # Generic UI elements (buttons, inputs, etc.)
├── lib/                  # Shared utilities and helpers
│   ├── supabase/         # Supabase client and database queries
│   ├── notifications/    # Notification logic and email templates
│   └── dependencies/     # Dependency calculation and DAG logic
├── types/                # TypeScript type definitions
├── public/               # Static assets
├── CLAUDE.md             # This file — read at session start
└── PRD.md                # Full product requirements document
```

---

## Database Schema (MVP)

### users
Managed by Supabase Auth — do not create a custom users table.

### timelines
```sql
create table timelines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### tasks
```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  timeline_id uuid references timelines(id) on delete cascade not null,
  name text not null,
  start_date date not null,
  end_date date not null,
  duration_days integer not null,
  status text check (status in ('not_started', 'in_progress', 'complete', 'blocked')) default 'not_started',
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

> ⚠️ Do NOT add `row_color` or `font_color` columns to tasks — these are v2 features and will be added via migration when v2 begins.

### dependencies
```sql
create table dependencies (
  id uuid primary key default gen_random_uuid(),
  predecessor_id uuid references tasks(id) on delete cascade not null,
  successor_id uuid references tasks(id) on delete cascade not null,
  type text default 'finish_to_start',
  unique(predecessor_id, successor_id)
);
```

### notifications
> ⚠️ Do NOT create a notifications table during MVP — this is a v1 feature and will be added via migration when v1 begins.

### Row Level Security (RLS)
RLS must be enabled on all tables. Use these exact policies:

```sql
alter table timelines enable row level security;
alter table tasks enable row level security;
alter table dependencies enable row level security;

-- Users can only access their own timelines
create policy "Users manage own timelines"
  on timelines for all
  using (auth.uid() = user_id);

-- Users can only access tasks that belong to their timelines
create policy "Users manage own tasks"
  on tasks for all
  using (
    exists (
      select 1 from timelines
      where timelines.id = tasks.timeline_id
      and timelines.user_id = auth.uid()
    )
  );

-- Users can only access dependencies for tasks in their timelines
create policy "Users manage own dependencies"
  on dependencies for all
  using (
    exists (
      select 1 from tasks
      join timelines on timelines.id = tasks.timeline_id
      where tasks.id = dependencies.predecessor_id
      and timelines.user_id = auth.uid()
    )
  );
```

---

## Key Business Logic Rules

### Dependency Recalculation
When a task's start date or duration changes, all downstream dependent tasks must automatically recalculate their start dates. This cascades recursively through the dependency chain. Always validate for circular dependencies before saving — reject and surface a clear error message if a cycle is detected.

### Task Duration
Duration in days and end date must always stay in sync. If the user edits duration, recalculate end date. If the user edits end date, recalculate duration. Never let them fall out of sync.

### Status Colors
- Not Started → gray
- In Progress → blue
- Complete → green
- Blocked → red/orange

### Notifications (v1)
- Task due today → send at 8:00 AM on due date
- Task overdue → send morning after due date
- Upcoming reminder → send X days before due date (default 3 days, user-configurable)

---

## UX Rules — Always Follow These

- **Inline editing only for MVP** — no modal dialogs for basic task edits. Users click a field to edit it in place
- **Optimistic updates** — UI should update immediately on user action, then sync to the database in the background
- **Empty states must be helpful** — never show a blank screen. Always show a prompt or call to action
- **Error messages must be specific** — never show "Something went wrong." Tell the user exactly what failed
- **Loading states** — show a skeleton or spinner whenever data is being fetched
- **Today line** — the Gantt chart always shows a vertical line marking today's date
- **Gantt and task list always scroll in sync**

---

## Current Build Phase

**We are currently in: MVP**

Focus only on MVP features unless I explicitly ask to work on v1, v2, or v3. Do not add features, complexity, or infrastructure that belongs to a later phase — even if it seems like a good idea. We build incrementally.

MVP feature checklist:
- [ ] Project setup (Next.js + Tailwind + Supabase)
- [ ] Authentication (sign up, login, logout, password reset)
- [ ] Timeline creation
- [ ] Task CRUD (create, read, update, delete)
- [ ] Dependency logic (Finish-to-Start, cascading recalculation, circular detection)
- [ ] Gantt chart visualization (Frappe Gantt)
- [ ] Data persistence (Supabase)

---

## Environment Variables

The following environment variables are required. Never hardcode these values in code. Always use `.env.local` for local development.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
```

Never commit `.env.local` to GitHub. Confirm `.env.local` is in `.gitignore` before the first commit.

---

## Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run type checks
pnpm type-check

# Run linter
pnpm lint
```

---

## Design Direction

PM Tool should feel like a professional-grade tool that a project manager at a serious company would be proud to use. The visual tone is clean, corporate, and trustworthy — inspired by tools like Linear, Notion, and Asana.

### Visual Style
- Clean, uncluttered layouts with generous whitespace
- Crisp typography with clear visual hierarchy
- Subtle shadows and borders — nothing heavy or dated
- Smooth, subtle animations on interactions (hover states, transitions) — never flashy
- Consistent border radius: slightly rounded corners (8px) throughout
- Every page should feel intentional — nothing random or thrown together

### Color Palette
- **Primary:** Navy blue (`#1E3A5F`) — used for headers, primary buttons, key UI elements
- **Accent:** Bright blue (`#2563EB`) — used for links, active states, highlights
- **Background:** Off-white (`#F8FAFC`) for page backgrounds, white (`#FFFFFF`) for cards and panels
- **Text:** Dark gray (`#111827`) for body text, medium gray (`#6B7280`) for secondary text
- **Success:** Green (`#16A34A`) — task complete status
- **Warning:** Orange (`#EA580C`) — blocked status, overdue indicators
- **Error:** Red (`#DC2626`) — error states, destructive actions
- **Borders:** Light gray (`#E5E7EB`) — subtle, not heavy

### Typography
- Font: Inter (load via Google Fonts or next/font)
- Page titles: 24–28px, bold, navy
- Section headings: 18–20px, semibold, dark gray
- Body text: 14–15px, regular, dark gray
- Labels and metadata: 12–13px, medium, secondary gray

### Component Style Guidelines
- **Buttons:** Solid navy for primary actions, outlined for secondary actions, ghost for tertiary. Always include hover and focus states
- **Inputs:** Clean border, subtle focus ring in accent blue, no heavy shadows
- **Cards:** White background, light border, subtle shadow (`shadow-sm`), slightly rounded
- **Tables and task rows:** Alternating subtle row backgrounds, hover highlight on rows
- **Status badges:** Pill-shaped, color-coded, consistent sizing
- **Navigation sidebar:** Navy background with white text and icons
- **Gantt bars:** Color-coded by status, slightly rounded ends, clean and proportional

### Design Rules
- Always build components to look polished from the start — do not defer styling
- Mobile-readable at minimum — layouts should not break on smaller screens
- Never use placeholder gray boxes as stand-ins for real UI — build the real thing
- Accessibility: all interactive elements must have visible focus states
- Icons: use Lucide React (already compatible with Next.js and Tailwind)

---

## What To Do At The Start of Every Session

1. Read this file completely
2. Read the PRD to understand what we are building
3. Ask me what I want to work on today
4. Confirm the current build phase before starting
5. Never assume context from a previous session — always ask if unsure

---

*Last updated: April 2026 — updated database schema, added Code Quality Rules, Package Management Rules, and Git Workflow sections**
*Product owner: Mallory Comes*

---

## Code Quality Rules

These rules apply to every file in every session. Never skip them, even for quick fixes or small changes.

### TypeScript
- Always use proper TypeScript types — never use `any` as a type. If the type is unknown, use `unknown` and handle it properly
- Define types and interfaces in the `types/` folder so they can be shared across the project
- All function parameters and return values must be typed explicitly
- If TypeScript shows a type error, fix the root cause — never suppress it with `// @ts-ignore`

### Error Handling
- Every API route must have a try/catch block — unhandled errors must never reach the user
- All database queries must handle failure gracefully and return a clear error message
- Never show raw error messages from Supabase or the database to the user — translate them into plain English first
- Log errors to the console in development so they are visible during building

### Code Cleanliness
- Never leave commented-out code in files — if something is removed, delete it entirely
- No `console.log` statements in production code — use them during development but remove before committing
- Each file should do one thing — if a file is growing very large, ask before splitting it
- Keep components small and focused — if a component is longer than 150 lines, flag it for discussion

### Security
- Never hardcode API keys, passwords, or secrets anywhere in the codebase
- Always use environment variables from `.env.local` for sensitive values
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser — it is server-side only
- Always validate user input on the server side — never trust data coming from the browser

---

## Package Management Rules

- **Always ask before installing any new package.** Tell me the package name, what it does, why it is needed, and whether a lighter alternative exists
- **Prefer packages already in the ecosystem** — if something can be done with Next.js, Supabase, or Tailwind built-ins, do not add a new package
- **No packages for things that can be done natively** — for example, do not install a date formatting library if the native JavaScript `Intl` API handles it
- **Check bundle size** — avoid large packages for small tasks. If a package adds significant size, flag it before installing
- Use `pnpm add` for runtime dependencies and `pnpm add -D` for development-only dependencies
- After installing any package, briefly explain to me what was added and why

---

## Git Workflow & Repository Etiquette

### Branch Strategy
Always work on a feature branch — never commit directly to `main`. One branch per GitHub Issue.

```
main                        → always stable and deployable
└── feature/issue-1-setup   → one branch per issue
└── feature/issue-2-auth
└── fix/issue-12-login-bug
```

Branch naming convention:
- New features → `feature/issue-[number]-[short-description]`
- Bug fixes → `fix/issue-[number]-[short-description]`
- Documentation updates → `docs/[short-description]`

### Commit Message Format
Every commit message must follow this format:

```
type: short description of what changed

Examples:
feat: add task creation form
feat: implement finish-to-start dependency logic
fix: resolve date sync bug between duration and end date
chore: install TanStack Query
docs: update CLAUDE.md with git workflow rules
style: improve Gantt bar colors for status types
```

Commit types:
- `feat` — a new feature or piece of functionality
- `fix` — a bug fix
- `chore` — installs, config changes, non-functional updates
- `docs` — changes to documentation or markdown files
- `style` — UI or styling changes with no logic change
- `refactor` — code restructuring with no behavior change

### Pull Request Rules
- Every feature branch must be merged via a pull request — never merge directly
- Before opening a pull request, confirm the app runs without errors locally
- Pull request title should reference the GitHub Issue number: `feat: add task creation (#3)`
- Every pull request description must include `Closes #[issue number]` — this automatically closes the related GitHub issue when the PR is merged
- Once merged, delete the feature branch to keep the repository clean

### What Belongs in a Commit
- One logical change per commit — do not bundle unrelated changes together
- Never commit `.env.local`, `node_modules`, or build artifacts
- Always confirm `.gitignore` is in place before the very first commit

### Before Every Commit — Checklist
- [ ] Does the app run without errors?
- [ ] Are there any `console.log` statements to remove?
- [ ] Is `.env.local` listed in `.gitignore`?
- [ ] Does the commit message follow the format above?
- [ ] Is this change on a feature branch, not main?


---

## Context7 — Live Documentation

Context7 MCP is installed and provides real-time, version-specific documentation for all libraries used in this project. Always use Context7 when generating code involving any of the following to ensure documentation is current and not based on outdated training data:

- Next.js
- Supabase
- TanStack Query
- Tailwind CSS
- Frappe Gantt
- TypeScript
- Resend
- node-cron

### How to Use Context7

Add `use context7` to any prompt where you need current library documentation. Example:

```
Create a Next.js middleware that checks for a valid Supabase session in cookies. use context7
```

Context7 will automatically fetch the latest official documentation before generating code. This prevents deprecated patterns and hallucinated APIs.

