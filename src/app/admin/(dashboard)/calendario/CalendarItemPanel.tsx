"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2 } from "lucide-react";
import { Field, Input, Textarea, Select } from "@/components/admin/ui";
import { confirmDialog } from "@/components/admin/dialog-store";
import { upsertCalendarItemInline, deleteCalendarItemInline } from "./actions";
import type { ContentCalendarItem } from "@/types/database.types";

const PLATFORMS: { value: NonNullable<ContentCalendarItem["platform"]>; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X" },
  { value: "live", label: "Live" },
  { value: "other", label: "Outro" },
];

// Where it actually went out — separate from "Plataforma" above (where it
// was *planned* for): ticked off after the fact, and a post sometimes goes
// out on more than one channel, so this is a checklist, not a single pick.
const CHECKLIST_CHANNELS = PLATFORMS.filter((p) => p.value !== "other");

const STATUSES: { value: ContentCalendarItem["status"]; label: string }[] = [
  { value: "planned", label: "Planejado" },
  { value: "in_progress", label: "Em produção" },
  { value: "done", label: "Pronto" },
];

/** Slide-over editor for a content_calendar_items row — opens over the
 * calendar grid instead of navigating to a separate page, so switching
 * between a handful of days' items doesn't mean leaving and coming back
 * to the grid each time. The standalone /admin/calendario/[id] and
 * .../novo pages still exist too (direct links, no-JS fallback); this
 * panel calls the *Inline variants of the same actions, which save
 * identically but return instead of redirecting. */
export function CalendarItemPanel({
  item,
  date,
  month,
  onClose,
}: {
  item?: ContentCalendarItem;
  date?: string;
  month: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [type, setType] = useState<ContentCalendarItem["type"]>(item?.type ?? "article_topic");
  const [pending, startTransition] = useTransition();
  const [deleting, startDeleteTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await upsertCalendarItemInline(item?.id ?? null, formData);
      router.refresh();
      onClose();
    });
  }

  async function handleDelete() {
    if (!item) return;
    if (!(await confirmDialog("Excluir este item do calendário?", { danger: true, confirmText: "Excluir" }))) return;
    startDeleteTransition(async () => {
      await deleteCalendarItemInline(item.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: "flex-end" }}>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, backgroundColor: "rgba(13,27,42,0.45)" }}
        className="calendar-panel-backdrop"
      />
      <div
        className="calendar-panel"
        style={{
          position: "relative",
          width: "min(420px, 100%)",
          height: "100%",
          backgroundColor: "var(--admin-surface)",
          boxShadow: "-12px 0 32px rgba(13,27,42,0.18)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--admin-border)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--admin-text)" }}>
            {item ? "Editar item do calendário" : "Novo item do calendário"}
          </h2>
          <button type="button" onClick={onClose} style={{ padding: "0.375rem", color: "var(--admin-muted)", background: "none", border: "none", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", flex: 1 }}>
          <input type="hidden" name="month" value={month} />
          <Field label="Tipo">
            <Select name="type" value={type} onChange={(e) => setType(e.target.value as ContentCalendarItem["type"])}>
              <option value="article_topic">Pauta de matéria</option>
              <option value="social_post">Post de rede social</option>
            </Select>
          </Field>
          <Field label="Título">
            <Input name="title" defaultValue={item?.title} required />
          </Field>
          <Field label={type === "social_post" ? "Texto / roteiro do post" : "Pauta"}>
            <Textarea name="notes" rows={4} defaultValue={item?.notes ?? ""} />
          </Field>
          {type === "social_post" && (
            <Field label="Plataforma" hint="Onde o post está planejado para sair.">
              <Select name="platform" defaultValue={item?.platform ?? "instagram"} required>
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Responsável" hint="Nome de quem vai produzir, opcional.">
            <Input name="responsible" defaultValue={item?.responsible ?? ""} />
          </Field>
          <Field label="Data">
            <Input type="date" name="scheduled_date" defaultValue={item?.scheduled_date ?? date} required />
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue={item?.status ?? "planned"}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Divulgado em" hint="Marque os canais onde esse post já foi publicado de fato.">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {CHECKLIST_CHANNELS.map((c) => (
                <label key={c.value} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>
                  <input type="checkbox" name="published_channels" value={c.value} defaultChecked={item?.published_channels?.includes(c.value) ?? false} />
                  {c.label}
                </label>
              ))}
            </div>
          </Field>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--admin-border)" }}>
            {item ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#ef4444", background: "none", border: "none", cursor: deleting ? "default" : "pointer", fontSize: "0.8125rem", fontWeight: 700, opacity: deleting ? 0.5 : 1 }}
              >
                <Trash2 size={15} /> Excluir
              </button>
            ) : <span />}
            <button
              type="submit"
              disabled={pending}
              style={{ backgroundColor: "#315E9C", color: "white", border: "none", padding: "0.625rem 1.25rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", cursor: pending ? "default" : "pointer", opacity: pending ? 0.7 : 1 }}
            >
              {pending ? "Salvando..." : item ? "Salvar alterações" : "Criar item"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes calendar-panel-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes calendar-backdrop-in { from { opacity: 0; } to { opacity: 1; } }
        .calendar-panel { animation: calendar-panel-in 0.22s ease-out; }
        .calendar-panel-backdrop { animation: calendar-backdrop-in 0.22s ease-out; }
        @media (max-width: 480px) {
          .calendar-panel { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
