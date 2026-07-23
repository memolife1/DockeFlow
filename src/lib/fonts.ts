// Curated Google Fonts library for the Design tab's heading/body font
// pickers. Each font maps to a PowerPoint-safe fallback (pptxName) since the
// .pptx export can't embed arbitrary web fonts — PowerPoint renders the
// closest standard font instead.
export interface FontOption {
  id: string;
  name: string;
  googleFamily: string; // exact name for the Google Fonts CSS2 URL
  category: "sans" | "serif" | "display" | "mono";
  cssStack: string; // full CSS font-family value for the HTML preview
  pptxName: string; // closest standard PowerPoint font
}

export const FONT_OPTIONS: FontOption[] = [
  // Sans-serif — clean, professional
  { id: "inter", name: "Inter", googleFamily: "Inter:wght@400;500;600;700;800", category: "sans", cssStack: '"Inter", system-ui, sans-serif', pptxName: "Calibri" },
  { id: "poppins", name: "Poppins", googleFamily: "Poppins:wght@400;500;600;700;800", category: "sans", cssStack: '"Poppins", sans-serif', pptxName: "Calibri" },
  { id: "montserrat", name: "Montserrat", googleFamily: "Montserrat:wght@400;500;600;700;800;900", category: "sans", cssStack: '"Montserrat", sans-serif', pptxName: "Calibri" },
  { id: "raleway", name: "Raleway", googleFamily: "Raleway:wght@400;500;600;700;800", category: "sans", cssStack: '"Raleway", sans-serif', pptxName: "Calibri" },
  { id: "dm-sans", name: "DM Sans", googleFamily: "DM+Sans:wght@400;500;600;700", category: "sans", cssStack: '"DM Sans", sans-serif', pptxName: "Calibri" },
  { id: "nunito", name: "Nunito", googleFamily: "Nunito:wght@400;600;700;800", category: "sans", cssStack: '"Nunito", sans-serif', pptxName: "Calibri" },
  { id: "outfit", name: "Outfit", googleFamily: "Outfit:wght@400;500;600;700;800", category: "sans", cssStack: '"Outfit", sans-serif', pptxName: "Calibri" },
  { id: "plus-jakarta", name: "Plus Jakarta Sans", googleFamily: "Plus+Jakarta+Sans:wght@400;500;600;700;800", category: "sans", cssStack: '"Plus Jakarta Sans", sans-serif', pptxName: "Calibri" },
  { id: "lato", name: "Lato", googleFamily: "Lato:wght@400;700;900", category: "sans", cssStack: '"Lato", sans-serif', pptxName: "Calibri" },
  { id: "roboto", name: "Roboto", googleFamily: "Roboto:wght@400;500;700;900", category: "sans", cssStack: '"Roboto", sans-serif', pptxName: "Calibri" },

  // Serif — editorial, authoritative
  { id: "playfair", name: "Playfair Display", googleFamily: "Playfair+Display:wght@400;500;600;700;800;900", category: "serif", cssStack: '"Playfair Display", Georgia, serif', pptxName: "Georgia" },
  { id: "merriweather", name: "Merriweather", googleFamily: "Merriweather:wght@400;700;900", category: "serif", cssStack: '"Merriweather", Georgia, serif', pptxName: "Georgia" },
  { id: "lora", name: "Lora", googleFamily: "Lora:wght@400;500;600;700", category: "serif", cssStack: '"Lora", Georgia, serif', pptxName: "Georgia" },
  { id: "eb-garamond", name: "EB Garamond", googleFamily: "EB+Garamond:wght@400;500;600;700;800", category: "serif", cssStack: '"EB Garamond", Georgia, serif', pptxName: "Georgia" },
  { id: "cormorant", name: "Cormorant Garamond", googleFamily: "Cormorant+Garamond:wght@400;500;600;700", category: "serif", cssStack: '"Cormorant Garamond", Georgia, serif', pptxName: "Georgia" },
  { id: "libre-baskerville", name: "Libre Baskerville", googleFamily: "Libre+Baskerville:wght@400;700", category: "serif", cssStack: '"Libre Baskerville", Georgia, serif', pptxName: "Georgia" },

  // Display — bold statements, premium feel
  { id: "space-grotesk", name: "Space Grotesk", googleFamily: "Space+Grotesk:wght@400;500;600;700", category: "display", cssStack: '"Space Grotesk", sans-serif', pptxName: "Calibri" },
  { id: "syne", name: "Syne", googleFamily: "Syne:wght@400;500;600;700;800", category: "display", cssStack: '"Syne", sans-serif', pptxName: "Calibri" },
  { id: "oxanium", name: "Oxanium", googleFamily: "Oxanium:wght@400;500;600;700;800", category: "display", cssStack: '"Oxanium", sans-serif', pptxName: "Calibri" },
  { id: "bebas-neue", name: "Bebas Neue", googleFamily: "Bebas+Neue", category: "display", cssStack: '"Bebas Neue", sans-serif', pptxName: "Impact" },
  { id: "righteous", name: "Righteous", googleFamily: "Righteous", category: "display", cssStack: '"Righteous", sans-serif', pptxName: "Calibri" },

  // Arabic-compatible — for Arabic language presentations
  { id: "noto-arabic", name: "Noto Sans Arabic", googleFamily: "Noto+Sans+Arabic:wght@400;500;600;700;800", category: "sans", cssStack: '"Noto Sans Arabic", "Noto Sans", sans-serif', pptxName: "Arial" },
  { id: "cairo", name: "Cairo", googleFamily: "Cairo:wght@400;500;600;700;800", category: "sans", cssStack: '"Cairo", sans-serif', pptxName: "Arial" },
  { id: "tajawal", name: "Tajawal", googleFamily: "Tajawal:wght@400;500;700;800", category: "sans", cssStack: '"Tajawal", sans-serif', pptxName: "Arial" },
  { id: "almarai", name: "Almarai", googleFamily: "Almarai:wght@400;700;800", category: "sans", cssStack: '"Almarai", sans-serif', pptxName: "Arial" },
];

export const FONT_CATEGORIES = [
  { id: "sans", label: "Sans-serif" },
  { id: "serif", label: "Serif" },
  { id: "display", label: "Display" },
  { id: "arabic", label: "Arabic" },
] as const;

export function getFontById(id: string | undefined): FontOption | undefined {
  return id ? FONT_OPTIONS.find((f) => f.id === id) : undefined;
}

export function getFontGoogleUrl(fontIds: string[]): string {
  const families = fontIds
    .map((id) => FONT_OPTIONS.find((f) => f.id === id)?.googleFamily)
    .filter((f): f is string => Boolean(f))
    .map((f) => `family=${f}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
