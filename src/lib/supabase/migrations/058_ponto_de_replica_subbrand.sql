-- Segunda marca restrita dentro da Festina: Ponto de Réplica (política,
-- economia e sociedade). Mesmo padrão do People & Growth (migration 057) —
-- flag por categoria, marcada pelo admin, em vez de um sistema novo de
-- "marcas"/verticais.

alter table categories add column is_ponto_de_replica boolean not null default false;
