/**
 * Builds PWA icons from src/assets/LOGO.png → public/LOGO.png (and optional sizes).
 * Run: npm run generate:icons
 */
import { copyFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const source = join(root, "src/assets/LOGO.png");
const publicLogo = join(root, "public/LOGO.png");

mkdirSync(join(root, "public"), { recursive: true });

try {
  const sharp = (await import("sharp")).default;
  await sharp(source).png().toFile(publicLogo);
  console.log("Wrote public/LOGO.png");
} catch {
  copyFileSync(source, publicLogo);
  console.log("Copied public/LOGO.png (install sharp for resize)");
}
