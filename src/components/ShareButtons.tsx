"use client";

import { useEffect, useState } from "react";
import { Linkedin, Link2, Check } from "lucide-react";

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.499-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.723 1.467h.005c9.607 0 14.31-11.62 7.917-18.153zM12.06 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.238c.002-5.448 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.822 9.822 0 012.893 6.994c-.003 5.45-4.437 9.886-9.885 9.886z"
      />
    </svg>
  );
}

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function ShareButtons({ title, compact }: { title: string; compact?: boolean }) {
  const [url, setUrl] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // window only exists client-side; this runs during SSR too, so the read
    // has to happen in an effect — the microtask just defers the setState
    // call past the effect's own first synchronous line.
    Promise.resolve().then(() => setUrl(window.location.href));
  }, []);

  useEffect(() => {
    if (!url) return;
    // The real article URL (locale + format + category + slug) is long
    // enough to read badly inside a WhatsApp message, so the share text
    // uses a short /api/s/ link instead — same one every time for this
    // article, since the endpoint reuses an existing code for the same URL.
    // shareUrl stays empty (falling back to the real URL below) until this
    // resolves, never blocking the share on it.
    fetch("/api/short-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.code) setShareUrl(`${window.location.origin}/api/s/${data.code}`);
      })
      .catch(() => {
        /* keep the real URL as shareUrl */
      });
  }, [url]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable, no-op */
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  // WhatsApp's own share links (its "Share" button on an article, not just a
  // bare link someone pastes) use this exact shape: *bold title | brand*, a
  // blank line, "Leia mais: <short url>", a blank line, then a one-line
  // brand sign-off — the structure the user pointed at with CNN Brasil's
  // own WhatsApp channel messages ("Título | CNN Brasil" ... "Pense bem,
  // pense CNN"). *asterisks* are WhatsApp's own bold markdown, not ours.
  const whatsappText = `*${title} | Grupo Festina*\n\nLeia mais: ${shareUrl || url}\n\n*Grupo Festina — apressa-te devagar*`;

  const links = [
    {
      label: "WhatsApp",
      icon: WhatsAppIcon,
      color: "#25D366",
      href: `https://wa.me/?text=${encodeURIComponent(whatsappText)}`,
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      color: "#0077B5",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "X",
      icon: XIcon,
      color: "#0d1b2a",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginTop: compact ? 0 : "2.5rem", marginBottom: compact ? "1.5rem" : 0 }}>
      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--site-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Compartilhar
      </span>
      {links.map(({ label, icon: Icon, color, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Compartilhar no ${label}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "2.25rem",
            height: "2.25rem",
            borderRadius: "50%",
            backgroundColor: `${color}15`,
            color,
          }}
        >
          <Icon size={16} />
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copiar link"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.25rem",
          height: "2.25rem",
          borderRadius: "50%",
          backgroundColor: "var(--site-surface-alt)",
          color: "var(--site-muted)",
          border: "none",
          cursor: "pointer",
        }}
      >
        {copied ? <Check size={16} color="#A07B3B" /> : <Link2 size={16} />}
      </button>
    </div>
  );
}
