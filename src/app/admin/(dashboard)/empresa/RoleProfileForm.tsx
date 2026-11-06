"use client";

import { FormShell, Field, Input, Textarea, Select, SubmitButton, ConfirmDeleteButton } from "@/components/admin/ui";
import { upsertRoleProfile, deleteRoleProfile } from "./actions";
import type { Columnist, RoleProfile } from "@/types/database.types";

const MARKDOWN_HINT = "Aceita **negrito** e listas com \"- \" no início da linha, igual no corpo dos artigos.";

export function RoleProfileForm({ item, columnists }: { item?: RoleProfile; columnists: Columnist[] }) {
  const action = upsertRoleProfile.bind(null, item?.id ?? null);
  const backHref = "/admin/empresa?tab=cargos";

  return (
    <FormShell
      title={item ? "Editar cargo e função" : "Novo cargo e função"}
      backHref={backHref}
      maxWidth="820px"
      action={item && <ConfirmDeleteButton confirmText="Excluir este cargo e função?" onDelete={deleteRoleProfile.bind(null, item.id)} />}
    >
      <form action={action}>
        <Field label="Sócio" hint="Quem esse cargo descreve.">
          <Select name="columnist_id" defaultValue={item?.columnist_id ?? ""} required>
            <option value="" disabled>Selecione...</option>
            {columnists.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0 1.5rem" }}>
          <Field label="Sigla" hint='Ex: "CMO"'>
            <Input name="acronym" defaultValue={item?.acronym ?? ""} />
          </Field>
          <Field label="Significado" hint='Ex: "Chief Marketing Officer"'>
            <Input name="title" defaultValue={item?.title ?? ""} />
          </Field>
        </div>

        <Field label="Função" hint="Resumo geral do papel — a coluna 'Função' da tabela.">
          <Textarea name="function_summary" rows={3} defaultValue={item?.function_summary ?? ""} />
        </Field>

        <Field label="Responsabilidades — Geral" hint={MARKDOWN_HINT}>
          <Textarea name="general_responsibilities" rows={4} defaultValue={item?.general_responsibilities ?? ""} />
        </Field>

        <Field label="Responsabilidades — Primárias (Foco Central)" hint={MARKDOWN_HINT}>
          <Textarea name="primary_responsibilities" rows={4} defaultValue={item?.primary_responsibilities ?? ""} />
        </Field>

        <Field label="Responsabilidades — Secundárias (Apoio Estratégico)" hint={MARKDOWN_HINT}>
          <Textarea name="secondary_responsibilities" rows={4} defaultValue={item?.secondary_responsibilities ?? ""} />
        </Field>

        <Field label="Responsabilidades — Terciárias (Relacionamento & Cultura)" hint={MARKDOWN_HINT}>
          <Textarea name="tertiary_responsibilities" rows={4} defaultValue={item?.tertiary_responsibilities ?? ""} />
        </Field>

        <Field label="Ordem" hint="Define a ordem das linhas na tabela.">
          <Input name="order" type="number" defaultValue={item?.order ?? 0} />
        </Field>

        <SubmitButton>{item ? "Salvar alterações" : "Criar"}</SubmitButton>
      </form>
    </FormShell>
  );
}
