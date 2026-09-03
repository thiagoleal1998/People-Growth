import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { createClient } from "@/lib/supabase/server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: configData } = await client
    .from("site_config")
    .select("key,value")
    .in("key", ["logo_url", "weather_city_name", "weather_lat", "weather_lon"]);

  const config = Object.fromEntries(((configData ?? []) as { key: string; value: string | null }[]).map((c) => [c.key, c.value ?? ""]));
  const logoUrl = config.logo_url || undefined;
  const weatherCity = config.weather_city_name || "São Paulo";
  const weatherLat = Number(config.weather_lat) || -23.5505;
  const weatherLon = Number(config.weather_lon) || -46.6333;

  return (
    <>
      <UtilityBar cityName={weatherCity} lat={weatherLat} lon={weatherLon} />
      <Navbar logoUrl={logoUrl} />
      <main className="public-main" style={{ paddingTop: "6.25rem" }}>
        <CategoryNav />
        {children}
      </main>
      <Footer logoUrl={logoUrl} />
      <CookieBanner />
      <style>{`
        @media (max-width: 768px) {
          .public-main { padding-top: 4rem !important; }
        }
      `}</style>
    </>
  );
}
