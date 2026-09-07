import { Instagram, Linkedin } from "lucide-react";

// Lucide has no WhatsApp brand icon — duplicated from the identical inline
// SVG already used by ShareButtons.tsx rather than exporting it from there,
// since that file has an unrelated pre-existing lint issue not worth
// dragging into this change by touching it.
function WhatsAppIcon({ size = 18 }: { size?: number }) {
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

type Props = {
  instagram?: string;
  linkedin?: string;
  whatsapp?: string;
};

/** A fixed vertical strip of social icons on the right edge of the page —
 * only rendering the channels actually configured in Configurações (no
 * fabricated links for accounts that don't exist). Hidden below the same
 * breakpoint as the other fixed chrome (UtilityBar, CategoryNav) since a
 * floating edge strip has nowhere to go on a narrow screen without
 * covering real content. */
export function SocialSidebar({ instagram, linkedin, whatsapp }: Props) {
  const links = [
    instagram && { label: "Instagram", href: instagram, Icon: Instagram },
    linkedin && { label: "LinkedIn", href: linkedin, Icon: Linkedin },
    whatsapp && { label: "WhatsApp", href: `https://wa.me/${whatsapp.replace(/\D/g, "")}`, Icon: WhatsAppIcon },
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
