-- Lets an article credit more than one author (collaborative pieces).
-- articles.author_id stays the article's primary author — it still decides
-- the main byline, the author-scoped RLS checks, and "Meus artigos"
-- ownership — this table adds any further co-authors to credit alongside
-- it. Mirrors article_categories (051) in shape and RLS.
--
-- NOTE: if any future query embeds `authors(...)` directly under
-- `articles`, add the `authors!author_id(...)` FK hint — otherwise
-- PostgREST will see this junction table as an implicit many-to-many path
-- and return an ambiguous-relationship error (same bug class fixed for
-- article_categories in v1.106.1).
CREATE TABLE article_coauthors (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, author_id)
);

CREATE INDEX article_coauthors_author_id_idx ON article_coauthors (author_id);

ALTER TABLE article_coauthors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read article_coauthors" ON article_coauthors FOR SELECT USING (true);

CREATE POLICY "Admins have full access to article_coauthors" ON article_coauthors FOR ALL
  USING (current_user_role() = 'admin');

-- Same rule as editing the article itself: an author may only add
-- co-authors to their own (primary-authored) articles, checked against the
-- real owning article row rather than a client-supplied id.
CREATE POLICY "Authors manage coauthors of their own articles" ON article_coauthors FOR ALL
  USING (EXISTS (SELECT 1 FROM articles WHERE articles.id = article_coauthors.article_id AND articles.author_id = current_user_author_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM articles WHERE articles.id = article_coauthors.article_id AND articles.author_id = current_user_author_id()));
