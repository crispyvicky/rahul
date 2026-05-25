/**
 * One-time: compress public/gym-hero.png → gym-hero.webp (run: node scripts/optimize-hero.mjs)
 */
import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "public");
const src = join(root, "gym-hero.png");

await sharp(src)
  .resize(1100, null, { withoutEnlargement: true })
  .webp({ quality: 82 })
  .toFile(join(root, "gym-hero.webp"));

await sharp(src)
  .resize(640, null, { withoutEnlargement: true })
  .webp({ quality: 80 })
  .toFile(join(root, "gym-hero-mobile.webp"));

console.log("Created gym-hero.webp and gym-hero-mobile.webp");
