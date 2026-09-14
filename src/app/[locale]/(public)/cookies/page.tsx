import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { pickLocale } from "@/lib/locale-content";

export const revalidate = 300;

const DEFAULT_TITLE_PT = "Política de Cookies";
const DEFAULT_TITLE_EN = "Cookie Policy";
const DEFAULT_BODY_PT = `## O que são cookies
Cookies são pequenos arquivos de texto armazenados no seu navegador quando você visita um site. Eles ajudam o site a lembrar informações sobre sua visita, como preferências e sessões de login.

## Quais cookies usamos
Usamos apenas cookies essenciais, necessários para o funcionamento do site — por exemplo, o cookie de sessão que mantém o login do painel administrativo. Não usamos cookies de rastreamento, publicidade ou de terceiros para monitorar sua navegação.

## Armazenamento local do navegador
Guardamos localmente, no seu navegador, a informação de que você já visualizou o aviso de cookies, para não exibi-lo novamente. Esse dado fica apenas no seu dispositivo e não é enviado para nossos servidores.

## Seus direitos (LGPD)
De acordo com a Lei Geral de Proteção de Dados (LGPD), você pode solicitar informações sobre os dados que tratamos, bem como sua correção ou exclusão. Entre em contato pela [página de Contato](/contato) para exercer esses direitos.

## Alterações nesta política
Esta política pode ser atualizada caso o site passe a usar novos cookies ou ferramentas de terceiros. Recomendamos revisitar esta página periodicamente.`;
const DEFAULT_BODY_EN = `## What cookies are
Cookies are small text files stored in your browser when you visit a website. They help the site remember information about your visit, such as preferences and login sessions.

## Which cookies we use
We only use essential cookies, necessary for the site to work — for example, the session cookie that keeps the admin panel login active. We do not use tracking, advertising or third-party cookies to monitor your browsing.

## Local browser storage
We store locally, in your browser, the information that you've already seen the cookie notice, so it isn't shown again. This data stays only on your device and is never sent to our servers.

## Your rights (LGPD)
Under Brazil's General Data Protection Law (LGPD), you can request information about the data we process, as well as its correction or deletion. Contact us via the [Contact page](/contato) to exercise these rights.

## Changes to this policy
This policy may be updated if the site starts using new cookies or third-party tools. We recommend revisiting this page periodically.`;

export const metadata: Metadata = {
  title: DEFAULT_TITLE_PT,
  description: "Como o site People & Growth usa cookies.",
};

export default async function CookiesPage() {
  const locale = await getLocale();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("institutional_pages").select("*").eq("slug", "cookies").single();

  const title = pickLocale(locale, data?.title_pt, data?.title_en) || (locale === "en" ? DEFAULT_TITLE_EN : DEFAULT_TITLE_PT);
  const body = pickLocale(locale, data?.body_pt, data?.body_en) || (locale === "en" ? DEFAULT_BODY_EN : DEFAULT_BODY_PT);

  return (
    <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
      <div className="container-xl" style={{ maxWidth: "720px" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>
          {title}
        </h1>
        <p style={{ color: "var(--site-muted)", fontSize: "1rem", marginBottom: "2.5rem" }}>
          {locale === "en" ? "Last updated" : "Última atualização"}: {new Date().toLocaleDateString(locale === "en" ? "en-US" : "pt-BR", { month: "long", year: "numeric" })}
        </p>

        <div
          style={{ color: "var(--site-text-secondary)", fontSize: "1.0625rem", lineHeight: 1.75 }}
          dangerouslySetInnerHTML={{ __html: renderMarkdownLite(body) }}
        />
      </div>
    </section>
  );
}
