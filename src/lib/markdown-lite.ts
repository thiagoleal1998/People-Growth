export function renderMarkdownLite(text: string): string {
  return text
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.5rem;font-weight:800;color:var(--site-text);margin:2rem 0 1rem">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;color:var(--site-text)">$1</strong>')
    .replace(/\n\n/g, '</p><p style="margin:0 0 1.25rem">')
    .replace(/^- (.+)$/gm, '<li style="margin-bottom:0.5rem">$1</li>')
    .replace(/(<li[^>]*>[\s\S]*?<\/li>)/g, '<ul style="padding-left:1.5rem;margin:1rem 0">$1</ul>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="margin-bottom:0.5rem"><strong>$2</strong></li>')
    .replace(/^(.+)$/, '<p style="margin:0 0 1.25rem">$1');
}
