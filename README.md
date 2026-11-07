# Hackathon Aydın 2027

Organization site for Hackathon Aydın 2027. Next.js (App Router) + TypeScript + Tailwind CSS 4.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The root redirects to `/tr` or `/en`.

## Content

- Copy: `src/lib/dict.ts` (shared and home page) and `src/content/` (guide, rules, partner pages).
- Data: `src/data/` (application status, sponsors, judges and mentors, schedule).
- Organizer notes: `docs/organizator-notlari.md`.

## Language

`src/middleware.ts` picks the language: a saved choice (cookie) first, then the visitor's country
(`x-vercel-ip-country` on Vercel), then the browser language.

## Deploy

Vercel. Set `NEXT_PUBLIC_SITE_URL` once a domain is connected; until then canonical URLs use
`https://hackathonaydin.vercel.app`.
