# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

People & Growth — a bilingual (pt/en) news/consulting site built with Next.js 15/16 App Router and Supabase. It has three surfaces sharing one codebase: the public site, an admin panel, and an author panel.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build (**on Windows, use PowerShell, not Bash** — the repo path contains `&`, which breaks Bash's shim resolution for `next`/`eslint` binaries; either PowerShell directly or `node ./node_modules/next/dist/bin/next build` from Bash both work)
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`); `next build` no longer runs lint itself (Next.js 16)
- No test runner is configured in this project.

Database migrations live in `src/lib/supabase/migrations/`, numbered sequentially (currently through 032) and never edited after the fact — a schema change is always a new file. They are not run automatically; paste the new file's contents into the Supabase SQL editor by hand after writing it.

## Architecture

### Three route trees, one Supabase project

- `src/app/[locale]/(public)/` — the public, internationalized site (next-intl, locales `pt`/`en`, pathnames mapped per-route in `src/i18n/routing.ts`).
- `src/app/admin/(dashboard)/` — full-access CMS for admins.
- `src/app/autor/(dashboard)/` — a restricted CMS for authors (their own articles/comments/profile only).

`src/proxy.ts` (Next.js 16's renamed `middleware.ts`) does double duty: for `/admin` and `/autor` paths it checks the Supabase session and role (`user_profiles.role`) and redirects unauthenticated or wrong-role requests to `/admin/login`; for everything else it delegates to next-intl's own middleware for locale routing.

### Two Supabase clients — which one to use matters

`src/lib/supabase/server.ts` exports two very different clients:
- `createClient()` — session/cookie-bound via `@supabase/ssr`, respects RLS. Use this whenever a request should be scoped by the logged-in user's own permissions (most admin/author reads and writes).
- `createAdminClient()` — a plain `@supabase/supabase-js` client authenticated with the service-role key, bypassing RLS entirely. Use this only where RLS would incorrectly block a legitimate operation: Storage uploads, admin-only cross-user queries (e.g. listing every `user_profiles` row, which RLS restricts to "your own row only"), and every public unauthenticated write (contact form, comments, error reports, password-reset requests, view/scroll tracking) — those go through Route Handlers using `createAdminClient()` plus `src/lib/rate-limit.ts`'s `checkRateLimit()`, never a direct authenticated insert policy.

Getting this wrong is a recurring bug shape in this codebase: using `createClient()` where all-users data is needed silently returns only the caller's own row instead of erroring.

### RLS is the primary authorization layer

Role checks (`admin`/`author`) are enforced in Postgres via RLS policies calling `current_user_role()`/`current_user_author_id()` (SECURITY DEFINER functions), not just in application code. When adding a table that authors need scoped access to (their own articles/comments), add a policy that joins back to `current_user_author_id()` rather than trusting a client-supplied author id. Some tables additionally use column-level `GRANT`/`REVOKE` (e.g. `comments`, `internal_tickets`) so a valid session can update a status column but not rewrite the original content — this is deliberate defense-in-depth, not an oversight, when you see it.

### Content editor and rendering pipeline

Articles use a small hand-rolled markdown dialect (`src/lib/markdown-lite.ts`), not a real markdown library — `renderMarkdownLite()` turns it into HTML for display and `stripMarkdownLite()` turns it into plain text for the text-to-speech reader. It supports `**bold**`, `[link](url)`, `## subtitle`, `- `/`1. ` lists, `![caption](url)` inline images, and `> text` / `> — Attribution` pull-quotes. `src/components/admin/MarkdownEditor.tsx` is the toolbar UI that inserts this syntax (including uploading images through `/api/admin/upload-content-image`); if you add a new syntax feature, both the editor's toolbar and `markdown-lite.ts`'s parser need updating together, and `stripMarkdownLite` needs to know how to drop or flatten it for speech.

Article preview (`src/components/ArticlePreviewFrame.tsx` and `src/components/ArticleBody.tsx`) is shared between the real public article page and the draft-preview routes under `/admin/artigos/[id]/preview` and `/autor/artigos/[id]/preview`, so a draft always renders with the exact same component the public site uses — don't duplicate article-rendering markup elsewhere.

### Shared admin/author UI kit

`src/components/admin/ui.tsx` is a hand-rolled form/layout kit (`Field`, `Input`, `Textarea`, `Select`, `SectionCard`/`SectionGrid`/`FieldGrid`, `FormShell`, `PageHeader`, `Card`, `SubmitButton`, `EmptyState`) used by both the admin and author panels — there is no component library (Radix/shadcn) despite some UI-kit-shaped dependencies having existed here before; this file is the actual design system. It relies on CSS custom properties (`--admin-*`) defined in `globals.css`, which is why both `src/app/admin/layout.tsx` and `src/app/autor/layout.tsx` must import `../globals.css` at the root — a panel silently loses all styling (raw unstyled HTML) if that import is missing.

Server Components in this codebase are plain `async function` pages doing direct Supabase queries and rendering with inline `style={}` objects (no Tailwind classes, no CSS modules) — this is the house style throughout, not an incomplete migration. Because these pages are Server Components, passing an inline event handler (`onClick`, `onChange`) to a raw DOM element crashes the page in production with a generic "server error" that `next build` does not catch (it's an RSC serialization failure, not a build-time check) — anything interactive needs either a native HTML mechanism (`<details>`/`<summary>`, a `<form>` submit button) or extraction into a `"use client"` component.

### Activity log

`src/lib/activity-log.ts`'s `logActivity()` is called from server actions after a write succeeds, feeding the "Relatório de atividade" tab in `/admin/relatorios`. `diffFields()` plus `ARTICLE_TRACKED_FIELDS` compute and store before/after values per field (rendered as a word-level diff via the `diff` package) — currently wired up for articles only; other content types log create/update/delete but not field-level detail.

### Versioning convention

`src/lib/version.ts`'s `APP_VERSION` is bumped by hand on every commit (patch for fixes, minor for features, major for large changes) and displayed on the login page and both admin/author sidebar footers — update it as part of the same commit, not separately.
