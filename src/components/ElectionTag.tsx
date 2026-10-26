// Small status tags shown next to a candidate's name: "Eleito(a)" in green, "2º Turno" in
// yellow, "Projetado" as an outline for deputies counted so far, and "Sub judice" in
// grey for candidacies whose votes the TSE annulled. The TSE's own data has no gender
// field (its raw status text is "Eleito" regardless of the candidate's gender), so this
// uses the standard gender-neutral form rather than guessing from the name.
export function ElectionTag({ kind, label: labelOverride }: { kind: "elected" | "runoff" | "projected" | "irregular"; color?: string; label?: string }) {
  const label = labelOverride ?? (kind === "elected" ? "Eleito(a)" : kind === "runoff" ? "2º Turno" : kind === "projected" ? "Projetado" : "Sub judice");
  const styles =
    kind === "elected"
      ? { backgroundColor: "#16A34A", color: "#ffffff", border: "none" }
      : kind === "runoff"
        ? { backgroundColor: "#FACC15", color: "#1F2937", border: "none" }
        : kind === "irregular"
          ? { backgroundColor: "#E5E7EB", color: "#374151", border: "none" }
          : { backgroundColor: "transparent", color: "#315E9C", border: "1px solid #315E9C" };
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
