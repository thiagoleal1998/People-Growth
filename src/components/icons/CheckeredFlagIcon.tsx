// A generic checkered-flag mark for the F1 tab — not the official "F1"
// wordmark, which is a registered trademark of Formula One Licensing BV
// with no freely/commercially licensable source found (the few PNG mirrors
// turned up are explicitly "personal/educational use only"). The checkered
// flag itself is a generic motorsport symbol, same reasoning as
// WhatsAppIcon/XIcon being small dedicated SVGs rather than a borrowed
// brand asset.
//
// Drawn as a fixed black/white grid (not `currentColor`) so it reads the
// same whether it sits on a light tint badge or a solid brand-colored
// pill — a monochrome icon would vanish against the latter.
export function CheckeredFlagIcon({ size = 20 }: { size?: number }) {
  const blackSquares = [
    [5, 3], [11, 3], [17, 3],
    [8, 6], [14, 6],
    [5, 9], [11, 9], [17, 9],
    [8, 12], [14, 12],
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="1" width="1.6" height="21" rx="0.5" fill="#1a1a1a" />
      <rect x="5" y="3" width="15" height="12" fill="#ffffff" stroke="#1a1a1a" strokeWidth="0.75" />
      {blackSquares.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" fill="#1a1a1a" />
      ))}
    </svg>
  );
}
