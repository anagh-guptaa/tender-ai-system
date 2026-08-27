# Dossier — Tender Portal (Frontend)

A React frontend for a tender discovery + documentation portal: sign in, browse
tenders scraped from government/public-institute pages, open a tender's full
dossier, and fill out its application form on-site.

## Stack
- React + Vite
- React Router
- Tailwind CSS v4
- Supabase JS client (wired up, optional for now)

## Current scope
This is the **frontend UI only** — no backend yet. It runs out of the box in
**demo mode**:
- Login/signup accept any email + password and create a local session
  (`AuthContext`, `src/context/AuthContext.jsx`).
- Tender listings come from placeholder data shaped like a scraper's output
  (`src/lib/mockTenders.js`) — swap this for real scraped data later.
- Filled application forms save to `localStorage` (`src/pages/ApplicationForm.jsx`,
  `src/pages/Applications.jsx`) so "My Applications" has something to show.

## Running it
```bash
npm install
npm run dev
```

## Connecting Supabase later
1. Create a Supabase project, enable email/password auth.
2. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`.
3. `AuthContext` automatically switches from demo mode to real Supabase auth
   once those env vars are present — no other code changes needed.
4. For the tender data: point your scraper's output at a Supabase table and
   replace the import in `Dashboard.jsx` / `TenderDetail.jsx` with a Supabase
   query instead of `mockTenders.js`.
5. For application submissions: replace the `localStorage` calls in
   `ApplicationForm.jsx` with an `insert` into a Supabase table (and
   Supabase Storage for the uploaded documents).

## Structure
```
src/
  components/   Logo, Seal (status stamp), AppLayout (sidebar shell), ProtectedRoute
  context/      AuthContext (Supabase + demo-mode auth)
  lib/          supabaseClient, mockTenders (placeholder scraped data)
  pages/        Login, Signup, Dashboard, TenderDetail, ApplicationForm, Applications
```
