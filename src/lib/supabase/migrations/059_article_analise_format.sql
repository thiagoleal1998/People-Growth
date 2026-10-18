-- Terceiro "Tipo de conteúdo", entre notícia e opinião: interpreta os fatos,
-- contextualiza causas e examina consequências, mas sem o grau de liberdade
-- autoral da opinião (migration 005_article_format.sql criou a coluna só com
-- noticia/opiniao).
alter table articles drop constraint if exists articles_format_check;
alter table articles add constraint articles_format_check
  check (format in ('noticia', 'analise', 'opiniao'));
