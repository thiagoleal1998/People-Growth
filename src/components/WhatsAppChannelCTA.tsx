"use client";

import { useLocale } from "next-intl";
import { MessageCircle } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

// The one WhatsApp Channel link reused by every CTA below — a broadcast
// channel (one-way, admin-posted updates), not the DM-style wa.me links
// SocialSidebar/Footer use for "talk to us".
export const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029VbEfvEx7tkj6vK9QhV2s";

const WHATSAPP_GREEN = "#25D366";

/** Fixed icon on every public page, all breakpoints — unlike SocialSidebar
 * (desktop-only, DM links) this is the one channel CTA that has to reach
 * mobile readers too. Sits above where CookieBanner lands so the two never
 * overlap even on first visit. */
export function WhatsAppChannelFloatingButton() {
  const locale = useLocale();
  return (
    <a
      href={WHATSAPP_CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={locale === "en" ? "Join our WhatsApp Channel" : "Entrar no nosso Canal do WhatsApp"}
      className="wa-channel-float"
      style={{
        position: "fixed",
        right: "1.25rem",
        bottom: "5.5rem",
        zIndex: 45,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "3.25rem",
        height: "3.25rem",
        borderRadius: "50%",
        backgroundColor: WHATSAPP_GREEN,
        color: "white",
        boxShadow: "0 6px 20px -4px rgba(37,211,102,0.55)",
      }}
    >
      <WhatsAppIcon size={26} />
      <style>{`
        .wa-channel-float { transition: transform 0.2s; }
        .wa-channel-float:hover { transform: scale(1.08); }
      `}</style>
    </a>
  );
}

/** Homepage banner — deliberately styled apart from AdBannerClient's
 * gradient (that one is paid advertiser space; this is our own promo, and
 * showing the same look right next to it would read as "which of these
 * two ads is real"). */
export function WhatsAppChannelBanner() {
  const locale = useLocale();
  return (
    <a
      href={WHATSAPP_CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.25rem",
        flexWrap: "wrap",
        textDecoration: "none",
        padding: "1.5rem 1.75rem",
        borderRadius: "1rem",
        background: "linear-gradient(135deg, #0a3d26, #0d1b2a)",
        border: "1px solid rgba(37,211,102,0.3)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "3rem", height: "3rem", borderRadius: "50%", backgroundColor: WHATSAPP_GREEN, flexShrink: 0 }}>
          <WhatsAppIcon size={24} />
        </span>
        <div>
          <h3 style={{ color: "white", fontWeight: 800, fontSize: "1.0625rem", marginBottom: "0.1875rem" }}>
            {locale === "en" ? "Follow Grupo Festina on WhatsApp" : "Acompanhe o Grupo Festina no WhatsApp"}
          </h3>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem" }}>
            {locale === "en" ? "Join our Channel for the news as it happens — no group, no spam." : "Entre no nosso Canal e receba as notícias em primeira mão — sem grupo, sem spam."}
          </p>
        </div>
      </div>
      <span
        style={{
          flexShrink: 0,
          backgroundColor: WHATSAPP_GREEN,
          color: "#0a3d26",
          fontWeight: 800,
          fontSize: "0.875rem",
          padding: "0.625rem 1.25rem",
          borderRadius: "9999px",
          whiteSpace: "nowrap",
        }}
      >
        {locale === "en" ? "Join Channel" : "Entrar no Canal"}
      </span>
    </a>
  );
}

/** Footer box, above the link columns — the footer is the one piece of
 * chrome every page shares, so this is the CTA's most reliable placement. */
export function WhatsAppChannelFooterBox() {
  const locale = useLocale();
  return (
    <a
      href={WHATSAPP_CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.875rem",
        textDecoration: "none",
        padding: "1rem 1.25rem",
        borderRadius: "0.75rem",
        backgroundColor: "rgba(37,211,102,0.08)",
        border: "1px solid rgba(37,211,102,0.25)",
        marginBottom: "2.5rem",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.5rem", height: "2.5rem", borderRadius: "50%", backgroundColor: WHATSAPP_GREEN, flexShrink: 0 }}>
        <WhatsAppIcon size={20} />
      </span>
      <span>
        <span style={{ display: "block", color: "white", fontWeight: 700, fontSize: "0.9375rem" }}>
          {locale === "en" ? "Join our WhatsApp Channel" : "Entre no nosso Canal do WhatsApp"}
        </span>
        <span style={{ display: "block", color: "rgba(255,255,255,0.55)", fontSize: "0.8125rem" }}>
          {locale === "en" ? "Breaking news and updates, straight from us" : "Notícias e novidades direto da fonte"}
        </span>
      </span>
    </a>
  );
}

/** Inline CTA on article pages, right where ShareButtons sits — the reader
 * just finished the article, the single most engaged moment to ask. */
export function WhatsAppChannelArticleCTA() {
  const locale = useLocale();
  return (
    <a
      href={WHATSAPP_CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.875rem",
        textDecoration: "none",
        padding: "1.125rem 1.25rem",
        borderRadius: "0.75rem",
        backgroundColor: "rgba(37,211,102,0.08)",
        border: "1px solid rgba(37,211,102,0.3)",
        marginTop: "1.5rem",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.75rem", height: "2.75rem", borderRadius: "50%", backgroundColor: WHATSAPP_GREEN, flexShrink: 0 }}>
        <MessageCircle size={22} color="white" fill="white" />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", color: "var(--site-text)", fontWeight: 700, fontSize: "0.9375rem" }}>
          {locale === "en" ? "Liked it? Follow Grupo Festina on WhatsApp" : "Gostou? Acompanhe o Grupo Festina no WhatsApp"}
        </span>
        <span style={{ display: "block", color: "var(--site-muted)", fontSize: "0.8125rem" }}>
          {locale === "en" ? "Join our Channel for more stories like this one" : "Entre no nosso Canal e receba mais matérias como essa"}
        </span>
      </span>
    </a>
  );
}
