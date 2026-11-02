-- Adiciona LinkedIn e Canal do WhatsApp às plataformas monitoráveis em
-- "Planos e Projeções" (migration 077 só tinha instagram/youtube/tiktok/x).
-- Nenhuma das duas tem leitura automática viável (LinkedIn exige app
-- aprovado pelo LinkedIn + OAuth pra estatística de página; Canal do
-- WhatsApp não tem API pública de inscritos) — ficam em entrada manual,
-- mesmo caminho já usado pra TikTok/X.
ALTER TABLE social_accounts DROP CONSTRAINT social_accounts_platform_check;
ALTER TABLE social_accounts ADD CONSTRAINT social_accounts_platform_check CHECK (platform IN ('instagram', 'youtube', 'tiktok', 'x', 'linkedin', 'whatsapp'));
