import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { Linkedin, Mail, Instagram, Youtube } from "lucide-react";
import { ErrorReportButton } from "@/components/ErrorReportButton";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { XIcon } from "@/components/icons/XIcon";

type FooterProps = {
  logoUrl?: string | null;
  contactEmail?: string;
  linkedin?: string;
  instagram?: string;
  whatsapp?: string;
  youtube?: string;
  x?: string;
};

export function Footer({ logoUrl, contactEmail, linkedin, instagram, whatsapp, youtube, x }: FooterProps) {
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
            gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))",
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
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: "rgba(255,255,255,0.6)", transition: "color 0.2s" }}>
                  <Linkedin size={20} />
                </a>
              )}
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} aria-label="Email" style={{ color: "rgba(255,255,255,0.6)", transition: "color 0.2s" }}>
                  <Mail size={20} />
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: "rgba(255,255,255,0.6)", transition: "color 0.2s" }}>
                  <Instagram size={20} />
                </a>
              )}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={{ color: "rgba(255,255,255,0.6)", transition: "color 0.2s" }}>
                  <WhatsAppIcon size={20} />
                </a>
              )}
              {youtube && (
                <a href={youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" style={{ color: "rgba(255,255,255,0.6)", transition: "color 0.2s" }}>
                  <Youtube size={20} />
                </a>
              )}
              {x && (
                <a href={x} target="_blank" rel="noopener noreferrer" aria-label="X" style={{ color: "rgba(255,255,255,0.6)", transition: "color 0.2s" }}>
                  <XIcon size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Nav links */}
          <div>
            <h4 style={{ color: "white", fontWeight: 600, fontSize: "0.875rem", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t("navigation")}
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {[
                { key: "home", href: "/" as const },
                { key: "about", href: "/sobre" as const },
                { key: "services", href: "/servicos" as const },
                { key: "portfolio", href: "/portfolio" as const },
                { key: "newsletter", href: "/conteudo" as const },
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
              {t("services")}
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {["strategicConsulting", "digitalMarketing", "growth", "bi", "aiForBusiness", "training"].map((key) => (
                <li key={key}>
                  <Link href="/servicos" style={{ fontSize: "0.875rem", transition: "color 0.2s" }}>
                    {t(key as "strategicConsulting")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 style={{ color: "white", fontWeight: 600, fontSize: "0.875rem", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t("resources")}
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {[
                { label: "Mea Sententia", href: "/conteudo" as const },
                { label: t("freeResources"), href: "/recursos" as const },
                { label: nav("courses"), href: "/cursos" as const },
                { label: nav("aiLab"), href: "/laboratorio-ia" as const },
                { label: nav("tools"), href: "/ferramentas" as const },
                { label: "FAQ", href: "/faq" as const },
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
              {t("copyrightNotice")}
            </Link>
            <Link href="/cookies" style={{ fontSize: "0.8125rem" }}>
              Cookies
            </Link>
            <NextLink href="/admin" style={{ fontSize: "0.8125rem", color: "inherit" }}>
              {t("adminArea")}
            </NextLink>
            <ErrorReportButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
