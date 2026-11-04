# Locals Only

Experiences across Romania, hosted by the people who live there.

This repo is the web app: Next.js 16 (App Router), React 19, styled-components, TanStack Query and NextAuth with Google sign-in. All data lives in [locals-only-api](https://github.com/AlexVataselu/locals-only-api), and this app has no database of its own.

```
Browser ──▶ Next.js (this repo)
              ├─ pages & server components ──┐
              └─ /api/* relay routes ────────┤ Bearer <5-min HS256 JWT signed with API_JWT_SECRET>
                                             ▼
                                     locals-only-api ──▶ Postgres
```

* **Sign-in.** NextAuth handles Google OAuth with JWT sessions. On first sign-in the user is synced to the API (`POST /users/sync`), and the API assigns the role.
* **Browser calls.** The browser only calls same-origin `/api/*` routes. These relay to the API as the signed-in user (`src/lib/api/proxy.ts`). API credentials never reach the browser.
* **Server components** call the API directly (`src/lib/api/server.ts`).
* **Roles.** The API checks roles on every write. The session's role is refreshed from the API every 5 minutes, so a newly promoted host sees host controls without signing out.

## Setup

1. Start the API first. Follow the README in locals-only-api; the database can be Vercel Postgres, so you don't need Postgres locally.
2. Configure this app:

   ```bash
   cp .env.example .env.local   # fill in the values
   yarn install
   yarn dev                     # http://localhost:3000
   ```

   | Variable | Purpose |
   |---|---|
   | `AUTH_SECRET` | NextAuth secret (`openssl rand -base64 32`) |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth app. Redirect URI: `http://localhost:3000/api/auth/callback/google` |
   | `API_URL` | Base URL of locals-only-api, for example `http://localhost:4000` |
   | `API_JWT_SECRET` | Must equal the API's `API_JWT_SECRET` |
   | `HOST_CONTACT_EMAIL` | Optional. Shown to signed-in users who ask to become hosts |

3. To become a host, sign in once, then in the API repo run `npm run user:role -- you@gmail.com HOST`.

## Deploying to Vercel

Deploy this repo and the API as **two Vercel projects**. On this one:

* set the variables above, with `API_URL` pointing at the API deployment;
* add the production callback URL to the Google OAuth app.

## Scripts

`yarn dev`, `yarn build`, `yarn start`, `yarn lint`, `yarn typecheck`.

## Project structure

```
src/
  app/                      routes (home, /experiences, /experiences/[id], /new, /[id]/edit, /api relay)
  components/               page sections and widgets
    ui/                     shared building blocks: SiteHeader, Carousel, SectionHeading, Rating, Status, PageShell
  hooks/                    TanStack Query hooks (experiences, hosts)
  lib/api/                  server-side API client, /api relay, browser fetch helper
  lib/auth.ts               NextAuth config (Google, API user sync)
  styles/                   theme tokens (light + dark) and global styles
  types/                    API types and the filter vocabulary (enum codes ↔ labels, URL serialisation)
```

Filters and search are kept in the URL (`/experiences?location=azuga&activityTypes=SPORTS`). That makes every result list shareable, and it survives refresh and Back.
