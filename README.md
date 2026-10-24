# Machmaso

Machmaso is a shared project developed by Agamir and Tomas on separate computers.

## Interactive map prototype

The current monochrome prototype uses Next.js App Router, TypeScript, Tailwind
CSS, Leaflet with OpenStreetMap tiles, marker clustering, Lucide icons, and EN/DE
controls. Listings are read server-side from Supabase, with built-in fictional
samples as a fallback; signed-in users can post actions. It is a prototype,
not a final application architecture or product specification. The original
`hello.py` and `test_hello.py` remain unchanged as a historical test scaffold.

### Local setup

Use Node.js 22 or newer and npm (tested with Node.js 24.17.0 and npm 11.13.0).
From the repository root:

```sh
npm ci
cp .env.example .env.local   # then fill in the Supabase values
npm run dev
```

Open http://127.0.0.1:3000. The development server binds to the local computer
only. Each collaborator runs their own preview from their own checkout.

### Supabase (listings and accounts)

Listings are loaded server-side from the `listings` table of the Supabase
project "Machmalso". Anyone can browse. Visitors who want to post an action are
asked to sign in or create an account (email and password); the listing is then
inserted server-side with the signed-in user's session. The author is always
taken from the verified session, never from the browser. No service-role key is
used anywhere.

#### Environment variables

| Name                                   | Where                                | Purpose                                                       |
| -------------------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | `.env.local`, Vercel                 | Project URL (Project Settings → API)                          |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env.local`, Vercel                 | Publishable key (Project Settings → API Keys)                 |
| `NEXT_PUBLIC_SITE_URL`                 | Vercel Production (optional locally) | Base URL for confirmation links, e.g. `https://<your-domain>` |

Copy `.env.example` to `.env.local` for local development. The publishable
key is designed to be public, but `.env.local` stays out of git (`.env*` is
ignored; only `.env.example` is committed). `NEXT_PUBLIC_*` values are inlined
at build time: restart `npm run dev` locally, and redeploy on Vercel after
changing them. Without `NEXT_PUBLIC_SITE_URL`, confirmation links use the
origin of the page where someone signed up (useful for Vercel previews).

Without the Supabase values, or if the request fails, the app falls back to the
built-in samples from `createSamples()` with a "demo data" notice, and posting
is disabled.

#### Supabase Auth settings (dashboard)

- **Authentication → Sign In / Providers → Email**: enabled, with **Confirm
  email** left on. Leave other providers off.
- **Authentication → URL Configuration**:
  - Site URL: the production URL (e.g. `https://<your-domain>`).
  - Redirect URLs: `http://127.0.0.1:3000/auth/confirm`,
    `http://localhost:3000/auth/confirm`, `https://<your-domain>/auth/confirm`,
    and for Vercel previews `https://*-<team-slug>.vercel.app/auth/confirm`.
- **Authentication → Emails → Confirm signup** (recommended): set the link to
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}`.
  This works even when the link is opened in another browser. The default
  template also works (`/auth/confirm` handles its `?code=` link), but only in
  the browser where the account was created.
- Supabase's built-in email service is heavily rate-limited and meant for
  testing. Configure custom SMTP before inviting real users.

`/auth/confirm` only redirects to paths on this site; any other `next` value
falls back to `/`.

#### Database

- `supabase/migrations/20261024161215_create_listings.sql` (applied) creates
  the table with check constraints matching `lib/data.ts` and Row Level
  Security with a single policy that lets anyone `SELECT`.
- `supabase/migrations/20261024180000_add_listing_authors.sql` (**not applied
  yet**) adds a nullable `author_id` referencing `auth.users`, reduces table
  privileges to `SELECT` for everyone plus column-limited `INSERT` for
  signed-in users, and adds a policy that only allows inserting listings whose
  `author_id` is the inserting user. Until it is applied, browsing works and
  posting shows a "not available yet" message.
- `supabase/seed.sql` inserts the 16 fictional listings (no author, fixed dates
  in June 2027). It is safe to re-run. To set up a fresh project, run the
  migrations in order and then the seed in the Supabase SQL editor.
- Sending a request stays a local demo (React memory). There is no editing or
  deleting of listings yet.

### Checks and production preview

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

`npm test` runs the Vitest unit tests for listing validation, ownership
mapping, auth input, and the confirmation redirect guard.

To preview the production build, stop the development server, then run:

```sh
npm run start
```

The production preview uses the same local URL. Run `npm run format` to format
the web source and setup documentation. The lockfile is shared; use `npm ci`
after pulling dependency changes.

### What to try

- Explore 16 fictional actions around Munich; zoom or select a cluster to reach
  nearby overlapping markers. Marker icons represent actions, not people.
- Combine intention, category, and text filters. Map and list share the same
  results. Use the map/list toggle on a phone or for a larger results view.
- Select a marker or card to open a desktop side panel or mobile bottom sheet.
- Send a demo request with an optional introduction. A pending state appears;
  no real message is delivered and chat is not implemented.
- Post an action after signing in, using a neighborhood, availability,
  compensation, and (for exchanges) separate offer/return fields. It is saved to
  Supabase and appears for everyone once the listing-authors migration is applied.
- Toggle EN/DE for interface labels. Fictional listing text stays in English.

### Dates, location, and demo limitations

- Date-only values use `YYYY-MM-DD` strings, formatted without local timezone
  conversion. Seeded Supabase listings use fixed dates; the built-in fallback
  samples generate dates after the current Berlin calendar date on each page
  load. Time ranges are wall-clock times in `Europe/Berlin`;
  recurring schedules preserve local time across daylight-saving changes.
- Specific dates may omit a time range. Recurring schedules require weekdays
  and a valid start/end range. Overnight ranges are not supported in this draft.
- Locations are approximate neighborhood points; no exact home address is asked
  for. The map does not request device geolocation.
- Listings are read from Supabase and signed-in users can create them. Pending
  requests are held only in React memory, and refreshing resets them. There is
  no listing editing, profile editing, social login, payment processing, real
  messaging, or acceptance flow. Deployment does not turn these demo flows into
  persistent services.
- OpenStreetMap tiles require internet access and retain visible attribution.
  If tile loading fails, the app switches to the results list with an explanatory
  notice. The map uses no paid service or API key. Production traffic would require
  evaluating the tile provider's usage policy and capacity.
- Native modal dialogs provide keyboard focus containment, Escape dismissal,
  and focus restoration. The list is also an accessible alternative to the map.
- The root App Router route is compatible with Vercel's Next.js support.
  `next.config.ts` only disables automatic framework edits to the shared
  `AGENTS.md`; existing collaboration rules are preserved. No deployment
  overrides or account settings have been added or changed.

## Collaboration workflow

Agamir and Tomas work directly on `main` for ordinary project tasks. Pull
requests and approval from the other collaborator are not required. This
supersedes the previous PR-only workflow.

### Before editing

1. Read [AGENTS.md](AGENTS.md), inspect the current branch and working tree, and
   check whether another local agent is actively working in the same checkout.
   Do not automatically switch branches or pull while another agent is working.
2. Fetch `origin`, safely switch to `main`, and update before editing:

   ```sh
   git status --short --branch
   git fetch origin
   git switch main
   git pull --ff-only origin main
   ```

3. Preserve all existing local changes and commits. Never discard or silently
   include unrelated work. If unrelated work or divergent history prevents safe
   synchronization, resolve the situation before proceeding without losing work.
4. Use a separate branch or worktree for simultaneous local tasks.

### Completing a task

1. Run checks appropriate to the change and report results or checks that could
   not be run. For implementation changes, use the relevant lint, type-check,
   build, and interaction checks described above.
2. Review the diff and intended untracked files for unintended changes and
   secrets. Run `git diff --check`; stage only the task's files and review the
   staged diff, including `git diff --cached --check`.
3. Commit only the task's changes with a descriptive English message, then push
   directly with `git push origin main`. Do not routinely ask for another
   confirmation. Explicit instructions such as "draft only", "do not commit",
   or "do not push" override this default.

### Concurrent remote changes

If a push is rejected because the other collaborator pushed first, fetch and
integrate the latest `origin/main`. Rebase only this task's own unpublished
commits when safe; preserve unrelated work and never rewrite published history.
Resolve straightforward conflicts while preserving both collaborators' intent,
and ask about genuinely ambiguous conflicts. Repeat checks affected by the
integration, review the result, and retry a normal push.

Never force-push `main`, reset away work, or discard another collaborator's
changes. If repository rules reject direct pushes, report the exact restriction
without bypassing it or changing branch protection. Do not install background
synchronization, scheduled jobs, or Git hooks.

### Deployment

A normal push to `main` may trigger the existing Vercel production deployment.
Both collaborators authorize this as part of the default workflow, without a
routine extra confirmation. Deployment settings, paid services or purchases,
and destructive database operations require explicit authorization.

Report deployment status and preview URLs only when verified. A successful Git
push alone is not proof of a successful deployment; otherwise report deployment
as unverified.

Follow [AGENTS.md](AGENTS.md) for shared rules. Communicate with Codex and write
code, comments, commit messages, and shared documentation in English. Never
commit credentials or real `.env` files; keep only placeholders in `.env.example`.
