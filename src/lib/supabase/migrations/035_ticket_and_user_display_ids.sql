-- Human-friendly sequential display IDs — purely for showing "CPG-0001" /
-- "IDPG-0001" in the UI instead of raw UUIDs. SERIAL auto-backfills every
-- existing row in creation order and keeps counting for new ones.
ALTER TABLE internal_tickets ADD COLUMN ticket_number SERIAL;
ALTER TABLE user_profiles ADD COLUMN display_id SERIAL;

-- Ticket detail view additions: who it's assigned to, and which page the
-- reporter was on when they opened it (mirrors error_reports.page_url).
-- assigned_to_name is a denormalized snapshot (like created_by_name below
-- it) because RLS on user_profiles only lets a caller read their own row —
-- an author viewing their own ticket couldn't otherwise see who an admin
-- assigned it to.
ALTER TABLE internal_tickets ADD COLUMN assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
ALTER TABLE internal_tickets ADD COLUMN assigned_to_name TEXT;
ALTER TABLE internal_tickets ADD COLUMN page_path TEXT;

-- Extends the column-level grant from 022_internal_tickets.sql to also
-- cover assigned_to/assigned_to_name (still admin-only in practice —
-- authors have no UPDATE row policy on this table at all).
REVOKE UPDATE ON internal_tickets FROM authenticated;
GRANT UPDATE (status, admin_response, updated_at, assigned_to, assigned_to_name) ON internal_tickets TO authenticated;
