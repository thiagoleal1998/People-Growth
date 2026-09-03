-- Audit trail for "Relatório de atividade" in Admin -> Relatórios: what
-- each admin/author did while logged in. Written exclusively through
-- src/lib/activity-log.ts using the service-role key (same pattern as
-- page_views/error_reports), so no anon/authenticated INSERT policy.
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX activity_log_created_at_idx ON activity_log (created_at DESC);
CREATE INDEX activity_log_user_id_idx ON activity_log (user_id);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to activity_log" ON activity_log FOR ALL
  USING (current_user_role() = 'admin');
