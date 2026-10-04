import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormShell, Field, Input, Textarea, SubmitButton } from "@/components/admin/ui";
import { INSTITUTIONAL_PAGES } from "../pages";
import { INSTITUTIONAL_DEFAULTS } from "@/lib/institutional-defaults";
import { upsertInstitutionalPage } from "../actions";
import type { InstitutionalPage } from "@/types/database.types";

export default async function EditarPaginaInstitucionalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = INSTITUTIONAL_PAGES.find((p) => p.slug === slug);
  if (!page) notFound();

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("institutional_pages").select("*").eq("slug", slug).single();
  const item = data as InstitutionalPage | null;
  // Until something is saved, the editor starts from the text the public page shows.
  const defaults = INSTITUTIONAL_DEFAULTS[slug];

  const action = upsertInstitutionalPage.bind(null, slug);

  return (
    <FormShell title={`Editar: ${page.label}`} backHref="/admin/paginas">
      <p style={{ fontSize: "0.8125rem", color: "var(--admin-faint)", marginBottom: "1.5rem" }}>
        Publicada em <a href={page.path} target="_blank" rel="noopener noreferrer" style={{ color: "#4361EE" }}>{page.path}</a>.
        {" "}O texto aceita <code>## Título</code> para subtítulos, <code>**negrito**</code>, listas com <code>- item</code> ou <code>1. item</code>, e links com <code>[texto](/caminho)</code>.
      </p>
      <form action={action}>
        <Field label="Título (PT)">
          <Input name="title_pt" defaultValue={item?.title_pt ?? defaults?.titlePt ?? page.label} required />
        </Field>
        <Field label="Título (EN)" hint="Deixe em branco para usar o título em português.">
          <Input name="title_en" defaultValue={item?.title_en ?? defaults?.titleEn ?? ""} />
        </Field>
        <Field label="Conteúdo (PT)">
          <Textarea name="body_pt" rows={20} defaultValue={item?.body_pt ?? defaults?.bodyPt ?? ""} required style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.85rem" }} />
        </Field>
        <Field label="Conteúdo (EN)" hint="Deixe em branco para usar o conteúdo em português também na versão em inglês do site.">
          <Textarea name="body_en" rows={12} defaultValue={item?.body_en ?? defaults?.bodyEn ?? ""} style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.85rem" }} />
        </Field>
        <SubmitButton>Salvar alterações</SubmitButton>
      </form>
    </FormShell>
  );
}
