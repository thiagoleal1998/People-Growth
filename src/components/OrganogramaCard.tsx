import { Network } from "lucide-react";
import type { Author } from "@/types/database.types";

const cardStyle = { backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", borderTop: "3px solid #315E9C", overflow: "hidden" } as const;
const cardHeaderStyle = { padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--admin-border-strong)" } as const;

// Sócios (founders) still get a smaller photo than regular authors — just
// not as tiny as before.
const FOUNDER_PHOTO_SIZE = "3rem";
const FOUNDER_CHIP_PHOTO_SIZE = "2.25rem";

// role_pt is a full sentence ("Fundador e CEO do Grupo Festina · ...") —
// too long for a chart box, so this just pulls out the three-letter title
// the founders' own role_pt already carries by convention.
function shortRole(roleText: string | null | undefined): string | null {
  if (!roleText) return null;
  if (roleText.includes("CEO")) return "CEO";
  if (roleText.includes("CCAO")) return "CCAO";
  if (roleText.includes("CMO")) return "CMO";
  return null;
}

function NameChip({ author }: { author: Author }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
      <div
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
      <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--admin-muted)" }}>{author.name}</span>
    </div>
  );
}

// Authors get a much bigger photo than the small sócios chip above — on
// request, so the editorial team's faces actually stand out.
function AuthorChip({ author }: { author: Author }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "6rem" }}>
      <div
        style={{
          width: "4.5rem",
          height: "4.5rem",
          borderRadius: "50%",
          flexShrink: 0,
          background: author.photo_url ? `url("${author.photo_url}") center/cover` : "linear-gradient(135deg, #315E9C, #C89A4A)",
          border: "2px solid var(--admin-surface)",
          boxShadow: "0 0 0 1px var(--admin-border-strong)",
        }}
      />
      <span style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-text)", lineHeight: 1.25 }}>{author.name}</span>
    </div>
  );
}

function FounderBox({ author }: { author: Author }) {
  const role = shortRole(author.role_pt);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "5.5rem" }}>
      <div
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
        <div style={{ fontWeight: 800, fontSize: "0.75rem", color: "var(--admin-text)", lineHeight: 1.25 }}>{author.name}</div>
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
  const ceoFounder = founders.length === 3 ? (founders.find((a) => a.role_pt?.includes("CEO")) ?? null) : null;
  const otherFounders = ceoFounder ? founders.filter((a) => a.id !== ceoFounder.id) : [];
  const otherAuthors = authors.filter((a) => !a.is_founder && a.status === "active");

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
                  {founders.map((a) => (
                    <NameChip key={a.id} author={a} />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", margin: "1.5rem 0 1.25rem" }}>
              <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "var(--admin-text)", textTransform: "uppercase", letterSpacing: "0.04em" }}>C-Level</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <FounderBox author={ceoFounder} />
              <Connector />
              <div style={{ display: "flex", gap: "2.5rem", justifyContent: "center" }}>
                {otherFounders.map((a) => (
                  <FounderBox key={a.id} author={a} />
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
                  {founders.map((a) => (
                    <NameChip key={a.id} author={a} />
                  ))}
                </div>
              </div>
            </div>

            {otherAuthors.length > 0 && (
              <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "var(--admin-text)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Autores</div>
                <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                  {otherAuthors.map((a) => (
                    <AuthorChip key={a.id} author={a} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
