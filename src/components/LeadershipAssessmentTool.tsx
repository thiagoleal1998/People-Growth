"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, Printer } from "lucide-react";
import { COMPETENCIES, computeAssessment, type CompetencyRatings, type CompetencyRating } from "@/lib/leadership-assessment";
import { LeadershipNineBox } from "@/components/LeadershipNineBox";

type Status = "idle" | "loading" | "error" | "rate-limited";
type ApiResult = ReturnType<typeof computeAssessment>;

const inputStyle = {
  width: "100%",
  padding: "0.625rem 0.875rem",
  borderRadius: "0.625rem",
  border: "1px solid var(--site-border-strong)",
  fontSize: "0.875rem",
  color: "var(--site-text)",
  backgroundColor: "var(--site-card)",
  boxSizing: "border-box" as const,
  fontFamily: "inherit",
};

function toLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

// The public layout has several position:fixed pieces (currency/weather
// ticker, navbar, category nav, the floating social icons, cookie banner)
// that aren't covered by a single "hide the header/footer" rule and would
// otherwise repeat on every printed page. Hiding everything except the
// report itself (rather than enumerating each fixed element) is the
// robust fix. Colors are also forced to a fixed light palette instead of
// the theme CSS variables, since --site-* resolves to light text on a
// dark card when the visitor's site theme is dark — unreadable on paper.
function printReport(evaluatedName: string) {
  const safeName = evaluatedName.trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || "Resultado";
  const previousTitle = document.title;
  document.title = `Diagnostico-Lideranca-${safeName}`;
  const restore = () => {
    document.title = previousTitle;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  window.print();
}

export function LeadershipAssessmentTool() {
  const t = useTranslations("leadershipTool");
  const locale = useLocale();
  const [step, setStep] = useState(1);

  const [evaluatedName, setEvaluatedName] = useState("");
  const [evaluatedRole, setEvaluatedRole] = useState("");
  const [evaluatorName, setEvaluatorName] = useState("");

  const [ratings, setRatings] = useState<CompetencyRatings>({});
  const [strengths, setStrengths] = useState("");
  const [developmentNeeds, setDevelopmentNeeds] = useState("");
  const [developmentPlan, setDevelopmentPlan] = useState("");
  const [nextActions, setNextActions] = useState("");

  const [shortTerm, setShortTerm] = useState("");
  const [mediumTerm, setMediumTerm] = useState("");
  const [longTerm, setLongTerm] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [renderedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ApiResult | null>(null);

  const allRated = COMPETENCIES.every((c) => ratings[c.key] != null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/tools/leadership-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          website,
          renderedAt,
          evaluatedName,
          evaluatedRole,
          evaluatorName,
          competencies: ratings,
          strengths,
          developmentNeeds,
          developmentPlan,
          nextActions,
          milestones: { short: toLines(shortTerm), medium: toLines(mediumTerm), long: toLines(longTerm) },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResult(data);
        setStatus("idle");
        setStep(5);
      } else if (res.status === 429) {
        setStatus("rate-limited");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (step === 5 && result) {
    const quadrantLabelText = locale === "en" ? result.quadrant.labelEn : result.quadrant.labelPt;
    return (
      <div className="leadership-report-print">
        <style>{`
          @media print {
            html, body { background: white !important; }
            body * { visibility: hidden; }
            .leadership-report-print, .leadership-report-print * { visibility: visible; }
            .leadership-report-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
              margin: 0;
            }
            .leadership-report-print .no-print { display: none !important; }
            .leadership-report-print > div { break-inside: avoid; page-break-inside: avoid; }
            .leadership-report-print, .leadership-report-print * {
              color: #0d1b2a !important;
              background-color: white !important;
              border-color: #d6dbe3 !important;
              box-shadow: none !important;
            }
          }
        `}</style>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.25rem" }}>{t("resultTitle")}</h2>
        <p style={{ fontSize: "0.9375rem", color: "var(--site-muted)", marginBottom: "1.75rem" }}>
          {t("resultFor")} <strong>{evaluatedName}</strong>
          {evaluatedRole ? ` — ${evaluatedRole}` : ""}
        </p>

        <div style={{ backgroundColor: "var(--site-card)", border: "1px solid var(--site-border)", borderRadius: "1.25rem", padding: "1.75rem", marginBottom: "1.5rem", display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center", justifyContent: "center" }}>
          <LeadershipNineBox
            performanceScore={result.performanceScore}
            behaviorScore={result.behaviorScore}
            personLabel={evaluatedName}
            legendMark={result.quadrant.legendMark}
            locale={locale}
          />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--site-faint)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>{t("quadrantLabel")}</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--site-text)" }}>
              {result.quadrant.legendMark} {quadrantLabelText}
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "var(--site-card)", border: "1px solid var(--site-border)", borderRadius: "1.25rem", padding: "1.75rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "1rem" }}>{t("competenciesSummaryTitle")}</h3>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {COMPETENCIES.map((c) => (
              <div key={c.key} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", fontSize: "0.875rem", borderBottom: "1px solid var(--site-border)", paddingBottom: "0.5rem" }}>
                <span style={{ color: "var(--site-muted)" }}>{locale === "en" ? c.labelEn : c.labelPt}</span>
                <span style={{ fontWeight: 700, color: "var(--site-text)" }}>
                  {ratingLabel(ratings[c.key], t)}
                </span>
              </div>
            ))}
          </div>
          {strengths && <SummaryText label={t("strengthsLabel")} value={strengths} />}
          {developmentNeeds && <SummaryText label={t("developmentNeedsLabel")} value={developmentNeeds} />}
          {developmentPlan && <SummaryText label={t("developmentPlanLabel")} value={developmentPlan} />}
          {nextActions && <SummaryText label={t("nextActionsLabel")} value={nextActions} />}
        </div>

        <div style={{ backgroundColor: "var(--site-card)", border: "1px solid var(--site-border)", borderRadius: "1.25rem", padding: "1.75rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "1rem" }}>{t("milestonesSummaryTitle")}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem" }}>
            <MilestoneColumn title={t("shortTerm")} items={toLines(shortTerm)} />
            <MilestoneColumn title={t("mediumTerm")} items={toLines(mediumTerm)} />
            <MilestoneColumn title={t("longTerm")} items={toLines(longTerm)} />
          </div>
        </div>

        <div className="no-print" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => printReport(evaluatedName)}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#4361EE", color: "white", fontWeight: 700, fontSize: "0.875rem", padding: "0.75rem 1.25rem", borderRadius: "0.625rem", border: "none", cursor: "pointer" }}
          >
            <Printer size={16} /> {t("printButton")}
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ background: "none", border: "none", color: "var(--site-muted)", fontSize: "0.875rem", cursor: "pointer" }}
          >
            {t("startOver")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--site-card)", border: "1px solid var(--site-border)", borderRadius: "1.25rem", padding: "2rem" }}>
      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--site-faint)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "1.5rem" }}>
        {t("stepOf", { current: step, total: 4 })}
      </div>

      {step === 1 && (
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "1.25rem" }}>{t("step1Title")}</h2>
          <FieldBlock label={t("evaluatedName")}>
            <input style={inputStyle} value={evaluatedName} onChange={(e) => setEvaluatedName(e.target.value)} required />
          </FieldBlock>
          <FieldBlock label={t("evaluatedRole")}>
            <input style={inputStyle} value={evaluatedRole} onChange={(e) => setEvaluatedRole(e.target.value)} />
          </FieldBlock>
          <FieldBlock label={t("evaluatorName")}>
            <input style={inputStyle} value={evaluatorName} onChange={(e) => setEvaluatorName(e.target.value)} />
          </FieldBlock>
          <StepNav onNext={() => setStep(2)} nextDisabled={!evaluatedName.trim()} nextLabel={t("next")} />
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.25rem" }}>{t("step2Title")}</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--site-muted)", marginBottom: "1.25rem" }}>{t("step2Subtitle")}</p>

          <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
            {COMPETENCIES.map((c) => (
              <div key={c.key}>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--site-text)", marginBottom: "0.375rem" }}>{locale === "en" ? c.labelEn : c.labelPt}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                  {([1, 2, 3] as CompetencyRating[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRatings((prev) => ({ ...prev, [c.key]: r }))}
                      style={{
                        padding: "0.5rem 0.375rem",
                        borderRadius: "0.5rem",
                        border: ratings[c.key] === r ? "2px solid #4361EE" : "1px solid var(--site-border-strong)",
                        backgroundColor: ratings[c.key] === r ? "rgba(67,97,238,0.08)" : "var(--site-card)",
                        color: "var(--site-text)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {ratingLabel(r, t)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <FieldBlock label={t("strengthsLabel")}>
            <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2} placeholder={t("strengthsPlaceholder")} value={strengths} onChange={(e) => setStrengths(e.target.value)} />
          </FieldBlock>
          <FieldBlock label={t("developmentNeedsLabel")}>
            <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2} placeholder={t("developmentNeedsPlaceholder")} value={developmentNeeds} onChange={(e) => setDevelopmentNeeds(e.target.value)} />
          </FieldBlock>
          <FieldBlock label={t("developmentPlanLabel")}>
            <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2} placeholder={t("developmentPlanPlaceholder")} value={developmentPlan} onChange={(e) => setDevelopmentPlan(e.target.value)} />
          </FieldBlock>
          <FieldBlock label={t("nextActionsLabel")}>
            <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2} placeholder={t("nextActionsPlaceholder")} value={nextActions} onChange={(e) => setNextActions(e.target.value)} />
          </FieldBlock>

          <StepNav onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!allRated} nextLabel={t("next")} backLabel={t("back")} />
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.25rem" }}>{t("step3Title")}</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--site-muted)", marginBottom: "1.25rem" }}>{t("step3Subtitle")}</p>
          <FieldBlock label={t("shortTerm")}>
            <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} placeholder={t("milestonesPlaceholder")} value={shortTerm} onChange={(e) => setShortTerm(e.target.value)} />
          </FieldBlock>
          <FieldBlock label={t("mediumTerm")}>
            <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} placeholder={t("milestonesPlaceholder")} value={mediumTerm} onChange={(e) => setMediumTerm(e.target.value)} />
          </FieldBlock>
          <FieldBlock label={t("longTerm")}>
            <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} placeholder={t("milestonesPlaceholder")} value={longTerm} onChange={(e) => setLongTerm(e.target.value)} />
          </FieldBlock>
          <StepNav onBack={() => setStep(2)} onNext={() => setStep(4)} nextLabel={t("next")} backLabel={t("back")} />
        </div>
      )}

      {step === 4 && (
        <form onSubmit={handleSubmit}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.25rem" }}>{t("step4Title")}</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--site-muted)", marginBottom: "1.25rem" }}>{t("step4Subtitle")}</p>

          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
          />

          <FieldBlock label={t("yourName")}>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} required />
          </FieldBlock>
          <FieldBlock label={t("yourEmail")}>
            <input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </FieldBlock>
          <p style={{ fontSize: "0.75rem", color: "var(--site-faint)", marginBottom: "1.25rem" }}>{t("privacyNote")}</p>

          {status === "error" && <p style={{ color: "#ef4444", fontSize: "0.8125rem", marginBottom: "1rem" }}>{t("genericError")}</p>}
          {status === "rate-limited" && <p style={{ color: "#ef4444", fontSize: "0.8125rem", marginBottom: "1rem" }}>{t("genericError")}</p>}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => setStep(3)}
              style={{ padding: "0.75rem 1rem", background: "none", border: "1px solid var(--site-border-strong)", borderRadius: "0.625rem", color: "var(--site-muted)", fontSize: "0.875rem", cursor: "pointer" }}
            >
              {t("back")}
            </button>
            <button
              type="submit"
              disabled={status === "loading"}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", backgroundColor: "#4361EE", color: "white", fontWeight: 700, fontSize: "0.875rem", padding: "0.75rem", borderRadius: "0.625rem", border: "none", cursor: status === "loading" ? "default" : "pointer", opacity: status === "loading" ? 0.7 : 1 }}
            >
              {status === "loading" && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
              {status === "loading" ? t("submitting") : t("submit")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function ratingLabel(r: CompetencyRating | undefined, t: ReturnType<typeof useTranslations>): string {
  if (r === 1) return t("ratingBelow");
  if (r === 2) return t("ratingMeets");
  if (r === 3) return t("ratingExcellent");
  return "";
}

function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--site-text)", marginBottom: "0.375rem" }}>{label}</label>
      {children}
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
  nextDisabled,
  nextLabel,
  backLabel,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel: string;
  backLabel?: string;
}) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{ padding: "0.75rem 1rem", background: "none", border: "1px solid var(--site-border-strong)", borderRadius: "0.625rem", color: "var(--site-muted)", fontSize: "0.875rem", cursor: "pointer" }}
        >
          {backLabel}
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        style={{ flex: 1, backgroundColor: "#4361EE", color: "white", fontWeight: 700, fontSize: "0.875rem", padding: "0.75rem", borderRadius: "0.625rem", border: "none", cursor: nextDisabled ? "default" : "pointer", opacity: nextDisabled ? 0.5 : 1 }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

function SummaryText({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginTop: "1rem" }}>
      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--site-faint)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>{label}</div>
      <p style={{ fontSize: "0.875rem", color: "var(--site-text)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{value}</p>
    </div>
  );
}

function MilestoneColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--site-faint)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.5rem" }}>{title}</div>
      {items.length === 0 ? (
        <p style={{ fontSize: "0.8125rem", color: "var(--site-faint)" }}>—</p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: "1.125rem", fontSize: "0.8125rem", color: "var(--site-text)", lineHeight: 1.6 }}>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
