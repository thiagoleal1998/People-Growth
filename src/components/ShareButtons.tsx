"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Linkedin, Twitter, Link2, Check } from "lucide-react";

export function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

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

  const links = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      color: "#25D366",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      color: "#0077B5",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "X",
      icon: Twitter,
      color: "#0d1b2a",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginTop: "2.5rem" }}>
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
        {copied ? <Check size={16} color="#04a87d" /> : <Link2 size={16} />}
      </button>
    </div>
  );
}
