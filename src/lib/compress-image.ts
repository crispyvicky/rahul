/** Resize + JPEG compress before upload (keeps Supabase Storage small). */

const DEFAULTS = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.82,
  maxBytes: 400_000,
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
  });
}

export async function compressImageForUpload(
  file: File,
  opts?: Partial<typeof DEFAULTS>
): Promise<File> {
  const { maxWidth, maxHeight, maxBytes } = { ...DEFAULTS, ...opts };
  let quality = opts?.quality ?? DEFAULTS.quality;

  const isImage =
    file.type.startsWith("image/") ||
    file.type === "" ||
    /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
  if (!isImage) {
    throw new Error("Please choose an image file (JPG, PNG, WebP, or a photo from your gallery).");
  }

  if (file.size <= maxBytes && file.type === "image/jpeg") {
    return file;
  }

  const img = await loadImage(file);
  let { width, height } = img;
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image");
  ctx.drawImage(img, 0, 0, width, height);

  let blob = await canvasToJpegBlob(canvas, quality);
  while (blob && blob.size > maxBytes && quality > 0.5) {
    quality -= 0.08;
    blob = await canvasToJpegBlob(canvas, quality);
  }

  if (!blob) throw new Error("Could not compress image");

  const base = file.name.replace(/\.[^.]+$/, "") || "proof";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
}
