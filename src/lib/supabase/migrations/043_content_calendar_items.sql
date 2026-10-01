-- Calendário de divulgação: planejamento manual de posts de redes sociais e
-- pautas de matérias a produzir. Sem geração/publicação automática — só
-- anotações que o admin cria e acompanha; a feature de automação de posts
-- deste projeto foi removida de propósito na migration 032, por decisão da
-- equipe editorial. Matérias já agendadas de verdade continuam vivendo em
-- articles/scheduled_for — este calendário só as exibe, não as duplica.
CREATE TABLE content_calendar_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('social_post', 'article_topic')),
  title TEXT NOT NULL,
  notes TEXT,
  platform TEXT CHECK (platform IN ('instagram', 'linkedin', 'whatsapp', 'live', 'other')),
  responsible TEXT,
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'done')),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX content_calendar_items_scheduled_date_idx ON content_calendar_items (scheduled_date);

ALTER TABLE content_calendar_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to content_calendar_items" ON content_calendar_items FOR ALL
  USING (current_user_role() = 'admin');
