import { permanentRedirect } from "next/navigation";

// NFL content moved into /esportes (the "NFL" tab) as part of unifying the
// site's sports pages — this route stays only so old links/bookmarks still
// land somewhere real.
export default async function NflPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  permanentRedirect(locale === "en" ? "/en/sports?tab=nfl" : "/pt/esportes?tab=nfl");
}
