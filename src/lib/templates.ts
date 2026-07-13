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
  {
    id: "midnight-navy",
    name: "Midnight Navy",
    category: "Corporate",
    description:
      "Deep navy authority with gold accents. Board rooms and investor decks.",
    sourceType: "built-in",
    theme: {
      accent: "#D4A853",
      surface: "#F8F7F4",
      ink: "#0D1B2A",
      fontFamily: "sans",
      character: "Authority",
    },
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "cobalt-pro",
    name: "Cobalt Pro",
    category: "Sales",
    description:
      "Bright cobalt energy. Perfect for sales pitches and product launches.",
    sourceType: "built-in",
    theme: {
      accent: "#2B4EFF",
      surface: "#FFFFFF",
      ink: "#0F1729",
      fontFamily: "sans",
      character: "Energetic",
    },
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "forest-executive",
    name: "Forest Executive",
    category: "Consulting",
    description:
      "Deep forest green with cream. Sophisticated consulting and strategy.",
    sourceType: "built-in",
    theme: {
      accent: "#1B4332",
      surface: "#F9F6EF",
      ink: "#1A2B1E",
      fontFamily: "serif",
      character: "Refined",
    },
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "pure-slate",
    name: "Pure Slate",
    category: "Tech",
    description:
      "Charcoal slate with electric cyan. Modern tech and SaaS decks.",
    sourceType: "built-in",
    theme: {
      accent: "#00B4D8",
      surface: "#F4F6F8",
      ink: "#1C2333",
      fontFamily: "sans",
      character: "Modern",
    },
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "crimson-authority",
    name: "Crimson Authority",
    category: "Corporate",
    description: "Deep crimson with white space. Confident and commanding.",
    sourceType: "built-in",
    theme: {
      accent: "#9B1D20",
      surface: "#FAFAFA",
      ink: "#1A0A0B",
      fontFamily: "sans",
      character: "Bold",
    },
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "ocean-deep",
    name: "Ocean Deep",
    category: "Consulting",
    description:
      "Rich teal with warm white. Research reports and annual reviews.",
    sourceType: "built-in",
    theme: {
      accent: "#0D6E6E",
      surface: "#F7F9F9",
      ink: "#0A2E2E",
      fontFamily: "sans",
      character: "Calm",
    },
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "obsidian",
    name: "Obsidian",
    category: "Creative",
    description: "Near-black with bright amber. Premium and high-contrast.",
    sourceType: "built-in",
    theme: {
      accent: "#F59E0B",
      surface: "#F5F5F5",
      ink: "#0C0C0C",
      fontFamily: "sans",
      character: "Premium",
    },
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "purple-reign",
    name: "Purple Reign",
    category: "Creative",
    description:
      "Rich violet with soft lavender tints. Innovation and vision decks.",
    sourceType: "built-in",
    theme: {
      accent: "#6D28D9",
      surface: "#FAF9FF",
      ink: "#1E1030",
      fontFamily: "sans",
      character: "Visionary",
    },
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "desert-sand",
    name: "Desert Sand",
    category: "Sales",
    description: "Warm sand with terracotta. Human, warm, and memorable.",
    sourceType: "built-in",
    theme: {
      accent: "#C26B3B",
      surface: "#FBF6EF",
      ink: "#2C1A0E",
      fontFamily: "serif",
      character: "Warm",
    },
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "arctic-white",
    name: "Arctic White",
    category: "Corporate",
    description:
      "Ultra-clean white with ice blue. Minimalist and editorial.",
    sourceType: "built-in",
    theme: {
      accent: "#4A90D9",
      surface: "#FFFFFF",
      ink: "#111827",
      fontFamily: "sans",
      character: "Minimal",
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
  "Corporate",
  "Tech",
  "Creative",
];
