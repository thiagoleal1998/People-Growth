// Small pill shown next to FormatTag on article cards whose category was
// flagged is_ponto_de_replica (CategoriesManager) — marks content that
// belongs to the restricted Ponto de Réplica sub-brand (política, economia
// e sociedade) inside the Festina site. Same pattern as PeopleGrowthBadge,
// own accent color since this sub-brand doesn't share Festina's palette.
export function PontoDeReplicaBadge() {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "0.6875rem",
        fontWeight: 800,
        letterSpacing: "0.03em",
        color: "#6A4C93",
        backgroundColor: "rgba(106,76,147,0.12)",
        padding: "0.1875rem 0.5rem",
        borderRadius: "0.25rem",
        marginLeft: "0.375rem",
      }}
    >
      Ponto de Réplica
    </span>
  );
}
