"use client";

import { FormShell, Field, Input, Textarea, Select, SubmitButton, ConfirmDeleteButton } from "@/components/admin/ui";
import { upsertRoleProfile, deleteRoleProfile } from "./actions";
import { ROLE_LEVELS } from "@/lib/role-levels";
import type { Columnist, RoleProfile } from "@/types/database.types";

const MARKDOWN_HINT = "Aceita **negrito** e listas com \"- \" no início da linha, igual no corpo dos artigos.";

export function RoleProfileForm({ item, columnists, defaultLevel }: { item?: RoleProfile; columnists: Columnist[]; defaultLevel?: string }) {
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
        <Field label="Nível" hint="Em qual sub-aba de Cargos e Funções este cargo aparece.">
          <Select name="level" defaultValue={item?.level ?? defaultLevel ?? "c_level"}>
            {ROLE_LEVELS.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </Select>
        </Field>

        <Field label="Sócio" hint="Quem esse cargo descreve — pode ficar em branco enquanto o cargo ainda não tem alguém designado.">
          <Select name="columnist_id" defaultValue={item?.columnist_id ?? ""}>
            <option value="">— Vago (sem sócio ainda) —</option>
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
