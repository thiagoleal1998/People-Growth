import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { renderMarkdownLite } from "@/lib/markdown-lite";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const revalidate = 300;

const DEFAULT_TITLE = "Política de Cookies";
const DEFAULT_BODY = `## O que são cookies
Cookies são pequenos arquivos de texto armazenados no seu navegador quando você visita um site. Eles ajudam o site a lembrar informações sobre sua visita, como preferências e sessões de login.

## Quais cookies usamos
Usamos apenas cookies essenciais, necessários para o funcionamento do site — por exemplo, o cookie de sessão que mantém o login do painel administrativo. Não usamos cookies de rastreamento, publicidade ou de terceiros para monitorar sua navegação.

## Armazenamento local do navegador
Guardamos localmente, no seu navegador, a informação de que você já visualizou o aviso de cookies, para não exibi-lo novamente. Esse dado fica apenas no seu dispositivo e não é enviado para nossos servidores.

## Seus direitos (LGPD)
De acordo com a Lei Geral de Proteção de Dados (LGPD), você pode solicitar informações sobre os dados que tratamos, bem como sua correção ou exclusão. Entre em contato pela [página de Contato](/contato) para exercer esses direitos.

## Alterações nesta política
Esta política pode ser atualizada caso o site passe a usar novos cookies ou ferramentas de terceiros. Recomendamos revisitar esta página periodicamente.`;

export const metadata: Metadata = {
  title: DEFAULT_TITLE,
  description: "Como o site People & Growth usa cookies.",
};

export default async function CookiesPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("institutional_pages").select("*").eq("slug", "cookies").single();

  const title = data?.title_pt || DEFAULT_TITLE;
  const body = data?.body_pt || DEFAULT_BODY;

  return (
    <section className="section-padding" style={{ backgroundColor: "var(--site-bg)" }}>
      <div className="container-xl" style={{ maxWidth: "720px" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>
          {title}
        </h1>
        <p style={{ color: "var(--site-muted)", fontSize: "1rem", marginBottom: "2.5rem" }}>
          Última atualização: {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>

        <div
          style={{ color: "var(--site-text-secondary)", fontSize: "1.0625rem", lineHeight: 1.75 }}
          dangerouslySetInnerHTML={{ __html: renderMarkdownLite(body) }}
        />
      </div>
    </section>
  );
}
