import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormShell, Field, Input, SubmitButton } from "@/components/admin/ui";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
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
        {" "}Use a barra de ferramentas para negrito, subtítulos, listas, citações e links, como no editor de artigos.
      </p>
      <form action={action}>
        <Field label="Título (PT)">
          <Input name="title_pt" defaultValue={item?.title_pt ?? defaults?.titlePt ?? page.label} required />
        </Field>
        <Field label="Título (EN)" hint="Deixe em branco para usar o título em português.">
          <Input name="title_en" defaultValue={item?.title_en ?? defaults?.titleEn ?? ""} />
        </Field>
        <Field label="Conteúdo (PT)">
          <MarkdownEditor name="body_pt" defaultValue={item?.body_pt ?? defaults?.bodyPt ?? ""} minHeight={420} />
        </Field>
        <Field label="Conteúdo (EN)" hint="Deixe em branco para usar o conteúdo em português também na versão em inglês do site.">
          <MarkdownEditor name="body_en" defaultValue={item?.body_en ?? defaults?.bodyEn ?? ""} minHeight={300} />
        </Field>
        <SubmitButton>Salvar alterações</SubmitButton>
      </form>
    </FormShell>
  );
}
