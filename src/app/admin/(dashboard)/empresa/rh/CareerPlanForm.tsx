"use client";

import { FormShell, Field, Textarea, Input, SubmitButton } from "@/components/admin/ui";
import { upsertCareerPlan } from "./actions";
import type { Columnist, CareerPlan } from "@/types/database.types";

const MARKDOWN_HINT = "Aceita **negrito** e listas com \"- \" no início da linha, igual no corpo dos artigos.";

export function CareerPlanForm({ columnist, plan }: { columnist: Columnist; plan: CareerPlan | null }) {
  const action = upsertCareerPlan.bind(null, columnist.id);

  return (
    <FormShell title={`Plano de carreira — ${columnist.name}`} backHref="/admin/empresa?tab=rh" maxWidth="820px">
      <form action={action}>
        <Field label="Situação atual" hint={`Onde a pessoa está hoje (cargo, nível, pontos fortes). ${MARKDOWN_HINT}`}>
          <Textarea name="current_summary" rows={4} defaultValue={plan?.current_summary ?? ""} />
        </Field>

        <Field label="Objetivos e próximos passos" hint={`Metas de desenvolvimento e o que falta para o próximo passo na carreira. ${MARKDOWN_HINT}`}>
          <Textarea name="goals" rows={6} defaultValue={plan?.goals ?? ""} />
        </Field>

        <Field label="Próxima revisão" hint="Data combinada para revisar este plano novamente.">
          <Input type="date" name="next_review_at" defaultValue={plan?.next_review_at ?? ""} />
        </Field>

        <SubmitButton>Salvar plano de carreira</SubmitButton>
      </form>
    </FormShell>
  );
}
