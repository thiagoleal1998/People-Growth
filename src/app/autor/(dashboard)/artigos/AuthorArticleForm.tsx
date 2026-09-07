"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Eye, Languages, Sparkles, Loader2 } from "lucide-react";
import { FormShell, Field, Input, Textarea, Select, SubmitButton } from "@/components/admin/ui";
import { MarkdownEditor, type MarkdownEditorHandle } from "@/components/admin/MarkdownEditor";
import { DateTimePicker } from "@/components/admin/DateTimePicker";
import { SavedToast } from "@/components/admin/SavedToast";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { alertDialog } from "@/components/admin/dialog-store";
import { upsertOwnArticle } from "./actions";
import type { Article, Category } from "@/types/database.types";

export function AuthorArticleForm({ item, categories, imageError, saveError, saved }: { item?: Article; categories: Category[]; imageError?: string; saveError?: string; saved?: boolean }) {
  const action = upsertOwnArticle.bind(null, item?.id ?? null);
  const [titlePt, setTitlePt] = useState(item?.title_pt ?? "");
  const [excerptPt, setExcerptPt] = useState(item?.excerpt_pt ?? "");
  const [summaryPt, setSummaryPt] = useState(item?.summary_pt ?? "");
  const [titleEn, setTitleEn] = useState(item?.title_en ?? "");
  const [excerptEn, setExcerptEn] = useState(item?.excerpt_en ?? "");
  const [summaryEn, setSummaryEn] = useState(item?.summary_en ?? "");
  const [translating, setTranslating] = useState(false);
  const [generatingExcerpt, setGeneratingExcerpt] = useState(false);
  const contentPtRef = useRef<MarkdownEditorHandle>(null);
  const contentEnRef = useRef<MarkdownEditorHandle>(null);

  async function handleGenerateExcerpt() {
    const content = contentPtRef.current?.getContent() ?? "";
    if (!content.trim()) {
      await alertDialog("Escreva o conteúdo em português antes de gerar a linha fina e o resumo.");
      return;
    }
    setGeneratingExcerpt(true);
    try {
      const res = await fetch("/api/admin/generate-excerpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title_pt: titlePt, content_pt: content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao gerar a linha fina e o resumo.");
      setExcerptPt(data.excerpt_pt);
      setSummaryPt(data.summary_pt);
    } catch (err) {
      await alertDialog(err instanceof Error ? err.message : "Erro ao gerar a linha fina e o resumo.");
    } finally {
      setGeneratingExcerpt(false);
    }
  }

  async function handleTranslate() {
    if (!titlePt.trim() && !contentPtRef.current?.getContent().trim()) {
      await alertDialog("Preencha o título ou o conteúdo em português antes de traduzir.");
      return;
    }
    setTranslating(true);
    try {
      const res = await fetch("/api/admin/translate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title_pt: titlePt,
          excerpt_pt: excerptPt,
          summary_pt: summaryPt,
          content_pt: contentPtRef.current?.getContent() ?? "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao traduzir o artigo.");
      setTitleEn(data.title_en);
      setExcerptEn(data.excerpt_en);
      setSummaryEn(data.summary_en);
      contentEnRef.current?.setContent(data.content_en);
    } catch (err) {
      await alertDialog(err instanceof Error ? err.message : "Erro ao traduzir o artigo.");
    } finally {
      setTranslating(false);
    }
  }

  return (
    <>
    <SavedToast show={Boolean(saved)} />
    <FormShell
      title={item ? "Editar artigo" : "Novo artigo"}
      backHref="/autor"
      maxWidth="900px"
      action={
        item && (
          <Link
            href={`/autor/artigos/${item.id}/preview`}
            target="_blank"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "white", border: "1px solid #e2e8f0", color: "#0d1b2a", padding: "0.625rem 1.125rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none", flexShrink: 0 }}
          >
            <Eye size={16} /> Visualizar
          </Link>
        )
      }
    >
      <form action={action}>
        <Field label="Título (PT)">
          <Input name="title_pt" value={titlePt} onChange={(e) => setTitlePt(e.target.value)} required />
        </Field>
        <Field label="Título (EN)">
          <Input name="title_en" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
        </Field>
        <Field label="Slug" hint="Deixe em branco para gerar automaticamente">
          <Input name="slug" defaultValue={item?.slug ?? ""} />
        </Field>
        <Field label="Tipo de conteúdo" hint="Notícia: reportagem/atualidade. Opinião: aparece com a tag Mea Sententia.">
          <Select name="format" defaultValue={item?.format ?? "opiniao"}>
            <option value="opiniao">Opinião (Mea Sententia)</option>
            <option value="noticia">Notícia</option>
          </Select>
        </Field>
        <Field label="Categoria">
          <Select name="category_id" defaultValue={item?.category_id ?? ""}>
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name_pt}</option>
            ))}
          </Select>
        </Field>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0 0 1.25rem" }}>
          <button
            type="button"
            onClick={handleGenerateExcerpt}
            disabled={generatingExcerpt}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "var(--admin-surface-alt)",
              border: "1px solid var(--admin-border-strong)",
              color: "var(--admin-text)",
              padding: "0.625rem 1.125rem",
              borderRadius: "0.625rem",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: generatingExcerpt ? "default" : "pointer",
              opacity: generatingExcerpt ? 0.7 : 1,
            }}
          >
            {generatingExcerpt ? <Loader2 size={16} className="admin-spin" /> : <Sparkles size={16} />}
            {generatingExcerpt ? "Gerando..." : "Gerar linha fina e resumo (PT)"}
          </button>
          <span style={{ fontSize: "0.75rem", color: "var(--admin-faint)" }}>
            Usa o Conteúdo (PT) escrito abaixo para preencher os dois campos PT a seguir — sobrescreve o que já estiver neles.
          </span>
        </div>

        <Field label="Linha fina / subtítulo (PT)" hint="Aparece nas listagens e cards de artigos — não é o Resumo em destaque abaixo.">
          <Textarea name="excerpt_pt" rows={2} value={excerptPt} onChange={(e) => setExcerptPt(e.target.value)} />
        </Field>
        <Field label="Linha fina / subtítulo (EN)">
          <Textarea name="excerpt_en" rows={2} value={excerptEn} onChange={(e) => setExcerptEn(e.target.value)} />
        </Field>
        <Field label="Resumo em destaque (PT)" hint='Opcional. Aparece numa caixa "Resumo" expansível, no início do artigo. Deixe em branco para não mostrar essa caixa.'>
          <Textarea name="summary_pt" rows={3} value={summaryPt} onChange={(e) => setSummaryPt(e.target.value)} />
        </Field>
        <Field label="Resumo em destaque (EN)">
          <Textarea name="summary_en" rows={3} value={summaryEn} onChange={(e) => setSummaryEn(e.target.value)} />
        </Field>
        <Field
          label="Conteúdo (PT)"
          hint='Use a barra de ferramentas para negrito, itálico, sublinhado, subtítulos, listas, citação, link e imagem — ou digite direto: **negrito**, _itálico_, ++sublinhado++, [link](url), ## subtítulo, ### subtítulo pequeno, "- " para lista, "> texto" para citação (com "> — Autor" numa linha própria, opcional).'
        >
          <MarkdownEditor ref={contentPtRef} name="content_pt" defaultValue={item?.content_pt ?? ""} />
        </Field>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.25rem 0" }}>
          <button
            type="button"
            onClick={handleTranslate}
            disabled={translating}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "var(--admin-surface-alt)",
              border: "1px solid var(--admin-border-strong)",
              color: "var(--admin-text)",
              padding: "0.625rem 1.125rem",
              borderRadius: "0.625rem",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: translating ? "default" : "pointer",
              opacity: translating ? 0.7 : 1,
            }}
          >
            {translating ? <Loader2 size={16} className="admin-spin" /> : <Languages size={16} />}
            {translating ? "Traduzindo..." : "Traduzir para inglês (PT → EN)"}
          </button>
          <span style={{ fontSize: "0.75rem", color: "var(--admin-faint)" }}>
            Preenche título, linha fina, resumo e conteúdo em inglês a partir do texto em PT acima — sobrescreve o que já estiver nos campos EN.
          </span>
        </div>

        <Field label="Conteúdo (EN)">
          <MarkdownEditor ref={contentEnRef} name="content_en" defaultValue={item?.content_en ?? ""} minHeight={280} />
        </Field>
        <Field label="Vídeo (URL do YouTube)" hint="Opcional — vira o visual principal do artigo, no lugar da imagem de capa. Mesmo assim, cadastre uma imagem de capa abaixo: ela é usada como miniatura ao compartilhar o link.">
          <Input name="video_url" defaultValue={item?.video_url ?? ""} placeholder="https://www.youtube.com/watch?v=..." />
        </Field>
        <Field label="Imagem de capa" hint="PNG, JPG ou WEBP — convertida automaticamente para WebP e comprimida para menos de 1MB.">
          {item?.cover_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.cover_image}
              alt="Capa atual"
              style={{ maxHeight: "6rem", display: "block", marginBottom: "0.625rem", borderRadius: "0.375rem", border: "1px solid #e2e8f0" }}
            />
          )}
          <input className="admin-file-input" type="file" name="cover_image_file" accept="image/png,image/jpeg,image/webp" />
          <input type="hidden" name="current_cover_image" value={item?.cover_image ?? ""} />
          <ErrorBanner message={imageError} />
        </Field>
        <Field label="...ou URL da imagem" hint="Alternativa ao envio de arquivo acima — cole o link de uma imagem já publicada em outro lugar, para não usar espaço de armazenamento do site. Se os dois campos forem preenchidos, o arquivo enviado tem prioridade.">
          <Input name="cover_image_url" placeholder="https://..." />
        </Field>
        <Field label="Legenda da imagem" hint="Descrição curta exibida junto da foto no início do artigo.">
          <Input name="cover_image_caption" defaultValue={item?.cover_image_caption ?? ""} />
        </Field>
        <Field label="Crédito da imagem" hint="Fotógrafo ou fonte da imagem.">
          <Input name="cover_image_credit" defaultValue={item?.cover_image_credit ?? ""} />
        </Field>
        <Field
          label="Data desejada de publicação"
          hint="Opcional. Mesmo com uma data marcada, o artigo só vai ao ar depois que um admin aprovar — a data só entra em vigor a partir da aprovação."
        >
          <DateTimePicker name="scheduled_for" defaultValue={item?.scheduled_for} />
        </Field>
        <Field
          label="Status"
          hint="Você não publica diretamente — um admin revisa e publica. Rascunho fica só com você; Pendente entra na fila de revisão."
        >
          <Select name="status" defaultValue={item?.status === "pending" ? "pending" : "draft"}>
            <option value="draft">Rascunho</option>
            <option value="pending">Enviar para revisão</option>
          </Select>
        </Field>
        <ErrorBanner message={saveError} label="Não foi possível salvar o artigo" />
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <SubmitButton>{item ? "Salvar alterações" : "Criar artigo"}</SubmitButton>
          <SubmitButton name="intent" value="draft" variant="secondary" pendingText="Salvando rascunho...">
            Salvar rascunho
          </SubmitButton>
        </div>
      </form>
    </FormShell>
    </>
  );
}
