-- "Feiras e Eventos" — admin-only planning tool for which trade fairs/
-- conferences the founders will attend. One row per event, grouped by
-- state (RJ/SP/MG sub-menu in the admin UI). Costs are broken into
-- ticket/travel/food/other so the admin can see a full cost estimate per
-- event before deciding — travel is framed around car rental or bus
-- departing from Petrópolis, per how the group actually travels.
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('RJ', 'SP', 'MG')),
  city TEXT,
  venue TEXT,
  date_start DATE,
  date_end DATE,
  interest_description TEXT,
  decision TEXT NOT NULL DEFAULT 'a_decidir' CHECK (decision IN ('sim', 'nao', 'a_decidir')),
  attendees TEXT,
  ticket_url TEXT,
  base_price NUMERIC,
  price_notes TEXT,
  travel_cost NUMERIC,
  travel_notes TEXT,
  food_cost NUMERIC,
  other_cost NUMERIC,
  other_cost_notes TEXT,
  source_urls TEXT,
  notes TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to events" ON events FOR ALL USING (current_user_role() = 'admin');
