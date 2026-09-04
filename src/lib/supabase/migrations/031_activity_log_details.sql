-- Field-level before/after values for an edit, so "Relatório de atividade"
-- can show exactly what changed (not just that something did). Stored as
-- [{ field, before, after }, ...]; the UI computes the actual word-level
-- diff at render time via the "diff" package.
ALTER TABLE activity_log ADD COLUMN details JSONB;
