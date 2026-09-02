export function ArticleSkeleton() {
  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)", paddingTop: "6rem", paddingBottom: "4rem" }}>
        <div className="container-xl" style={{ maxWidth: "800px" }}>
          <div className="skeleton" style={{ height: "1.5rem", width: "140px", marginBottom: "1.5rem", opacity: 0.15 }} />
          <div className="skeleton" style={{ height: "2.75rem", width: "90%", marginBottom: "0.75rem", opacity: 0.15 }} />
          <div className="skeleton" style={{ height: "2.75rem", width: "60%", opacity: 0.15 }} />
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
        <div
          className="container-xl article-skeleton-grid"
          style={{ maxWidth: "1100px", display: "grid", gridTemplateColumns: "1fr 300px", gap: "4rem", alignItems: "start" }}
        >
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: "1rem", width: i % 3 === 2 ? "70%" : "100%", marginBottom: "0.875rem" }} />
            ))}
          </div>
          <div>
            <div className="skeleton" style={{ height: "220px", marginBottom: "1rem" }} />
            <div className="skeleton" style={{ height: "140px" }} />
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .article-skeleton-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>
    </>
  );
}
