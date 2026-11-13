"use client";

import { useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { Field, Textarea } from "@/components/admin/ui";
import { updateNotificationTemplate, resetNotificationTemplate } from "./notification-template-actions";
import { renderTemplateText, NOTIFICATION_TEMPLATE_PREVIEW_VARS, NOTIFICATION_TEMPLATE_AUDIENCE, type NotificationTemplateKey } from "@/lib/notification-template-text";
import type { NotificationTemplate } from "@/types/database.types";

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

  const audience = NOTIFICATION_TEMPLATE_AUDIENCE[template.key as NotificationTemplateKey];
  const audienceLabel = audience === "ambos" ? "Depende de quem recebe" : audience === "admin" ? "Admin" : "Colunista";
  const audienceColor = audience === "ambos" ? "#8a6d3b" : audience === "admin" ? "#315E9C" : "#C89A4A";

  return (
    <div style={{ border: "1px solid var(--admin-border)", borderRadius: "0.75rem", padding: "1.25rem", marginBottom: "1rem" }}>
      <span
        style={{
          display: "inline-block",
          fontSize: "0.6875rem",
          fontWeight: 700,
          color: audienceColor,
          backgroundColor: `${audienceColor}18`,
          padding: "0.1875rem 0.5rem",
          borderRadius: "9999px",
          marginBottom: "0.625rem",
        }}
      >
        {audienceLabel}
      </span>
      {template.description && (
        <p style={{ fontSize: "0.75rem", color: "var(--admin-muted)", marginBottom: "0.875rem" }}>{template.description}</p>
      )}
      <Field label="Título">
        <input value={titleTemplate} onChange={(e) => setTitleTemplate(e.target.value)} style={titleInputStyle} />
      </Field>
      <Field label="Corpo (opcional)">
        <Textarea value={bodyTemplate} onChange={(e) => setBodyTemplate(e.target.value)} rows={2} />
      </Field>

      <div style={{ marginBottom: "0.5rem" }}>
        <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.375rem" }}>
          Prévia (com dados de exemplo)
        </div>
        <div style={{ borderRadius: "0.5rem", border: "1px solid var(--admin-border)", backgroundColor: "rgba(49, 94, 156,0.06)", padding: "0.75rem 1rem", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
          <Bell size={15} style={{ flexShrink: 0, marginTop: "0.125rem", color: "#315E9C" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-text)" }}>
              {renderTemplateText(titleTemplate, NOTIFICATION_TEMPLATE_PREVIEW_VARS[template.key as NotificationTemplateKey]) || "(título vazio)"}
            </div>
            {bodyTemplate.trim() && (
              <div style={{ fontSize: "0.75rem", color: "var(--admin-muted)", marginTop: "0.125rem" }}>
                {renderTemplateText(bodyTemplate, NOTIFICATION_TEMPLATE_PREVIEW_VARS[template.key as NotificationTemplateKey])}
              </div>
            )}
            <div style={{ fontSize: "0.6875rem", color: "var(--admin-faint)", marginTop: "0.25rem" }}>agora</div>
          </div>
        </div>
      </div>

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
  if (templates.length === 0) {
    return (
      <p style={{ fontSize: "0.875rem", color: "var(--admin-faint)" }}>
        Nenhum modelo cadastrado ainda — rode a migration 067_notification_templates.sql no Supabase.
      </p>
    );
  }

  // "Ambos" (ticket_member_notified, message_received) can land in either
  // inbox depending on who's on the other side of that specific ticket/DM —
  // shown in both columns, with the badge making that conditionality clear,
  // rather than forcing them into a single column that would misrepresent
  // who actually gets notified.
  const colunistaTemplates = templates.filter((t) => NOTIFICATION_TEMPLATE_AUDIENCE[t.key as NotificationTemplateKey] !== "admin");
  const adminTemplates = templates.filter((t) => NOTIFICATION_TEMPLATE_AUDIENCE[t.key as NotificationTemplateKey] !== "colunista");

  return (
    <div className="notif-template-columns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>
      <div>
        <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "0.875rem" }}>Colunista</h3>
        {colunistaTemplates.map((template) => (
          <TemplateCard key={template.key} template={template} />
        ))}
      </div>
      <div>
        <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "0.875rem" }}>Admin</h3>
        {adminTemplates.map((template) => (
          <TemplateCard key={template.key} template={template} />
        ))}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .notif-template-columns { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
