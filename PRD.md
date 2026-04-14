# PRD — PM Tool

> Product Requirements Document — Version 1.0 — April 2026
> This is the working source of truth for all product requirements. Update this file as requirements change. Always refer to this document before building any new feature.

---

## 1. Product Vision

PM Tool is a web-based project management platform built for project managers and cross-functional teams who need more than a simple to-do list. It combines dependency-aware Gantt timelines, automated deadline notifications, and team collaboration — all in one place.

**The core problem we are solving:** project managers spend too much time manually following up with task owners. Deadlines slip not because people are lazy, but because no system is proactively reminding them. PM Tool puts accountability on autopilot so project managers can focus on strategy, not status updates.

The product is inspired by tools like Smartsheet but designed to be significantly easier to adopt — particularly for non-technical teams who need powerful dependency logic and smart notifications without a steep learning curve.

---

## 2. Target Users

### Primary User — The Project Manager

The project manager is the power user of PM Tool. They create and own timelines, define tasks and dependencies, invite collaborators, and rely on the system to keep everyone accountable without constant manual follow-up.

Their core needs:
- A clear, visual Gantt timeline that shows how tasks connect and what blocks what
- Automated notifications so task owners are reminded without the PM having to send emails
- A single dashboard to monitor the health of all their active projects at a glance
- Confidence that if one task slips, the downstream timeline automatically recalculates

### Secondary User — The Task Owner / Team Member

Task owners are assigned to specific tasks within a project. They do not necessarily log in to PM Tool every day — which is why proactive notifications are critical. When they do log in, the experience needs to be simple and focused.

Their core needs:
- Clear visibility into what they are responsible for and when it is due
- Email reminders that tell them exactly what is coming up — without needing to open the app
- An easy way to update task status so the PM and team stay informed
- Ability to comment on tasks to communicate blockers or progress

---

## 3. User Experience Principles

Every design and product decision should be evaluated against these principles:

| Principle | What It Means in Practice |
|-----------|--------------------------|
| Proactive over reactive | The system should surface information before users need to ask for it. Notifications, status indicators, and overdue flags should be automatic |
| Clarity over density | Show users what they need to act on. Avoid overwhelming dashboards with too much data at once |
| The PM should not be a messenger | Automated notifications replace manual follow-up. The PM sets up the system once; it runs itself |
| Accountability is visual | Every task owner can see their own responsibilities clearly. Every PM can see who is on track and who is not |
| Fast to learn, powerful over time | New users should be productive within 10 minutes. Advanced features reveal themselves gradually |
| Mobile-friendly reading | While the MVP is web-first, all pages should be readable on mobile so task owners can check status on the go |

---

## 4. Release Phases Overview

| Phase | Focus | Primary Beneficiary |
|-------|-------|-------------------|
| MVP | Auth, single Gantt timeline, dependency logic, basic task CRUD | Solo project managers getting started |
| v1 | Multi-timeline dashboard, automated email + in-app notifications | PMs managing multiple projects |
| v2 | Conditional formatting, filter views, visual controls, CSV/PDF export | Power users customizing their workflow |
| v3 | Team collaboration, comments, roles and permissions | Full project teams working together |
| Later | Integrations, templates, recurring tasks, reporting, API | Enterprise and scaling teams |

---

## 5. MVP — Detailed Requirements

**MVP Goal:** A working, deployable app where a single user can sign up, log in, build one Gantt timeline with tasks and dependencies, and have downstream dates automatically recalculate when any task changes.

### 5.1 Authentication & Account Management

#### User Experience
The sign-up and login flow should be frictionless. New users should be able to go from landing page to their first timeline in under 2 minutes. Error messages must be specific and helpful — not generic.

#### Functional Requirements
- Email and password sign-up with real-time validation (password strength, email format)
- Login and logout with persistent session (30-day default, with Remember Me option)
- Password reset via email with a secure, time-limited link (expires in 1 hour)
- Delete account with confirmation prompt, clear warning that all data will be removed, and immediate data wipeout
- Session management using Supabase Auth (JWT-based)

#### UX Detail
- After sign-up, new users land directly on an empty timeline with a brief onboarding prompt: "Create your first task to get started"
- Login errors should distinguish between wrong email and wrong password — not a generic "Invalid credentials" message
- Password reset emails should arrive within 30 seconds and use a clear, branded template

---

### 5.2 Timeline Builder

#### User Experience
Creating and editing tasks should feel as natural as editing a spreadsheet. Users should never feel like they are fighting the UI to add or change a task. Dates, durations, and statuses should be editable with minimal clicks.

#### Functional Requirements
- Create a new timeline with a name and optional date range
- Add tasks with: name, start date, duration in days OR end date (auto-calculates the other), and status
- Task statuses: Not Started, In Progress, Complete, Blocked
- Edit any task field inline — no modal required for basic edits
- Delete tasks with a confirmation prompt
- Manually reorder tasks via drag-and-drop in the task list

#### UX Detail
- Clicking any task field opens it for editing in place — no pop-up dialogs for basic operations
- Adding a new task appends a row at the bottom with the cursor already in the task name field
- Status changes update the Gantt bar color immediately without a page reload
- Duration and end date stay in sync: editing one auto-updates the other

---

### 5.3 Dependency Logic

#### User Experience
Dependencies are the most powerful and most delicate feature of PM Tool. Users need to see immediately how a change cascades — and the system needs to prevent mistakes like circular dependencies before they cause confusion.

#### Functional Requirements
- Support Finish-to-Start (FS) dependencies in MVP — Task B cannot start until Task A is complete
- When a predecessor task changes its duration or start date, all downstream dependent tasks auto-recalculate
- Visual dependency lines (arrows) connect tasks on the Gantt chart
- Circular dependency detection with a clear, specific error message identifying which tasks are involved
- Users can remove a dependency link from either the task list or the Gantt chart

#### UX Detail
- Dependency links should be visible but not visually overwhelming — use subtle arrows that highlight on hover
- When a cascading recalculation happens, briefly animate or highlight the affected rows so the user sees what changed
- Circular dependency errors appear inline next to the task, not as a global toast — so users know exactly which link caused the problem

---

### 5.4 Gantt Chart Visualization

#### User Experience
The Gantt chart is the emotional centerpiece of PM Tool. It needs to feel fast, responsive, and immediately legible. Users should understand their timeline at a glance — which tasks are on track, which are blocked, and how everything connects.

#### Functional Requirements
- Horizontal bar chart with one row per task, proportional to duration
- Scrollable date axis with Day / Week / Month toggle
- Bars color-coded by status: Not Started (gray), In Progress (blue), Complete (green), Blocked (red/orange)
- Dependency arrows connecting predecessor and successor tasks
- Today line — a vertical marker showing the current date on the chart

#### UX Detail
- The Gantt chart and task list scroll together — they are always in sync
- Hovering over a task bar shows a tooltip with task name, dates, duration, and status
- The chart loads with the current week centered in view — not the beginning of the timeline
- Status color legend is always visible at the top of the Gantt section

---

### 5.5 Data Persistence
- All tasks and timelines are saved to Supabase (PostgreSQL) in real time
- Data persists across sessions — users return to exactly where they left off
- Basic undo for the last action (stretch goal for MVP — nice to have, not required)

---

## 6. v1 — Multi-Timeline & Automated Notifications

**v1 Goal:** Extend PM Tool to support multiple projects per user, provide a unified dashboard view, and introduce the automated notification system that removes the need for manual PM follow-up.

### 6.1 Automated Notifications — The Core v1 Feature

#### User Experience
This is the feature that transforms PM Tool from a timeline viewer into a proactive accountability system. Task owners should receive clear, actionable emails that tell them exactly what is expected of them and when — without needing to log in to check.

#### Notification Types
- Task due today — sent at 8:00 AM on the due date to the assigned task owner
- Task overdue — sent the morning after the due date has passed (configurable: 1 day, 2 days)
- Upcoming task reminder — sent X days before due date (user-configurable lead time, default 3 days)
- In-app notification bell with unread count visible in the header at all times

#### Notification UX
- Email notifications use a clean, branded template that shows: task name, project name, due date, and a direct link to the task
- One-click unsubscribe link in every email — no account login required to opt out
- Notification preferences page where users can enable/disable each notification type globally
- Notification history log so users can see what was sent and when

---

### 6.2 Dashboard View

#### User Experience
The dashboard is the first thing a returning user sees. It should give them an immediate sense of project health across all their timelines without needing to click into each one.

#### Functional Requirements
- Summary card for each timeline showing: project name, overall % complete, upcoming task count, overdue task count, and date range
- Click any card to open that timeline
- Sort timelines by: name, date created, last modified, % complete
- Archive a timeline to hide it from the dashboard without deleting it

#### Dashboard UX Detail
- Overdue tasks are flagged with a red indicator on the project card — visible at a glance
- A project with all tasks complete shows a visual completion badge
- Empty state for new users: a welcoming prompt to create their first project, not a blank screen

---

### 6.3 Improved Timeline UX
- Inline editing — click a task name or date to edit without a modal
- Drag task bars on the Gantt chart to change dates (auto-updates dependencies)
- Zoom levels: Day / Week / Month / Quarter
- Column sort and basic column resize

---

## 7. v2 — Conditional Formatting, Filters & Visual Controls

### 7.1 Conditional Formatting Rules Engine
Users can create "if-then" rules that automatically change how rows look based on task data. Example rules:
- If End Date is past today → highlight row red
- If Status = Blocked → highlight row orange
- If % Complete = 100 → apply strikethrough to task name

Rules are managed through a visual rules editor where users can add, edit, delete, and reorder rules. Rules apply in real time as task data changes.

### 7.2 Filter Views
Users can filter the task list by status, date range, assignee, or custom tags. Named filter views can be saved per timeline (e.g., "My Tasks This Week") and toggled quickly. Filters are non-destructive — they never affect underlying data.

### 7.3 Visual & Formatting Controls
- Change font color per cell or row
- Bold and italic formatting per cell
- Manual row background color (separate from conditional rules)
- Column visibility toggle — show/hide any column
- Lock/freeze the task name column while scrolling horizontally

### 7.4 Export
- Export timeline to CSV
- Export Gantt view as PNG or print-friendly PDF

---

## 8. v3 — Collaboration & Permissions

### 8.1 User Roles

| Role | Permissions |
|------|------------|
| Admin | Full access: manage members, rename/delete timeline, all edit capabilities |
| Editor | Add, edit, and delete tasks. Cannot manage membership or delete the timeline |
| Viewer | Read-only access. Can see timeline and tasks but cannot make changes |

### 8.2 Comments & Activity
- Comment thread on individual tasks
- @mention a collaborator in a comment, which triggers a notification to them
- Activity log per timeline showing who changed what and when
- Mark comments as resolved to keep threads clean

### 8.3 Shared Dashboard
- Collaborators see shared timelines on their own dashboard
- Ownership transfer — current owner can hand off admin rights to another user

---

## 9. Technical Architecture

### Recommended Tech Stack

| Layer | Decision | Rationale |
|-------|----------|-----------|
| Framework | Next.js + TypeScript | Full-stack in one repo, optimized for Vercel deployment |
| Styling | Tailwind CSS | Most widely supported by AI tooling, fast to build with |
| State Management | TanStack Query | Best-in-class for server data like tasks and timelines |
| Database | Supabase (PostgreSQL) | Already configured, handles auth + DB + storage |
| Authentication | Supabase Auth | Built-in, supports email/password + Google OAuth in v1 |
| Email / Notifications | Resend | Free up to 3,000 emails/month, excellent developer experience |
| Job Scheduling | node-cron (MVP), BullMQ (v1+) | Simple for MVP, upgradeable when reliability matters |
| Gantt Rendering | Frappe Gantt (OSS) | Open source, lightweight, well-documented |
| Hosting | Vercel + Supabase | Already configured, zero-config deployment from GitHub |

### Architecture Decisions
- Monorepo — frontend and backend together in one Next.js project for simplicity
- REST API for MVP — simpler to build and debug than GraphQL at this stage
- PostgreSQL enforces a strict directed acyclic graph (DAG) for dependency data
- Supabase Row Level Security (RLS) ensures users can only access their own data
- Polling for real-time updates in MVP — WebSocket architecture deferred to v3
- pnpm over npm — faster installs, more space-efficient

---

## 10. Out of Scope

| Feature | Status |
|---------|--------|
| Native mobile app (iOS / Android) | Deferred — web is mobile-readable; native app post-v3 |
| AI-assisted scheduling or task suggestions | Deferred indefinitely |
| Billing, subscriptions, or paid tiers | Deferred — product is free during build phase |
| Gantt critical path analysis | Revisit in v2/v3 |
| Resource management / capacity planning | Post-v3 |
| Portfolio-level views across users | Post-v3 |
| Import from Asana, Jira, Smartsheet | Post-v3 |
| API / Webhooks for external integrations | Post-v3 |

---

## 11. Success Metrics

### MVP Success
- A user can sign up, create a timeline with 5+ tasks, add at least 2 dependencies, and have downstream dates recalculate correctly
- No data loss across sessions — all tasks and timelines persist on logout and re-login
- Timeline loads in under 2 seconds for up to 50 tasks

### v1 Success
- Notification emails are delivered within 5 minutes of their scheduled send time
- Zero missed notifications for tasks that are due today or overdue
- Users managing 3+ projects find the dashboard gives them a clear project health summary without clicking into each timeline

### Long-Term Success
- Project managers report spending less time on status follow-up after adopting PM Tool
- Task owners report feeling more informed about their responsibilities without needing to be prompted by the PM

---

*Last updated: April 2026 — v1.0 initial release*
*Product owner: Mallory Comes*
