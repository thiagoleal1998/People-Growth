import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Bell } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/database.types";

export const revalidate = 300;

const palette = ["#4361EE", "#06D6A0", "#FFB703"];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "courses" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function CursosPage() {
  const t = await getTranslations("courses");
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("courses").select("*").neq("status", "draft").order("order");
  const courses = (data ?? []) as Course[];

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)", paddingTop: "6rem", paddingBottom: "5rem", color: "white", textAlign: "center" }}>
        <div className="container-xl" style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, marginBottom: "1rem" }}>{t("title")}</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.125rem", lineHeight: 1.7 }}>{t("subtitle")}</p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: "#f0f4f8" }}>
        <div className="container-xl">
          {courses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
              Nenhum curso cadastrado no momento.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.75rem" }}>
              {courses.map((course, i) => {
                const color = palette[i % palette.length];
                return (
                  <div key={course.id} style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "2rem", border: "1px solid rgba(0,0,0,0.06)", position: "relative", overflow: "hidden" }}>
                    {course.status === "coming_soon" && (
                      <div style={{ position: "absolute", top: "1rem", right: "1rem", backgroundColor: `${color}15`, color, padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700 }}>
                        {t("comingSoon")}
                      </div>
                    )}
                    <div
                      style={{
                        width: "3.5rem",
                        height: "3.5rem",
                        borderRadius: "0.875rem",
                        marginBottom: "1rem",
                        background: course.cover_image ? `url(${course.cover_image}) center/cover` : `${color}15`,
                      }}
                    />
                    {course.category && (
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{course.category}</div>
                    )}
                    <h3 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#0d1b2a", marginBottom: "0.625rem" }}>{course.title_pt}</h3>
                    {course.description_pt && (
                      <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "1.5rem" }}>{course.description_pt}</p>
                    )}
                    <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1.25rem" }}>
                      <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <Bell size={14} color={color} /> {t("notifyMe")}
                      </p>
                      <NewsletterForm compact />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
