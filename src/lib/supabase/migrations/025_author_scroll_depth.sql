-- Lets an author see how much of their own articles people actually read
-- (Autor -> Meus artigos -> Estatísticas), not just view counts. page_views
-- was previously admin-only; this scopes read access to rows whose
-- article belongs to the caller, same shape as the author comment
-- policies from migration 020.
CREATE POLICY "Authors can read page views of their own articles" ON page_views FOR SELECT
  USING (
    article_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM articles WHERE articles.id = page_views.article_id AND articles.author_id = current_user_author_id()
    )
  );
