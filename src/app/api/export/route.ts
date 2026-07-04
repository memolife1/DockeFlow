import { NextResponse } from "next/server";

// Export placeholder. A real implementation would render slides to PDF/PPTX
// and return a signed download URL. For the MVP we acknowledge the job.
export async function POST(req: Request) {
  const { format = "pdf" } = (await req.json().catch(() => ({}))) as {
    format?: string;
  };
  await new Promise((r) => setTimeout(r, 900));
  return NextResponse.json({
    status: "ready",
    format,
    note: "Export is mocked in this MVP. Wire a renderer here to produce a real file.",
  });
}
