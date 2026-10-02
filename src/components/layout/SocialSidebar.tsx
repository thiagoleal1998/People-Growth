import { Instagram, Linkedin, Youtube } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { XIcon } from "@/components/icons/XIcon";

type Props = {
  instagram?: string;
  linkedin?: string;
  whatsapp?: string;
  youtube?: string;
  x?: string;
};

/** A fixed vertical strip of social icons on the right edge of the page —
 * only rendering the channels actually configured in Configurações (no
 * fabricated links for accounts that don't exist). Hidden below the same
 * breakpoint as the other fixed chrome (UtilityBar, CategoryNav) since a
 * floating edge strip has nowhere to go on a narrow screen without
 * covering real content. */
export function SocialSidebar({ instagram, linkedin, whatsapp, youtube, x }: Props) {
  const links = [
    instagram && { label: "Instagram", href: instagram, Icon: Instagram },
    linkedin && { label: "LinkedIn", href: linkedin, Icon: Linkedin },
    whatsapp && { label: "WhatsApp", href: `https://wa.me/${whatsapp.replace(/\D/g, "")}`, Icon: WhatsAppIcon },
    youtube && { label: "YouTube", href: youtube, Icon: Youtube },
    x && { label: "X", href: x, Icon: XIcon },
  ].filter((l): l is { label: string; href: string; Icon: typeof Instagram } => Boolean(l));

  if (links.length === 0) return null;

  return (
    <div
      className="social-sidebar"
      style={{
        position: "fixed",
        right: "1.25rem",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        gap: "0.625rem",
      }}
    >
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "50%",
            backgroundColor: "rgba(13,27,42,0.85)",
            color: "rgba(255,255,255,0.75)",
            transition: "background-color 0.2s, color 0.2s",
          }}
          className="social-sidebar-icon"
        >
          <Icon size={18} />
        </a>
      ))}

      <style>{`
        @media (max-width: 768px) {
          .social-sidebar { display: none !important; }
        }
        .social-sidebar-icon:hover {
          background-color: #4361EE !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
