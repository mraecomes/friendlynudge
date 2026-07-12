# STATUS.md — FriendlyNudge

> This is the first file to read at the start of every coding session.
> It tells you exactly where the project stands right now.
> Update it at the start and end of every session.

---

## Current Status

**Build Phase:** MVP Complete — Deployed to Production
**Last Updated:** July 12, 2026
**Last Session:** Deployed to Vercel; resolved production bugs (malformed env variable, stale branding, PKCE password reset)
**Next Session Goal:** Begin v1 — [decide focus area and create GitHub issue before starting]

---

## MVP Progress


| Feature                                       | Status             | Notes                |
| --------------------------------------------- | ------------------ | -------------------- |
| Project setup (Next.js + Tailwind + Supabase) | ✅ Complete 4.17.26 | First thing to build |
| Authentication — sign up                      | ✅ Complete 4.18.26 |                      |
| Authentication — login / logout               | ✅ Complete 4.18.26 |                      |
| Authentication — password reset               | ✅ Complete 4.18.26 |                      |
| Authentication — delete account               | ✅ Complete 4.18.26 |                      |
| Timeline creation                             | ✅ Complete 4.19.26 |                      |
| Task creation                                 | ✅ Complete 4.19.26 |                      |
| Task editing (inline)                         | ✅ Complete 4.19.26 |                      |
| Task deletion                                 | ✅ Complete 4.19.26 |                      |
| Task reordering (drag and drop)               | ✅ Complete 4.19.26 |                      |
| Dependency logic (Finish-to-Start)            | ✅ Complete 4.21.26 | Most complex feature |
| Dependency cascading recalculation            | ✅ Complete 4.21.26 |                      |
| Circular dependency detection                 | ✅ Complete 4.21.26 |                      |
| Gantt chart visualization                     | ✅ Complete 4.25.26 | Uses Frappe Gantt    |
| Status color coding on Gantt                  | ✅ Complete 4.25.26 |                      |
| Today line on Gantt                           | ✅ Complete 4.25.26 |                      |
| Data persistence (Supabase)                   | ✅ Complete 4.19.26 |                      |


**Legend:** ⬜ Not started · 🔄 In progress · ✅ Complete · 🚫 Blocked

---

## Deployment Checklist

These are steps to complete before and during the Vercel deployment.

- [x] Rename GitHub repo to `friendlynudge` (do before connecting Vercel)
- [x] Choose Vercel project name
- [x] Set all environment variables in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [x] Confirm email confirmation is OFF in Supabase for production (decision: off, to keep signup friction-free; turning it on is a documented pre-launch item)
- [x] Add the production Vercel URL to Supabase Authentication → URL Configuration so password reset links resolve correctly in production
- [x] Deploy to Vercel and confirm the build succeeds
- [x] Cold end-to-end test in an incognito window: sign up as a new user, create a timeline, add tasks, create a Finish-to-Start dependency, change a predecessor's date or duration, confirm downstream tasks recalculate
- [x] Attempt to create a circular dependency and confirm it is blocked with a clear error
- [x] Confirm the Day and Week view toggle both render correctly in production
- [x] Confirm the password reset flow works end to end in production

---

## v1 Progress (Do Not Start Until MVP Is Complete)


| Feature                              | Status        | Notes |
| ------------------------------------ | ------------- | ----- |
| Multi-timeline support               | ⬜ Not started |       |
| Dashboard view                       | ⬜ Not started |       |
| Email notifications (Resend)         | ⬜ Not started |       |
| In-app notification bell             | ⬜ Not started |       |
| Notification preferences page        | ⬜ Not started |       |
| Notification history log             | ⬜ Not started |       |
| Inline Gantt drag to change dates    | ⬜ Not started |       |
| Zoom levels (Day/Week/Month/Quarter) | ⬜ Not started |       |


---

## Current Blockers

None — ready to start building.

---

## Open Questions

- Create a Resend account before starting v1 notifications
- Move delete account CTA to a Settings page (flagged during Issue #3 UAT)

---

## Upcoming Decisions

These decisions need to be made before the relevant feature is built. They do not need to be resolved now.


| Decision                           | Needed By        | Notes                               |
| ---------------------------------- | ---------------- | ----------------------------------- |
| Google OAuth setup                 | v1 auth          | Supabase makes this straightforward |
| Notification email template design | v1 notifications | Should match app design direction   |
| CSV export format                  | v2               | Decide which columns to include     |
| Collaboration invite flow          | v3               | Email invite vs. shareable link     |


---

## Recently Completed

- ✅ Issue #1 — Project setup (Next.js + Tailwind + Supabase)
- ✅ Issue #2 — Database schema (timelines, tasks, dependencies, RLS)
- ✅ Issue #3 — Authentication (sign up, login, logout, password reset, delete account)
- ✅ Issue #4 — Timeline creation & management
- ✅ Issue #5 — Task CRUD (create, inline edit, delete, drag-to-reorder)
- ✅ Issue #6 — Dependency logic (Finish-to-Start, cascading recalculation, circular detection)
- ✅ Issue #7 — Gantt chart visualization (Frappe Gantt, status colors, today line, dependency arrow highlighting)
- ✅ Issue #23 — Branding: update user-facing product name to FriendlyNudge
- ✅ Issue #25 — Fix: password reset PKCE code double-consumption via /auth/callback
- ✅ Deployed to Vercel — production verified end-to-end (7.12.26)

---

## How To Update This File

**At the start of a session:**

- Update "Last Session" and "Next Session Goal"
- Review blockers and open questions
- Note what you plan to work on today

**At the end of a session:**

- Update the progress table (change ⬜ to 🔄 or ✅)
- Add any new blockers or open questions
- Update "Next Session Goal" for next time
- Add an entry to CHANGELOG.md

---

*Last updated: July 12, 2026*
*Product owner: Mallory Comes*