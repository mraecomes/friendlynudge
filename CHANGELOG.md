# CHANGELOG.md — PM Tool

> A running log of what was built, changed, or fixed in each coding session.
> Update this at the end of every session before closing Cursor.
> Most recent entries go at the top.

---

## How To Write a Good Entry

```
## [Date] — Session Title

### Added
- Brief description of new features or files created

### Changed
- Brief description of anything modified or updated

### Fixed
- Brief description of bugs resolved

### Decisions Made
- Any important decisions made during this session and why
```

---

## [April 19 2026] — Issues #4 and #5 Complete

### Issue #4 — Timeline Creation & Management

### Added

- Timeline creation modal on the dashboard — users can create a new timeline with a name and optional start/end dates
- Timeline cards on the dashboard — display timeline name, created date, and date range; link through to the timeline detail page
- Timeline detail page (`/timeline/[id]`) — shows the timeline header with name and dates, with a not-found state if the ID does not exist
- Skeleton loaders on the dashboard and timeline detail page while data is fetching
- Row Level Security enforced — all timeline data is scoped to the logged-in user

### Fixed

- **Date validation in the creation modal** — end date cannot be set before start date; the submit button is disabled and an inline error message is shown until the dates are corrected

---

### Issue #5 — Task CRUD

### Added

- Task creation via a local pending row — clicking "Add task" appends a focused input row; the task is only saved to the database once the user types a name
- Inline editing for all task fields — name, start date, duration (days), end date, and status are all editable in place with no modals
- Drag-to-reorder — tasks can be dragged up and down the list; order is persisted to the database
- Status badges — color-coded pill labels for Not Started, In Progress, Complete, and Blocked
- Task deletion — trash icon on hover with a confirmation prompt before deleting
- Empty state — helpful prompt shown when a timeline has no tasks yet
- Consistent MM/DD/YYYY date formatting across all date displays in the app (task rows, timeline cards, dashboard)

### Fixed

- **"Add task" showed a validation error immediately** — clicking "Add task" was calling the API with an empty name before the user had a chance to type anything. Fixed by replacing the immediate API call with a local-only pending row that only writes to the database after the user provides a name.
- **Duration and end date sync** — editing start date, duration, or end date now automatically recalculates the other fields to stay consistent at all times

---

## [April 18 2026] — Issues #2 and #3 Complete

### Issue #2 — Database Schema

Created the Supabase database schema for the MVP via a single migration file (`supabase/migrations/20260418000000_create_mvp_tables.sql`).

### Added

- `timelines` table — stores project timelines, linked to the authenticated user
- `tasks` table — stores individual tasks with dates, duration, status, and position
- `dependencies` table — stores finish-to-start relationships between tasks, with a unique constraint to prevent duplicates
- Row Level Security (RLS) enabled on all three tables — users can only access their own data

---

### Issue #3 — Authentication

Built a complete authentication system using Supabase Auth, including all pages, API routes, and reusable UI components.

### Added

- Sign up page — creates a new account with email and password
- Login page — signs in an existing user
- Forgot password page — sends a password reset email via Supabase
- Update password page — lets the user set a new password after clicking the reset link
- Logout button — signs the user out and redirects to login
- Delete account button and API route — permanently deletes the user's account and all their data
- Auth callback route — handles the Supabase redirect after email confirmation and password reset
- Dashboard placeholder page — confirms authentication is working with a protected route
- Reusable `Button` and `Input` UI components

### Fixed

- **Password reset flow and expired link error message** — Supabase was sending password reset emails that pointed to the wrong page. Fixed the redirect URL so the link correctly lands on the Update Password page. Also added a user-friendly error message when a reset link has expired, rather than showing a blank or broken page.
- **Implicit flow and missing session on Update Password page** — The Update Password page was not correctly detecting the session when Supabase used its implicit (hash-based) auth flow. Fixed the page to listen for the auth session event properly so users who click a valid reset link are no longer incorrectly told their session is missing.

## [April 17 2026] — Issue #1 Complete

### Added

- Next.js 16 + TypeScript + Tailwind CSS v4 project scaffolded
- Supabase browser, server, and middleware clients configured
- TanStack Query v5 provider set up
- Lucide React icons installed
- Inter font applied via next/font/google
- Design system color palette defined in globals.css
- TypeScript types for Timeline, Task, Dependency, TaskStatus
- Route protection middleware
- .env.local stubbed with required keys

### Decisions Made

- Used create-next-app into temp folder due to existing planning files
- Added middleware guard for missing Supabase env vars during setup

## [April 2026] — Planning Phase Complete

### Added

- `PRD.md` — Full product requirements document covering MVP through v3
- `CLAUDE.md` — Claude Code instruction file with tech stack, schema, UX rules, and design direction
- `ARCHITECTURE.md` — Technical architecture document covering data flow, security model, and key decisions
- `CHANGELOG.md` — This file
- `STATUS.md` — Project status and progress tracker
- `.env.example` — Environment variable template

### Decisions Made

- Tech stack finalized: Next.js + TypeScript, Tailwind CSS, TanStack Query, Supabase, Resend, node-cron, Frappe Gantt, Vercel
- MVP scope locked: authentication, single timeline, task CRUD, Finish-to-Start dependencies, Gantt visualization
- Design direction: clean and corporate, navy and blue color palette, inspired by Linear/Notion/Asana
- Dependency model: Finish-to-Start only for MVP, DAG enforced at database level
- Notification scheduling: node-cron for MVP, upgrade to BullMQ in v1
- Auth: Supabase Auth with email/password for MVP, Google OAuth deferred to v1

---
