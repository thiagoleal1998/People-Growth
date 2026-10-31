"use client";

import { useState, useTransition } from "react";
import { Field, Textarea } from "@/components/admin/ui";
import { updateNotificationTemplate, resetNotificationTemplate } from "./notification-template-actions";
import type { NotificationTemplate } from "@/types/database.types";
import type { NotificationTemplateKey } from "@/lib/notify";

const titleInputStyle = { width: "100%", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.9rem", boxSizing: "border-box" as const, fontFamily: "inherit", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" };

function TemplateCard({ template }: { template: NotificationTemplate }) {
  const [titleTemplate, setTitleTemplate] = useState(template.title_template);
  const [bodyTemplate, setBodyTemplate] = useState(template.body_template ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateNotificationTemplate(template.key as NotificationTemplateKey, { title_template: titleTemplate, body_template: bodyTemplate });
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  }

  function reset() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        const defaults = await resetNotificationTemplate(template.key as NotificationTemplateKey);
        setTitleTemplate(defaults.title_template);
        setBodyTemplate(defaults.body_template ?? "");
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao restaurar.");
      }
    });
  }

  return (
    <div style={{ border: "1px solid var(--admin-border)", borderRadius: "0.75rem", padding: "1.25rem", marginBottom: "1rem" }}>
      {template.description && (
        <p style={{ fontSize: "0.75rem", color: "var(--admin-muted)", marginBottom: "0.875rem" }}>{template.description}</p>
      )}
      <Field label="Título">
        <input value={titleTemplate} onChange={(e) => setTitleTemplate(e.target.value)} style={titleInputStyle} />
      </Field>
      <Field label="Corpo (opcional)">
        <Textarea value={bodyTemplate} onChange={(e) => setBodyTemplate(e.target.value)} rows={2} />
      </Field>
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginTop: "0.5rem" }}>
        <button
          type="button"
          disabled={pending}
          onClick={save}
          style={{ backgroundColor: "#315E9C", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "0.5rem", fontSize: "0.8125rem", fontWeight: 700, cursor: pending ? "default" : "pointer", opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={reset}
          style={{ backgroundColor: "var(--admin-surface-alt)", color: "var(--admin-text)", border: "1px solid var(--admin-border-strong)", padding: "0.5rem 1rem", borderRadius: "0.5rem", fontSize: "0.8125rem", fontWeight: 700, cursor: pending ? "default" : "pointer", opacity: pending ? 0.6 : 1 }}
        >
          Restaurar padrão
        </button>
        {saved && <span style={{ fontSize: "0.8125rem", color: "#15803d", fontWeight: 600 }}>Salvo.</span>}
        {error && <span style={{ fontSize: "0.8125rem", color: "#dc2626" }}>{error}</span>}
      </div>
    </div>
  );
}

export function NotificationTemplatesManager({ templates }: { templates: NotificationTemplate[] }) {
  return (
    <div>
      {templates.length === 0 ? (
        <p style={{ fontSize: "0.875rem", color: "var(--admin-faint)" }}>
          Nenhum modelo cadastrado ainda — rode a migration 067_notification_templates.sql no Supabase.
        </p>
      ) : (
        templates.map((template) => <TemplateCard key={template.key} template={template} />)
      )}
    </div>
  );
}
