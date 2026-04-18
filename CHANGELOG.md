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

