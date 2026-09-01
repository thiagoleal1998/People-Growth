"use client";

import { FormShell, Field, Input, Textarea, Select, SubmitButton } from "@/components/admin/ui";
import { upsertService } from "./actions";
import type { Database } from "@/types/database.types";

type Service = Database["public"]["Tables"]["services"]["Row"];

export function ServiceForm({ service }: { service?: Service }) {
  const action = upsertService.bind(null, service?.id ?? null);

  return (
    <FormShell title={service ? "Editar serviço" : "Novo serviço"} backHref="/admin/servicos">
      <form action={action}>
        <Field label="Título (PT)">
          <Input name="title_pt" defaultValue={service?.title_pt} required />
        </Field>
        <Field label="Título (EN)">
          <Input name="title_en" defaultValue={service?.title_en ?? ""} />
        </Field>
        <Field label="Slug" hint="Deixe em branco para gerar automaticamente a partir do título">
          <Input name="slug" defaultValue={service?.slug ?? ""} />
        </Field>
        <Field label="Descrição (PT)">
          <Textarea name="description_pt" rows={3} defaultValue={service?.description_pt} required />
        </Field>
        <Field label="Descrição (EN)">
          <Textarea name="description_en" rows={3} defaultValue={service?.description_en ?? ""} />
        </Field>
        <Field label="Metodologia (PT)">
          <Textarea name="methodology_pt" rows={3} defaultValue={service?.methodology_pt ?? ""} />
        </Field>
        <Field label="Metodologia (EN)">
          <Textarea name="methodology_en" rows={3} defaultValue={service?.methodology_en ?? ""} />
        </Field>
        <Field label="Benefícios" hint="Um por linha">
          <Textarea name="benefits" rows={4} defaultValue={(service?.benefits ?? []).join("\n")} />
        </Field>
        <Field label="Resultados (PT)">
          <Textarea name="results_pt" rows={2} defaultValue={service?.results_pt ?? ""} />
        </Field>
        <Field label="Resultados (EN)">
          <Textarea name="results_en" rows={2} defaultValue={service?.results_en ?? ""} />
        </Field>
        <Field label="Ícone (nome lucide-react)" hint="Ex: Target, TrendingUp, Rocket, Brain">
          <Input name="icon" defaultValue={service?.icon ?? ""} />
        </Field>
        <Field label="Ordem">
          <Input name="order" type="number" defaultValue={service?.order ?? 0} />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={service?.status ?? "active"}>
            <option value="active">Ativo</option>
            <option value="draft">Rascunho</option>
          </Select>
        </Field>
        <SubmitButton>{service ? "Salvar alterações" : "Criar serviço"}</SubmitButton>
      </form>
    </FormShell>
  );
}
