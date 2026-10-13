import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  async redirects() {
    // The old "Mea Sententia" content section (news + opinion mixed together)
    // moved from /mea-sententia to /conteudo — categories and author archives
    // there mixed both formats, so nesting them under the opinion-column
    // brand name was misleading. These keep old shared/indexed deep links
    // working. /mea-sententia itself is reclaimed by a real page now (the
    // Festina brand's opinion-only listing, format: "opiniao"), so unlike
    // before, the bare path and its EN equivalent are deliberately NOT
    // redirected here — only sub-paths that belonged to the old mixed page.
    return [
      { source: "/pt/mea-sententia/:path+", destination: "/pt/conteudo/:path+", permanent: true },
      { source: "/en/mea-sententia/autor/:slug", destination: "/en/content/author/:slug", permanent: true },
      { source: "/en/mea-sententia/colunistas", destination: "/en/content/columnists", permanent: true },
      { source: "/en/mea-sententia/categoria/:slug", destination: "/en/content/category/:slug", permanent: true },
      { source: "/en/mea-sententia/:slug", destination: "/en/content/:slug", permanent: true },
      // "O que é a People & Growth" became "O que é o Grupo Festina" — the
      // page now opens with the group and its brands, with the People &
      // Growth origin story and philosophy as the rest of it.
      { source: "/pt/sobre/o-que-e-people-and-growth", destination: "/pt/sobre/o-que-e-o-grupo-festina", permanent: true },
      { source: "/en/about/what-is-people-and-growth", destination: "/en/about/what-is-grupo-festina", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Applies to every route; a strict Content-Security-Policy is
        // deliberately left out — the site embeds YouTube iframes and loads
        // GA4/Meta Pixel/LinkedIn Insight scripts, and getting a CSP wrong
        // silently breaks those with no way to visually verify it here.
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
