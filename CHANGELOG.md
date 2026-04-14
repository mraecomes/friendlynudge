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

<!-- Add new entries above this line -->
