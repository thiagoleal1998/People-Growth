"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, Input, Select, SubmitButton, FieldGrid, FormSection } from "@/components/admin/ui";
import { Receipt, Tag, CalendarClock } from "lucide-react";
import { upsertFinanceEntry } from "./actions";
import type { FinanceClient, FinanceEntry } from "@/types/database.types";

export function EntryForm({ item, clients, categories }: { item?: FinanceEntry; clients: FinanceClient[]; categories: string[] }) {
  const action = upsertFinanceEntry.bind(null, item?.id ?? null);
  const [type, setType] = useState<FinanceEntry["type"]>(item?.type ?? "expense");

  return (
    <div style={{ maxWidth: "720px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/admin/financeiro/lancamentos" style={{ color: "var(--admin-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
          &larr; Voltar
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--admin-text)", marginTop: "0.5rem" }}>
          {item ? "Editar lançamento" : "Novo lançamento"}
        </h1>
      </div>

      <form action={action}>
        <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.75rem" }}>
          <FormSection icon={<Receipt size={17} />} title="Lançamento">
            <FieldGrid>
              <Field label="Tipo">
                <Select name="type" value={type} onChange={(e) => setType(e.target.value as FinanceEntry["type"])}>
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </Select>
              </Field>
              <Field label="Valor (R$)">
                <Input name="amount" type="number" step="0.01" min="0.01" defaultValue={item?.amount ?? ""} required />
              </Field>
            </FieldGrid>
            <Field label="Descrição">
              <Input name="description" defaultValue={item?.description} placeholder="Ex: Pagamento consultoria Cliente X, Assinatura Figma, Pró-labore" required />
            </Field>
          </FormSection>

          <FormSection icon={<Tag size={17} />} title="Classificação">
            <FieldGrid>
              <Field label="Categoria" hint="Texto livre — digite uma já usada antes pra manter os relatórios consistentes.">
                <Input name="category" list="finance-categories" defaultValue={item?.category ?? ""} />
                <datalist id="finance-categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              {type === "income" && (
                <Field label="Cliente / projeto" hint="Só faz sentido pra receita ligada a um cliente de consultoria.">
                  <Select name="client_id" defaultValue={item?.client_id ?? ""}>
                    <option value="">— nenhum —</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </Field>
              )}
            </FieldGrid>
          </FormSection>

          <FormSection icon={<CalendarClock size={17} />} title="Data e recorrência" last>
            <FieldGrid>
              <Field label="Data">
                <Input name="entry_date" type="date" defaultValue={item?.entry_date ?? new Date().toISOString().slice(0, 10)} required />
              </Field>
              <Field label="Recorrência">
                <Select name="recurrence" defaultValue={item?.recurrence ?? "one_time"}>
                  <option value="one_time">Única</option>
                  <option value="monthly">Mensal</option>
                </Select>
              </Field>
            </FieldGrid>
          </FormSection>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <SubmitButton>{item ? "Salvar alterações" : "Criar lançamento"}</SubmitButton>
        </div>
      </form>
    </div>
  );
}
