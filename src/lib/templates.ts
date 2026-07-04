import type { Template } from "./types";

// Built-in templates. Each contributes a restrained design theme to the deck.
// Kept deliberately neutral and editorial — no glowing gradients.
export const BUILT_IN_TEMPLATES: Template[] = [
  {
    id: "tpl_editorial",
    name: "Editorial",
    category: "General",
    description:
      "Serif headlines, generous whitespace, left-aligned. Reads like a considered document.",
    sourceType: "built-in",
    theme: {
      accent: "#c2410c",
      surface: "#ffffff",
      ink: "#1c1917",
      fontFamily: "serif",
      character: "Warm · editorial",
    },
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "tpl_boardroom",
    name: "Boardroom",
    category: "Executive",
    description:
      "Restrained and formal. Built for exec reviews, QBRs, and board updates.",
    sourceType: "built-in",
    theme: {
      accent: "#1e3a34",
      surface: "#ffffff",
      ink: "#111827",
      fontFamily: "sans",
      character: "Formal · muted green",
    },
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "tpl_sales",
    name: "Sales Motion",
    category: "Sales",
    description:
      "Punchy structure for pitches and proposals. Clear problem → solution → ask.",
    sourceType: "built-in",
    theme: {
      accent: "#b91c1c",
      surface: "#ffffff",
      ink: "#1c1917",
      fontFamily: "sans",
      character: "Direct · confident",
    },
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "tpl_consulting",
    name: "Consulting Brief",
    category: "Consulting",
    description:
      "Analytical layout for findings and recommendations. Structured and dense.",
    sourceType: "built-in",
    theme: {
      accent: "#3730a3",
      surface: "#ffffff",
      ink: "#111827",
      fontFamily: "sans",
      character: "Analytical · ink",
    },
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "tpl_startup",
    name: "Startup Update",
    category: "Startup",
    description:
      "For investor updates and all-hands. Momentum-forward but not hypey.",
    sourceType: "built-in",
    theme: {
      accent: "#0f766e",
      surface: "#ffffff",
      ink: "#1c1917",
      fontFamily: "sans",
      character: "Modern · teal",
    },
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "tpl_mono",
    name: "Monochrome",
    category: "General",
    description:
      "Black, white, and one line weight. Maximum focus on the words.",
    sourceType: "built-in",
    theme: {
      accent: "#292524",
      surface: "#ffffff",
      ink: "#0c0a09",
      fontFamily: "sans",
      character: "Minimal · black",
    },
    createdAt: "2025-01-01T00:00:00.000Z",
  },
];

export function getTemplate(
  id: string,
  extra: Template[] = [],
): Template | undefined {
  return [...BUILT_IN_TEMPLATES, ...extra].find((t) => t.id === id);
}

export const TEMPLATE_CATEGORIES = [
  "All",
  "General",
  "Executive",
  "Sales",
  "Consulting",
  "Startup",
];
