import { PEOPLE_GROWTH_LOGO_URL } from "@/lib/brand-logos";

// Small pill shown next to FormatTag on article cards whose category was
// flagged is_people_growth (CategoriesManager) — marks content that belongs
// to the restricted People & Growth sub-brand inside the Festina site.
export function PeopleGrowthBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: "rgba(200,154,74,0.15)",
        padding: "0.1875rem 0.5rem",
        borderRadius: "0.25rem",
        marginLeft: "0.375rem",
      }}
    >
      <img src={PEOPLE_GROWTH_LOGO_URL} alt="People & Growth" style={{ height: "1.125rem", width: "auto", display: "block", objectFit: "contain" }} />
    </span>
  );
}
