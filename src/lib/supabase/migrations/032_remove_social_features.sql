-- Removes the AI social-post generator and social-publishing feature
-- (decided against: a small editorial team publishing under named
-- authors doesn't want an automated content pipeline). Both API routes
-- (/api/ai/gerar-conteudo, /api/social/publicar) were already deleted;
-- these four tables backed them and were never wired into any UI or
-- typed client usage (see database.types.ts), so nothing else reads
-- from or writes to them.
DROP TABLE IF EXISTS content_drafts;
DROP TABLE IF EXISTS social_integrations;
DROP TABLE IF EXISTS tiktok_engagements;
DROP TABLE IF EXISTS message_templates;
