// Small pill shown next to FormatTag on article cards whose category was
// flagged is_people_growth (CategoriesManager) — marks content that belongs
// to the restricted People & Growth sub-brand inside the Festina site.
export function PeopleGrowthBadge() {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "0.6875rem",
        fontWeight: 800,
        letterSpacing: "0.03em",
        color: "#A07B3B",
        backgroundColor: "rgba(200,154,74,0.15)",
        padding: "0.1875rem 0.5rem",
        borderRadius: "0.25rem",
        marginLeft: "0.375rem",
      }}
    >
      People & Growth
    </span>
  );
}
