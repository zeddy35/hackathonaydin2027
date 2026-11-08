# Hackathon Aydın 2027

Organization site for Hackathon Aydın 2027. Next.js (App Router) + TypeScript + Tailwind CSS 4.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The root redirects to `/tr` or `/en`.

Copy `.env.example` to `.env.local` and fill in the Supabase values. Without them the public site
still works; sign-in, the participant panel and the admin panel need Supabase.

## Database

Supabase (Postgres, Auth, Storage, row level security). Schema and rules: `supabase/migrations/`.

```bash
npm run test:db   # applies the migrations to an in-memory Postgres and runs supabase/tests/*.sql
```

## Content

- Copy: `src/lib/dict.ts` (shared and home page) and `src/content/` (guide, rules, partners, privacy, panel, auth).
- Application status, dates, sponsors, judges and mentors, MLH flags: admin panel at `/admin` (see `docs/admin-kilavuzu.md`).
- Defaults when the database is not configured: `src/data/`.
- Organizer notes: `docs/organizator-notlari.md`. Delivery report: `docs/teslim-raporu.md`.

## Language

`src/middleware.ts` picks the language: a saved choice (cookie) first, then the visitor's country
(`x-vercel-ip-country` on Vercel), then the browser language.

## Deploy

Vercel. Environment variables: see `.env.example`. Set `NEXT_PUBLIC_SITE_URL` once a domain is
connected; until then canonical URLs use `https://hackathonaydin.vercel.app`.
