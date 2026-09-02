export function ListingSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)", paddingTop: "6rem", paddingBottom: "5rem" }}>
        <div className="container-xl" style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
          <div className="skeleton" style={{ height: "2.75rem", width: "70%", margin: "0 auto 1rem", opacity: 0.15 }} />
          <div className="skeleton" style={{ height: "1.125rem", width: "90%", margin: "0 auto", opacity: 0.1 }} />
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "var(--site-surface-alt)" }}>
        <div className="container-xl" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.75rem" }}>
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} style={{ backgroundColor: "var(--site-card)", borderRadius: "1.25rem", padding: "1.5rem", border: "1px solid var(--site-border)" }}>
              <div className="skeleton" style={{ height: "160px", marginBottom: "1.25rem" }} />
              <div className="skeleton" style={{ height: "1.125rem", width: "85%", marginBottom: "0.75rem" }} />
              <div className="skeleton" style={{ height: "0.875rem", width: "95%", marginBottom: "0.5rem" }} />
              <div className="skeleton" style={{ height: "0.875rem", width: "60%" }} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
