// Core domain entities for DeckeFlow.
// These mirror the intended persistence schema so the localStorage-backed
// store can later be swapped for a real database without UI changes.

export type PresentationMode = "topic" | "content";

export type PresentationStatus =
  | "draft"
  | "generating"
  | "ready"
  | "error";

export type Tone =
  | "professional"
  | "confident"
  | "consultative"
  | "friendly"
  | "visionary";

// New-generation layout ids (the premium layout library). One spec per id in
// lib/layouts/specs.ts; both the HTML preview and the PPTX export render from
// the same spec.
export type LayoutId =
  | "title_hero"
  | "title_split"
  | "agenda"
  | "section_divider"
  | "content_bullets"
  | "content_image_right"
  | "content_image_left"
  | "two_column_compare"
  | "stat_kpi"
  | "timeline_horizontal"
  | "process_steps"
  | "funnel"
  | "swot_matrix"
  | "chart_focus"
  | "team_grid"
  | "closing_cta";

// Legacy layout names (existing decks). Mapped to the nearest LayoutId at
// render time — see resolveLayoutId() in lib/layouts/specs.ts.
export type LegacyLayoutType =
  | "title"
  | "agenda"
  | "section"
  | "content"
  | "two-column"
  | "stat-block"
  | "quote"
  | "closing";

export type LayoutType = LegacyLayoutType | LayoutId;

// Big-number highlight shown on a stat-block slide.
export interface Stat {
  value: string; // e.g. "47%", "3x", "$2.4M"
  label: string;
}

// One side of a two-column comparison slide.
export interface SlideColumn {
  heading: string;
  points: string[];
}

// Structured content for the richer layouts.
export interface TimelineItem {
  label: string; // milestone name, e.g. "Q1 — Pilot"
  detail?: string;
}

export interface ProcessStep {
  label: string;
  detail?: string;
}

export interface FunnelStage {
  label: string;
  value?: string; // e.g. "1,200 leads"
}

export interface SwotContent {
  s: string[];
  w: string[];
  o: string[];
  t: string[];
}

export interface TeamMember {
  name: string;
  role: string;
}

export type TemplateSourceType = "built-in" | "uploaded";

// Chart attached to a data-oriented slide. Rendered as a native, editable
// chart object in PowerPoint export.
export type ChartType = "bar" | "line" | "pie";

export interface ChartSpec {
  type: ChartType;
  title?: string;
  labels: string[]; // category axis / pie segment labels
  series: { name: string; values: number[] }[]; // one series for pie
}

export interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  createdAt: string;
}

export interface Presentation {
  id: string;
  userId: string;
  title: string;
  subtitle: string;
  mode: PresentationMode;
  audience: string;
  goal: string;
  tone: Tone;
  templateId: string;
  status: PresentationStatus;
  // When true, the .pptx export puts a Pexels photo behind the title slide.
  // Session-scoped presentation option; not persisted to Supabase.
  useStockImages?: boolean;
  // Per-presentation theme customization set from the editor's Design tab —
  // layered on top of the chosen template's theme (lib/layouts/theme.ts).
  themeOverrides?: {
    accent?: string; // hex, no "#"
    surface?: string; // hex, no "#"
    ink?: string; // hex, no "#"
    backgroundDesign?: string; // BackgroundDesignKey from lib/backgroundDesigns
    fontFamily?: "sans" | "serif";
    backgroundImageUri?: string; // full-bleed background photo, data URI
  };
  // A brand logo watermark applied to every slide (preview + PPTX export).
  logoWatermark?: {
    logoId: string;
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    size: "small" | "medium";
  };
  createdAt: string;
  updatedAt: string;
}

export interface Slide {
  id: string;
  presentationId: string;
  orderIndex: number;
  title: string;
  content: string[]; // bullet points / body lines
  speakerNotes: string;
  layoutType: LayoutType;
  chart?: ChartSpec; // present on data-oriented slides
  stats?: Stat[]; // present on stat-block slides
  columns?: SlideColumn[]; // present on two-column comparison slides
  // Rich-layout content (all optional; layouts fall back gracefully).
  icons?: (string | null)[]; // semantic icon name per content bullet
  timeline?: TimelineItem[];
  steps?: ProcessStep[];
  funnel?: FunnelStage[];
  swot?: SwotContent;
  team?: TeamMember[];
  imageQuery?: string; // stock-photo search for image zones
  imageUrl?: string; // resolved image URL (set at generation time)
  sectionNumber?: number; // for section_divider numbering
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  sourceType: TemplateSourceType;
  // Design tokens the template contributes to the deck theme.
  theme: TemplateTheme;
  createdAt: string;
}

export interface TemplateTheme {
  accent: string;
  surface: string;
  ink: string;
  fontFamily: "sans" | "serif";
  // A short label describing the visual character (shown in the picker).
  character: string;
  // Brand overrides extracted from an uploaded .pptx (Phase 4). Roles map to
  // the layout system's ColorRole names.
  brand?: {
    name?: string;
    roles?: {
      primary?: string;
      dark?: string;
      accent?: string;
      surface?: string;
    };
    fontHead?: string;
    fontBody?: string;
    logoDataUri?: string;
    // User-chosen override in the confirmation dialog (Phase 1) — takes
    // precedence over whatever the source (.pptx / website) implied.
    fontFamily?: "sans" | "serif";
  };
}

// A photo a user uploads to use in their own slides instead of stock images
// (event photos, product shots, team photos, etc.).
export interface UserImage {
  id: string;
  userId: string;
  fileName: string;
  dataUri: string; // base64 data URI, stored locally
  fileUrl?: string; // Supabase Storage URL when available
  tags?: string[];
  uploadedAt: string;
}

// A brand logo a user uploads, for watermarking slides (distinct from the
// per-slide UserImage library).
export interface BrandLogo {
  id: string;
  userId: string;
  name: string;
  dataUri: string; // base64 data URI, transparent background preserved
  uploadedAt: string;
}

export interface UploadedStyleReference {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileUrl: string; // object URL / data ref (mocked)
  extractedAccent: string;
  createdAt: string;
}

export interface GenerationJob {
  id: string;
  presentationId: string;
  status: "queued" | "running" | "done" | "error";
  inputType: PresentationMode;
  createdAt: string;
}

export interface ExportJob {
  id: string;
  presentationId: string;
  status: "queued" | "processing" | "ready" | "error";
  format: "pdf" | "pptx" | "link";
  createdAt: string;
}

export interface DeckBundle {
  presentation: Presentation;
  slides: Slide[];
}
