# MIDA Mega Tool

Developer onboarding for the Destiny 2 weapon search and customization app.

## What This Project Is

This repo is a Next.js 16 app that lets users:

- search Destiny 2 weapons
- open a weapon customization page
- inspect weapon perk sockets and stats
- browse imported manifest data from Supabase
- track trending weapons based on search-result clicks

Core integrations:

- Bungie API for live manifest/detail lookups and fallback data paths
- Supabase for imported manifest tables and trending search analytics
- Vercel for deployment

## Important Note About Next.js

This project uses a newer Next.js version with breaking changes.

Before making framework-level changes, read the relevant docs in:

`node_modules/next/dist/docs/`

At minimum, route/page work should follow the docs for:

- `app` router
- route handlers
- route segment config like `dynamic = 'force-dynamic'`

## Tech Stack

- Node.js
- npm
- Next.js 16
- React 19
- TypeScript
- Supabase
- Bungie API
- Vercel

## Project Layout

Main app/runtime files:

- [src/app/layout.tsx](C:/Users/StriX/mida-mega-tool-next/src/app/layout.tsx)
- [src/app/page.tsx](C:/Users/StriX/mida-mega-tool-next/src/app/page.tsx)
- [src/app/components/Header.tsx](C:/Users/StriX/mida-mega-tool-next/src/app/components/Header.tsx)
- [src/app/api/weapons/search/route.ts](C:/Users/StriX/mida-mega-tool-next/src/app/api/weapons/search/route.ts)
- [src/app/api/weapons/details/[hash]/route.ts](C:/Users/StriX/mida-mega-tool-next/src/app/api/weapons/details/[hash]/route.ts)
- [src/app/api/weapons/trending/route.ts](C:/Users/StriX/mida-mega-tool-next/src/app/api/weapons/trending/route.ts)
- [src/app/api/manifest/items/route.ts](C:/Users/StriX/mida-mega-tool-next/src/app/api/manifest/items/route.ts)
- [src/app/weapon-lab/[hash]/page.tsx](C:/Users/StriX/mida-mega-tool-next/src/app/weapon-lab/[hash]/page.tsx)

Shared helpers:

- [src/lib/d2-api-human.ts](C:/Users/StriX/mida-mega-tool-next/src/lib/d2-api-human.ts)
- [src/lib/manifest-items.ts](C:/Users/StriX/mida-mega-tool-next/src/lib/manifest-items.ts)
- [src/lib/weapon-search-trending.ts](C:/Users/StriX/mida-mega-tool-next/src/lib/weapon-search-trending.ts)
- [src/lib/supabase-public.ts](C:/Users/StriX/mida-mega-tool-next/src/lib/supabase-public.ts)
- [src/utils/supabase/proxy.ts](C:/Users/StriX/mida-mega-tool-next/src/utils/supabase/proxy.ts)
- [src/proxy.ts](C:/Users/StriX/mida-mega-tool-next/src/proxy.ts)

Operational setup files:

- [supabase/manifest-schema.sql](C:/Users/StriX/mida-mega-tool-next/supabase/manifest-schema.sql)
- [supabase/normalize-d2db.sql](C:/Users/StriX/mida-mega-tool-next/supabase/normalize-d2db.sql)
- [supabase/weapon-search-trending.sql](C:/Users/StriX/mida-mega-tool-next/supabase/weapon-search-trending.sql)
- [scripts/import-bungie-manifest-to-supabase.mjs](C:/Users/StriX/mida-mega-tool-next/scripts/import-bungie-manifest-to-supabase.mjs)

Additional notes:

- [docs/developer-manual.md](C:/Users/StriX/mida-mega-tool-next/docs/developer-manual.md)
- [docs/supabase-manifest.md](C:/Users/StriX/mida-mega-tool-next/docs/supabase-manifest.md)

## Prerequisites

Install locally:

- Node.js 20+ recommended
- npm

External accounts/services you need:

- a Bungie API key
- a Supabase project
- optional: a Vercel project if you want to deploy

## Environment Variables

Create `.env.local` in the repo root.

Required for normal local development:

```env
BUNGIE_API_KEY=your_bungie_api_key
NEXT_PUBLIC_BUNGIE_API_KEY=your_bungie_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Optional but useful for admin/import workflows:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_URL=your_postgres_connection_string
```

Notes:

- `BUNGIE_API_KEY` is used server-side.
- `NEXT_PUBLIC_BUNGIE_API_KEY` is browser-visible. Keep it only if you intentionally want public client access.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is expected to be public.

## Install And Run

Install dependencies:

```bash
npm install
```

Start local development:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Build production output locally:

```bash
npm run build
npm run start
```

## Supabase Setup

Cloning the repo is not enough for full functionality. Supabase schema and data must exist.

### 1. Create or choose a Supabase project

You need:

- project URL
- publishable key
- service role key if doing admin scripts
- optional direct Postgres URL

### 2. Run SQL files in the Supabase SQL editor

Run these files in this order:

1. [manifest-schema.sql](C:/Users/StriX/mida-mega-tool-next/supabase/manifest-schema.sql)
2. [normalize-d2db.sql](C:/Users/StriX/mida-mega-tool-next/supabase/normalize-d2db.sql)
3. [weapon-search-trending.sql](C:/Users/StriX/mida-mega-tool-next/supabase/weapon-search-trending.sql)

What they do:

- `manifest-schema.sql` creates the base imported manifest table
- `normalize-d2db.sql` creates helper tables for items, perks, traits, and stats
- `weapon-search-trending.sql` creates the trending search table and increment function

### 3. Import manifest data

Use the included importer:

```bash
npm run import:manifest:supabase
```

This loads Bungie's `DestinyInventoryItemDefinition` into Supabase.

You can also provide a local JSON file:

```bash
node scripts/import-bungie-manifest-to-supabase.mjs ./path/to/DestinyInventoryItemDefinition.json
```

## What Works Without Full Setup

If you only run `npm install` and `npm run dev`:

- the app can boot
- some pages render
- some searches may partially work through fallback paths

But these features require Supabase schema/data:

- `/manifest-lab`
- manifest-backed search behavior
- perk icon hydration from imported data
- homepage trending weapons

## Runtime Flow

### Weapon search

- Search UI lives in [Header.tsx](C:/Users/StriX/mida-mega-tool-next/src/app/components/Header.tsx)
- Search requests go to [api/weapons/search/route.ts](C:/Users/StriX/mida-mega-tool-next/src/app/api/weapons/search/route.ts)
- That route prefers Supabase manifest weapon search and falls back to `d2-api-human`

### Weapon details/customization

- Weapon page is [weapon-lab/[hash]/page.tsx](C:/Users/StriX/mida-mega-tool-next/src/app/weapon-lab/[hash]/page.tsx)
- Data comes from [api/weapons/details/[hash]/route.ts](C:/Users/StriX/mida-mega-tool-next/src/app/api/weapons/details/[hash]/route.ts)
- Perk organization comes from `d2-api-human`
- Perk names/icons are hydrated from manifest-backed Supabase data where available

### Manifest lab

- UI: [manifest-lab/page.tsx](C:/Users/StriX/mida-mega-tool-next/src/app/manifest-lab/page.tsx)
- API: [api/manifest/items/route.ts](C:/Users/StriX/mida-mega-tool-next/src/app/api/manifest/items/route.ts)
- Data source: Supabase manifest tables via [manifest-items.ts](C:/Users/StriX/mida-mega-tool-next/src/lib/manifest-items.ts)

### Trending weapons

- Search-result click tracking posts to [api/weapons/trending/route.ts](C:/Users/StriX/mida-mega-tool-next/src/app/api/weapons/trending/route.ts)
- Trending data is stored in Supabase table `weapon_search_trending`
- Homepage reads top 7 trending weapons in [page.tsx](C:/Users/StriX/mida-mega-tool-next/src/app/page.tsx)

## Vercel Deployment

If deploying to Vercel, add these environment variables in the Vercel project:

- `BUNGIE_API_KEY`
- `NEXT_PUBLIC_BUNGIE_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Then deploy:

```bash
vercel deploy --prod
```

If env vars are missing, the app now fails more gracefully than before, but Supabase-backed functionality will be degraded.

## Troubleshooting

### Homepage still shows fallback trending weapons

Likely causes:

- `weapon_search_trending` table was not created
- nobody has clicked search results yet
- Supabase env vars are missing

### Manifest lab returns empty data or errors

Check:

- manifest SQL ran successfully
- manifest import completed
- public read policy exists
- Supabase public env vars are correct

### Weapon page shows missing icons

Check:

- `normalize-d2db.sql` ran
- `destiny_inventory_items`, `destiny_sandbox_perks`, and `destiny_traits` exist
- manifest import/normalization completed

### Production site 500s

Check:

- Vercel env vars exist
- Supabase tables are present
- latest deployment logs in Vercel

## Recommended First Tasks For A New Developer

1. Get the app booting locally with `.env.local`.
2. Run the Supabase SQL files.
3. Import manifest data.
4. Verify `/manifest-lab` works.
5. Verify search opens a real weapon page.
6. Verify homepage trending starts changing after search clicks.
7. Review the runtime/data flow before making new abstractions.

For a fuller setup guide, read [docs/developer-manual.md](C:/Users/StriX/mida-mega-tool-next/docs/developer-manual.md).
