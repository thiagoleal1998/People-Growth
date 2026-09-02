-- =====================
-- ERROR REPORTS ("Comunicar erro")
-- =====================
CREATE TABLE error_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_url TEXT NOT NULL,
  description TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert error reports" ON error_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users have full access to error_reports" ON error_reports FOR ALL USING (auth.role() = 'authenticated');
