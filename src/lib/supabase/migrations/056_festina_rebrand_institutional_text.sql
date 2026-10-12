-- Rebrand: People & Growth -> Festina. Swaps the brand name (not the
-- substance) inside the already-saved PT bodies of the three general
-- institutional pages that got customized away from the code-level
-- defaults in institutional-defaults.ts (comentarios, direitos-autorais,
-- normas-de-seguranca-e-privacidade). Their EN bodies are null in
-- production (no admin override), so they already fall back to the
-- updated EN text in institutional-defaults.ts with no DB change needed.
--
-- Deliberately excludes the "o-que-e-people-and-growth" page — that page
-- IS the restricted People & Growth sub-brand (per the Festina rebrand
-- plan), so its own name stays "People & Growth" throughout.

update institutional_pages
set body_pt = replace(body_pt, 'People & Growth', 'Festina')
where slug in ('comentarios', 'direitos-autorais', 'normas-de-seguranca-e-privacidade')
  and body_pt like '%People & Growth%';
