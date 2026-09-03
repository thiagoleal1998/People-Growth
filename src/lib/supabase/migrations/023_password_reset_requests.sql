-- =====================
-- Password reset requests: the "Esqueci minha senha" flow on the login
-- page has no email-based self-service reset — this is a small team, so
-- instead a request lands here, an admin gets notified, and sets the new
-- password directly from Admin -> Usuários (see resetUserPassword action).
-- Rows are only ever written by the /api/password-reset-request route
-- using the service-role key (rate-limited, same pattern as error_reports
-- and leads), so no anon/authenticated INSERT policy is needed here.
-- =====================
CREATE TABLE password_reset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to password_reset_requests" ON password_reset_requests FOR ALL
  USING (current_user_role() = 'admin');
