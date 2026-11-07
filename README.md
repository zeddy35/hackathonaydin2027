# Hackathon Aydın 2027

Organization site for Hackathon Aydın 2027. Next.js (App Router) + Tailwind CSS 4 + Motion.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The root redirects to `/tr` or `/en`.

## Language

`src/middleware.ts` picks the language: a saved choice (cookie) first, then the visitor's country
(`x-vercel-ip-country` on Vercel), then the browser language. All copy lives in `src/lib/dict.ts`.

## Deploy

Push to GitHub and import the repo on Vercel, then add the `hackathonaydin.com` domain in the project settings.
