import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const RAW = resolve(root, "data/dictionary/frequencies/en-full.txt");
const WORDS = resolve(root, "data/dictionary/re-enable/re-enable.txt");
const OUTPUT = resolve(root, "data/dictionary/frequencies/en-frequencies.txt");

const valid = new Set(
  readFileSync(WORDS, "utf8")
    .split(/\r?\n/)
    .map((word) => word.trim().toUpperCase())
    .filter((word) => word.length >= 2),
);

const kept = [];
for (const line of readFileSync(RAW, "utf8").split(/\r?\n/)) {
  const [word, count] = line.trim().split(/\s+/);
  if (!word || !count) continue;
  if (!/^[a-z]+$/i.test(word)) continue;
  if (!valid.has(word.toUpperCase())) continue;

  kept.push(`${word} ${count}`);
}

writeFileSync(OUTPUT, `${kept.join("\n")}\n`);

console.log(`Kept ${kept.length} words in ${OUTPUT}`);
