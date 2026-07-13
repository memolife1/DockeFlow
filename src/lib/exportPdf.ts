import type { Presentation, Slide, TemplateTheme } from "./types";

// ---------------------------------------------------------------------------
// Client-side PDF export: renders each slide's SlideView off-screen at a
// fixed 1280x720 (16:9) size, rasterizes it with html2canvas, and assembles
// the pages with jsPDF. No server round-trip — the same component that
// drives the editor preview and the PPTX export drives this too.
// ---------------------------------------------------------------------------

function safeFileName(title: string): string {
  const base = title.trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
  return `${base || "presentation"}.pdf`;
}

export async function exportDeckToPdf(
  presentation: Presentation,
  slides: Slide[],
  theme: TemplateTheme,
): Promise<void> {
  const { default: html2canvas } = await import("html2canvas");
  const { default: jsPDF } = await import("jspdf");
  const { SlideView } = await import("@/components/deck/SlideView");
  const { createRoot } = await import("react-dom/client");
  const React = await import("react");

  // Offscreen container with correct 16:9 slide dimensions.
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: 1280px; height: 720px;
    z-index: -1; pointer-events: none;
  `;
  document.body.appendChild(container);

  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1280, 720] });
  const ordered = [...slides].sort((a, b) => a.orderIndex - b.orderIndex);

  try {
    for (let i = 0; i < ordered.length; i++) {
      const slide = ordered[i];
      const slideDiv = document.createElement("div");
      slideDiv.style.cssText = "width:1280px;height:720px;";
      container.innerHTML = "";
      container.appendChild(slideDiv);

      const root = createRoot(slideDiv);
      root.render(
        React.createElement(SlideView, {
          slide,
          theme,
          index: i,
          total: ordered.length,
        }),
      );

      // Let the DOM paint and web fonts settle before rasterizing.
      await new Promise((r) => setTimeout(r, 200));

      const canvas = await html2canvas(slideDiv, {
        width: 1280,
        height: 720,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      root.unmount();

      if (i > 0) pdf.addPage([1280, 720], "landscape");
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 1280, 720);
    }
  } finally {
    document.body.removeChild(container);
  }

  pdf.save(safeFileName(presentation.title));
}
