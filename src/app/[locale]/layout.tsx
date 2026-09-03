import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";
import { Analytics } from "@/components/Analytics";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import "../globals.css";

type SiteConfigRow = { key: string; value: string | null };

async function getSiteConfig() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = (await (supabase as any).from("site_config").select("*")) as { data: SiteConfigRow[] | null };
  return Object.fromEntries((data ?? []).map((row) => [row.key, row.value ?? ""]));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const config = await getSiteConfig();

  const titleKey = locale === "en" ? "seo_meta_title_en" : "seo_meta_title_pt";
  const descriptionKey = locale === "en" ? "seo_meta_description_en" : "seo_meta_description_pt";

  return {
    title: {
      default: config[titleKey] || "People & Growth",
      template: "%s | People & Growth",
    },
    description: config[descriptionKey] || t("heroSubtitle"),
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://peopleandgrowth.com.br"
    ),
    icons: config.favicon_url ? { icon: config.favicon_url } : undefined,
    openGraph: {
      type: "website",
      locale: locale === "pt" ? "pt_BR" : "en_US",
      siteName: "People & Growth",
      images: config.seo_og_image ? [{ url: config.seo_og_image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: config.seo_twitter_handle || undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
    verification: config.seo_google_verification
      ? { google: config.seo_google_verification }
      : undefined,
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "pt" | "en")) {
    notFound();
  }

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "home" });
  const config = await getSiteConfig();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://peopleandgrowth.com.br";
  const summaryKey = locale === "en" ? "geo_ai_summary_en" : "geo_ai_summary_pt";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "People & Growth",
    url: siteUrl,
    logo: config.logo_url || undefined,
    description: config[summaryKey] || t("heroSubtitle"),
    email: config.contact_email || undefined,
    sameAs: [config.linkedin, config.instagram].filter(Boolean),
  };

  const faqKey = locale === "en" ? "aeo_faq_en" : "aeo_faq_pt";
  const faqEntries = (config[faqKey] || config.aeo_faq_pt || "")
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter((parts) => parts.length === 2 && parts[0] && parts[1]);

  const faqSchema = faqEntries.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  } : null;

  const themeScript = `
(function () {
  try {
    var theme = localStorage.getItem("site-theme");
    if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
  } catch (e) {}
})();
`;

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <head>
        <link rel="alternate" type="application/rss+xml" title="People & Growth — Mea Sententia" href="/rss.xml" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        )}
        {config.ga4_measurement_id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${config.ga4_measurement_id}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${config.ga4_measurement_id}');
              `}
            </Script>
          </>
        )}
        {config.meta_pixel_id && (
          <>
            <Script id="meta-pixel-init" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${config.meta_pixel_id}');
                fbq('track', 'PageView');
              `}
            </Script>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <noscript>
              <img
                height="1"
                width="1"
                alt=""
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${config.meta_pixel_id}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}
        {config.linkedin_partner_id && (
          <>
            <Script id="linkedin-insight-init" strategy="afterInteractive">
              {`
                _linkedin_partner_id = "${config.linkedin_partner_id}";
                window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
                window._linkedin_data_partner_ids.push(_linkedin_partner_id);
                (function(l) {
                  if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
                  window.lintrk.q=[]}
                  var s = document.getElementsByTagName("script")[0];
                  var b = document.createElement("script");
                  b.type = "text/javascript";b.async = true;
                  b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                  s.parentNode.insertBefore(b, s);
                })(window.lintrk);
              `}
            </Script>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <noscript>
              <img
                height="1"
                width="1"
                alt=""
                style={{ display: "none" }}
                src={`https://px.ads.linkedin.com/collect/?pid=${config.linkedin_partner_id}&fmt=gif`}
              />
            </noscript>
          </>
        )}
        <NextTopLoader color="#4361EE" height={3} showSpinner={false} />
        <Analytics />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
