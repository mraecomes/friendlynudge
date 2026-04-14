# ARCHITECTURE.md — PM Tool

> This document describes how PM Tool is structured technically — how the parts connect, how data flows, and why key decisions were made. Read this alongside CLAUDE.md before making any structural changes to the codebase.

---

## High-Level Overview

PM Tool is a full-stack web application built with Next.js. The frontend and backend live in the same project (monorepo). Supabase handles the database, authentication, and file storage. Vercel handles deployment.

```
Browser (User)
     │
     ▼
Next.js App (Vercel)
  ├── Frontend Pages (React components + Tailwind CSS)
  └── API Routes (backend logic, runs server-side)
          │
          ▼
     Supabase
  ├── PostgreSQL Database (tasks, timelines, dependencies)
  ├── Supabase Auth (user sessions, JWTs)
  └── Row Level Security (data access control)
          │
     Resend (email notifications)
     node-cron (scheduled jobs)
```

---

## Application Layers

### 1. Frontend (React + Next.js App Router)

All user-facing pages live in the `app/` directory using Next.js App Router. Pages are React components styled with Tailwind CSS.

Key pages:
- `/` — Landing page / redirect to dashboard if logged in
- `/login` — Login page
- `/signup` — Sign up page
- `/dashboard` — Project dashboard showing all timelines
- `/timeline/[id]` — Individual Gantt timeline view

State management uses TanStack Query for all server data (fetching, caching, updating tasks and timelines). Local UI state uses React's built-in `useState` and `useReducer`.

### 2. Backend (Next.js API Routes)

Server-side logic lives in `app/api/`. These are serverless functions that run on Vercel. They handle:
- Database operations that require the service role key (admin-level access)
- Notification scheduling and email sending via Resend
- Any logic that should not run in the browser

API routes follow REST conventions:
```
GET    /api/timelines          → fetch all timelines for current user
POST   /api/timelines          → create a new timeline
GET    /api/timelines/[id]     → fetch a single timeline with tasks
PUT    /api/timelines/[id]     → update a timeline
DELETE /api/timelines/[id]     → delete a timeline

GET    /api/tasks/[id]         → fetch a single task
POST   /api/tasks              → create a new task
PUT    /api/tasks/[id]         → update a task (triggers dependency recalculation)
DELETE /api/tasks/[id]         → delete a task

POST   /api/notifications/send → manually trigger a notification (for testing)
```

### 3. Database (Supabase / PostgreSQL)

The database uses PostgreSQL via Supabase. Row Level Security (RLS) policies are enabled on all tables — this means the database itself enforces that users can only read and write their own data, even if the application code has a bug.

See CLAUDE.md for the full database schema.

### 4. Authentication (Supabase Auth)

Authentication is handled entirely by Supabase Auth. The app uses JWT tokens stored in cookies. Next.js middleware checks for a valid session on protected routes and redirects unauthenticated users to `/login`.

Auth flow:
```
User submits login form
       │
       ▼
Supabase Auth validates credentials
       │
       ▼
JWT token stored in secure cookie
       │
       ▼
Next.js middleware reads cookie on every request
       │
  ┌────┴────┐
Valid?      No
  │          │
  ▼          ▼
Allow     Redirect to /login
access
```

### 5. Notifications (Resend + node-cron)

Notification emails are sent via Resend. A node-cron job runs on a schedule (every morning at 7:45 AM) to check for tasks that are due today, overdue, or coming up within the user's configured reminder window. It then sends the appropriate emails via the Resend API.

Notification flow:
```
node-cron triggers at 7:45 AM daily
       │
       ▼
Query database for tasks due today, overdue, or upcoming
       │
       ▼
For each matching task, check user notification preferences
       │
       ▼
Send email via Resend API using branded template
       │
       ▼
Log notification in notification_history table
```

---

## Dependency Logic Architecture

Dependency recalculation is one of the most complex pieces of business logic in PM Tool. It lives in `lib/dependencies/`.

The dependency graph is a Directed Acyclic Graph (DAG) — tasks are nodes, dependencies are directed edges. When any task changes, the system:

1. Finds all tasks downstream of the changed task (descendants in the DAG)
2. Sorts them in topological order (respecting dependency chain order)
3. Recalculates each downstream task's start date based on its predecessor's new end date
4. Checks for circular dependencies before saving — rejects with an error if found
5. Saves all recalculated tasks in a single database transaction

```
Task A changes duration
       │
       ▼
Find all descendants of Task A
       │
       ▼
Sort descendants topologically
       │
       ▼
Recalculate start dates in order
       │
       ▼
Check for circular dependencies
       │
  ┌────┴────┐
None       Cycle detected
  │          │
  ▼          ▼
Save all   Return error
changes    to user
```

---

## Data Flow — Creating a Task

```
User fills in task form in browser
       │
       ▼
TanStack Query mutation fires
       │
       ▼
POST /api/tasks called with task data
       │
       ▼
API route validates input
       │
       ▼
Supabase inserts task into database
       │
       ▼
If task has a predecessor, run dependency recalculation
       │
       ▼
Return new task data to browser
       │
       ▼
TanStack Query updates local cache
       │
       ▼
UI updates immediately (optimistic update)
```

---

## Security Model

- **Row Level Security (RLS)** is enabled on all Supabase tables. Users can only access rows where `user_id` matches their authenticated user ID
- **Service role key** (`SUPABASE_SERVICE_ROLE_KEY`) is only used server-side in API routes — never exposed to the browser
- **Public anon key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is safe to expose in the browser — RLS policies prevent data leaks
- **Environment variables** — all secrets stored in `.env.local` locally and in Vercel environment variables in production. Never hardcoded
- **`.env.local` is always in `.gitignore`** — never committed to GitHub

---

## Deployment Architecture

```
Developer pushes to GitHub (main branch)
       │
       ▼
Vercel detects new commit
       │
       ▼
Vercel runs build (pnpm build)
       │
       ▼
If build passes → deploy to production URL
If build fails → deployment blocked, previous version stays live
       │
       ▼
Supabase runs independently (always-on cloud database)
```

Preview deployments: every pull request gets its own preview URL from Vercel for testing before merging to main.

---

## Key Architectural Decisions & Why

| Decision | Why |
|----------|-----|
| Next.js monorepo over separate frontend/backend | Simpler to manage, deploy, and reason about for a solo builder |
| Supabase over custom PostgreSQL | Managed infrastructure, built-in auth, RLS, and dashboard — no DevOps required |
| REST over GraphQL | Simpler to build and debug at MVP stage; GraphQL adds complexity that isn't needed yet |
| TanStack Query over Redux | Purpose-built for server state; much less boilerplate for CRUD operations |
| node-cron over BullMQ | Simpler for MVP; BullMQ adds Redis dependency that isn't justified until scale requires it |
| Frappe Gantt over custom SVG | Saves significant build time; open source and customizable enough for MVP needs |
| Polling over WebSockets | WebSockets add infrastructure complexity; polling is sufficient until v3 real-time collaboration |
| pnpm over npm | Faster installs, more space-efficient, consistent with project setup |

---

## What To Update This File When

- You add a new major feature or service (e.g., adding Redis in v1)
- The folder structure changes significantly
- A new API route category is added
- The deployment setup changes
- An architectural decision is reversed or changed

---

*Last updated: April 2026*
*Product owner: Mallory Comes*
