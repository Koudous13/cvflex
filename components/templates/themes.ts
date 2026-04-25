import type { TemplateId } from "@/lib/types";

export type CvTheme = {
  id: TemplateId;
  name: string;
  badge: string;
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    accent: string;
    sidebarBg: string;
    sidebarBgEnd: string;
    sidebarText: string;
    text: string;
    textMuted: string;
    bg: string;
  };
};

export const THEMES: Record<TemplateId, CvTheme> = {
  "fullstack-ia": {
    id: "fullstack-ia",
    name: "FullStack IA",
    badge: "Architecte Full Stack × IA",
    colors: {
      primary: "#ea580c",
      primaryDark: "#9a3412",
      primaryLight: "#fb923c",
      accent: "#6366f1",
      sidebarBg: "#1c1917",
      sidebarBgEnd: "#44403c",
      sidebarText: "#fef3c7",
      text: "#1c1917",
      textMuted: "#57534e",
      bg: "#f8fafc",
    },
  },
  "automatisation-ia": {
    id: "automatisation-ia",
    name: "Automatisation IA",
    badge: "Spécialiste Automatisation IA & Agents IA",
    colors: {
      primary: "#4f46e5",
      primaryDark: "#3730a3",
      primaryLight: "#818cf8",
      accent: "#06b6d4",
      sidebarBg: "#0f172a",
      sidebarBgEnd: "#1e1b4b",
      sidebarText: "#e2e8f0",
      text: "#1e293b",
      textMuted: "#64748b",
      bg: "#f8fafc",
    },
  },
  "developpement-web": {
    id: "developpement-web",
    name: "Développement Web",
    badge: "Développeur Full Stack Web",
    colors: {
      primary: "#0d9488",
      primaryDark: "#115e59",
      primaryLight: "#5eead4",
      accent: "#f59e0b",
      sidebarBg: "#042f2e",
      sidebarBgEnd: "#064e3b",
      sidebarText: "#ccfbf1",
      text: "#0f172a",
      textMuted: "#475569",
      bg: "#f8fafc",
    },
  },
};
