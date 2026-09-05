-- In-app notification center (bell icon in both admin and author sidebars).
-- Currently only populated by the "Notificar membro" action on a ticket,
-- but the shape is generic (title/body/link) so other features can reuse it.
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_user_id_idx ON notifications(user_id, read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can mark own notifications read" ON notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins have full access to notifications" ON notifications FOR ALL USING (current_user_role() = 'admin');

-- A recipient can only ever flip their own `read` flag — not rewrite the
-- notification's content, even though the row policy above would allow it.
REVOKE UPDATE ON notifications FROM authenticated;
GRANT UPDATE (read) ON notifications TO authenticated;
