import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { SocialSidebar } from "@/components/layout/SocialSidebar";
import { createClient } from "@/lib/supabase/server";
import { publishDueScheduledArticles } from "@/lib/publish-scheduled";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await publishDueScheduledArticles();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: configData } = await client
    .from("site_config")
    .select("key,value")
    .in("key", ["logo_url", "weather_city_name", "weather_lat", "weather_lon", "contact_email", "instagram", "linkedin", "whatsapp", "youtube", "x", "media_enabled", "sports_widget_enabled"]);

  const config = Object.fromEntries(((configData ?? []) as { key: string; value: string | null }[]).map((c) => [c.key, c.value ?? ""]));
  const logoUrl = config.logo_url || undefined;
  const weatherCity = config.weather_city_name || "São Paulo";
  const weatherLat = Number(config.weather_lat) || -23.5505;
  const weatherLon = Number(config.weather_lon) || -46.6333;
  const contactEmail = config.contact_email || undefined;
  // Defaults to enabled — the key only exists once an admin has explicitly
  // toggled it off via Configurações.
  const mediaEnabled = config.media_enabled !== "false";
  const sportsEnabled = config.sports_widget_enabled !== "false";

  return (
    <>
      <UtilityBar cityName={weatherCity} lat={weatherLat} lon={weatherLon} />
      <Navbar logoUrl={logoUrl} mediaEnabled={mediaEnabled} sportsEnabled={sportsEnabled} />
      <main className="public-main" style={{ paddingTop: "6.25rem" }}>
        <CategoryNav />
        {children}
      </main>
      <Footer
        logoUrl={logoUrl}
        contactEmail={contactEmail}
        linkedin={config.linkedin || undefined}
        instagram={config.instagram || undefined}
        whatsapp={config.whatsapp || undefined}
        youtube={config.youtube || undefined}
        x={config.x || undefined}
        mediaEnabled={mediaEnabled}
        sportsEnabled={sportsEnabled}
      />
      <SocialSidebar
        instagram={config.instagram || undefined}
        linkedin={config.linkedin || undefined}
        whatsapp={config.whatsapp || undefined}
        youtube={config.youtube || undefined}
        x={config.x || undefined}
      />
      <CookieBanner />
      <style>{`
        @media (max-width: 768px) {
          .public-main { padding-top: 4rem !important; }
        }
      `}</style>
    </>
  );
}
