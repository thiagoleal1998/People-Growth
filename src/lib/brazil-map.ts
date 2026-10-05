// Brazil's state outlines, from the IBGE's public map of the country (malhas).
// Converted once to SVG paths so the map is drawn on the server, with no
// map library in the browser. Cached for a day: borders do not change.

const IBGE_URL = "https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=UF";

// IBGE area codes for each state, keyed by the lowercase code the TSE uses.
const UF_BY_IBGE: Record<string, string> = {
  "11": "ro", "12": "ac", "13": "am", "14": "rr", "15": "pa", "16": "ap", "17": "to", "21": "ma", "22": "pi",
  "23": "ce", "24": "rn", "25": "pb", "26": "pe", "27": "al", "28": "se", "29": "ba", "31": "mg", "32": "es",
  "33": "rj", "35": "sp", "41": "pr", "42": "sc", "43": "rs", "50": "ms", "51": "mt", "52": "go", "53": "df",
};

export type StatePath = { uf: string; d: string };
export type BrazilMap = { viewBox: string; states: StatePath[] };

type Position = [number, number];
type GeoFeature = { properties: { codarea: string }; geometry: { type: "Polygon" | "MultiPolygon"; coordinates: Position[][] | Position[][][] } };

function polygonsOf(geometry: GeoFeature["geometry"]): Position[][][] {
  return geometry.type === "Polygon" ? [geometry.coordinates as Position[][]] : (geometry.coordinates as Position[][][]);
}

export async function getBrazilMap(): Promise<BrazilMap | null> {
  try {
    const res = await fetch(IBGE_URL, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const geo = (await res.json()) as { features: GeoFeature[] };

    // Lon/lat to a flat plane: longitude is squeezed by cos(latitude) so the
    // country keeps roughly its real proportions.
    const scaleX = Math.cos((-14 * Math.PI) / 180);
    let minLon = Infinity, maxLon = -Infinity, maxLat = -Infinity, minLat = Infinity;
    for (const feature of geo.features) {
      for (const polygon of polygonsOf(feature.geometry)) {
        for (const ring of polygon) {
          for (const [lon, lat] of ring) {
            minLon = Math.min(minLon, lon);
            maxLon = Math.max(maxLon, lon);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
          }
        }
      }
    }
    const project = ([lon, lat]: Position): string => `${((lon - minLon) * scaleX).toFixed(3)} ${(maxLat - lat).toFixed(3)}`;

    const states: StatePath[] = [];
    for (const feature of geo.features) {
      const uf = UF_BY_IBGE[feature.properties.codarea];
      if (!uf) continue;
      const d = polygonsOf(feature.geometry)
        .map((polygon) => polygon.map((ring) => `M${ring.map(project).join("L")}Z`).join(""))
        .join("");
      states.push({ uf, d });
    }

    const width = (maxLon - minLon) * scaleX;
    const height = maxLat - minLat;
    return { viewBox: `0 0 ${width.toFixed(3)} ${height.toFixed(3)}`, states };
  } catch {
    return null;
  }
}
