// Logos for the three brands inside the Grupo Festina umbrella — re-hosted on
// the project's own Storage bucket (site-assets) rather than referencing the
// original upload location, same pattern as NFL_LOGO_URL/NBA_LOGO_URL.
const BRAND_LOGO_BASE = "https://lqgkxpoyymokrratgabe.supabase.co/storage/v1/object/public/site-assets/brand-logos";

export const PEOPLE_GROWTH_LOGO_URL = `${BRAND_LOGO_BASE}/people-growth.png`;

// -v2 files: the Ponto de Réplica and Mea Sententia logos as originally
// supplied were flattened onto a solid black background (no alpha channel
// at all — confirmed via sharp's metadata, not just how they looked), unlike
// the People & Growth file, which was already a true transparent PNG. Re-cut
// with a screen-style alpha matte (alpha = max(r,g,b), since both are light
// metallic renders on pure black) rather than asking for a re-export.
export const PONTO_DE_REPLICA_LOGO_URL = `${BRAND_LOGO_BASE}/ponto-de-replica-v2.png`;

// -v3: replaces -v2, which misspelled "Sententia" as "Setentia" (missing an
// "n") right in the artwork — a genuine typo in the supplied file, not a
// transparency issue like the other two. Already a true transparent PNG,
// no alpha-matte recut needed this time.
export const MEA_SENTENTIA_LOGO_URL = `${BRAND_LOGO_BASE}/mea-sententia-v3.png`;
