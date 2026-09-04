"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Field, Input, Select, SubmitButton } from "@/components/admin/ui";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { AD_SLOT_DEFS } from "./ad-slots";
import { upsertAd } from "./actions";
import type { Ad, Article } from "@/types/database.types";

type OtherAd = Pick<Ad, "id" | "title" | "slot_key" | "target_mode">;

export function AdForm({
  item,
  articles,
  targetedArticleIds,
  otherAds,
  targetsByAd,
  imageError,
}: {
  item?: Ad;
  articles: Pick<Article, "id" | "title_pt">[];
  targetedArticleIds: string[];
  otherAds: OtherAd[];
  targetsByAd: Record<string, string[]>;
  imageError?: string;
}) {
  const action = upsertAd.bind(null, item?.id ?? null);
  const [slotKey, setSlotKey] = useState(item?.slot_key ?? "home-top");
  const [targetMode, setTargetMode] = useState<"all" | "specific">(item?.target_mode ?? "all");
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>(targetedArticleIds);
  const [active, setActive] = useState(item?.active ?? false);
  const showTargeting = slotKey !== "home-top";

  const collisions = useMemo(() => {
    if (!active) return [];
    const sameSlot = otherAds.filter((a) => a.slot_key === slotKey && a.target_mode === targetMode);
    if (targetMode === "all") return sameSlot;
    return sameSlot.filter((a) => (targetsByAd[a.id] ?? []).some((id) => selectedArticleIds.includes(id)));
  }, [active, otherAds, slotKey, targetMode, selectedArticleIds, targetsByAd]);

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
              <input type="checkbox" name="active" checked={active} onChange={(e) => setActive(e.target.checked)} />
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
            <input className="admin-file-input" type="file" name="image_file" accept="image/png,image/jpeg,image/webp" />
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
                  value={selectedArticleIds}
                  onChange={(e) => setSelectedArticleIds(Array.from(e.target.selectedOptions, (o) => o.value))}
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

          {collisions.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "0.625rem",
                backgroundColor: "rgba(255,183,3,0.1)",
                border: "1px solid rgba(255,183,3,0.35)",
                borderRadius: "0.625rem",
                padding: "0.875rem 1rem",
                marginBottom: "1.125rem",
              }}
            >
              <AlertTriangle size={17} color="#cc9200" style={{ flexShrink: 0, marginTop: "0.125rem" }} />
              <div>
                <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#7a5c00", marginBottom: "0.25rem" }}>
                  Esse espaço já tem outro anúncio ativo no mesmo lugar
                </p>
                <p style={{ fontSize: "0.8125rem", color: "#7a5c00", lineHeight: 1.5 }}>
                  Só um anúncio aparece por vez — o mais recentemente salvo tem prioridade, então os outros deixam de aparecer:{" "}
                  <strong>{collisions.map((c) => c.title).join(", ")}</strong>.
                </p>
              </div>
            </div>
          )}

          <SubmitButton>{item ? "Salvar alterações" : "Criar anúncio"}</SubmitButton>
        </form>
      </div>
    </div>
  );
}
