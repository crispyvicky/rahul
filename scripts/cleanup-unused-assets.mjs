/**
 * Lists or deletes unreferenced files under src/assets.
 *
 *   node scripts/cleanup-unused-assets.mjs           # dry-run (default)
 *   node scripts/cleanup-unused-assets.mjs --delete  # actually delete
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = path.join(root, "src", "assets");
const doDelete = process.argv.includes("--delete");

// Always use forward slashes (matches normalized rel paths on all OSes).
const KEEP = new Set([
  "after.jpg",
  "before.jpeg",
  "img/bike.jpg",
  "img/what_people1.avif",
  "img/what_people2.avif",
  "img/what_people3.avif",
  "img/gym1.avif",
  "img/gym2.avif",
  "img/gym3.avif",
  "img/gym4.avif",
  "img/gym5.avif",
  "img/blog1.avif",
  "img/blog2.avif",
  "img/blog3.avif",
  "img/b_user1.avif",
  "img/b_user2.avif",
  "img/b_user3.avif",
  "img/wp1.avif",
  "img/wp2.avif",
  "img/wp3.avif",
  "img/wp4.avif",
  "img/RF.png",
  "img/mobile1.png",
  "img/phone.jpg",
  "img/icon2.svg",
  "img/icon3.svg",
  "img/info.svg",
  "img/contact.avif",
  "img/app3.jpg",
  "img/app4.jpg",
  "img/app6.png",
  "img/p_icon1.png",
  "img/t_user1.avif",
  "img/t_user2.avif",
]);

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const toRemove = [];
let kept = 0;
for (const file of walk(assetsDir)) {
  const rel = path.relative(assetsDir, file).replace(/\\/g, "/");
  if (KEEP.has(rel)) {
    kept++;
    continue;
  }
  toRemove.push({ rel, file });
}

if (!doDelete) {
  console.log(`Dry run: would keep ${kept}, delete ${toRemove.length}. Pass --delete to apply.`);
  toRemove.sort((a, b) => a.rel.localeCompare(b.rel)).forEach(({ rel }) => console.log("  -", rel));
  process.exit(0);
}

for (const { rel, file } of toRemove) fs.unlinkSync(file);
console.log(`Kept ${kept} files. Deleted ${toRemove.length} unused assets.`);
