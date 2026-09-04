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
    // The "Mea Sententia" content section (news + opinion mixed together)
    // moved from /mea-sententia to /conteudo — categories and author archives
    // there mixed both formats, so nesting them under the opinion-column
    // brand name was misleading. These keep old shared/indexed links working.
    return [
      { source: "/pt/mea-sententia/:path*", destination: "/pt/conteudo/:path*", permanent: true },
      { source: "/en/mea-sententia/autor/:slug", destination: "/en/content/author/:slug", permanent: true },
      { source: "/en/mea-sententia/colunistas", destination: "/en/content/columnists", permanent: true },
      { source: "/en/mea-sententia/categoria/:slug", destination: "/en/content/category/:slug", permanent: true },
      { source: "/en/mea-sententia/:slug", destination: "/en/content/:slug", permanent: true },
      { source: "/en/mea-sententia", destination: "/en/content", permanent: true },
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
