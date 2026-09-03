-- =====================
-- Internal tickets: lets authors report bugs and suggest improvements
-- from their own panel, and lets admins do the same from theirs. Lives
-- alongside error_reports (public "Comunicar erro" button reports) under
-- the renamed "Chamados" admin section, as a separate tab.
-- =====================
CREATE TABLE internal_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_by_name TEXT NOT NULL,
  created_by_role TEXT NOT NULL CHECK (created_by_role IN ('admin', 'author')),
  type TEXT NOT NULL DEFAULT 'bug' CHECK (type IN ('bug', 'suggestion')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  admin_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX internal_tickets_created_by_idx ON internal_tickets(created_by);

ALTER TABLE internal_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to internal_tickets" ON internal_tickets FOR ALL
  USING (current_user_role() = 'admin');

-- created_by_role is only ever a display label (actual access is always
-- gated by current_user_role(), never by this column), but there's no
-- reason to let a caller forge it, so it's checked against their real role.
CREATE POLICY "Authors can create their own tickets" ON internal_tickets FOR INSERT
  WITH CHECK (created_by = auth.uid() AND created_by_role = current_user_role());

CREATE POLICY "Authors can read their own tickets" ON internal_tickets FOR SELECT
  USING (created_by = auth.uid());

-- Column-level restriction, same reasoning as comments in migration 021:
-- nobody (including admins, via the app's own UI) ever needs to rewrite
-- the reporter's identity or original ticket text after the fact — only
-- the status and the admin's reply. Authors have no UPDATE row policy at
-- all above, so this only narrows what admins' own updates can touch.
REVOKE UPDATE ON internal_tickets FROM authenticated;
GRANT UPDATE (status, admin_response, updated_at) ON internal_tickets TO authenticated;
