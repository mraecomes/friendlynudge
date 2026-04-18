# STATUS.md — PM Tool

> This is the first file to read at the start of every coding session.
> It tells you exactly where the project stands right now.
> Update it at the start and end of every session.

---

## Current Status

**Build Phase:** Pre-build — Planning complete, ready to start MVP
**Last Updated:** April 2026
**Last Session:** Planning phase — all planning documents created
**Next Session Goal:** Project setup (Next.js + Tailwind + Supabase configuration)

---

## MVP Progress


| Feature                                       | Status             | Notes                |
| --------------------------------------------- | ------------------ | -------------------- |
| Project setup (Next.js + Tailwind + Supabase) | ✅ Complete 4.17.26 | First thing to build |
| Authentication — sign up                      | ⬜ Not started      |                      |
| Authentication — login / logout               | ⬜ Not started      |                      |
| Authentication — password reset               | ⬜ Not started      |                      |
| Authentication — delete account               | ⬜ Not started      |                      |
| Timeline creation                             | ⬜ Not started      |                      |
| Task creation                                 | ⬜ Not started      |                      |
| Task editing (inline)                         | ⬜ Not started      |                      |
| Task deletion                                 | ⬜ Not started      |                      |
| Task reordering (drag and drop)               | ⬜ Not started      |                      |
| Dependency logic (Finish-to-Start)            | ⬜ Not started      | Most complex feature |
| Dependency cascading recalculation            | ⬜ Not started      |                      |
| Circular dependency detection                 | ⬜ Not started      |                      |
| Gantt chart visualization                     | ⬜ Not started      | Uses Frappe Gantt    |
| Status color coding on Gantt                  | ⬜ Not started      |                      |
| Today line on Gantt                           | ⬜ Not started      |                      |
| Data persistence (Supabase)                   | ⬜ Not started      |                      |


**Legend:** ⬜ Not started · 🔄 In progress · ✅ Complete · 🚫 Blocked

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

- Confirm Supabase project URL and keys are accessible before first session
- Decide on a Vercel project name before first deploy
- Create a Resend account before starting v1 notifications

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

- ✅ Product brainstorm document
- ✅ PRD (Product Requirements Document)
- ✅ CLAUDE.md (Claude Code instruction file)
- ✅ ARCHITECTURE.md (Technical architecture)
- ✅ CHANGELOG.md
- ✅ STATUS.md (this file)
- ✅ .env.example

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

*Last updated: April 2026*
*Product owner: Mallory Comes*