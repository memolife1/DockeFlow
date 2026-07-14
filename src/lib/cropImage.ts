// Center-crops any image to a fixed 16:9 (1280x720) frame so uploaded photos
// always match slide dimensions, regardless of source aspect ratio.

const TARGET_W = 1280;
const TARGET_H = 720;
const TARGET_RATIO = TARGET_W / TARGET_H;

function drawCropped(img: HTMLImageElement): HTMLCanvasElement {
  const srcRatio = img.width / img.height;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (srcRatio > TARGET_RATIO) {
    // Source is wider than 16:9 — crop the sides.
    sw = img.height * TARGET_RATIO;
    sx = (img.width - sw) / 2;
  } else if (srcRatio < TARGET_RATIO) {
    // Source is taller than 16:9 — crop top/bottom.
    sh = img.width / TARGET_RATIO;
    sy = (img.height - sh) / 2;
  }

  const canvas = document.createElement("canvas");
  canvas.width = TARGET_W;
  canvas.height = TARGET_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_W, TARGET_H);
  return canvas;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode image"))),
      "image/jpeg",
      0.9,
    );
  });
}

export function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
}

/** Center-crops an uploaded File to 1280x720 (16:9). */
export async function cropTo16x9(file: File): Promise<{ blob: Blob; dataUri: string }> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const canvas = drawCropped(img);
    const blob = await canvasToBlob(canvas);
    const dataUri = await blobToDataUri(blob);
    return { blob, dataUri };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Center-crops an already-stored data URI (e.g. from the image library) to 1280x720 (16:9). */
export async function cropDataUriTo16x9(dataUri: string): Promise<string> {
  const img = await loadImage(dataUri);
  const canvas = drawCropped(img);
  const blob = await canvasToBlob(canvas);
  return blobToDataUri(blob);
}
