"use client";

import { useState } from "react";
import { FormShell, Field, Input, Textarea, Select, SubmitButton, ConfirmDeleteButton } from "@/components/admin/ui";
import { upsertCalendarItem, deleteCalendarItem } from "./actions";
import type { ContentCalendarItem } from "@/types/database.types";

const platforms: { value: NonNullable<ContentCalendarItem["platform"]>; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X" },
  { value: "live", label: "Live" },
  { value: "other", label: "Outro" },
];

const statuses: { value: ContentCalendarItem["status"]; label: string }[] = [
  { value: "planned", label: "Planejado" },
  { value: "in_progress", label: "Em produção" },
  { value: "done", label: "Pronto" },
];

// Where it actually went out, ticked off after the fact — separate from
// "Plataforma" above (where it's planned for). Kept in sync with the same
// checklist in CalendarItemPanel.tsx (the slide-over panel most edits go
// through now); this standalone form stays as the direct-link/no-JS path,
// and has to submit the same field or saving through it would silently
// wipe it back to empty.
const checklistChannels = platforms.filter((p) => p.value !== "other");

export function CalendarItemForm({
  item,
  date,
  month,
}: {
  item?: ContentCalendarItem;
  date?: string;
  month: string;
}) {
  const [type, setType] = useState<ContentCalendarItem["type"]>(item?.type ?? "article_topic");
  const action = upsertCalendarItem.bind(null, item?.id ?? null);
  const backHref = `/admin/calendario?month=${month}`;

  return (
    <FormShell
      title={item ? "Editar item do calendário" : "Novo item do calendário"}
      backHref={backHref}
      action={item && <ConfirmDeleteButton confirmText="Excluir este item do calendário?" onDelete={deleteCalendarItem.bind(null, item.id, month)} />}
    >
      <form action={action}>
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
          <Field label="Plataforma">
            <Select name="platform" defaultValue={item?.platform ?? "instagram"} required>
              {platforms.map((p) => (
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
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Divulgado em" hint="Marque os canais onde esse post já foi publicado de fato.">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {checklistChannels.map((c) => (
              <label key={c.value} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>
                <input type="checkbox" name="published_channels" value={c.value} defaultChecked={item?.published_channels?.includes(c.value) ?? false} />
                {c.label}
              </label>
            ))}
          </div>
        </Field>
        <SubmitButton>{item ? "Salvar alterações" : "Criar item"}</SubmitButton>
      </form>
    </FormShell>
  );
}
