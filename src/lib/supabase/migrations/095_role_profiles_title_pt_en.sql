-- "title" was being used inconsistently — English for the original
-- C-level rows ("Chief Marketing Officer"), Portuguese for the newer
-- Diretoria/Heads/etc. rows ("Diretor(a) de Marketing e Growth"). Split
-- it into the same title_pt/title_en pair used everywhere else in the
-- app (articles, portfolio_cases, services, courses, ...) so every role
-- always shows both.
ALTER TABLE role_profiles RENAME COLUMN title TO title_pt;
ALTER TABLE role_profiles ADD COLUMN title_en TEXT;
