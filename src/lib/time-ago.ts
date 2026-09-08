export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

  if (seconds < 60) return "agora mesmo";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} hora${hours === 1 ? "" : "s"}`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} dia${days === 1 ? "" : "s"}`;

  // Pinned timezone: this runs inside "use client" components that Next.js
  // both server-renders and hydrates — with no explicit timeZone, the date
  // formats in UTC on the server but the visitor's own local timezone in
  // the browser, which can flip the calendar day for a comment posted near
  // a UTC day boundary and throw a real hydration mismatch (confirmed live
  // for the same pattern in ArticlesExplorer.tsx).
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" });
}
