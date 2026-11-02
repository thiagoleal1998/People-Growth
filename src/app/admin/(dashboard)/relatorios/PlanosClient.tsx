"use client";

import { useState, useTransition } from "react";
import { Instagram, Youtube, Music2, X as XIcon, Linkedin, MessageCircle, Plus, RefreshCw } from "lucide-react";
import { SectionCard, Field, Input, Select, Badge, ConfirmDeleteButton } from "@/components/admin/ui";
import { createGoal, updateGoal, deleteGoal, updateGoalStatus, createSocialAccount, updateSocialAccount, deleteSocialAccount, fetchAccountNow, setManualFollowerCount } from "./actions";
import type { Goal, SocialAccount } from "@/types/database.types";

export type GoalWithProgress = Goal & {
  currentValue: number;
  progressPct: number;
  daysTotal: number;
  daysElapsed: number;
  onTrack: "achieved" | "on_track" | "behind";
  socialAccountLabel: string | null;
};

export type AccountWithHistory = SocialAccount & {
  currentCount: number | null;
  currentSource: "api" | "scrape" | "manual" | null;
  currentFetchedAt: string | null;
  delta7d: number | null;
  delta30d: number | null;
};

const METRIC_LABELS: Record<Goal["metric"], string> = {
  page_views: "Visualizações de página",
  unique_visitors: "Visitantes únicos",
  leads: "Leads",
  newsletter_subs: "Inscritos na newsletter",
  social_followers: "Seguidores em rede social",
};

const PLATFORM_LABELS: Record<SocialAccount["platform"], string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  x: "X",
  linkedin: "LinkedIn",
  whatsapp: "Canal do WhatsApp",
};

// Same icon choices already used for these platforms in CalendarGrid.tsx —
// lucide has no literal TikTok glyph, Music2 stands in for it there too.
const PLATFORM_ICON: Record<SocialAccount["platform"], typeof Instagram> = {
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
  x: XIcon,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
};

const SOURCE_LABELS: Record<"api" | "scrape" | "manual", string> = { api: "via API", scrape: "via scrape", manual: "manual" };

// Small/pure — duplicated from relatorios/page.tsx rather than exported,
// same tradeoff that file's own comments make elsewhere for tiny helpers.
function formatRelativeTime(iso: string | null): string {
  if (!iso) return "nunca";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} minuto${minutes === 1 ? "" : "s"}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} hora${hours === 1 ? "" : "s"}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} dia${days === 1 ? "" : "s"}`;
  const months = Math.floor(days / 30);
  return `há ${months} ${months === 1 ? "mês" : "meses"}`;
}

function formatDelta(delta: number | null, label: string): string {
  if (delta == null) return `— ${label}`;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toLocaleString("pt-BR")} ${label}`;
}

function GoalCard({ goal, accounts, onChanged }: { goal: GoalWithProgress; accounts: AccountWithHistory[]; onChanged: () => void }) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(goal.title);
  const [metric, setMetric] = useState(goal.metric);
  const [socialAccountId, setSocialAccountId] = useState(goal.social_account_id ?? accounts[0]?.id ?? "");
  const [targetValue, setTargetValue] = useState(String(goal.target_value));
  const [targetDate, setTargetDate] = useState(goal.target_date);
  const [notes, setNotes] = useState(goal.notes ?? "");
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const badge =
    goal.onTrack === "achieved"
      ? { tone: "success" as const, label: "Atingida" }
      : goal.onTrack === "on_track"
        ? { tone: "neutral" as const, label: "No caminho" }
        : { tone: "warning" as const, label: "Atrás do previsto" };

  function handleSave() {
    setError(null);
    startSaving(async () => {
      try {
        await updateGoal(goal.id, {
          title,
          metric,
          socialAccountId: metric === "social_followers" ? socialAccountId : undefined,
          targetValue: Number(targetValue),
          targetDate,
          notes,
        });
        onChanged();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  }

  if (editing) {
    return (
      <div style={{ border: "1px solid var(--admin-border)", borderRadius: "0.75rem", padding: "1.25rem" }}>
        <Field label="Título">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Métrica">
          <Select value={metric} onChange={(e) => setMetric(e.target.value as Goal["metric"])}>
            {Object.entries(METRIC_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
        </Field>
        {metric === "social_followers" && (
          <Field label="Conta">
            <Select value={socialAccountId} onChange={(e) => setSocialAccountId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{PLATFORM_LABELS[a.platform]} · {a.display_name || a.handle}</option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Valor alvo">
          <Input type="number" min={1} value={targetValue} onChange={(e) => setTargetValue(e.target.value)} />
        </Field>
        <Field label="Prazo">
          <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </Field>
        <Field label="Notas (opcional)">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        {error && <div style={{ color: "#dc2626", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>{error}</div>}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" disabled={saving} onClick={handleSave} style={{ backgroundColor: "#315E9C", color: "white", padding: "0.4rem 0.875rem", borderRadius: "0.375rem", fontWeight: 700, fontSize: "0.8125rem", border: "none", cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button type="button" onClick={() => setEditing(false)} style={{ backgroundColor: "var(--admin-surface-alt)", color: "var(--admin-text)", padding: "0.4rem 0.875rem", borderRadius: "0.375rem", fontWeight: 700, fontSize: "0.8125rem", border: "1px solid var(--admin-border-strong)", cursor: "pointer" }}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid var(--admin-border)", borderRadius: "0.75rem", padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.625rem" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: "0.9375rem", color: "var(--admin-text)" }}>{goal.title}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)", marginTop: "0.125rem" }}>
            {METRIC_LABELS[goal.metric]}
            {goal.socialAccountLabel ? ` · ${goal.socialAccountLabel}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          <Badge tone={badge.tone}>{badge.label}</Badge>
          <button type="button" onClick={() => setEditing(true)} style={{ padding: "0.25rem", background: "none", border: "none", color: "var(--admin-muted)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 700 }}>
            Editar
          </button>
          <ConfirmDeleteButton confirmText={`Excluir a meta "${goal.title}"?`} onDelete={() => deleteGoal(goal.id, goal.title).then(onChanged)} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.375rem" }}>
        <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--admin-text)" }}>{goal.currentValue.toLocaleString("pt-BR")}</span>
        <span style={{ fontSize: "0.8125rem", color: "var(--admin-faint)" }}>meta: {goal.target_value.toLocaleString("pt-BR")}</span>
      </div>
      <div style={{ height: "0.5rem", borderRadius: "9999px", backgroundColor: "var(--admin-surface-alt)", overflow: "hidden", marginBottom: "0.5rem" }}>
        <div style={{ height: "100%", width: `${Math.max(goal.progressPct, 2)}%`, borderRadius: "9999px", backgroundColor: badge.tone === "warning" ? "#cc9200" : "#315E9C" }} />
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)" }}>
        {goal.progressPct}% · prazo {new Date(`${goal.target_date}T12:00:00`).toLocaleDateString("pt-BR")}
        {goal.onTrack !== "achieved" && ` · ${Math.max(0, goal.daysTotal - goal.daysElapsed)} dia(s) restantes`}
      </div>

      {goal.onTrack !== "achieved" && goal.currentValue >= goal.target_value && (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => updateGoalStatus(goal.id, "achieved", goal.title).then(onChanged))}
          style={{ marginTop: "0.75rem", background: "none", border: "none", color: "#315E9C", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", padding: 0 }}
        >
          Marcar como atingida
        </button>
      )}
    </div>
  );
}

function NewGoalForm({ accounts, onCreated }: { accounts: AccountWithHistory[]; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [metric, setMetric] = useState<Goal["metric"]>("page_views");
  const [socialAccountId, setSocialAccountId] = useState(accounts[0]?.id ?? "");
  const [targetValue, setTargetValue] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await createGoal({
          title,
          metric,
          socialAccountId: metric === "social_followers" ? socialAccountId : undefined,
          targetValue: Number(targetValue),
          targetDate,
          notes,
        });
        setTitle("");
        setTargetValue("");
        setTargetDate("");
        setNotes("");
        onCreated();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  }

  const canSubmit = title.trim() && Number(targetValue) > 0 && targetDate && (metric !== "social_followers" || socialAccountId);

  return (
    <SectionCard title="Nova meta" subtitle="Defina um alvo — o progresso é calculado a partir de dado real do site.">
      <Field label="Título">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: 50 mil visualizações até dezembro" />
      </Field>
      <Field label="Métrica">
        <Select value={metric} onChange={(e) => setMetric(e.target.value as Goal["metric"])}>
          {Object.entries(METRIC_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
      </Field>
      {metric === "social_followers" && (
        <Field label="Conta" hint={accounts.length === 0 ? "Cadastre uma conta em \"Contas monitoradas\" primeiro." : undefined}>
          <Select value={socialAccountId} onChange={(e) => setSocialAccountId(e.target.value)} disabled={accounts.length === 0}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{PLATFORM_LABELS[a.platform]} · {a.display_name || a.handle}</option>
            ))}
          </Select>
        </Field>
      )}
      <Field label="Valor alvo">
        <Input type="number" min={1} value={targetValue} onChange={(e) => setTargetValue(e.target.value)} />
      </Field>
      <Field label="Prazo">
        <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
      </Field>
      <Field label="Notas (opcional)">
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      {error && <div style={{ color: "#dc2626", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>{error}</div>}
      <button
        type="button"
        disabled={pending || !canSubmit}
        onClick={submit}
        style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#315E9C", color: "white", padding: "0.625rem 1.25rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: pending || !canSubmit ? "default" : "pointer", opacity: pending || !canSubmit ? 0.6 : 1 }}
      >
        <Plus size={15} /> {pending ? "Salvando..." : "Adicionar meta"}
      </button>
    </SectionCard>
  );
}

function AccountRow({ account, onLocalUpdate, onDeleted, onChanged }: { account: AccountWithHistory; onLocalUpdate: (next: Partial<AccountWithHistory>) => void; onDeleted: () => void; onChanged: () => void }) {
  const [fetching, startFetching] = useTransition();
  const [manualValue, setManualValue] = useState("");
  const [savingManual, startManual] = useTransition();
  const [rowError, setRowError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [handle, setHandle] = useState(account.handle);
  const [displayName, setDisplayName] = useState(account.display_name ?? "");
  const [externalId, setExternalId] = useState(account.external_id ?? "");
  const [profileUrl, setProfileUrl] = useState(account.profile_url ?? "");
  const [savingEdit, startSavingEdit] = useTransition();
  const [editError, setEditError] = useState<string | null>(null);
  const Icon = PLATFORM_ICON[account.platform];

  function handleSaveEdit() {
    setEditError(null);
    startSavingEdit(async () => {
      try {
        await updateSocialAccount(account.id, { handle, displayName, externalId, profileUrl, isActive: account.is_active });
        onChanged();
      } catch (err) {
        setEditError(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  }

  function handleFetchNow() {
    setRowError(null);
    startFetching(async () => {
      const result = await fetchAccountNow(account.id);
      if (result.ok) {
        onLocalUpdate({ currentCount: result.count, currentSource: result.source, currentFetchedAt: new Date().toISOString(), last_fetch_error: null });
      } else {
        setRowError(result.error);
        onLocalUpdate({ last_fetch_error: result.error });
      }
    });
  }

  function handleManualSave() {
    const count = Number(manualValue);
    if (!Number.isFinite(count) || count < 0) return;
    setRowError(null);
    startManual(async () => {
      try {
        await setManualFollowerCount(account.id, count);
        onLocalUpdate({ currentCount: Math.round(count), currentSource: "manual", currentFetchedAt: new Date().toISOString(), last_fetch_error: null });
        setManualValue("");
      } catch (err) {
        setRowError(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  }

  if (editing) {
    return (
      <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--admin-border)" }}>
        <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ minWidth: "140px" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-text-secondary)", marginBottom: "0.25rem" }}>Handle</label>
            <Input value={handle} onChange={(e) => setHandle(e.target.value)} style={{ padding: "0.375rem 0.625rem", fontSize: "0.8125rem" }} />
          </div>
          <div style={{ minWidth: "160px" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-text-secondary)", marginBottom: "0.25rem" }}>Nome de exibição</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ padding: "0.375rem 0.625rem", fontSize: "0.8125rem" }} />
          </div>
          <div style={{ minWidth: "140px" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-text-secondary)", marginBottom: "0.25rem" }}>ID externo</label>
            <Input value={externalId} onChange={(e) => setExternalId(e.target.value)} style={{ padding: "0.375rem 0.625rem", fontSize: "0.8125rem" }} />
          </div>
          <div style={{ minWidth: "220px", flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-text-secondary)", marginBottom: "0.25rem" }}>URL do perfil</label>
            <Input value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)} placeholder="https://..." style={{ padding: "0.375rem 0.625rem", fontSize: "0.8125rem" }} />
          </div>
          <button type="button" disabled={savingEdit} onClick={handleSaveEdit} style={{ backgroundColor: "#315E9C", color: "white", padding: "0.4rem 0.875rem", borderRadius: "0.375rem", fontWeight: 700, fontSize: "0.8125rem", border: "none", cursor: savingEdit ? "default" : "pointer", opacity: savingEdit ? 0.6 : 1 }}>
            {savingEdit ? "Salvando..." : "Salvar"}
          </button>
          <button type="button" onClick={() => setEditing(false)} style={{ backgroundColor: "var(--admin-surface-alt)", color: "var(--admin-text)", padding: "0.4rem 0.875rem", borderRadius: "0.375rem", fontWeight: 700, fontSize: "0.8125rem", border: "1px solid var(--admin-border-strong)", cursor: "pointer" }}>
            Cancelar
          </button>
        </div>
        {editError && <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.5rem" }}>{editError}</div>}
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--admin-border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", flexWrap: "wrap" }}>
        <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", backgroundColor: "rgba(49, 94, 156,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={17} color="#315E9C" />
        </div>
        <div style={{ minWidth: "160px", flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: "0.9375rem", color: "var(--admin-text)" }}>{account.display_name || `@${account.handle}`}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)" }}>
            {PLATFORM_LABELS[account.platform]} · @{account.handle}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--admin-text)" }}>
            {account.currentCount != null ? `${account.currentSource === "scrape" ? "~" : ""}${account.currentCount.toLocaleString("pt-BR")}` : "—"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)" }}>
            {formatDelta(account.delta7d, "(7d)")} · {formatDelta(account.delta30d, "(30d)")}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, minWidth: "140px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)" }}>
            {account.currentSource ? `${SOURCE_LABELS[account.currentSource]} · ${formatRelativeTime(account.currentFetchedAt)}` : "sem leitura ainda"}
          </div>
        </div>
        <button
          type="button"
          disabled={fetching}
          onClick={handleFetchNow}
          title="Buscar agora"
          style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.4rem 0.75rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border-strong)", backgroundColor: "var(--admin-surface-alt)", color: "var(--admin-text)", fontSize: "0.8125rem", fontWeight: 700, cursor: fetching ? "default" : "pointer", flexShrink: 0 }}
        >
          <RefreshCw size={13} className={fetching ? "admin-spin" : undefined} /> Buscar agora
        </button>
        <button type="button" onClick={() => setEditing(true)} style={{ padding: "0.4rem 0.75rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border-strong)", backgroundColor: "var(--admin-surface-alt)", color: "var(--admin-text)", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
          Editar
        </button>
        <ConfirmDeleteButton confirmText={`Remover a conta "${account.handle}"?`} onDelete={() => deleteSocialAccount(account.id, account.handle).then(onDeleted)} />
      </div>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.625rem", marginLeft: "3.125rem" }}>
        <Input
          type="number"
          min={0}
          placeholder="Inserir manualmente"
          value={manualValue}
          onChange={(e) => setManualValue(e.target.value)}
          style={{ width: "160px", padding: "0.375rem 0.625rem", fontSize: "0.8125rem" }}
        />
        <button
          type="button"
          disabled={savingManual || !manualValue}
          onClick={handleManualSave}
          style={{ padding: "0.375rem 0.75rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border-strong)", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", fontSize: "0.8125rem", fontWeight: 700, cursor: savingManual || !manualValue ? "default" : "pointer", opacity: savingManual || !manualValue ? 0.6 : 1 }}
        >
          Salvar
        </button>
      </div>

      {(rowError || (account.last_fetch_error && account.currentSource !== "manual")) && (
        <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.5rem", marginLeft: "3.125rem" }}>
          última tentativa falhou: {rowError || account.last_fetch_error}
        </div>
      )}
    </div>
  );
}

function NewAccountForm({ onCreated }: { onCreated: () => void }) {
  const [platform, setPlatform] = useState<SocialAccount["platform"]>("instagram");
  const [handle, setHandle] = useState("");
  const [externalId, setExternalId] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await createSocialAccount({ platform, handle, externalId: externalId || undefined, profileUrl: profileUrl || undefined });
        setHandle("");
        setExternalId("");
        setProfileUrl("");
        onCreated();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  }

  return (
    <SectionCard title="Nova conta" subtitle="Cadastre a conta antes de buscar ou inserir seguidores.">
      <Field label="Plataforma">
        <Select value={platform} onChange={(e) => setPlatform(e.target.value as SocialAccount["platform"])}>
          {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
      </Field>
      <Field label="Handle" hint="Sem @ — ex: grupofestina">
        <Input value={handle} onChange={(e) => setHandle(e.target.value)} />
      </Field>
      <Field label="URL do perfil (opcional)" hint={platform === "youtube" ? "Cole o link exato do canal se a busca pelo handle não achar (ex: canais com URL antiga /c/... ou /user/...)." : "Só pra referência — não usado na busca automática."}>
        <Input value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)} placeholder="https://..." />
      </Field>
      <Field
        label="ID externo (opcional)"
        hint={
          platform === "youtube"
            ? "Não precisa — a busca já funciona só com o handle, sem chave nenhuma (número aproximado; pra número exato, Channel ID aqui + YOUTUBE_API_KEY)."
            : platform === "instagram"
              ? "Instagram bloqueia a leitura automática sem login — só funciona com a API oficial do Meta (ID da conta Business aqui) ou entrada manual."
              : "Sem leitura automática pra essa rede — use a entrada manual abaixo."
        }
      >
        <Input value={externalId} onChange={(e) => setExternalId(e.target.value)} />
      </Field>
      {error && <div style={{ color: "#dc2626", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>{error}</div>}
      <button
        type="button"
        disabled={pending || !handle.trim()}
        onClick={submit}
        style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#315E9C", color: "white", padding: "0.625rem 1.25rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: pending || !handle.trim() ? "default" : "pointer", opacity: pending || !handle.trim() ? 0.6 : 1 }}
      >
        <Plus size={15} /> {pending ? "Salvando..." : "Adicionar conta"}
      </button>
    </SectionCard>
  );
}

export function PlanosClient({ goals: initialGoals, accounts: initialAccounts }: { goals: GoalWithProgress[]; accounts: AccountWithHistory[] }) {
  const goals = initialGoals;
  const [accounts, setAccounts] = useState(initialAccounts);

  // Goal progress/deltas depend on a server-side recompute (current value
  // vs. target, 7d/30d snapshot deltas) that a client-side patch can't
  // reproduce correctly — a full reload is simpler and good enough here
  // (create/delete goal or account are infrequent actions). The "Buscar
  // agora"/manual-entry local patches below cover the frequent action
  // (checking a count) without needing a reload.
  function reloadFromServer() {
    window.location.reload();
  }

  function updateAccountLocal(id: string, patch: Partial<AccountWithHistory>) {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "1rem" }}>Metas</h2>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 380px) 1fr", gap: "1.5rem", alignItems: "start" }} className="planos-grid">
          <NewGoalForm accounts={accounts} onCreated={reloadFromServer} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: "1rem" }}>
            {goals.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.875rem", border: "1px dashed var(--admin-border)", borderRadius: "0.75rem" }}>Nenhuma meta cadastrada ainda.</div>
            ) : (
              goals.map((g) => <GoalCard key={g.id} goal={g} accounts={accounts} onChanged={reloadFromServer} />)
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "1rem" }}>Contas monitoradas</h2>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 380px) 1fr", gap: "1.5rem", alignItems: "start" }} className="planos-grid">
          <NewAccountForm onCreated={reloadFromServer} />
          <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", overflow: "hidden" }}>
            {accounts.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.875rem" }}>Nenhuma conta cadastrada ainda.</div>
            ) : (
              accounts.map((a) => (
                <AccountRow
                  key={a.id}
                  account={a}
                  onLocalUpdate={(patch) => updateAccountLocal(a.id, patch)}
                  onDeleted={() => setAccounts((prev) => prev.filter((x) => x.id !== a.id))}
                  onChanged={reloadFromServer}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .planos-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
