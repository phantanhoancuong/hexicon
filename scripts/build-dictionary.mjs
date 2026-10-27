import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const SOURCE = resolve(root, "data/dictionary/re-enable.txt");
const OUTPUT_FILE = resolve(root, "public/dictionary/dictionary.txt");
const OUTPUT_FOLDER = dirname(OUTPUT_FILE);

const MIN_LENGTH = 2;
const PLAIN_LETTERS = /^[A-Z]+$/;

const words = new Set();
for (const line of readFileSync(SOURCE, "utf8").split("\n")) {
  const word = line.trim().toUpperCase();
  if (word.length >= MIN_LENGTH && PLAIN_LETTERS.test(word)) words.add(word);
}

const sorted = [...words].sort();
mkdirSync(OUTPUT_FOLDER, { recursive: true });
writeFileSync(OUTPUT_FILE, sorted.join("\n") + "\n");

console.log(`dictionary: ${sorted.length} words written to ${OUTPUT_FILE}`);
