import fs from "fs";
import path from "path";
import sharp from "sharp";

const INPUT_DIR = path.resolve("fotos");
const OUTPUT_DIR = path.resolve("fotos/thumbs");
const MAX = 480; // tamanho bom pra grid

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const files = walk(INPUT_DIR).filter((f) => !f.includes(`${path.sep}thumbs${path.sep}`));

for (const file of files) {
  const rel = path.relative(INPUT_DIR, file); // ex: "4-Abril/5abril.jpeg"
  const outPath = path.join(OUTPUT_DIR, rel).replace(/\.(jpe?g|png)$/i, ".webp");

  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  await sharp(file)
    .resize({ width: MAX, height: MAX, fit: "inside" })
    .webp({ quality: 70 })
    .toFile(outPath);

  console.log("thumb:", rel);
}

console.log("✅ thumbs prontas em fotos/thumbs/");
