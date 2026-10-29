# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Grupo Festina — a bilingual (pt/en) news/consulting site built with Next.js 15/16 App Router and Supabase. It has three surfaces sharing one codebase: the public site, an admin panel, and an author panel. Three editorial sub-brands live inside the one site — see "Editorial sub-brands" below.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build (**on Windows, use PowerShell, not Bash** — the repo path contains `&`, which breaks Bash's shim resolution for `next`/`eslint` binaries; either PowerShell directly or `node ./node_modules/next/dist/bin/next build` from Bash both work)
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`); `next build` no longer runs lint itself (Next.js 16)
- No test runner is configured in this project.

Database migrations live in `src/lib/supabase/migrations/`, numbered sequentially (currently through 064) and never edited after the fact — a schema change is always a new file. They are not run automatically; paste the new file's contents into the Supabase SQL editor by hand after writing it. Code that depends on a new column/table must not be pushed until the migration has actually been run — confirm with whoever's running it first.

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

### Editorial sub-brands

Three sub-brands live inside the one site, identified two different ways — don't assume they're the same mechanism:
- **People & Growth** and **Ponto de Réplica** are *category-driven*: `categories.is_people_growth` / `categories.is_ponto_de_replica` (booleans, set per category in admin → Configurações → Categorias). An article inherits whichever flag its category has.
- **Mea Sententia** is *format-driven*: `article.format === "opiniao"`, unrelated to category. Its URL segment is `mea-sententia` (see `FORMAT_SEGMENT` in `src/lib/article-url.ts`), not a literal `/opiniao/` path.

Logos: `src/lib/brand-logos.ts` (`PEOPLE_GROWTH_LOGO_URL`, `PONTO_DE_REPLICA_LOGO_URL`, `MEA_SENTENTIA_LOGO_URL`, all re-hosted on the `site-assets` Storage bucket). An article shows **at most one** sub-brand logo, never more than one even if its category and format would both match — format wins over category (`article.format === "opiniao"` checked before either category flag) since an opinion piece keeps that identity regardless of its topic category.

### Content editor and rendering pipeline

Articles use a small hand-rolled markdown dialect (`src/lib/markdown-lite.ts`), not a real markdown library — `renderMarkdownLite()` turns it into HTML for display and `stripMarkdownLite()` turns it into plain text for the text-to-speech reader. It supports `**bold**`, `[link](url)`, `## subtitle`, `- `/`1. ` lists, `![caption](url)` inline images, and `> text` / `> — Attribution` pull-quotes. `src/components/admin/MarkdownEditor.tsx` is the toolbar UI that inserts this syntax (including uploading images through `/api/admin/upload-content-image`); if you add a new syntax feature, both the editor's toolbar and `markdown-lite.ts`'s parser need updating together, and `stripMarkdownLite` needs to know how to drop or flatten it for speech.

A `## Fontes` / `### Fontes` heading **or** a bold-only paragraph (`**Fontes**`/`**FONTES**`) — same regex, `SOURCE_HEADING_RE` in `markdown-lite.ts` — triggers `groupSourceSections()`, which wraps that heading and everything after it (until the next heading) in a tinted citation card and opens every link inside it in a new tab. This only fires on content typed straight into the article body; the *structured* `articles.sources` field (label+url pairs, its own "Fontes" tab in both editors) renders through a separate, always-styled block in `ArticleBody.tsx` — prefer the structured field for anything written going forward, the body-text fallback above exists for whatever's already published without it.

**The author and admin article forms are two separate files that must be kept in sync by hand**: `src/app/admin/(dashboard)/artigos/ArticleForm.tsx` and `src/app/autor/(dashboard)/artigos/AuthorArticleForm.tsx` share no component — a field added to one (the "Fontes" tab, the mandatory AI-use disclosure, a new tab generally) does not exist for the other surface until it's ported over by hand, same for their `actions.ts` server actions. Check both whenever "the editor" comes up.

Article preview (`src/components/ArticlePreviewFrame.tsx` and `src/components/ArticleBody.tsx`) is shared between the real public article page and the draft-preview routes under `/admin/artigos/[id]/preview` and `/autor/artigos/[id]/preview`, so a draft always renders with the exact same component the public site uses — don't duplicate article-rendering markup elsewhere.

### Sports section

`/esportes` is a single tabbed page (`?tab=artigos|brasileirao|nfl|nba`, default `brasileirao`) unifying what used to be three separate routes — `/nfl`, `/nba`, and `/conteudo/categoria/esporte` are now `permanentRedirect`s into the matching tab, kept only so old links/bookmarks still resolve. All score/standings data is fetched live from third parties, nothing is stored in Supabase: football (`src/lib/sports.ts`) blends API-Football (live scores only, needs `API_FOOTBALL_KEY`), TheSportsDB (fallback standings), and a `cheerio` scrape of api-futebol.com.br's public pages (primary standings/fixtures source); NFL/NBA (`src/lib/nfl.ts`/`nba.ts`) hit ESPN's public undocumented JSON API directly, with no toggle to disable them. The one admin-configurable flag, `site_config.sports_widget_enabled`, only hides the home page's live football widget + standings snippet — it does not touch `/esportes` itself.

### Shared admin/author UI kit

`src/components/admin/ui.tsx` is a hand-rolled form/layout kit (`Field`, `Input`, `Textarea`, `Select`, `SectionCard`/`SectionGrid`/`FieldGrid`, `FormShell`, `PageHeader`, `Card`, `SubmitButton`, `EmptyState`) used by both the admin and author panels — there is no component library (Radix/shadcn) despite some UI-kit-shaped dependencies having existed here before; this file is the actual design system. It relies on CSS custom properties (`--admin-*`) defined in `globals.css`, which is why both `src/app/admin/layout.tsx` and `src/app/autor/layout.tsx` must import `../globals.css` at the root — a panel silently loses all styling (raw unstyled HTML) if that import is missing.

Server Components in this codebase are plain `async function` pages doing direct Supabase queries and rendering with inline `style={}` objects (no Tailwind classes, no CSS modules) — this is the house style throughout, not an incomplete migration. Because these pages are Server Components, passing an inline event handler (`onClick`, `onChange`) to a raw DOM element crashes the page in production with a generic "server error" that `next build` does not catch (it's an RSC serialization failure, not a build-time check) — anything interactive needs either a native HTML mechanism (`<details>`/`<summary>`, a `<form>` submit button) or extraction into a `"use client"` component.

A recurring real bug shape, hit more than once: a `display: grid` item (or a flex item) does not shrink below its content's own min-content width by default — a grid track declared `minmax(280px, 1fr)` or similar still lets a long unbroken string (a URL used as its own link text, a long name + several stat columns in a table) force that one item, and with it the whole row/page, wider than its container. The fix is `minWidth: 0` on the grid/flex item itself (and usually `overflow-wrap: anywhere` too, if the culprit is text rather than a table) — reach for this first when something "leaks" past its card's border instead of wrapping/truncating.

### Activity log

`src/lib/activity-log.ts`'s `logActivity()` is called from server actions after a write succeeds, feeding the "Relatório de atividade" tab in `/admin/relatorios`. `diffFields()` plus `ARTICLE_TRACKED_FIELDS` compute and store before/after values per field (rendered as a word-level diff via the `diff` package) — currently wired up for articles only; other content types log create/update/delete but not field-level detail.

### Site-wide feature toggles

A handful of public-site sections can be turned off from admin → Configurações → "Seções do site": `media_enabled`, `testimonials_enabled`, `portfolio_enabled`, `courses_enabled`, `sports_widget_enabled`. All follow the same shape: a `site_config` row whose `value` is the literal string `"true"`/`"false"` (never a real boolean column), read back everywhere as `config.<key> !== "false"` — so a missing row defaults to *enabled*, meaning the flag only needs to exist once an admin has actually switched it off. Each flag's own page additionally checks it server-side and calls `notFound()` when disabled (see `na-midia/page.tsx`, `portfolio/page.tsx`, `cursos/page.tsx`) — the admin checkbox alone only removes the nav/footer link and the sitemap entry, it doesn't block the URL by itself.

### Versioning convention

`src/lib/version.ts`'s `APP_VERSION` is bumped by hand on every commit (patch for fixes, minor for features, major for large changes) and displayed on the login page and both admin/author sidebar footers — update it as part of the same commit, not separately.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
