import { Trophy } from "lucide-react";
import { TeamCrest } from "@/components/TeamCrest";
import { COMPETITIONS, type Competition } from "@/lib/sports";

// A competition-level crest (league/cup logo, not a team's) — wraps
// TeamCrest with one extra fallback step: when COMPETITIONS[x].logo is
// blank (Libertadores/Sul-Americana/Champions League — see the comments
// next to those entries in sports.ts for why), this renders a plain
// colored trophy badge instead of either the real trademarked mark or
// TeamCrest's generic gradient circle, so each competition still reads as
// visually distinct without reproducing anyone's logo.
export function CompetitionCrest({ competition, size = 32 }: { competition: Competition; size?: number }) {
  const info = COMPETITIONS[competition];
  if (info.logo) return <TeamCrest src={info.logo} alt="" size={size} />;
  if (info.badgeColor) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: info.badgeColor,
          color: "white",
          flexShrink: 0,
        }}
        title={info.name_pt}
      >
        <Trophy size={Math.round(size * 0.55)} />
      </span>
    );
  }
  return <TeamCrest src={null} alt="" size={size} />;
}
