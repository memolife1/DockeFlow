export interface TemplateInfo {
  name: string;
  accent: string;
  description: string;
  fontStyle: "serif" | "sans";
}

// DeckeFlow's own templates. Accent colors are each template's brand hue —
// deliberately distinct from the Coral signature color.
export const TEMPLATES: TemplateInfo[] = [
  {
    name: "Editorial",
    accent: "#B54A2E",
    description: "Serif headlines and generous margins. Reads like a considered document.",
    fontStyle: "serif",
  },
  {
    name: "Boardroom",
    accent: "#1F4A3C",
    description: "Formal and restrained. Built for exec reviews and board updates.",
    fontStyle: "sans",
  },
  {
    name: "Sales Motion",
    accent: "#A3312A",
    description: "Direct structure for pitches. Clear problem, solution, and ask.",
    fontStyle: "sans",
  },
  {
    name: "Consulting Brief",
    accent: "#2B3A67",
    description: "Analytical layout for findings and recommendations.",
    fontStyle: "sans",
  },
  {
    name: "Startup Update",
    accent: "#0F766E",
    description: "Momentum-forward for investor updates and all-hands.",
    fontStyle: "sans",
  },
  {
    name: "Monochrome",
    accent: "#111111",
    description: "Black, white, and one line weight. Maximum focus on the words.",
    fontStyle: "sans",
  },
];
