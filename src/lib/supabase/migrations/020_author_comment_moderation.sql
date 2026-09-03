-- Authors could already read comments on their own articles (migration 015)
-- but had no way to act on them — approve/reject/delete required admin.
CREATE POLICY "Authors can moderate comments on own articles" ON comments FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM articles WHERE articles.id = comments.article_id AND articles.author_id = current_user_author_id())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM articles WHERE articles.id = comments.article_id AND articles.author_id = current_user_author_id())
  );

CREATE POLICY "Authors can delete comments on own articles" ON comments FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM articles WHERE articles.id = comments.article_id AND articles.author_id = current_user_author_id())
  );
