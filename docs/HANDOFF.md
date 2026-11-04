# Handoff: where the project stands

This was last updated on 4 Nov 2026, after a long cloud session with Claude Code. Use it to pick up the work in another session, for example in Claude Desktop.

## What's live

- **Production:** https://local-only-v2-avblanas-projects.vercel.app, deployed from `main`.
  - Vercel project `local-only-v2` (`prj_k4aO5OEtQcVrAuaN4nz8BLKO1HOM`).
  - Team `team_jcgdjlcaDx23zI6xJX8jf7Yt`.
- **Latest merge:** [PR #1](https://github.com/AlexVataselu/localOnlyV2/pull/1), squash-merged as `dcf2d4c`.
- **Database:** Vercel Prisma Postgres (store `store_UiNHzRKhpGkwc1X1`), shared by every environment.
  - The current schema has been applied to it (`db push`).
  - It holds the Romanian seed: 5 guide hosts, 10 experiences and their reviews.

## What was done (PR #1)

1. **Audit fixes, using the Impeccable skill:**
   - Upgraded Next to 16.0.11; Vercel blocked 16.0.1 as vulnerable.
   - Typecheck and lint are clean.
   - The detail page reads Prisma directly instead of fetching the app's own API.
   - API hardening: typed filters, no client-set `rating`, and an allowed list of image hosts.
   - Accessibility (axe reports 0 violations), light-mode contrast via `accentText`, responsive fixes, prices in Lei, a branded 404 and page titles.
   - A host landing page at `/experiences/new`.
2. **Listing data:**
   - Each experience now has included items, what to bring, guest requirements, a cancellation policy, languages, a meeting-point description and availability.
   - A `Review` model; `rating` is the average of the reviews.
   - Hosts have a bio.
   - All of these can be edited in the create and edit forms.
3. **Romanian seed** (`prisma/seed.ts`):
   - Hosts: Mihai Bear, Dan Fox, Alex Puma (lynx), Andrei Wolf and Costi Dog.
   - Listings in Bușteni, Azuga, Zărnești, Sibiel, Mediaș, the Danube Delta, Cluj, Sinaia and Făgăraș.
   - The photos are generic Unsplash pictures, not real photos of these places.
4. **Info pages:** About, Team and Contact were rewritten in English with no placeholder text. The contact form opens an email draft to `info@localsonly.com`.
5. **Home and UI:**
   - **Hero:** one guide per screen. The portrait is on the right and the copy on the left. The approved badge slider is docked in the lower right. A row of guide portraits (Bear, Fox, Lynx, Wolf, Dog) switches the portrait, the slogan and the badges together.
   - **Search bar:** a where + what pill. The date field was removed because it never filtered anything.
   - **Cards:** "New this week" and "Similar experiences" cards all have the same height.
   - **Home header:** shows the logo only.

## Open to-dos

- [ ] **Google sign-in:** in Google Cloud Console, add `https://local-only-v2-avblanas-projects.vercel.app/api/auth/callback/google`, plus any custom domain and the preview URLs you want, to the authorised redirect URIs.
- [ ] **Contact email:** confirm that `info@localsonly.com` is the right address (`src/app/contact/page.tsx`).
- [ ] **Badges:** the "Badge completed" states in `src/components/home/heroSlideData.ts` are hard-coded, because nothing tracks badge progress yet.
- [ ] **Photos:** replace the Unsplash stand-ins with real photos of each place. Any new image host must be added to `src/lib/images.ts`.
- [ ] **Booking:** the "Choose" buttons on the detail page don't book anything yet.
- [ ] **Dates:** there is no date filter yet. If you add one, it needs an API filter on `availability` and a field in the search bar.

## Other branches and repos (not merged)

- **`claude/wonderful-franklin-gwintw`, in this repo and in `locals-only-api`:** an earlier redesign built on the wrong base, before your local work was pushed.
  - It is kept for reference: the split hero and the search bar were taken from it.
  - Don't merge it.
- **`AlexVataselu/locals-only-api`:** a standalone REST backend rebuilt during that redesign.
  - Its last commit is `78cec21`, and it is deployed as the Vercel project `locals-only-api`.
  - The live app does **not** use it. `main` talks to Prisma directly through Next.js API routes.

## Design tools used

Both skills were installed into `~/.claude/skills` in the cloud session. To use them on your own machine, install them there:

- **Impeccable:** audit and critique.
- **taste-skill** (https://github.com/Leonxlnx/taste-skill): hero composition. Its scripts need Node 22+ and Chrome.

## Working locally

```bash
git clone https://github.com/AlexVataselu/localOnlyV2.git locals-only-v2
cd locals-only-v2
yarn install
npx vercel link            # pick the local-only-v2 project
npx vercel env pull .env --environment=preview
yarn dev
```

Keep in mind that `.env` points at the shared database, so anything you write locally shows up on the live site. For throwaway experiments, set `DATABASE_URL` to a local Postgres instead.
