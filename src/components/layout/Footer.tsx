import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { Linkedin, Mail, Instagram } from "lucide-react";
import { ErrorReportButton } from "@/components/ErrorReportButton";

export function Footer({ logoUrl, contactEmail }: { logoUrl?: string | null; contactEmail?: string }) {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: "#0d1b2a",
        color: "rgba(255,255,255,0.7)",
        paddingTop: "4rem",
        paddingBottom: "2rem",
      }}
    >
      <div className="container-xl">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2.5rem",
            paddingBottom: "3rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Brand */}
          <div>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="People & Growth" style={{ height: "3rem", width: "auto", marginBottom: "0.75rem" }} />
            ) : (
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  background: "linear-gradient(135deg, #4361EE, #06D6A0)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "0.75rem",
                }}
              >
                People &amp; Growth
              </div>
            )}
            <p style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>{t("tagline")}</p>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
              <a
                href="https://www.linkedin.com/in/thiagoleal98/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                style={{ color: "rgba(255,255,255,0.6)", transition: "color 0.2s" }}
              >
                <Linkedin size={20} />
              </a>
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  aria-label="Email"
                  style={{ color: "rgba(255,255,255,0.6)", transition: "color 0.2s" }}
                >
                  <Mail size={20} />
                </a>
              )}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                style={{ color: "rgba(255,255,255,0.6)", transition: "color 0.2s" }}
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Nav links */}
          <div>
            <h4 style={{ color: "white", fontWeight: 600, fontSize: "0.875rem", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Navegação
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {[
                { key: "home", href: "/" as const },
                { key: "about", href: "/sobre" as const },
                { key: "services", href: "/servicos" as const },
                { key: "portfolio", href: "/portfolio" as const },
                { key: "newsletter", href: "/mea-sententia" as const },
                { key: "media", href: "/na-midia" as const },
                { key: "contact", href: "/contato" as const },
              ].map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    style={{ fontSize: "0.875rem", transition: "color 0.2s" }}
                  >
                    {nav(key as keyof typeof nav)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ color: "white", fontWeight: 600, fontSize: "0.875rem", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Serviços
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {["Consultoria Estratégica", "Marketing Digital", "Growth", "Business Intelligence", "IA para Negócios", "Treinamentos"].map((item) => (
                <li key={item}>
                  <Link href="/servicos" style={{ fontSize: "0.875rem", transition: "color 0.2s" }}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 style={{ color: "white", fontWeight: 600, fontSize: "0.875rem", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Recursos
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {[
                { label: "Mea Sententia", href: "/mea-sententia" as const },
                { label: "Recursos Gratuitos", href: "/recursos" as const },
                { label: "Cursos", href: "/cursos" as const },
                { label: "Laboratório IA", href: "/laboratorio-ia" as const },
                { label: "Ferramentas", href: "/ferramentas" as const },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} style={{ fontSize: "0.875rem", transition: "color 0.2s" }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "1.5rem",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <p style={{ fontSize: "0.8125rem" }}>
            © {year} People &amp; Growth. {t("rights")}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <Link href="/normas-de-seguranca-e-privacidade" style={{ fontSize: "0.8125rem" }}>
              {t("privacy")}
            </Link>
            <Link href="/termos-de-uso" style={{ fontSize: "0.8125rem" }}>
              {t("terms")}
            </Link>
            <Link href="/direitos-autorais" style={{ fontSize: "0.8125rem" }}>
              Aviso de Direitos Autorais
            </Link>
            <Link href="/cookies" style={{ fontSize: "0.8125rem" }}>
              Cookies
            </Link>
            <NextLink href="/admin" style={{ fontSize: "0.8125rem", color: "inherit" }}>
              Área Administrativa
            </NextLink>
            <ErrorReportButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
