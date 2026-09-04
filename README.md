# People & Growth

Bilingual (pt/en) news and consulting site — a public content site plus an admin panel and a separate author panel, all in one Next.js app.

## Tech stack

- **Next.js 16** (App Router, Server Components/Actions, Turbopack)
- **Supabase** (Postgres + Row Level Security + Auth + Storage)
- **next-intl** for `pt`/`en` routing and translations
- **Tailwind CSS v4** (used mainly for the global reset/utilities — most UI is hand-rolled inline styles, see `CLAUDE.md`)
- **Vercel** for hosting/deployment

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Windows note:** if the repo path contains an `&` (as in "People & Growth"), run `npm run build` from PowerShell rather than Git Bash — Bash's `.bin` shim resolution breaks on the `&` and fails to find the `next`/`eslint` binaries.

### Environment variables

Create `.env.local` with:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon/public key (RLS-respecting client) |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Service-role key (bypasses RLS — server-only, see `createAdminClient()` in `CLAUDE.md`) |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical site URL, used for absolute links/metadata |
| `RESEND_API_KEY` | optional | Enables transactional email (password-reset admin notifications). Without it, `src/lib/email.ts` silently no-ops. |
| `RESEND_FROM_EMAIL` | optional | Sender address once a domain is verified in Resend; defaults to Resend's shared `onboarding@resend.dev`. |

### Database migrations

Schema changes live in `src/lib/supabase/migrations/`, numbered sequentially. They are **not** applied automatically — after adding a new migration file, run its SQL by hand in the Supabase project's SQL editor. Migrations are never edited after being merged; a further change is always a new numbered file.

## Deployment

The app is deployed on Vercel, connected to this repository's `main` branch. Environment variables above must also be set in the Vercel project settings (not just `.env.local`).

## Project structure

See `CLAUDE.md` for the architecture write-up (route trees, the two Supabase client patterns, RLS conventions, the content editor/rendering pipeline, and the shared admin/author UI kit). In short:

- `src/app/[locale]/(public)/` — the public site
- `src/app/admin/(dashboard)/` — admin CMS
- `src/app/autor/(dashboard)/` — author CMS (restricted to the author's own content)
- `src/lib/` — shared server-side helpers (Supabase clients, activity log, email, rate limiting, markdown rendering)
- `src/components/` — shared UI, split into public-site components, `admin/`, `autor/`, and `layout/`
