import { Network } from "lucide-react";
import { OrgChartConnectorLines } from "@/components/OrgChartConnectorLines";
import type { Columnist } from "@/types/database.types";

const CLEVEL_WRAP_ID = "org-chart-clevel";

const cardStyle = { backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", borderTop: "3px solid #315E9C", overflow: "hidden" } as const;
const cardHeaderStyle = { padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--admin-border-strong)" } as const;

// Sócios (founders) still get a smaller photo than regular columnists — just
// not as tiny as before.
const FOUNDER_PHOTO_SIZE = "3rem";
const FOUNDER_CHIP_PHOTO_SIZE = "2.25rem";

// org_chart_role is the manual override (set in the columnist's edit form,
// "Organograma" field) — anyone can have one, not just founders. Falls back
// to sniffing role_pt/role_en for the three-letter title when it's empty,
// same as before, so existing founders keep working unchanged without
// having to re-enter anything. Checks both languages rather than only
// role_pt: an edit can rephrase the Portuguese text without the acronym
// (e.g. role_pt spelling out "Diretor de Assuntos Corporativos" instead of
// "CCAO") while role_en keeps it, so relying on a single field silently
// drops the badge.
function shortRole(columnist: Pick<Columnist, "role_pt" | "role_en" | "org_chart_role">): string | null {
  if (columnist.org_chart_role?.trim()) return columnist.org_chart_role.trim();
  const text = `${columnist.role_pt ?? ""} ${columnist.role_en ?? ""}`;
  if (text.includes("CEO")) return "CEO";
  if (text.includes("CCAO")) return "CCAO";
  if (text.includes("CMO")) return "CMO";
  return null;
}

function NameChip({ columnist, index }: { columnist: Columnist; index: number }) {
  return (
    <div className="og-item" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", animationDelay: `${index * 60}ms` }}>
      <div
        className="og-avatar"
        style={{
          width: FOUNDER_CHIP_PHOTO_SIZE,
          height: FOUNDER_CHIP_PHOTO_SIZE,
          borderRadius: "50%",
          flexShrink: 0,
          background: columnist.photo_url ? `url("${columnist.photo_url}") center/cover` : "linear-gradient(135deg, #315E9C, #C89A4A)",
          border: "2px solid var(--admin-surface)",
          boxShadow: "0 0 0 1px var(--admin-border-strong)",
        }}
      />
      <span className="og-name" style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--admin-muted)" }}>{columnist.name}</span>
    </div>
  );
}

// Columnists get a much bigger photo than the small sócios chip above — on
// request, so the editorial team's faces actually stand out.
function ColumnistChip({ columnist, index }: { columnist: Columnist; index: number }) {
  return (
    <div className="og-item" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "6rem", animationDelay: `${index * 60}ms` }}>
      <div
        className="og-avatar"
        style={{
          width: "4.5rem",
          height: "4.5rem",
          borderRadius: "50%",
          flexShrink: 0,
          background: `url("${columnist.photo_url}") center/cover`,
          border: "2px solid var(--admin-surface)",
          boxShadow: "0 0 0 1px var(--admin-border-strong)",
        }}
      />
      <span className="og-name" style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-text)", lineHeight: 1.25 }}>{columnist.name}</span>
    </div>
  );
}

function FounderBox({ columnist, index, compact }: { columnist: Columnist; index: number; compact?: boolean }) {
  const role = shortRole(columnist);
  const photoSize = compact ? "2.75rem" : FOUNDER_PHOTO_SIZE;
  return (
    <div className="og-item" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: compact ? "5rem" : "5.5rem", animationDelay: `${index * 60}ms` }}>
      <div
        id={`org-avatar-${columnist.id}`}
        className="og-avatar"
        style={{
          position: "relative",
          zIndex: 1,
          width: photoSize,
          height: photoSize,
          borderRadius: "50%",
          flexShrink: 0,
          background: columnist.photo_url ? `url("${columnist.photo_url}") center/cover` : "linear-gradient(135deg, #315E9C, #C89A4A)",
          border: "2px solid var(--admin-surface)",
          boxShadow: "0 0 0 1px var(--admin-border-strong)",
        }}
      />
      {/* position/zIndex here too, same reasoning as the avatar above — this
          sits in the same stacking context as a manager→report connector
          line (see OrgChartConnectorLines), which should pass behind the
          name and role same as it does the photo, not draw over them. */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div className="og-name" style={{ fontWeight: 800, fontSize: "0.75rem", color: "var(--admin-text)", lineHeight: 1.25 }}>{columnist.name}</div>
        {role && (
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: compact ? "#A07B3B" : "#315E9C", letterSpacing: "0.03em", marginTop: "0.125rem" }}>{role}</div>
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

export function OrganogramaCard({ columnists }: { columnists: Columnist[] }) {
  const founders = columnists.filter((a) => a.is_founder);
  // Only meaningful for exactly 3 founders (CEO + two others) — otherwise
  // there's no clean pyramid to draw, so the card just doesn't render one.
  const ceoFounder = founders.length === 3 ? (founders.find((a) => shortRole(a) === "CEO") ?? null) : null;
  const otherFounders = ceoFounder ? founders.filter((a) => a.id !== ceoFounder.id) : [];
  // Placeholder entries (no photo yet, or an empty name) don't belong in a
  // chart whose whole point is putting a face to each person.
  const otherColumnists = columnists.filter((a) => !a.is_founder && a.status === "active" && a.photo_url && a.name?.trim());

  // Alphabetical by request, for every section except the C-Level pyramid
  // below (which keeps the hierarchy order the unsorted `founders`/
  // `otherFounders` above already encode — CEO on top, the others under it).
  const byName = (a: Columnist, b: Columnist) => a.name.localeCompare(b.name, "pt");
  const foundersAlpha = [...founders].sort(byName);
  const otherColumnistsAlpha = [...otherColumnists].sort(byName);

  // Anyone (founder or not) can be set as someone's manager from the
  // columnist edit form — this opens a new tier hanging off that manager,
  // not just the fixed C-Level pyramid. Only a name is required (not an
  // active status or a photo — FounderBox already falls back to a gradient
  // avatar) because this also covers a prospective hire who doesn't have a
  // real columnist profile yet, just a placeholder row with status
  // "inactive" so they never show up anywhere public. Someone can be both
  // a report here *and* still show in the regular Colunistas grid below
  // (being set as e.g. a Social Media Manager doesn't remove them from
  // "also a columnist").
  const eligible = (a: Columnist) => Boolean(a.name?.trim());
  const reportsByManager = new Map<string, Columnist[]>();
  for (const a of columnists) {
    if (!a.org_chart_manager_id || !eligible(a)) continue;
    const list = reportsByManager.get(a.org_chart_manager_id) ?? [];
    list.push(a);
    reportsByManager.set(a.org_chart_manager_id, list);
  }
  for (const list of reportsByManager.values()) list.sort(byName);

  // Reports hang off the *side* of the C-Level box (connected by an L-shaped
  // line out of their manager, see OrgChartConnectorLines) rather than
  // straight down from them — stacking every report directly under its own
  // manager got cramped once more than one manager had one, and read as
  // part of the box itself rather than clearly outside it. Side is picked
  // once, here, from the manager's own position: whichever half of the
  // otherFounders row they're in (so it stays consistent if a manager
  // picks up a second report later); the CEO defaults to the right, having
  // no "half" of their own to go by.
  const managerSide = new Map<string, "left" | "right">();
  if (ceoFounder) managerSide.set(ceoFounder.id, "right");
  otherFounders.forEach((a, i) => {
    managerSide.set(a.id, i < Math.ceil(otherFounders.length / 2) ? "left" : "right");
  });

  const allManagers = ceoFounder ? [ceoFounder, ...otherFounders] : [];
  const reportPairs: { managerId: string; reportId: string; side: "left" | "right" }[] = [];
  const leftReports: Columnist[] = [];
  const rightReports: Columnist[] = [];
  for (const manager of allManagers) {
    const side = managerSide.get(manager.id) ?? "right";
    for (const r of reportsByManager.get(manager.id) ?? []) {
      reportPairs.push({ managerId: manager.id, reportId: r.id, side });
      (side === "left" ? leftReports : rightReports).push(r);
    }
  }

  if (!ceoFounder && founders.length === 0 && otherColumnists.length === 0) return null;

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
                    <NameChip key={a.id} columnist={a} index={i} />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem" }} />

            {/* Everything from the C-Level box down through any reports
                hanging off one of these people shares one relative-
                positioned wrapper, so OrgChartConnectorLines (an absolutely
                positioned overlay, see below) can draw a line from a
                manager's avatar straight down to their report's — passing
                behind both — no matter which of them sits inside the box
                and which sits outside it. */}
            <div id={CLEVEL_WRAP_ID} style={{ position: "relative" }}>
              {/* The C-Level pyramid gets its own box (same treatment as the
                  Conselho boxes above/below, "C-Level" label included inside
                  it same as "Conselho Administrativo"/"Conselho Editorial"
                  are inside theirs) specifically so anyone reporting to one
                  of these people — rendered further down, outside this box —
                  reads as clearly NOT part of C-Level itself, just connected
                  to it. */}
              <div style={{ backgroundColor: "rgba(49, 94, 156, 0.05)", border: "1px solid rgba(49, 94, 156, 0.15)", borderRadius: "0.875rem", padding: "1.5rem 1.25rem" }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "var(--admin-text)", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center", marginBottom: "1.25rem" }}>C-Level</div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <FounderBox columnist={ceoFounder} index={0} />
                  <Connector />
                  <div style={{ display: "flex", gap: "2.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                    {otherFounders.map((a, i) => (
                      <div key={a.id} style={{ width: "5.5rem" }}>
                        <FounderBox columnist={a} index={i + 1} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reports sit to the left/right of center, matching
                  managerSide above — not under the box, not pinned all the
                  way out to its edges either (maxWidth below reins the
                  space-between in from the full card width, which read as
                  "launched into the corners" at anything wider than a
                  phone). Wide enough that each report's vertical drop clears
                  the *other* side's FounderBox column — otherwise it cuts
                  straight through the CEO-to-founders Connector's own
                  horizontal bar on its way down, the two reading as one
                  crossed line. Each column stacks vertically if a side ever
                  picks up more than one report. */}
              {(leftReports.length > 0 || rightReports.length > 0) && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", maxWidth: "30rem", margin: "0 auto", paddingTop: "1.5rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                    {leftReports.map((r, ri) => (
                      <FounderBox key={r.id} columnist={r} index={ri} compact />
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                    {rightReports.map((r, ri) => (
                      <FounderBox key={r.id} columnist={r} index={ri} compact />
                    ))}
                  </div>
                </div>
              )}

              {reportPairs.length > 0 && (
                <OrgChartConnectorLines pairs={reportPairs} containerId={CLEVEL_WRAP_ID} color="rgba(49, 94, 156, 0.4)" />
              )}
            </div>
          </div>
        )}

        {(founders.length > 0 || otherColumnists.length > 0) && (
          <div>
            <div style={{ backgroundColor: "rgba(200, 154, 74, 0.06)", border: "1px solid rgba(200, 154, 74, 0.2)", borderRadius: "0.875rem", padding: "1.25rem" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--admin-text)" }}>Conselho Editorial</div>
                <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                  {foundersAlpha.map((a, i) => (
                    <NameChip key={a.id} columnist={a} index={i} />
                  ))}
                </div>
              </div>
            </div>

            {otherColumnists.length > 0 && (
              <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "var(--admin-text)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Colunistas</div>
                <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                  {otherColumnistsAlpha.map((a, i) => (
                    <ColumnistChip key={a.id} columnist={a} index={i} />
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
