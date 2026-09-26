-- =====================
-- "Diagnóstico de Liderança" tool: a public, lead-gated 9-box-style
-- leadership assessment (one evaluated person per submission). Reuses the
-- existing Recursos catalog to surface an entry point to it (a card whose
-- type is "tool" instead of a downloadable file), and adds a dedicated
-- table to persist every submission for the admin to review before
-- following up with the lead.
-- =====================

-- (a) widen resources.type so an interactive-tool card can live in the
-- existing Recursos grid/admin CRUD without a parallel content model.
ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_type_check;
ALTER TABLE resources ADD CONSTRAINT resources_type_check
  CHECK (type IN ('ebook', 'template', 'guide', 'checklist', 'prompt', 'tool'));

-- (b) one row per public submission of the leadership assessment tool.
-- No public SELECT/INSERT policy: every public write goes through the
-- /api/tools/leadership-assessment route handler using createAdminClient()
-- (service-role, bypasses RLS), same convention as leads/error_reports/
-- comments — never a direct authenticated-insert policy for public writes.
CREATE TABLE leadership_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  evaluated_name TEXT NOT NULL,
  evaluated_role TEXT,
  evaluator_name TEXT,
  competencies JSONB NOT NULL,
  strengths TEXT,
  development_needs TEXT,
  development_plan TEXT,
  next_actions TEXT,
  milestones JSONB NOT NULL DEFAULT '{"short":[],"medium":[],"long":[]}'::jsonb,
  performance_score NUMERIC(3, 2) NOT NULL,
  behavior_score NUMERIC(3, 2) NOT NULL,
  quadrant_label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX leadership_assessments_created_at_idx ON leadership_assessments (created_at DESC);

ALTER TABLE leadership_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to leadership_assessments" ON leadership_assessments FOR ALL
  USING (current_user_role() = 'admin');
