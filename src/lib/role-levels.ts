// The sub-menu inside "Cargos e Funções" — shared between the form (so a
// new role is filed under the right level) and the table/tabs (so the
// same 8 labels and order are used everywhere this shows up).
export const ROLE_LEVELS = [
  { id: "c_level", label: "C-Level" },
  { id: "diretoria", label: "Diretoria" },
  { id: "heads", label: "Heads" },
  { id: "gerentes", label: "Gerentes" },
  { id: "coordenadores", label: "Coordenadores" },
  { id: "supervisores", label: "Supervisores" },
  { id: "analistas", label: "Analistas" },
  { id: "assistentes", label: "Assistentes" },
] as const;

export type RoleLevel = (typeof ROLE_LEVELS)[number]["id"];

export function roleLevelLabel(level: string): string {
  return ROLE_LEVELS.find((l) => l.id === level)?.label ?? level;
}
