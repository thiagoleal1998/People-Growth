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
    <html lang={locale}>
      <head>
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
        <NextTopLoader color="#4361EE" height={3} showSpinner={false} />
        <Analytics />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
