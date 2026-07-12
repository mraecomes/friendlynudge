# CHANGELOG.md — FriendlyNudge

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

## [July 12, 2026] — Deployment to Vercel

### Fixed

- **Malformed `NEXT_PUBLIC_SUPABASE_URL` environment variable in Vercel** — the value had `/rest/v1` incorrectly appended to the project URL, causing all Supabase auth requests to return a 404 on the token endpoint in production. Found by inspecting Supabase Auth logs, fixed by correcting the variable to the bare project URL and redeploying.
- **Stale "PM Tool" branding in three user-facing locations** — the browser tab title, auth page header (`<h1>`), and dashboard nav header still displayed "PM Tool" despite the earlier documentation-only rename. Found during production UAT. Fixed via Issue #23.
- **Password reset failing on first click due to PKCE code double-consumption** — `forgot-password/page.tsx` set its `redirectTo` directly to `/update-password`, so the middleware's `createServerClient` consumed the single-use PKCE code on the incoming request before the page could exchange it. The page then called `exchangeCodeForSession` on an already-used code and surfaced a false "link expired" error even though the session had been established successfully. Fixed by routing `redirectTo` through `/auth/callback?next=/update-password` instead; the callback exchanges the code intentionally, sets session cookies, and redirects cleanly. Fixed via Issue #25.

### Decisions Made

- Diagnosed the password reset bug using Supabase Auth logs rather than guessing — the logs showed `/verify` returning 303 and `/token` returning 200, confirming the PKCE code was being consumed successfully by the middleware before the page ran, not expiring in transit.
- Verified the fix on the production deployment rather than the PR's Vercel preview URL, since preview URLs are not in the Supabase redirect allowlist and would not have exercised the actual redirect flow end-to-end.

---

## [July 11, 2026] — Product Rename

### Decisions Made

- Product renamed from **PM Tool** to **FriendlyNudge** across all project documentation (PRD.md, ARCHITECTURE.md, CLAUDE.md, STATUS.md, CHANGELOG.md, END_OF_SESSION_CHECKLIST.md). The GitHub repository has been renamed to `friendlynudge` to match.
- The local folder name (`pm-tool`) and `package.json` name remain `pm-tool` intentionally. These are cosmetic identifiers with no functional dependency on the product name — renaming them would require unnecessary file system changes with no benefit to the running application.

---

## [April 25, 2026] — Issue #7 Complete

### Issue #7 — Gantt Chart Visualization

### Added

- Gantt chart view on the timeline detail page, rendered using Frappe Gantt, showing all tasks as color-coded bars with dependency arrows between them
- Status color coding on Gantt bars — gray (Not Started), blue (In Progress), green (Complete), orange/red (Blocked)
- Today line — a vertical marker showing the current date in the chart at all times
- Popup tooltip on bar hover — shows task name, date range in MM/DD/YYYY format, duration in days, and status label
- Scroll-to-today on load and on view mode change — the chart automatically centers on the current date
- Day / Week view toggle — custom button pair (navy active state, outlined inactive) replacing Frappe Gantt's built-in view mode selector
- Dependency arrow chain highlighting — hovering any task bar or arrow highlights all arrows in that task's connected dependency chain in navy; all other arrows stay gray
- Transparent wide hit paths cloned over each arrow for a larger hover target area (12px stroke vs 1.5px visible)
- Invisible `__today_anchor_`_ task injected into the Gantt data to force the SVG canvas to extend through today + 28 days, even when all real tasks end before today
- `lib/utils/gantt.ts` — utility that converts `Task[]` + `Dependency[]` into the Frappe Gantt task format with status colors, dependency wiring, and the today anchor
- `components/gantt/GanttLegend` — color-coded legend below the chart showing all four task statuses
- `types/frappe-gantt.d.ts` — TypeScript module declaration for the Frappe Gantt library, including `gantt_start`, `gantt_end`, `config`, `infinite_padding`, and `on_view_change`

### Fixed

- **Browser crash on initial render** — `scroll_to: 'today'` caused a runtime crash inside Frappe Gantt (`Cannot read properties of undefined (reading 'clientWidth')`). Fixed by changing to `scroll_to: 'start'` and implementing manual scroll-to-today logic using `gantt_start`, `config.step`, and `config.column_width`.
- **Double initialization race condition** — the dynamic `import('frappe-gantt')` could resolve twice before the ref was set, constructing two Gantt instances and crashing. Fixed with a `cancelled` flag and a `ganttRef.current` guard inside the `.then()` callback.
- **Anchor task bar appearing in chart** — SVG `<g>` elements ignore `display: none` in CSS. Fixed by switching the hide rule to `visibility: hidden`, which SVG respects and which cascades correctly to child elements.
- **Tooltip showing end date one day too late** — Frappe Gantt stores `_end` as an exclusive date (one day past the visual end). Fixed by using the raw string field `t.end` (YYYY-MM-DD) instead of the `t._end` Date object, then reformatting to MM/DD/YYYY in the popup.
- **Month view bar misalignment** — a confirmed bug inside Frappe Gantt v1.2.2 where Month view bar positions use equal-month math but column headers use variable-day-width math, causing all bars to render in the wrong columns. Fixed by removing Month view entirely and replacing it with custom Day/Week toggle buttons.
- **Arrow hit areas producing zero elements** — `setupArrowHitAreas` was querying `.gantt .arrow`, which selects the `<g class="arrow">` container, not the individual `<path>` children. Fixed by changing the selector to `.gantt .arrow path:not(.arrow-hit)`.
- **Arrow hit areas double-cloning on re-render** — on subsequent calls (after view mode change or `refresh()`), the selector was also picking up existing `.arrow-hit` paths and cloning them again. Fixed by adding `:not(.arrow-hit)` to exclude already-processed paths.
- **Arrow highlighting not visually applying** — `arrow-highlighted` was being added as a CSS class to SVG `<path>` elements, but the CSS rule could not reliably target SVG path children through the Tailwind v4 processing pipeline. Fixed by switching to JavaScript inline style assignment (`a.style.stroke`, `a.style.strokeWidth`) which bypasses all CSS cascade and specificity concerns.
- **Setup functions not running after refresh** — `ganttRef.current.refresh()` wipes the SVG DOM, destroying all arrow elements and event listeners. Fixed by calling `setupArrowHitAreas` and `setupChainHighlight` inside a 60ms `setTimeout` after every `refresh()` and every `on_view_change`.

### Decisions Made

- **Invisible anchor task instead of a library config option** — Frappe Gantt has no option to set an explicit canvas end date; it only extends the canvas based on task end dates. The `__today_anchor__` invisible task (hidden via CSS `visibility: hidden`) is the only reliable workaround. The block in `lib/utils/gantt.ts` is annotated with "Do not remove" to prevent future confusion.
- **Removed Month view** — the misalignment is a confirmed library bug that cannot be fixed without patching Frappe Gantt's source. Month view was removed rather than shipping broken UI. Day and Week views both render correctly.
- **Custom Day/Week toggle buttons** — built to match the existing design system (navy active, outlined inactive) rather than using Frappe Gantt's built-in view mode selector, which does not support the app's visual style.
- **JS inline styles for arrow highlighting** — CSS class toggling on SVG `<path>` elements was unreliable through the Tailwind v4/Next.js CSS pipeline. Inline styles via `element.style.stroke` are the highest-priority value in the CSS cascade and are unaffected by any build-time CSS processing.
- **Union-find for chain grouping** — the `buildChainMap` function uses a union-find (disjoint set) data structure to group all transitively connected tasks into a single chain. Hovering any task in a linear chain correctly highlights all arrows in that chain simultaneously.

---

## [April 21 2026] — Issue #6 Complete

### Issue #6 — Dependency Logic

### Added

- Finish-to-Start dependency engine — users can define that Task B cannot start until Task A is complete, via a searchable "Depends On" column in the task list
- Cascading date recalculation — when a predecessor task's start date or duration changes, all downstream successor tasks automatically recalculate their start and end dates, recursively through the full chain
- Immediate recalculation on dependency creation — the moment a dependency is saved, the successor task's dates snap to the correct position without any manual edit
- Circular dependency detection — before saving any dependency, the system checks for cycles and rejects the save with a plain-English error message naming the exact tasks involved (e.g. "A → B → C → A")
- Cascade highlight animation — rows affected by a cascading recalculation briefly highlight in blue so the user can see exactly what changed
- `lib/dependencies/graph.ts` — pure TypeScript functions for cycle detection, downstream ID lookup, and topological sort; fully isolated from the database
- `lib/dependencies/cascade.ts` — pure TypeScript function that computes all downstream date updates for a changed predecessor
- `supabase/migrations/20260420000000_update_task_with_cascade.sql` — PostgreSQL RPC function that updates the primary task and all cascaded tasks in a single atomic transaction; any failure rolls back everything

### Fixed

- **Stale dependency cache after task deletion** — deleting a task now correctly invalidates the client-side dependency cache, so subsequent dependency operations work immediately without a page refresh

### Decisions Made

- Cascade saves are atomic via a PostgreSQL RPC function — if any part of the cascade fails, the entire update (including the original task change) rolls back and the user receives a clear error message. No silent partial saves.
- Custom searchable combobox built without any new packages — filters the task list as the user types, keyboard-navigable, matches the existing design system
- Circular detection runs server-side before any insert, so no invalid dependency records can reach the database

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

