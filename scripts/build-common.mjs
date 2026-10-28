import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const FREQUENCIES = resolve(
  root,
  "data/dictionary/frequencies/en-frequencies.txt",
);
const DICTIONARY = resolve(root, "public/dictionary/dictionary.txt");
const OUTPUT = resolve(root, "public/dictionary/common.txt");

const COMMON_LIMIT = 30000;

const readWords = (path) =>
  readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((word) => word.trim().toUpperCase())
    .filter(Boolean);

const readCounts = (path) => {
  const counts = new Map();
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const [word, count] = line.trim().split(/\s+/);
    if (!word || !count) continue;

    const key = word.toUpperCase();
    counts.set(key, (counts.get(key) ?? 0) + Number(count));
  }
  return counts;
};

const counts = readCounts(FREQUENCIES);

const common = readWords(DICTIONARY)
  .filter((word) => counts.has(word))
  .sort((a, b) => counts.get(b) - counts.get(a) || a.localeCompare(b))
  .slice(0, COMMON_LIMIT);

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${common.join("\n")}\n`);

console.log(`Wrote ${common.length} common words to ${OUTPUT}`);
