import { PONTO_DE_REPLICA_LOGO_URL } from "@/lib/brand-logos";

// Small pill shown next to FormatTag on article cards whose category was
// flagged is_ponto_de_replica (CategoriesManager) — marks content that
// belongs to the restricted Ponto de Réplica sub-brand (política, economia
// e sociedade) inside the Festina site. Same pattern as PeopleGrowthBadge,
// own accent color since this sub-brand doesn't share Festina's palette.
export function PontoDeReplicaBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: "rgba(106,76,147,0.12)",
        padding: "0.1875rem 0.5rem",
        borderRadius: "0.25rem",
        marginLeft: "0.375rem",
      }}
    >
      <img src={PONTO_DE_REPLICA_LOGO_URL} alt="Ponto de Réplica" style={{ height: "1.125rem", width: "auto", display: "block", objectFit: "contain" }} />
    </span>
  );
}
