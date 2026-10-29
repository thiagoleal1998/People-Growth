import { permanentRedirect } from "next/navigation";

// NBA content moved into /esportes (the "NBA" tab) as part of unifying the
// site's sports pages — this route stays only so old links/bookmarks still
// land somewhere real.
export default async function NbaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  permanentRedirect(locale === "en" ? "/en/sports?tab=nba" : "/pt/esportes?tab=nba");
}
