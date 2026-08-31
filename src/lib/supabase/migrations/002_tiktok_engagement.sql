-- =====================
-- MESSAGE TEMPLATES
-- =====================
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- TIKTOK ENGAGEMENTS
-- =====================
CREATE TABLE tiktok_engagements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  display_name TEXT,
  video_title TEXT NOT NULL,
  video_url TEXT,
  liked_at DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'skipped')),
  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_engagements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users have full access to message_templates" ON message_templates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users have full access to tiktok_engagements" ON tiktok_engagements FOR ALL USING (auth.role() = 'authenticated');

-- Default templates
INSERT INTO message_templates (name, content) VALUES
  ('Saudação padrão', 'Oi {{nome}}! Vi que curtiu meu vídeo sobre "{{video}}". Obrigado pelo apoio! 🙏 Se tiver alguma dúvida sobre o tema, pode me chamar aqui.'),
  ('Engajamento ativo', 'Olá {{nome}}! Fico feliz que curtiu o vídeo sobre "{{video}}"! Tenho mais conteúdo sobre isso. Qualquer dúvida é só perguntar 🚀');
