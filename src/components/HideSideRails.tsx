// Reading pages (institutional texts and articles) keep the side columns out of
// the way: the category list and social icons would compete with the text.
export function HideSideRails() {
  return (
    <style>{`
      .category-nav, .social-sidebar { display: none !important; }
    `}</style>
  );
}
