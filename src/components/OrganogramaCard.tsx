import { Network } from "lucide-react";
import type { Author } from "@/types/database.types";

const cardStyle = { backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", borderTop: "3px solid #315E9C", overflow: "hidden" } as const;
const cardHeaderStyle = { padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--admin-border-strong)" } as const;

// Sócios (founders) still get a smaller photo than regular authors — just
// not as tiny as before.
const FOUNDER_PHOTO_SIZE = "3rem";
const FOUNDER_CHIP_PHOTO_SIZE = "2.25rem";

// role_pt/role_en are a full sentence each ("Fundador e CEO do Grupo
// Festina · ...") — too long for a chart box, so this just pulls out the
// three-letter title. Checks both languages rather than only role_pt: an
// edit can rephrase the Portuguese text without the acronym (e.g. role_pt
// spelling out "Diretor de Assuntos Corporativos" instead of "CCAO") while
// role_en keeps it, so relying on a single field silently drops the badge.
function shortRole(author: Pick<Author, "role_pt" | "role_en">): string | null {
  const text = `${author.role_pt ?? ""} ${author.role_en ?? ""}`;
  if (text.includes("CEO")) return "CEO";
  if (text.includes("CCAO")) return "CCAO";
  if (text.includes("CMO")) return "CMO";
  return null;
}

function NameChip({ author, index }: { author: Author; index: number }) {
  return (
    <div className="og-item" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", animationDelay: `${index * 60}ms` }}>
      <div
        className="og-avatar"
        style={{
          width: FOUNDER_CHIP_PHOTO_SIZE,
          height: FOUNDER_CHIP_PHOTO_SIZE,
          borderRadius: "50%",
          flexShrink: 0,
          background: author.photo_url ? `url("${author.photo_url}") center/cover` : "linear-gradient(135deg, #315E9C, #C89A4A)",
          border: "2px solid var(--admin-surface)",
          boxShadow: "0 0 0 1px var(--admin-border-strong)",
        }}
      />
      <span className="og-name" style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--admin-muted)" }}>{author.name}</span>
    </div>
  );
}

// Authors get a much bigger photo than the small sócios chip above — on
// request, so the editorial team's faces actually stand out.
function AuthorChip({ author, index }: { author: Author; index: number }) {
  return (
    <div className="og-item" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "6rem", animationDelay: `${index * 60}ms` }}>
      <div
        className="og-avatar"
        style={{
          width: "4.5rem",
          height: "4.5rem",
          borderRadius: "50%",
          flexShrink: 0,
          background: `url("${author.photo_url}") center/cover`,
          border: "2px solid var(--admin-surface)",
          boxShadow: "0 0 0 1px var(--admin-border-strong)",
        }}
      />
      <span className="og-name" style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-text)", lineHeight: 1.25 }}>{author.name}</span>
    </div>
  );
}

function FounderBox({ author, index }: { author: Author; index: number }) {
  const role = shortRole(author);
  return (
    <div className="og-item" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "5.5rem", animationDelay: `${index * 60}ms` }}>
      <div
        className="og-avatar"
        style={{
          width: FOUNDER_PHOTO_SIZE,
          height: FOUNDER_PHOTO_SIZE,
          borderRadius: "50%",
          flexShrink: 0,
          background: author.photo_url ? `url("${author.photo_url}") center/cover` : "linear-gradient(135deg, #315E9C, #C89A4A)",
          border: "2px solid var(--admin-surface)",
          boxShadow: "0 0 0 1px var(--admin-border-strong)",
        }}
      />
      <div style={{ textAlign: "center" }}>
        <div className="og-name" style={{ fontWeight: 800, fontSize: "0.75rem", color: "var(--admin-text)", lineHeight: 1.25 }}>{author.name}</div>
        {role && (
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#315E9C", letterSpacing: "0.03em", marginTop: "0.125rem" }}>{role}</div>
        )}
      </div>
    </div>
  );
}

// Pure-CSS "⊤" connector between the CEO box above and the two boxes below
// it: a short vertical drop, then a bar split in half where each half's
// inner border turns the corner down into its own box — no SVG needed.
function Connector() {
  return (
    <>
      <div style={{ width: "2px", height: "1.25rem", backgroundColor: "var(--admin-border-strong)" }} />
      <div style={{ display: "flex", width: "100%", maxWidth: "260px" }}>
        <div style={{ flex: 1, height: "1.25rem", borderTop: "2px solid var(--admin-border-strong)", borderRight: "2px solid var(--admin-border-strong)" }} />
        <div style={{ flex: 1, height: "1.25rem", borderTop: "2px solid var(--admin-border-strong)", borderLeft: "2px solid var(--admin-border-strong)" }} />
      </div>
    </>
  );
}

export function OrganogramaCard({ authors }: { authors: Author[] }) {
  const founders = authors.filter((a) => a.is_founder);
  // Only meaningful for exactly 3 founders (CEO + two others) — otherwise
  // there's no clean pyramid to draw, so the card just doesn't render one.
  const ceoFounder = founders.length === 3 ? (founders.find((a) => shortRole(a) === "CEO") ?? null) : null;
  const otherFounders = ceoFounder ? founders.filter((a) => a.id !== ceoFounder.id) : [];
  // Placeholder entries (no photo yet, or an empty name) don't belong in a
  // chart whose whole point is putting a face to each person.
  const otherAuthors = authors.filter((a) => !a.is_founder && a.status === "active" && a.photo_url && a.name?.trim());

  // Alphabetical by request, for every section except the C-Level pyramid
  // below (which keeps the hierarchy order the unsorted `founders`/
  // `otherFounders` above already encode — CEO on top, the others under it).
  const byName = (a: Author, b: Author) => a.name.localeCompare(b.name, "pt");
  const foundersAlpha = [...founders].sort(byName);
  const otherAuthorsAlpha = [...otherAuthors].sort(byName);

  if (!ceoFounder && founders.length === 0 && otherAuthors.length === 0) return null;

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <h2 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--admin-text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Network size={17} color="#315E9C" /> Organograma
        </h2>
      </div>

      <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {ceoFounder && (
          <div>
            <div style={{ backgroundColor: "rgba(49, 94, 156, 0.05)", border: "1px solid rgba(49, 94, 156, 0.15)", borderRadius: "0.875rem", padding: "1.25rem" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--admin-text)" }}>Conselho Administrativo</div>
                <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                  {foundersAlpha.map((a, i) => (
                    <NameChip key={a.id} author={a} index={i} />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", margin: "1.5rem 0 1.25rem" }}>
              <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "var(--admin-text)", textTransform: "uppercase", letterSpacing: "0.04em" }}>C-Level</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <FounderBox author={ceoFounder} index={0} />
              <Connector />
              <div style={{ display: "flex", gap: "2.5rem", justifyContent: "center" }}>
                {otherFounders.map((a, i) => (
                  <FounderBox key={a.id} author={a} index={i + 1} />
                ))}
              </div>
            </div>
          </div>
        )}

        {(founders.length > 0 || otherAuthors.length > 0) && (
          <div>
            <div style={{ backgroundColor: "rgba(200, 154, 74, 0.06)", border: "1px solid rgba(200, 154, 74, 0.2)", borderRadius: "0.875rem", padding: "1.25rem" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--admin-text)" }}>Conselho Editorial</div>
                <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                  {foundersAlpha.map((a, i) => (
                    <NameChip key={a.id} author={a} index={i} />
                  ))}
                </div>
              </div>
            </div>

            {otherAuthors.length > 0 && (
              <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "var(--admin-text)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Autores</div>
                <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                  {otherAuthorsAlpha.map((a, i) => (
                    <AuthorChip key={a.id} author={a} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes ogFadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.92); }
          to { opacity: 1; transform: none; }
        }
        .og-item {
          animation: ogFadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .og-avatar {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .og-item:hover .og-avatar {
          transform: scale(1.1) translateY(-3px);
          box-shadow: 0 0 0 2px #315E9C, 0 10px 22px rgba(49, 94, 156, 0.3);
        }
        .og-name {
          transition: color 0.2s ease;
        }
        .og-item:hover .og-name {
          color: #315E9C;
        }
      `}</style>
    </div>
  );
}
