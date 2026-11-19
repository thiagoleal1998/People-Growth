// Lucide has no TikTok brand icon. Shared by every place a TikTok link
// renders (SocialSidebar, Footer), same reasoning as WhatsAppIcon/XIcon.
export function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82c-1.003-1.03-1.564-2.41-1.564-3.82h-3.07v13.78c0 1.57-1.28 2.86-2.86 2.86a2.86 2.86 0 01-2.86-2.86 2.86 2.86 0 012.86-2.86c.3 0 .58.05.85.13v-3.12c-.28-.04-.56-.07-.85-.07A5.93 5.93 0 003.2 15.8a5.93 5.93 0 005.93 5.93 5.93 5.93 0 005.93-5.93V9.1a8.9 8.9 0 005.18 1.66V7.7a5.6 5.6 0 01-3.64-1.88z" />
    </svg>
  );
}
