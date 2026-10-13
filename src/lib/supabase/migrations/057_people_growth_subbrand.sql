-- Fase B do rebrand Festina: People & Growth passa a ser uma marca
-- restrita dentro do site (liderança, desenvolvimento pessoal e a
-- consultoria), marcada por categoria em vez de um sistema novo de
-- "marcas"/verticais que ninguém pediu.

alter table categories add column is_people_growth boolean not null default false;
