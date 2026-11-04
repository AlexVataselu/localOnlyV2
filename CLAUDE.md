# Locals Only V2

A marketplace for local experiences in Romania. Experiences are hosted by "animal guide" mascots (bear, fox, lynx, wolf, dog). Prices are in lei.

For the history of the project and the open to-dos, read `docs/HANDOFF.md` first.

## Stack

- **App:** Next.js 16 App Router with React 19 and TypeScript.
- **Styling:** styled-components, with theme tokens in `src/styles/theme.ts`.
- **Data:** Prisma 6 on Vercel Prisma Postgres, plus TanStack Query.
- **Auth:** NextAuth v5 (Google) with the Prisma adapter.
- **Package manager:** yarn. `yarn.lock` is the lockfile; don't add a `package-lock.json`.
- **Builds use webpack:** `next dev --webpack` and `next build --webpack`.

## Commands

```bash
yarn install          # also runs prisma generate
yarn dev              # http://localhost:3000
yarn typecheck && yarn lint
yarn build
yarn db:push          # apply prisma/schema.prisma to DATABASE_URL
yarn db:seed          # DESTRUCTIVE: deletes all users/experiences, then seeds Romanian demo data
```

Environment: `npx vercel env pull .env --environment=preview` writes the Vercel variables into `.env`, which git ignores. Never commit `.env*` files.

## Rules that matter here

- **The database is shared:** preview and production use the same Vercel Postgres database. Ask the user before running `db:seed`, and before any schema change that drops data.
- **Server reads:**
  - Server components read data with Prisma via `src/lib/experiences.ts`.
  - Never `fetch` the app's own API from the server: behind Vercel Deployment Protection it returns an HTML login page, which crashed the detail page.
- **Images:** remote images must come from hosts in `src/lib/images.ts` (`IMAGE_HOSTS`). The API rejects other hosts.
- **Colours:**
  - Use theme tokens, not hex values.
  - Use `accentText` for accent-coloured text, because `accent` (#E2A506) fails contrast on white.
  - The hero is always dark, so it uses fixed light colours.
- **Badges:** the badge cards (`ChallengeBadgeCard` and `ChallengeBadgesSlider`) are an approved design; don't restyle them.
- **Accessibility bar:**
  - One `h1` per page. Pages that have their own h1 pass `titleAs="p"` to `AppHeader`.
  - A `main` landmark and visible focus on every page.
  - axe should report 0 violations.
  - No horizontal scroll at 390px, 1024px or 1440px.
- **Verify in a real browser:** after UI changes, screenshot the page at those three widths and look at the screenshots before calling it done.

## Map

- `src/app`: routes. `experiences/[id]` is the detail page; `experiences/new` shows the host landing page or the create form.
- `src/components/home`: the home sections. `HeroSection` is one guide per screen, with the badge slider docked and a picker row of guide portraits.
- `src/components/ExperienceDetailContent.tsx`: the detail page. Each section renders only when the listing has data.
- `src/components/ExperienceExtrasFields.tsx`: the listing-details fields shared by the create and edit forms.
- `src/lib/experienceExtras.ts`: validation of those fields in the API.
- `prisma/schema.prisma` and `prisma/seed.ts`: the schema and the demo data.
