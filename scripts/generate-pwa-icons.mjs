/**
 * Builds favicon + PWA icons from src/assets/img/favicon.png → public/
 * Run: npm run generate:icons
 */
import { copyFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const source = join(root, "src/assets/img/favicon.png");
const publicDir = join(root, "public");

const outputs = [
  { file: "favicon.png", size: 32 },
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
  /** Legacy path used by OG / JSON-LD */
  { file: "LOGO.png", size: 512 },
];

mkdirSync(publicDir, { recursive: true });

try {
  const sharp = (await import("sharp")).default;
  for (const { file, size } of outputs) {
    await sharp(source)
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 1 } })
      .png()
      .toFile(join(publicDir, file));
    console.log(`Wrote public/${file} (${size}x${size})`);
  }
} catch (err) {
  if (err.code === "ERR_MODULE_NOT_FOUND") {
    for (const { file } of outputs) {
      copyFileSync(source, join(publicDir, file));
    }
    console.log("Copied icons (install sharp for proper resize)");
  } else {
    throw err;
  }
}
