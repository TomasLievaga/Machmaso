# Machmaso

Machmaso is a shared project developed by Agamir and Tomas on separate computers.

## Interactive map prototype

The first visual draft uses Next.js App Router, TypeScript, Tailwind CSS, Leaflet
with OpenStreetMap tiles, marker clustering, and Lucide icons. It is a prototype,
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

### Supabase (listings, read-only)

Listings are loaded server-side from the `listings` table of the Supabase
project "Machmalso". Put the project URL and publishable key (Supabase →
Project Settings → API Keys) into `.env.local`:

```sh
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

The publishable key is designed to be public, but `.env.local` stays out of git
(`.env*` is ignored; only `.env.example` is committed). Restart `npm run dev`
after changing it. Without these values, or if the request fails, the app falls
back to the built-in samples from `createSamples()` and shows a "demo data"
notice.

- Schema: `supabase/migrations/20261024161215_create_listings.sql` creates the
  table with check constraints matching `lib/data.ts` and enables Row Level
  Security with a single policy that lets anyone `SELECT`. There are no insert,
  update or delete policies yet, because there is no login.
- Sample data: `supabase/seed.sql` inserts the 16 fictional listings (fixed
  dates in June 2027, recurring or "by arrangement" otherwise). It is safe to
  re-run. To set up a fresh project, paste the migration and then the seed into
  the Supabase SQL editor.
- Posting an action and sending a request stay local-only (React memory) until
  authentication exists. Nothing is written to Supabase.

### Checks and production preview

```sh
npm run lint
npm run typecheck
npm run build
```

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
- Post an action using a neighborhood, availability, compensation, and (for
  exchanges) separate offer/return fields. It appears immediately in this session.
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
- Listings are read from Supabase; newly posted actions and pending requests are
  held only in React memory, and refreshing resets them. There is no
  authentication, write access to the database, payment processing, real
  messaging, acceptance flow, or production deployment.
- OpenStreetMap tiles require internet access and retain visible attribution.
  If tile loading fails, the app switches to the results list with an explanatory
  notice. No paid service or API key is used. Production traffic would require
  evaluating the tile provider's usage policy and capacity.
- Native modal dialogs provide keyboard focus containment, Escape dismissal,
  and focus restoration. The list is also an accessible alternative to the map.
- The root App Router route is compatible with Vercel's Next.js support.
  `next.config.ts` only disables automatic framework edits to the shared
  `AGENTS.md`; existing collaboration rules are preserved. No deployment
  overrides or account settings have been added or changed.

## Collaboration workflow

1. Start with a clean working tree, switch to `main`, and update it with `git pull --ff-only origin main`. If updating fails, resolve the divergence together without discarding work.
2. Create a separate task branch, for example `git switch -c codex/agamir-task-name` or `git switch -c codex/tomas-task-name`.
3. Implement the focused change and run appropriate checks.
4. Review the diff and commit the intended files with an English commit message.
5. Push the task branch with `git push -u origin <task-branch>`.
6. Open a pull request into `main` and obtain the other collaborator's review.
7. Merge the reviewed pull request, then update local `main` before starting another task.

Follow [AGENTS.md](AGENTS.md) for shared collaboration rules. Communicate with
Codex and write code, comments, commit messages, and shared documentation in English.
