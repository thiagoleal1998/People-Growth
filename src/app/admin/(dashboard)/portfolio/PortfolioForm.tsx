"use client";

import { FormShell, Field, Input, Textarea, Select, SubmitButton } from "@/components/admin/ui";
import { upsertPortfolioCase } from "./actions";
import type { PortfolioCase } from "@/types/database.types";

const categories: { value: PortfolioCase["category"]; label: string }[] = [
  { value: "marketing", label: "Marketing" },
  { value: "growth", label: "Growth" },
  { value: "data", label: "Dados" },
  { value: "ai", label: "IA" },
  { value: "consulting", label: "Consultoria" },
];

export function PortfolioForm({ item }: { item?: PortfolioCase }) {
  const action = upsertPortfolioCase.bind(null, item?.id ?? null);

  return (
    <FormShell title={item ? "Editar case" : "Novo case"} backHref="/admin/portfolio">
      <form action={action}>
        <Field label="Título (PT)">
          <Input name="title_pt" defaultValue={item?.title_pt} required />
        </Field>
        <Field label="Título (EN)">
          <Input name="title_en" defaultValue={item?.title_en ?? ""} />
        </Field>
        <Field label="Slug" hint="Deixe em branco para gerar automaticamente">
          <Input name="slug" defaultValue={item?.slug ?? ""} />
        </Field>
        <Field label="Categoria">
          <Select name="category" defaultValue={item?.category ?? "marketing"}>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Desafio (PT)">
          <Textarea name="challenge_pt" rows={3} defaultValue={item?.challenge_pt ?? ""} />
        </Field>
        <Field label="Desafio (EN)">
          <Textarea name="challenge_en" rows={3} defaultValue={item?.challenge_en ?? ""} />
        </Field>
        <Field label="Solução (PT)">
          <Textarea name="solution_pt" rows={3} defaultValue={item?.solution_pt ?? ""} />
        </Field>
        <Field label="Solução (EN)">
          <Textarea name="solution_en" rows={3} defaultValue={item?.solution_en ?? ""} />
        </Field>
        <Field label="Ferramentas" hint="Uma por linha">
          <Textarea name="tools" rows={3} defaultValue={(item?.tools ?? []).join("\n")} />
        </Field>
        <Field label="Resultados (PT)">
          <Textarea name="results_pt" rows={2} defaultValue={item?.results_pt ?? ""} />
        </Field>
        <Field label="Resultados (EN)">
          <Textarea name="results_en" rows={2} defaultValue={item?.results_en ?? ""} />
        </Field>
        <Field label="Imagem de capa (URL)">
          <Input name="cover_image" defaultValue={item?.cover_image ?? ""} />
        </Field>
        <Field label="Ordem">
          <Input name="order" type="number" defaultValue={item?.order ?? 0} />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={item?.status ?? "active"}>
            <option value="active">Ativo</option>
            <option value="draft">Rascunho</option>
          </Select>
        </Field>
        <SubmitButton>{item ? "Salvar alterações" : "Criar case"}</SubmitButton>
      </form>
    </FormShell>
  );
}
