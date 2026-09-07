"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Eye, Languages, Sparkles, Loader2 } from "lucide-react";
import { Field, Input, Textarea, Select, SubmitButton, Badge } from "@/components/admin/ui";
import { MarkdownEditor, type MarkdownEditorHandle } from "@/components/admin/MarkdownEditor";
import { DateTimePicker } from "@/components/admin/DateTimePicker";
import { SeoPreview } from "@/components/admin/SeoPreview";
import { SavedToast } from "@/components/admin/SavedToast";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { alertDialog } from "@/components/admin/dialog-store";
import { upsertOwnArticle } from "./actions";
import type { Article, Category } from "@/types/database.types";

const tabs = [
  { id: "conteudo", label: "Conteúdo" },
  { id: "seo", label: "SEO" },
  { id: "detalhes", label: "Detalhes" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const statusDisplay: Record<Article["status"], { label: string; tone: "success" | "warning" | "neutral" }> = {
  draft: { label: "Rascunho", tone: "neutral" },
  // Shown here (in the editor) as "Enviado para Aprovação"; the same
  // underlying status shows as "Aguardando Aprovação" in the "Meus
  // artigos" list — same state, worded for where it's read.
  pending: { label: "Enviado para Aprovação", tone: "warning" },
  scheduled: { label: "Agendado", tone: "warning" },
  published: { label: "Publicado", tone: "success" },
};

function slugifyPreview(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AuthorArticleForm({ item, categories, imageError, saveError, saved }: { item?: Article; categories: Category[]; imageError?: string; saveError?: string; saved?: boolean }) {
  const action = upsertOwnArticle.bind(null, item?.id ?? null);
  const [active, setActive] = useState<TabId>("conteudo");
  const [titlePt, setTitlePt] = useState(item?.title_pt ?? "");
  const [excerptPt, setExcerptPt] = useState(item?.excerpt_pt ?? "");
  const [summaryPt, setSummaryPt] = useState(item?.summary_pt ?? "");
  const [titleEn, setTitleEn] = useState(item?.title_en ?? "");
  const [excerptEn, setExcerptEn] = useState(item?.excerpt_en ?? "");
  const [summaryEn, setSummaryEn] = useState(item?.summary_en ?? "");
  const [seoTitlePt, setSeoTitlePt] = useState(item?.seo_title_pt ?? "");
  const [seoDescPt, setSeoDescPt] = useState(item?.seo_desc_pt ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [format, setFormat] = useState<Article["format"]>(item?.format ?? "opiniao");
  const [categoryId, setCategoryId] = useState(item?.category_id ?? "");
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

  const formatSegment = format === "opiniao" ? "mea-sententia" : "noticia";
  const categorySlug = categories.find((c) => c.id === categoryId)?.slug || "geral";
  const previewUrl = `peoplegrowth.com.br › conteudo › ${formatSegment} › categoria › ${categorySlug} › ${slug || slugifyPreview(titlePt) || "..."}`;
  const status = item?.status ?? "draft";

  return (
    <div style={{ maxWidth: "900px" }}>
      <SavedToast show={Boolean(saved)} />
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <Link href="/autor" style={{ color: "var(--admin-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
            &larr; Voltar
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--admin-text)", marginTop: "0.5rem" }}>
            {item ? "Editar artigo" : "Novo artigo"}
          </h1>
        </div>
        {item && (
          <Link
            href={`/autor/artigos/${item.id}/preview`}
            target="_blank"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border-strong)", color: "var(--admin-text)", padding: "0.625rem 1.125rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none", flexShrink: 0 }}
          >
            <Eye size={16} /> Visualizar
          </Link>
        )}
      </div>

      <form action={action}>
        <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid var(--admin-border)", marginBottom: "1.75rem" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              style={{
                padding: "0.75rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: active === tab.id ? "#4361EE" : "var(--admin-muted)",
                background: "none",
                border: "none",
                borderBottom: active === tab.id ? "2px solid #4361EE" : "2px solid transparent",
                cursor: "pointer",
                marginBottom: "-1px",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.75rem" }}>
          <div style={{ display: active === "conteudo" ? "block" : "none" }}>
            <Field label="Título (PT)">
              <Input name="title_pt" value={titlePt} onChange={(e) => setTitlePt(e.target.value)} required />
            </Field>
            <Field label="Título (EN)">
              <Input name="title_en" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
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
            <Field label="Vídeo (URL do YouTube)" hint="Opcional — vira o visual principal do artigo, no lugar da imagem de capa. Mesmo assim, cadastre uma imagem de capa na aba Detalhes: ela é usada como miniatura ao compartilhar o link.">
              <Input name="video_url" defaultValue={item?.video_url ?? ""} placeholder="https://www.youtube.com/watch?v=..." />
            </Field>
          </div>

          <div style={{ display: active === "seo" ? "block" : "none" }}>
            <Field label="SEO — título (PT)" hint="Deixe em branco para usar o título do artigo.">
              <Input name="seo_title_pt" value={seoTitlePt} onChange={(e) => setSeoTitlePt(e.target.value)} maxLength={70} />
            </Field>
            <Field label="SEO — descrição (PT)" hint="Deixe em branco para usar a linha fina / subtítulo.">
              <Textarea name="seo_desc_pt" rows={2} value={seoDescPt} onChange={(e) => setSeoDescPt(e.target.value)} maxLength={170} />
            </Field>
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "0.625rem" }}>
                Como aparece no Google
              </div>
              <SeoPreview url={previewUrl} title={seoTitlePt || titlePt} description={seoDescPt || excerptPt} />
            </div>
          </div>

          <div style={{ display: active === "detalhes" ? "block" : "none" }}>
            <Field label="Slug" hint="Deixe em branco para gerar automaticamente">
              <Input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugifyPreview(titlePt)} />
            </Field>
            <Field label="Tipo de conteúdo" hint="Notícia: reportagem/atualidade. Opinião: aparece com a tag Mea Sententia.">
              <Select name="format" value={format} onChange={(e) => setFormat(e.target.value as Article["format"])}>
                <option value="opiniao">Opinião (Mea Sententia)</option>
                <option value="noticia">Notícia</option>
              </Select>
            </Field>
            <Field label="Categoria">
              <Select name="category_id" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_pt}</option>
                ))}
              </Select>
            </Field>
            <Field label="Imagem de capa" hint="PNG, JPG ou WEBP — convertida automaticamente para WebP e comprimida para menos de 1MB.">
              {item?.cover_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.cover_image}
                  alt="Capa atual"
                  style={{ maxHeight: "6rem", display: "block", marginBottom: "0.625rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border)" }}
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
              hint="Usada se você escolher 'Agendar' abaixo. A aprovação de um admin pode levar até 72h — escolha a data considerando essa margem."
            >
              <DateTimePicker name="scheduled_for" defaultValue={item?.scheduled_for} />
            </Field>

            <Field label="Status">
              <div>
                <Badge tone={statusDisplay[status].tone}>{statusDisplay[status].label}</Badge>
              </div>
            </Field>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--admin-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <SubmitButton name="intent" value="draft" variant="secondary" pendingText="Salvando...">
                  Manter como rascunho
                </SubmitButton>
                <span style={{ fontSize: "0.75rem", color: "var(--admin-faint)" }}>Fica só com você, sem entrar na fila de aprovação.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <SubmitButton name="intent" value="schedule" variant="secondary" pendingText="Enviando...">
                  Agendar
                </SubmitButton>
                <span style={{ fontSize: "0.75rem", color: "var(--admin-faint)" }}>
                  Será agendado para a data acima assim que um admin aprovar (até 72h).
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <SubmitButton name="intent" value="send" pendingText="Enviando...">
                  Enviar para Aprovação
                </SubmitButton>
                <span style={{ fontSize: "0.75rem", color: "var(--admin-faint)" }}>
                  Será publicado automaticamente assim que um admin aprovar, sem data marcada.
                </span>
              </div>
            </div>
          </div>
        </div>

        <ErrorBanner message={saveError} label="Não foi possível salvar o artigo" />
      </form>
    </div>
  );
}
