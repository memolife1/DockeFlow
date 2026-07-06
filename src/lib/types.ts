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

export type LayoutType =
  | "title"
  | "agenda"
  | "section"
  | "content"
  | "two-column"
  | "quote"
  | "closing";

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
