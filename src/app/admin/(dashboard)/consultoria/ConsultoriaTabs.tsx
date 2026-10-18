"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit, Download } from "lucide-react";
import { PageHeader, PrimaryLinkButton, Card, EmptyState, Badge, ConfirmDeleteButton } from "@/components/admin/ui";
import { ResourcesSubNav } from "@/components/admin/ResourcesSubNav";
import { deleteService } from "../servicos/actions";
import { deletePortfolioCase } from "../portfolio/actions";
import { deleteCourse } from "../cursos/actions";
import { deleteResource } from "../recursos/actions";
import type { Service, PortfolioCase, Course, Resource } from "@/types/database.types";

const courseStatusLabel: Record<Course["status"], string> = { coming_soon: "Em breve", active: "Ativo", draft: "Rascunho" };
const courseStatusTone: Record<Course["status"], "success" | "warning" | "neutral"> = { coming_soon: "warning", active: "success", draft: "neutral" };

const outerTabs = [
  { id: "servicos", label: "Serviços" },
  { id: "portfolio", label: "Portfólio" },
  { id: "cursos", label: "Cursos" },
  { id: "recursos", label: "Recursos" },
] as const;

type OuterTabId = (typeof outerTabs)[number]["id"];

const headerByTab: Record<OuterTabId, { subtitle: (n: number) => string; actionHref: string; actionLabel: string }> = {
  servicos: { subtitle: (n) => `${n} serviço${n === 1 ? "" : "s"}`, actionHref: "/admin/servicos/novo", actionLabel: "Novo serviço" },
  portfolio: { subtitle: (n) => `${n} case${n === 1 ? "" : "s"}`, actionHref: "/admin/portfolio/novo", actionLabel: "Novo case" },
  cursos: { subtitle: (n) => `${n} curso${n === 1 ? "" : "s"}`, actionHref: "/admin/cursos/novo", actionLabel: "Novo curso" },
  recursos: { subtitle: (n) => `${n} recurso${n === 1 ? "" : "s"}`, actionHref: "/admin/recursos/novo", actionLabel: "Novo recurso" },
};

export function ConsultoriaTabs({
  services,
  portfolioCases,
  courses,
  resources,
  initialTab,
}: {
  services: Service[];
  portfolioCases: PortfolioCase[];
  courses: Course[];
  resources: Resource[];
  initialTab?: string;
}) {
  const [active, setActive] = useState<OuterTabId>(
    outerTabs.some((t) => t.id === initialTab) ? (initialTab as OuterTabId) : "servicos"
  );

  const countByTab: Record<OuterTabId, number> = {
    servicos: services.length,
    portfolio: portfolioCases.length,
    cursos: courses.length,
    recursos: resources.length,
  };
  const header = headerByTab[active];

  return (
    <div>
      <PageHeader
        title="Consultoria"
        subtitle={header.subtitle(countByTab[active])}
        action={<PrimaryLinkButton href={header.actionHref}><Plus size={16} /> {header.actionLabel}</PrimaryLinkButton>}
      />

      <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid var(--admin-border)", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {outerTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            style={{
              padding: "0.875rem 1.5rem",
              fontSize: "0.9375rem",
              fontWeight: 800,
              color: active === tab.id ? "#315E9C" : "var(--admin-muted)",
              background: "none",
              border: "none",
              borderBottom: active === tab.id ? "2.5px solid #315E9C" : "2.5px solid transparent",
              cursor: "pointer",
              marginBottom: "-1px",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "servicos" && <ServicosList items={services} />}
      {active === "portfolio" && <PortfolioList items={portfolioCases} />}
      {active === "cursos" && <CursosList items={courses} />}
      {active === "recursos" && <RecursosList items={resources} />}
    </div>
  );
}

function ServicosList({ items }: { items: Service[] }) {
  return (
    <Card>
      {items.length === 0 ? (
        <EmptyState text="Nenhum serviço cadastrado." />
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
              {["Ordem", "Título", "Status", ""].map((h) => (
                <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-faint)", fontSize: "0.875rem" }}>{s.order}</td>
                <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--admin-text)", fontSize: "0.875rem" }}>{s.title_pt}</td>
                <td style={{ padding: "0.875rem 1.25rem" }}>
                  <Badge tone={s.status === "active" ? "success" : "neutral"}>{s.status === "active" ? "Ativo" : "Rascunho"}</Badge>
                </td>
                <td style={{ padding: "0.875rem 1.25rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link href={`/admin/servicos/${s.id}`} style={{ padding: "0.375rem", color: "#315E9C", borderRadius: "0.375rem" }} title="Editar"><Edit size={15} /></Link>
                    <ConfirmDeleteButton confirmText={`Excluir o serviço "${s.title_pt}"?`} onDelete={deleteService.bind(null, s.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function PortfolioList({ items }: { items: PortfolioCase[] }) {
  return (
    <Card>
      {items.length === 0 ? (
        <EmptyState text="Nenhum case cadastrado." />
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
              {["Ordem", "Título", "Categoria", "Status", ""].map((h) => (
                <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-faint)", fontSize: "0.875rem" }}>{s.order}</td>
                <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--admin-text)", fontSize: "0.875rem" }}>{s.title_pt}</td>
                <td style={{ padding: "0.875rem 1.25rem" }}><Badge>{s.category}</Badge></td>
                <td style={{ padding: "0.875rem 1.25rem" }}>
                  <Badge tone={s.status === "active" ? "success" : "neutral"}>{s.status === "active" ? "Ativo" : "Rascunho"}</Badge>
                </td>
                <td style={{ padding: "0.875rem 1.25rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link href={`/admin/portfolio/${s.id}`} style={{ padding: "0.375rem", color: "#315E9C", borderRadius: "0.375rem" }} title="Editar"><Edit size={15} /></Link>
                    <ConfirmDeleteButton confirmText={`Excluir o case "${s.title_pt}"?`} onDelete={deletePortfolioCase.bind(null, s.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function CursosList({ items }: { items: Course[] }) {
  return (
    <Card>
      {items.length === 0 ? (
        <EmptyState text="Nenhum curso cadastrado." />
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
              {["Ordem", "Título", "Categoria", "Status", ""].map((h) => (
                <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-faint)", fontSize: "0.875rem" }}>{s.order}</td>
                <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--admin-text)", fontSize: "0.875rem" }}>{s.title_pt}</td>
                <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-muted)", fontSize: "0.875rem" }}>{s.category ?? "—"}</td>
                <td style={{ padding: "0.875rem 1.25rem" }}>
                  <Badge tone={courseStatusTone[s.status]}>{courseStatusLabel[s.status]}</Badge>
                </td>
                <td style={{ padding: "0.875rem 1.25rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link href={`/admin/cursos/${s.id}`} style={{ padding: "0.375rem", color: "#315E9C", borderRadius: "0.375rem" }} title="Editar"><Edit size={15} /></Link>
                    <ConfirmDeleteButton confirmText={`Excluir o curso "${s.title_pt}"?`} onDelete={deleteCourse.bind(null, s.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function RecursosList({ items }: { items: Resource[] }) {
  return (
    <div>
      <ResourcesSubNav active="all" />
      <Card>
        {items.length === 0 ? (
          <EmptyState text="Nenhum recurso cadastrado." />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                {["Título", "Tipo", "Downloads", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                  <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--admin-text)", fontSize: "0.875rem" }}>{s.title_pt}</td>
                  <td style={{ padding: "0.875rem 1.25rem" }}><Badge>{s.type}</Badge></td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-muted)", fontSize: "0.875rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><Download size={13} /> {s.download_count}</span>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <Badge tone={s.status === "active" ? "success" : "neutral"}>{s.status === "active" ? "Ativo" : "Rascunho"}</Badge>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link href={`/admin/recursos/${s.id}`} style={{ padding: "0.375rem", color: "#315E9C", borderRadius: "0.375rem" }} title="Editar"><Edit size={15} /></Link>
                      <ConfirmDeleteButton confirmText={`Excluir o recurso "${s.title_pt}"?`} onDelete={deleteResource.bind(null, s.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
