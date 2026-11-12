"use client";

import Link from "next/link";
import { Field, Input, Textarea, Select, SubmitButton, FieldGrid, FormSection } from "@/components/admin/ui";
import { Building2, CalendarRange, NotebookPen } from "lucide-react";
import { upsertFinanceClient } from "./actions";
import type { FinanceClient } from "@/types/database.types";

export function ClientForm({ item }: { item?: FinanceClient }) {
  const action = upsertFinanceClient.bind(null, item?.id ?? null);

  return (
    <div style={{ maxWidth: "720px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/admin/financeiro/clientes" style={{ color: "var(--admin-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
          &larr; Voltar
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--admin-text)", marginTop: "0.5rem" }}>
          {item ? "Editar cliente" : "Novo cliente"}
        </h1>
      </div>

      <form action={action}>
        <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.75rem" }}>
          <FormSection icon={<Building2 size={17} />} title="Cliente / projeto">
            <FieldGrid>
              <Field label="Nome">
                <Input name="name" defaultValue={item?.name} required />
              </Field>
              <Field label="Status">
                <Select name="status" defaultValue={item?.status ?? "active"}>
                  <option value="active">Ativo</option>
                  <option value="paused">Pausado</option>
                  <option value="completed">Encerrado</option>
                </Select>
              </Field>
            </FieldGrid>
            <Field label="Valor do contrato (R$/mês)" hint="Usado como MRR enquanto o status for Ativo — deixe em branco se não for um valor recorrente fixo.">
              <Input name="contract_value" type="number" step="0.01" min="0" defaultValue={item?.contract_value ?? ""} />
            </Field>
          </FormSection>

          <FormSection icon={<CalendarRange size={17} />} title="Período">
            <FieldGrid>
              <Field label="Início">
                <Input name="start_date" type="date" defaultValue={item?.start_date ?? ""} />
              </Field>
              <Field label="Fim">
                <Input name="end_date" type="date" defaultValue={item?.end_date ?? ""} />
              </Field>
            </FieldGrid>
          </FormSection>

          <FormSection icon={<NotebookPen size={17} />} title="Observações" last>
            <Field label="Notas">
              <Textarea name="notes" rows={4} defaultValue={item?.notes ?? ""} />
            </Field>
          </FormSection>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <SubmitButton>{item ? "Salvar alterações" : "Criar cliente"}</SubmitButton>
        </div>
      </form>
    </div>
  );
}
