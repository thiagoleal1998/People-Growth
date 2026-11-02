-- Sistema interno de mensagens: admin<->admin e admin<->colunista, nunca
-- colunista<->colunista. Também adiciona "quem criou" em instruction_items
-- pra permitir o colunista acionar o criador de uma instrução direto pelo
-- Canal de Instruções.
BEGIN;

-- Quem criou cada instrução (null = antiga, ninguém registrado).
ALTER TABLE instruction_items ADD COLUMN created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
UPDATE instruction_items SET created_by = (SELECT id FROM user_profiles WHERE email = 'gustavoafonso473@gmail.com');

-- Igual a current_user_role()/current_user_columnist_id() (migration 010),
-- mas parametrizada: permite que a policy de INSERT de messages confira o
-- papel do DESTINATÁRIO sem cair na RLS de user_profiles (que só deixa cada
-- um ler a própria linha) nem precisar de admin client dentro de uma policy.
CREATE OR REPLACE FUNCTION public.user_role_by_id(target_id UUID) RETURNS TEXT
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM user_profiles WHERE id = target_id;
$$;

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  context_type TEXT,
  context_id UUID,
  context_title TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX messages_recipient_idx ON messages(recipient_id, created_at DESC);
CREATE INDEX messages_sender_idx ON messages(sender_id, created_at DESC);
CREATE INDEX messages_unread_idx ON messages(recipient_id) WHERE read_at IS NULL;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own conversations" ON messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send allowed messages" ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND recipient_id <> auth.uid()
    AND NOT (current_user_role() = 'columnist' AND user_role_by_id(recipient_id) = 'columnist')
  );

CREATE POLICY "Recipients can mark their messages read" ON messages FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Mesmo padrão de defesa em profundidade de internal_tickets (migration
-- 022): o destinatário só pode tocar em read_at, nunca reescrever o
-- conteúdo ou fingir ser outro remetente.
REVOKE UPDATE ON messages FROM authenticated;
GRANT UPDATE (read_at) ON messages TO authenticated;

INSERT INTO notification_templates (key, title_template, body_template, description) VALUES
  ('message_received', '{{sender}} te enviou uma mensagem', '{{preview}}',
    'Enviada a quem recebe uma mensagem interna (admin ou colunista). Placeholders: {{sender}}, {{preview}}.');

COMMIT;
