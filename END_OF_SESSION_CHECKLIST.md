# End of Session Checklist — PM Tool

> Run through these 5 steps at the end of every coding session to keep
> STATUS.md and CHANGELOG.md up to date everywhere.

---

## Step 1 — Update STATUS.md in Cursor

1. Open `STATUS.md` in Cursor
2. Click the **Markdown** tab to switch to edit mode
3. Update the progress table using these status indicators:
   - `⬜` Not started
   - `🔄` In progress
   - `✅` Complete
   - `🚫` Blocked
4. Update **Last Updated** date and **Next Session Goal**
5. Save with **Cmd + S**

---

## Step 2 — Update CHANGELOG.md in Cursor

1. Open `CHANGELOG.md` in Cursor
2. Click the **Markdown** tab to switch to edit mode
3. Add a new entry at the very top (below the header) using this format:

```
## [Month Year] — Session Title

### Added
- Brief description of new features or files created

### Changed
- Brief description of anything modified

### Fixed
- Brief description of bugs resolved

### Decisions Made
- Any important decisions made and why
```

4. Save with **Cmd + S**

---

## Step 3 — Commit and Push via Claude Code

Type this in Claude Code in the Cursor terminal:

```
Please create a docs branch, commit the updated STATUS.md and
CHANGELOG.md, push to GitHub, create a PR, and let me know
when it's ready to merge.
```

Approve any prompts Claude Code asks along the way.

---

## Step 4 — Merge the PR on GitHub

1. Go to the PR link Claude Code gives you
2. Click **Merge pull request**
3. Click **Confirm merge**
4. Click **Delete branch**

---

## Step 5 — Pull Latest Changes Locally

Type this in Claude Code after merging:

```
Please pull the latest changes from main.
```

Approve the prompt and confirm it says "up to date" or lists the files pulled in.

---

## Why All 5 Steps Matter

| Step | What It Updates |
|------|----------------|
| Steps 1–2 | Your local files in Cursor |
| Step 3 | Pushes updates to GitHub |
| Step 4 | Merges them into main on GitHub |
| Step 5 | Syncs your local Mac folder with GitHub |

After Step 5, everything is identical everywhere — your Mac, your
external drive, and GitHub all have the same latest versions.
Claude Code will never read an outdated file!

---

## Quick Reference — Status Indicators

| Symbol | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🔄 | In progress |
| ✅ | Complete |
| 🚫 | Blocked |

---

## Quick Reference — Commit Message Format

| Type | When to Use | Example |
|------|------------|---------|
| `feat` | New feature built | `feat: add login page` |
| `fix` | Bug fixed | `fix: resolve redirect loop` |
| `chore` | Config or install change | `chore: install Resend` |
| `docs` | Documentation update | `docs: update STATUS.md` |
| `style` | UI or styling change | `style: update button colors` |
| `refactor` | Code restructure, no behavior change | `refactor: simplify auth logic` |

---

*Last updated: April 2026*
*PM Tool — Mallory Comes*
