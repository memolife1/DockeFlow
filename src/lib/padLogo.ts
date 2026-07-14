import { loadImage, blobToDataUri } from "./cropImage";

// Fits an uploaded logo into a fixed 200x100 frame without cropping any of
// its content — unlike photo cropping, a logo must stay fully visible, so
// this pads/letterboxes onto a transparent canvas instead of center-cropping.

const LOGO_W = 200;
const LOGO_H = 100;

function readAsDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function padLogoTo200x100(file: File): Promise<{ blob: Blob; dataUri: string }> {
  // SVGs are vector — rasterizing them to a fixed canvas would throw away
  // their resolution independence, so store them as-is.
  if (file.type === "image/svg+xml" || /\.svg$/i.test(file.name)) {
    const dataUri = await readAsDataUri(file);
    return { blob: file, dataUri };
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(LOGO_W / img.width, LOGO_H / img.height, 1);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = LOGO_W;
    canvas.height = LOGO_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.clearRect(0, 0, LOGO_W, LOGO_H);
    ctx.drawImage(img, (LOGO_W - w) / 2, (LOGO_H - h) / 2, w, h);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Failed to encode image"))),
        "image/png",
      );
    });
    const dataUri = await blobToDataUri(blob);
    return { blob, dataUri };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
