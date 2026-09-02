"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, Input, Select, SubmitButton } from "@/components/admin/ui";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { AD_SLOT_DEFS } from "./ad-slots";
import { upsertAd } from "./actions";
import type { Ad, Article } from "@/types/database.types";

export function AdForm({
  item,
  articles,
  targetedArticleIds,
  imageError,
}: {
  item?: Ad;
  articles: Pick<Article, "id" | "title_pt">[];
  targetedArticleIds: string[];
  imageError?: string;
}) {
  const action = upsertAd.bind(null, item?.id ?? null);
  const [slotKey, setSlotKey] = useState(item?.slot_key ?? "home-top");
  const [targetMode, setTargetMode] = useState<"all" | "specific">(item?.target_mode ?? "all");
  const showTargeting = slotKey !== "home-top";

  return (
    <div style={{ maxWidth: "640px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/admin/publicidade" style={{ color: "var(--admin-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
          &larr; Voltar
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--admin-text)", marginTop: "0.5rem" }}>
          {item ? "Editar anúncio" : "Novo anúncio"}
        </h1>
      </div>

      <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.75rem" }}>
        <form action={action}>
          <Field label="Título interno" hint="Só aparece aqui no admin, pra você identificar a campanha.">
            <Input name="title" defaultValue={item?.title ?? ""} placeholder="Ex: XP Investimentos — Setembro" required />
          </Field>

          <Field label="Espaço">
            <Select name="slot_key" value={slotKey} onChange={(e) => setSlotKey(e.target.value)}>
              {AD_SLOT_DEFS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Estamos exibindo este anúncio?">
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>
              <input type="checkbox" name="active" defaultChecked={item?.active ?? false} />
              Sim, mostrar no site
            </label>
          </Field>

          <Field label="Imagem do banner" hint="PNG, JPG ou WEBP, até 5MB. Sem imagem, o anúncio não aparece mesmo que ativado.">
            {item?.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image_url}
                alt="Banner atual"
                style={{ maxHeight: "6rem", display: "block", marginBottom: "0.625rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border)" }}
              />
            )}
            <input type="file" name="image_file" accept="image/png,image/jpeg,image/webp" />
            <ErrorBanner message={imageError} />
          </Field>

          <Field label="Link de destino (URL)">
            <Input name="link_url" defaultValue={item?.link_url ?? ""} placeholder="https://..." />
          </Field>

          <Field label="Texto alternativo">
            <Input name="alt_text" defaultValue={item?.alt_text ?? ""} placeholder="Descrição curta do anúncio" />
          </Field>

          {showTargeting && (
            <Field label="Onde exibir">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>
                  <input type="radio" name="target_mode" value="all" checked={targetMode === "all"} onChange={() => setTargetMode("all")} />
                  Todas as matérias
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>
                  <input type="radio" name="target_mode" value="specific" checked={targetMode === "specific"} onChange={() => setTargetMode("specific")} />
                  Matérias específicas
                </label>
              </div>

              {targetMode === "specific" && (
                <select
                  name="article_ids"
                  multiple
                  defaultValue={targetedArticleIds}
                  size={8}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.85rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" }}
                >
                  {articles.map((a) => (
                    <option key={a.id} value={a.id}>{a.title_pt}</option>
                  ))}
                </select>
              )}
              {targetMode === "specific" && (
                <p style={{ fontSize: "0.75rem", color: "var(--admin-faint)", marginTop: "0.375rem" }}>
                  Segure Ctrl (ou Cmd no Mac) para selecionar mais de uma matéria. Se nenhum anúncio específico for encontrado para a matéria, cai automaticamente para um anúncio de &quot;todas as matérias&quot;, quando houver.
                </p>
              )}
            </Field>
          )}

          <SubmitButton>{item ? "Salvar alterações" : "Criar anúncio"}</SubmitButton>
        </form>
      </div>
    </div>
  );
}
