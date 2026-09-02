export function renderMarkdownLite(text: string): string {
  let html = text
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.5rem;font-weight:800;color:var(--site-text);margin:2rem 0 1rem">$1</h2>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#4361EE;font-weight:600;text-decoration:underline">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;color:var(--site-text)">$1</strong>');

  // Consecutive "1. …" lines become an <ol>
  html = html.replace(/(?:^\d+\.\s+.+$\n?)+/gm, (block) => {
    const items = block.trim().split("\n").map((line) => line.replace(/^\d+\.\s+/, ""));
    return `<ol style="padding-left:1.5rem;margin:1rem 0;display:flex;flex-direction:column;gap:0.75rem">${items
      .map((i) => `<li>${i}</li>`)
      .join("")}</ol>`;
  });

  // Consecutive "- …" lines become a <ul>
  html = html.replace(/(?:^-\s+.+$\n?)+/gm, (block) => {
    const items = block.trim().split("\n").map((line) => line.replace(/^-\s+/, ""));
    return `<ul style="padding-left:1.5rem;margin:1rem 0">${items
      .map((i) => `<li style="margin-bottom:0.5rem">${i}</li>`)
      .join("")}</ul>`;
  });

  // Remaining blank-line-separated blocks become paragraphs
  return html
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h2|ul|ol)/.test(trimmed)) return trimmed;
      return `<p style="margin:0 0 1.25rem">${trimmed}</p>`;
    })
    .join("");
}
