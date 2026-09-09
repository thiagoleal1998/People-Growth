"use client";

import { useState } from "react";
import { Download, X, Loader2 } from "lucide-react";
import { alertDialog } from "@/components/admin/dialog-store";

type SectionKey = "resumo" | "paginas" | "origens" | "localizacoes" | "anuncios" | "artigos" | "atividade";

const SECTIONS: { key: SectionKey; label: string; hint: string }[] = [
  { key: "resumo", label: "Resumo geral", hint: "Visualizações, visitantes únicos, CTR e leitura média" },
  { key: "paginas", label: "Páginas mais acessadas", hint: "Todas as páginas, não só o top 10 exibido na tela" },
  { key: "origens", label: "Origem do tráfego", hint: "De onde vêm os visitantes" },
  { key: "localizacoes", label: "Localização dos visitantes", hint: "Cidade/país aproximados" },
  { key: "anuncios", label: "Desempenho dos anúncios", hint: "Impressões, cliques e CTR por anúncio" },
  { key: "artigos", label: "Estatísticas por artigo", hint: "Visualizações, comentários, curtidas e denúncias" },
  { key: "atividade", label: "Log de atividade", hint: "Quem fez o quê, e quando" },
];

const GENERAL_KEYS: SectionKey[] = ["resumo", "paginas", "origens", "localizacoes", "anuncios"];

export function ExportReportButton({
  tab,
  period,
  from,
  to,
  userFilter,
}: {
  tab: string;
  period: string;
  from?: string;
  to?: string;
  userFilter?: string;
}) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selected, setSelected] = useState<Set<SectionKey>>(
    () => new Set(tab === "artigos" ? ["artigos"] : tab === "atividade" ? ["atividade"] : GENERAL_KEYS)
  );

  function toggle(key: SectionKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleDownload() {
    if (selected.size === 0) {
      await alertDialog("Selecione ao menos um dado para baixar.");
      return;
    }
    setDownloading(true);
    try {
      const params = new URLSearchParams({ sections: Array.from(selected).join(",") });
      if (from || to) {
        if (from) params.set("from", from);
        if (to) params.set("to", to);
      } else {
        params.set("period", period);
      }
      if (userFilter) params.set("user", userFilter);

      const res = await fetch(`/api/admin/relatorios/export?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        await alertDialog(body.error ?? "Não foi possível gerar o relatório.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch {
      await alertDialog("Não foi possível gerar o relatório. Tente novamente.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          backgroundColor: "var(--admin-surface)",
          color: "var(--admin-text)",
          border: "1px solid var(--admin-border-strong)",
          borderRadius: "0.625rem",
          padding: "0.5rem 1rem",
          fontSize: "0.8125rem",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        <Download size={15} /> Baixar relatório (Excel)
      </button>

      {open && (
        <div
          onClick={() => !downloading && setOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(13,27,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", zIndex: 400 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", borderRadius: "1rem", maxWidth: "460px", width: "100%", maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <div style={{ padding: "1.25rem 1.5rem 1rem", borderBottom: "1px solid var(--admin-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: 800 }}>Baixar relatório</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--admin-faint)" }}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-scroll" style={{ padding: "1.25rem 1.5rem", overflowY: "auto", flex: 1 }}>
              <p style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginTop: 0, marginBottom: "1.125rem" }}>
                Escolha o que incluir no arquivo. Cada item vira uma aba na planilha, considerando o período/filtro selecionado nesta página.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {SECTIONS.map((s) => (
                  <label key={s.key} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={selected.has(s.key)} onChange={() => toggle(s.key)} style={{ marginTop: "0.1875rem", cursor: "pointer" }} />
                    <span>
                      <span style={{ display: "block", fontWeight: 700, fontSize: "0.875rem" }}>{s.label}</span>
                      <span style={{ display: "block", fontSize: "0.75rem", color: "var(--admin-faint)" }}>{s.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--admin-border)", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={downloading}
                style={{ backgroundColor: "var(--admin-surface-alt)", color: "var(--admin-text)", border: "none", borderRadius: "0.5rem", padding: "0.5rem 1.125rem", fontSize: "0.8125rem", fontWeight: 700, cursor: downloading ? "default" : "pointer" }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#4361EE", color: "white", border: "none", borderRadius: "0.5rem", padding: "0.5rem 1.125rem", fontSize: "0.8125rem", fontWeight: 700, cursor: downloading ? "default" : "pointer", opacity: downloading ? 0.7 : 1 }}
              >
                {downloading ? <Loader2 size={15} className="admin-spin" /> : <Download size={15} />}
                {downloading ? "Gerando..." : "Baixar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
