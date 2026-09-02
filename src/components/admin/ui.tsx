"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Trash2, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--admin-text)" }}>{title}</h1>
        {subtitle && <p style={{ color: "var(--admin-muted)", fontSize: "0.9375rem" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PrimaryLinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#4361EE", color: "white", padding: "0.625rem 1.25rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}
    >
      {children}
    </Link>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", overflow: "hidden" }}>
      {children}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ padding: "3rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.9rem" }}>{text}</div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "success" | "neutral" | "warning" | "danger" }) {
  const tones: Record<string, { bg: string; color: string }> = {
    success: { bg: "rgba(6,214,160,0.1)", color: "#04a87d" },
    warning: { bg: "rgba(255,183,3,0.15)", color: "#cc9200" },
    danger: { bg: "rgba(239,68,68,0.1)", color: "#dc2626" },
    neutral: { bg: "rgba(148,163,184,0.15)", color: "var(--admin-muted)" },
  };
  const t = tones[tone];
  return (
    <span style={{ backgroundColor: t.bg, color: t.color, padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700 }}>
      {children}
    </span>
  );
}

const fieldLabelStyle = { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "0.375rem" } as const;
const fieldControlStyle = { width: "100%", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.9rem", boxSizing: "border-box" as const, fontFamily: "inherit", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" };

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: "1.125rem" }}>
      <label style={fieldLabelStyle}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)", marginTop: "0.25rem" }}>{hint}</div>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...fieldControlStyle, ...props.style }} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...fieldControlStyle, resize: "vertical", ...props.style }} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...fieldControlStyle, cursor: "pointer", ...props.style }} />;
}

export function FormShell({ title, backHref, children }: { title: string; backHref: string; children: ReactNode }) {
  return (
    <div style={{ maxWidth: "640px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href={backHref} style={{ color: "var(--admin-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
          &larr; Voltar
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--admin-text)", marginTop: "0.5rem" }}>{title}</h1>
      </div>
      <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.75rem" }}>
        {children}
      </div>
    </div>
  );
}

export function SubmitButton({ children, pendingText = "Salvando..." }: { children: ReactNode; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        backgroundColor: "#4361EE",
        color: "white",
        padding: "0.75rem 1.5rem",
        borderRadius: "0.625rem",
        fontWeight: 700,
        fontSize: "0.9rem",
        border: "none",
        cursor: pending ? "default" : "pointer",
        opacity: pending ? 0.7 : 1,
      }}
    >
      {pending && <Loader2 size={16} className="admin-spin" />}
      {pending ? pendingText : children}
    </button>
  );
}

export function ConfirmDeleteButton({ confirmText, onDelete }: { confirmText: string; onDelete: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm(confirmText)) startTransition(onDelete);
      }}
      style={{ padding: "0.375rem", color: "#ef4444", background: "none", border: "none", cursor: pending ? "default" : "pointer", borderRadius: "0.375rem", opacity: pending ? 0.5 : 1 }}
      title="Excluir"
    >
      <Trash2 size={15} />
    </button>
  );
}

export function DangerButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type="submit"
      style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.8125rem" }}
    >
      {children}
    </button>
  );
}

export function SectionGrid({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: "1.25rem", alignItems: "start" }}>
      {children}
    </div>
  );
}

export function SectionCard({ title, subtitle, children, wide }: { title: string; subtitle: string; children: ReactNode; wide?: boolean }) {
  return (
    <section
      style={{
        backgroundColor: "var(--admin-surface)",
        borderRadius: "1rem",
        border: "1px solid var(--admin-border)",
        padding: "1.75rem",
        gridColumn: wide ? "1 / -1" : undefined,
      }}
    >
      <div style={{ marginBottom: "1.375rem" }}>
        <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "var(--admin-text)" }}>{title}</h2>
        <p style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginTop: "0.1875rem" }}>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0 1.5rem" }}>
      {children}
    </div>
  );
}
