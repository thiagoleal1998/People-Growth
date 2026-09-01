"use client";

import { FormShell, Field, Input, Select, SubmitButton } from "@/components/admin/ui";
import { upsertMediaItem } from "./actions";
import type { MediaItem } from "@/types/database.types";

const types: { value: MediaItem["type"]; label: string }[] = [
  { value: "interview", label: "Entrevista" },
  { value: "event", label: "Evento" },
  { value: "podcast", label: "Podcast" },
  { value: "article", label: "Artigo" },
];

export function MediaForm({ item }: { item?: MediaItem }) {
  const action = upsertMediaItem.bind(null, item?.id ?? null);

  return (
    <FormShell title={item ? "Editar menção" : "Nova menção"} backHref="/admin/midia">
      <form action={action}>
        <Field label="Título">
          <Input name="title" defaultValue={item?.title} required />
        </Field>
        <Field label="Veículo">
          <Input name="outlet" defaultValue={item?.outlet ?? ""} placeholder="Ex: Exame, Forbes, Podcast X" />
        </Field>
        <Field label="Link (URL)">
          <Input name="url" defaultValue={item?.url ?? ""} />
        </Field>
        <Field label="Thumbnail (URL da imagem)">
          <Input name="thumbnail" defaultValue={item?.thumbnail ?? ""} />
        </Field>
        <Field label="Data">
          <Input name="date" type="date" defaultValue={item?.date ?? ""} />
        </Field>
        <Field label="Tipo">
          <Select name="type" defaultValue={item?.type ?? "article"}>
            {types.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Ordem">
          <Input name="order" type="number" defaultValue={item?.order ?? 0} />
        </Field>
        <SubmitButton>{item ? "Salvar alterações" : "Criar menção"}</SubmitButton>
      </form>
    </FormShell>
  );
}
