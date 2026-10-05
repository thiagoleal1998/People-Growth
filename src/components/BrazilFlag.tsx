// The Brazilian flag, drawn as SVG so it renders the same everywhere (emoji flags
// show as letters on Windows). Marks the election block as Brazilian.
export function BrazilFlag({ width = 36 }: { width?: number }) {
  return (
    <svg width={width} height={width * 0.7} viewBox="0 0 40 28" role="img" aria-label="Bandeira do Brasil" style={{ borderRadius: "3px", flexShrink: 0, boxShadow: "0 0 0 1px rgba(0,0,0,0.08)" }}>
      <rect width="40" height="28" fill="#009C3B" />
      <polygon points="20,2.5 37.5,14 20,25.5 2.5,14" fill="#FFDF00" />
      <circle cx="20" cy="14" r="6.2" fill="#002776" />
    </svg>
  );
}
