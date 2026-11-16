-- Sub-menu inside "Cargos e Funções" grouping roles by organizational
-- level (C-Level, Diretoria, Heads, Gerentes, Coordenadores,
-- Supervisores, Analistas, Assistentes) — every existing row is a
-- founder's C-level role, hence the default.
ALTER TABLE role_profiles
  ADD COLUMN level TEXT NOT NULL DEFAULT 'c_level'
    CHECK (level IN ('c_level', 'diretoria', 'heads', 'gerentes', 'coordenadores', 'supervisores', 'analistas', 'assistentes'));
