# Rocky Mount Design Co. — Site & Admin

A static site with a tokenless admin panel and live cross-device sync, powered by Vercel serverless functions.

## How it works

- **`index.html`** — public site. Loads content from `/api/data` (falls back to `data.json`). Auto-syncs every 15s, on tab focus, and instantly across same-browser tabs after a save.
- **`admin.html`** — password-only admin. Edits projects, skills, contact, hero, about, and appearance.
- **`data.json`** — all editable content.
- **`api/data.js`** — returns the current content (reads GitHub server-side; visitors never need a token).
- **`api/save.js`** — saves changes to GitHub using a server-held token, after checking the admin password.

If the Vercel functions aren't deployed, the admin automatically falls back to publishing with a personal GitHub token (one-time prompt), so the site keeps working on GitHub Pages too.

## Deploy to Vercel (one-time)

1. Go to **vercel.com** → **Add New… → Project** → import the GitHub repo `eduardoquirino290-art/marketing`.
2. Framework preset: **Other**. Leave build settings empty (it's static + `/api`).
3. Add **Environment Variables** (Project → Settings → Environment Variables):

   | Name | Value | Notes |
   |------|-------|-------|
   | `GH_TOKEN` | a GitHub PAT with **repo** scope | held server-side only |
   | `ADMIN_PASSWORDS` | `anther2026,eduardo2026` | comma-separated; must match the admin logins |
   | `GH_REPO` | `eduardoquirino290-art/marketing` | optional (this is the default) |
   | `GH_BRANCH` | `main` | optional (default) |

4. **Deploy.** Your site will be live at `https://<project>.vercel.app`.
5. Use `https://<project>.vercel.app/admin.html` — log in with just a password and hit **Save & Publish**. No token needed.

## Changing admin passwords

Update both:
- `ADMINS` in `admin.html` (gates the login UI)
- `ADMIN_PASSWORDS` env var in Vercel (the real server-side check)
