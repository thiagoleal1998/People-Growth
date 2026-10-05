// Small status tags shown next to a candidate's name: "Eleito" in green, "2º Turno"
// in yellow, and "Projetado" as an outline for deputies counted so far.
// The colour prop is accepted for callers that still pass it; the tags keep their fixed colours.
export function ElectionTag({ kind }: { kind: "elected" | "runoff" | "projected"; color?: string }) {
  const label = kind === "elected" ? "Eleito" : kind === "runoff" ? "2º Turno" : "Projetado";
  const styles =
    kind === "elected"
      ? { backgroundColor: "#16A34A", color: "#ffffff", border: "none" }
      : kind === "runoff"
        ? { backgroundColor: "#FACC15", color: "#1F2937", border: "none" }
        : { backgroundColor: "transparent", color: "#4361EE", border: "1px solid #4361EE" };
  return (
    <span
      style={{
        display: "inline-block",
        ...styles,
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
