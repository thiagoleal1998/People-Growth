// Small status tags shown next to a candidate's name. "Eleito" takes the party's
// colour, like the candidate's numbers. "2º Turno" and "Projetado" are about the
// race rather than the person, so they take People & Growth's colour.
const BRAND = "#4361EE";

export function ElectionTag({ kind, color }: { kind: "elected" | "runoff" | "projected"; color?: string }) {
  const label = kind === "elected" ? "Eleito" : kind === "runoff" ? "2º Turno" : "Projetado";
  const background = kind === "elected" ? (color ?? BRAND) : kind === "runoff" ? BRAND : "transparent";
  const border = kind === "projected" ? `1px solid ${BRAND}` : "none";
  const text = kind === "projected" ? BRAND : "white";
  return (
    <span
      style={{
        display: "inline-block",
        backgroundColor: background,
        border,
        color: text,
        borderRadius: "0.25rem",
        padding: "0.0625rem 0.4375rem",
        fontSize: "0.6875rem",
        fontWeight: 700,
        whiteSpace: "nowrap",
        verticalAlign: "middle",
      }}
    >
      {label}
    </span>
  );
}
