import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Settings,
  Users,
  Mail,
  Monitor,
  MessageSquare,
  KeyRound,
  ScrollText,
  Megaphone,
  BarChart3,
  LifeBuoy,
  Tag,
  Calendar,
  Building2,
  Home,
  MessageCircle,
  UserCircle,
} from "lucide-react";

export type CountKey = "comentarios" | "leads" | "chamados" | "resetRequests";
export type MenuLink = { id: string; href: string; label: string; icon: LucideIcon; countKey?: CountKey; activeMatch?: string[] };
export type MenuGroup = { id: string; label: string; icon: LucideIcon; children: MenuLink[] };
export type MenuEntry = MenuLink | MenuGroup;

export function isMenuGroup(item: MenuEntry): item is MenuGroup {
  return "children" in item;
}

// The code-defined structure and order — hrefs, icons and badge wiring stay
// fixed here regardless of what gets customized; only label/position are
// ever overridden (see applyMenuOverrides below). A group's own children
// keep their built-in order and labels — only top-level entries (the group
// itself counts as one) are reorderable/renamable from the admin.
export const ADMIN_MENU_DEFAULTS: MenuEntry[] = [
  { id: "dashboard", href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { id: "relatorios", href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { id: "artigos", href: "/admin/artigos", label: "Artigos", icon: FileText, countKey: "comentarios", activeMatch: ["/admin/comentarios"] },
  { id: "calendario", href: "/admin/calendario", label: "Calendário de Divulgação", icon: Calendar },
  {
    id: "consultoria",
    href: "/admin/consultoria",
    label: "Consultoria",
    icon: Briefcase,
    activeMatch: ["/admin/servicos", "/admin/portfolio", "/admin/cursos", "/admin/recursos", "/admin/diagnosticos"],
  },
  { id: "leads", href: "/admin/leads", label: "Leads / CRM", icon: Users, countKey: "leads" },
  { id: "chamados", href: "/admin/chamados", label: "Chamados", icon: LifeBuoy, countKey: "chamados" },
  { id: "comunicados", href: "/admin/comunicados", label: "Comunicados", icon: Megaphone },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    children: [
      { id: "marketing-newsletter", href: "/admin/newsletter", label: "Newsletter", icon: Mail },
      { id: "marketing-publicidade", href: "/admin/publicidade", label: "Publicidade", icon: Megaphone },
      { id: "marketing-promocoes", href: "/admin/promocoes", label: "Promoções", icon: Tag },
      { id: "marketing-depoimentos", href: "/admin/depoimentos", label: "Depoimentos", icon: MessageSquare },
      { id: "marketing-midia", href: "/admin/midia", label: "Na Mídia", icon: Monitor },
    ],
  },
  { id: "usuarios", href: "/admin/usuarios", label: "Usuários", icon: KeyRound, countKey: "resetRequests", activeMatch: ["/admin/autores"] },
  { id: "empresa", href: "/admin/empresa", label: "A empresa", icon: Building2 },
  { id: "paginas", href: "/admin/paginas", label: "Páginas Institucionais", icon: ScrollText },
  { id: "configuracoes", href: "/admin/configuracoes", label: "Configurações", icon: Settings, activeMatch: ["/admin/seo"] },
];

export const AUTHOR_MENU_DEFAULTS: MenuLink[] = [
  { id: "inicio", href: "/autor", label: "Início", icon: Home },
  { id: "artigos", href: "/autor/artigos", label: "Meus artigos", icon: FileText },
  { id: "comentarios", href: "/autor/comentarios", label: "Comentários", icon: MessageCircle },
  { id: "comunicados", href: "/autor/comunicados", label: "Comunicados", icon: Megaphone },
  { id: "chamados", href: "/autor/chamados", label: "Chamados", icon: LifeBuoy },
  { id: "empresa", href: "/autor/empresa", label: "A empresa", icon: Building2 },
  { id: "perfil", href: "/autor/perfil", label: "Meu perfil", icon: UserCircle },
];

export type MenuOverride = { id: string; label: string; sort_order: number };

// No saved rows for a panel = untouched, so the defaults' own order stands.
// Once customized, every top-level item got a row the last time it was
// saved (see the "Menus" tab's save action, which always writes the full
// current list) — so if an override is missing for some id here, that's a
// newly added default item since the last save, placed at its normal
// position among the customized ones rather than dropped.
export function applyMenuOverrides<T extends MenuEntry>(defaults: T[], overrides: MenuOverride[]): T[] {
  if (overrides.length === 0) return defaults;
  const overrideById = new Map(overrides.map((o) => [o.id, o]));
  return [...defaults].sort((a, b) => {
    const orderA = overrideById.get(a.id)?.sort_order ?? defaults.indexOf(a);
    const orderB = overrideById.get(b.id)?.sort_order ?? defaults.indexOf(b);
    return orderA - orderB;
  }).map((item) => {
    const override = overrideById.get(item.id);
    return override ? { ...item, label: override.label } : item;
  });
}
