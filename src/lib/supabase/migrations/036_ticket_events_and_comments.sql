-- Powers the "Linha do tempo" (timeline) in the ticket detail view: one row
-- per notable thing that happened to a ticket (assigned, status changed,
-- someone notified). The very first "opened" entry isn't stored here — it's
-- synthesized from internal_tickets.created_at/created_by_name, since it's
-- always true and never needs to be queried separately.
CREATE TABLE ticket_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES internal_tickets(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('assigned', 'status_changed', 'notified')),
  actor_name TEXT NOT NULL,
  detail TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ticket_events_ticket_id_idx ON ticket_events(ticket_id);

ALTER TABLE ticket_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to ticket_events" ON ticket_events FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "Authors can read events on own tickets" ON ticket_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM internal_tickets WHERE internal_tickets.id = ticket_events.ticket_id AND internal_tickets.created_by = auth.uid()));

-- =====================
-- Ticket replies: a two-way conversation thread between whoever opened the
-- ticket and admins, rendered inline in the same timeline. Once posted, a
-- reply is never edited or deleted — no UPDATE/DELETE policies for anyone
-- but admins (via their FOR ALL policy).
-- =====================
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES internal_tickets(id) ON DELETE CASCADE,
  author_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ticket_comments_ticket_id_idx ON ticket_comments(ticket_id);

ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to ticket_comments" ON ticket_comments FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "Authors can read comments on own tickets" ON ticket_comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM internal_tickets WHERE internal_tickets.id = ticket_comments.ticket_id AND internal_tickets.created_by = auth.uid()));

CREATE POLICY "Authors can comment on own tickets" ON ticket_comments FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (SELECT 1 FROM internal_tickets WHERE internal_tickets.id = ticket_comments.ticket_id AND internal_tickets.created_by = auth.uid())
  );
