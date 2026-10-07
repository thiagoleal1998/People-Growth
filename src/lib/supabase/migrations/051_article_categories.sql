-- Lets an article belong to more than one category (e.g. a piece that is both
-- Política and Economia). articles.category_id stays as the article's primary
-- category — it still decides the article's URL
-- (/conteudo/[format]/categoria/[category]/[slug]) and its main badge — and this
-- table adds any further categories the article should also be listed under
-- (other category pages, the home category bar's "has articles" check, etc.).
-- Mirrors article_tags (001_initial_schema.sql) in shape and RLS.
CREATE TABLE article_categories (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, category_id)
);

CREATE INDEX article_categories_category_id_idx ON article_categories (category_id);

ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read article_categories" ON article_categories FOR SELECT USING (true);

CREATE POLICY "Admins have full access to article_categories" ON article_categories FOR ALL
  USING (current_user_role() = 'admin');

-- Same rule as editing the article itself: an author may only tag their own articles
-- with extra categories, checked against the real owning article row rather than a
-- client-supplied id.
CREATE POLICY "Authors manage categories of their own articles" ON article_categories FOR ALL
  USING (EXISTS (SELECT 1 FROM articles WHERE articles.id = article_categories.article_id AND articles.author_id = current_user_author_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM articles WHERE articles.id = article_categories.article_id AND articles.author_id = current_user_author_id()));
