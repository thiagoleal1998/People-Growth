"use client";

import { FormShell, Field, Input, Textarea, Select, SubmitButton, ConfirmDeleteButton } from "@/components/admin/ui";
import { upsertEvent, deleteEvent } from "./actions";
import type { Event } from "@/types/database.types";

export function EventForm({ item, defaultState }: { item?: Event; defaultState?: string }) {
  const action = upsertEvent.bind(null, item?.id ?? null);
  const backHref = `/admin/eventos?tab=${item?.state ?? defaultState ?? "RJ"}`;

  return (
    <FormShell
      title={item ? "Editar evento" : "Novo evento"}
      backHref={backHref}
      maxWidth="820px"
      action={item && <ConfirmDeleteButton confirmText={`Excluir o evento "${item.name}"?`} onDelete={deleteEvent.bind(null, item.id)} />}
    >
      <form action={action}>
        <Field label="Nome do evento">
          <Input name="name" defaultValue={item?.name ?? ""} required />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0 1.5rem" }}>
          <Field label="Estado">
            <Select name="state" defaultValue={item?.state ?? defaultState ?? "RJ"}>
              <option value="RJ">Rio de Janeiro</option>
              <option value="SP">São Paulo</option>
              <option value="MG">Minas Gerais</option>
            </Select>
          </Field>
          <Field label="Cidade / local">
            <Input name="city" defaultValue={item?.city ?? ""} placeholder='Ex: "Riocentro, Rio de Janeiro"' />
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.5rem" }}>
          <Field label="Data de início">
            <Input type="date" name="date_start" defaultValue={item?.date_start ?? ""} />
          </Field>
          <Field label="Data de término" hint="Deixe em branco se for um evento de um dia só.">
            <Input type="date" name="date_end" defaultValue={item?.date_end ?? ""} />
          </Field>
        </div>

        <Field label="Interesse para o grupo" hint="Por que esse evento é relevante (temas, oportunidades de relacionamento, etc).">
          <Textarea name="interest_description" rows={3} defaultValue={item?.interest_description ?? ""} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0 1.5rem" }}>
          <Field label="Decisão">
            <Select name="decision" defaultValue={item?.decision ?? "a_decidir"}>
              <option value="a_decidir">A decidir</option>
              <option value="sim">Vamos</option>
              <option value="nao">Não vamos</option>
            </Select>
          </Field>
          <Field label="Quem vai" hint="Ex: Thiago e Gustavo">
            <Input name="attendees" defaultValue={item?.attendees ?? ""} />
          </Field>
        </div>

        <Field label="Link de ingressos">
          <Input type="url" name="ticket_url" defaultValue={item?.ticket_url ?? ""} placeholder="https://..." />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0 1.5rem" }}>
          <Field label="Preço base (ingresso)">
            <Input type="number" step="0.01" name="base_price" defaultValue={item?.base_price ?? ""} />
          </Field>
          <Field label="Observação sobre o preço" hint="Ex: preço de referência da edição anterior, a confirmar.">
            <Input name="price_notes" defaultValue={item?.price_notes ?? ""} />
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0 1.5rem" }}>
          <Field label="Custo de deslocamento" hint="Ida e volta, carro ou ônibus saindo de Petrópolis.">
            <Input type="number" step="0.01" name="travel_cost" defaultValue={item?.travel_cost ?? ""} />
          </Field>
          <Field label="Observação sobre o deslocamento">
            <Input name="travel_notes" defaultValue={item?.travel_notes ?? ""} />
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.5rem" }}>
          <Field label="Alimentação (estimativa)">
            <Input type="number" step="0.01" name="food_cost" defaultValue={item?.food_cost ?? ""} />
          </Field>
          <Field label="Outros custos" hint="Hospedagem, estacionamento, etc.">
            <Input type="number" step="0.01" name="other_cost" defaultValue={item?.other_cost ?? ""} />
          </Field>
        </div>
        <Field label="Observação sobre outros custos">
          <Input name="other_cost_notes" defaultValue={item?.other_cost_notes ?? ""} />
        </Field>

        <Field label="Fontes" hint="Um link por linha.">
          <Textarea name="source_urls" rows={2} defaultValue={item?.source_urls ?? ""} />
        </Field>

        <Field label="Notas gerais">
          <Textarea name="notes" rows={2} defaultValue={item?.notes ?? ""} />
        </Field>

        <Field label="Ordem" hint="Define a ordem dos cards dentro do estado.">
          <Input type="number" name="order" defaultValue={item?.order ?? 0} />
        </Field>

        <SubmitButton>{item ? "Salvar alterações" : "Criar"}</SubmitButton>
      </form>
    </FormShell>
  );
}
