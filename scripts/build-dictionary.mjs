import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const OUTPUT_FOLDER = resolve(root, "public/dictionary");

const RAW = resolve(root, "data/dictionary/frequencies/en-full.txt");
const SOURCE = resolve(root, "data/dictionary/re-enable/re-enable.txt");
const COMMON_FILE = resolve(OUTPUT_FOLDER, "common.txt");
const UNCOMMON_FILE = resolve(OUTPUT_FOLDER, "uncommon.txt");

const MIN_LENGTH = 2;
const PLAIN_LETTERS = /^[A-Z]+$/;
const COMMON_LIMIT = 30000;

const uncommonWords = new Set();
for (const line of readFileSync(SOURCE, "utf8").split("\n")) {
  const word = line.trim().toUpperCase();
  if (word.length >= MIN_LENGTH && PLAIN_LETTERS.test(word))
    uncommonWords.add(word);
}

const rankedCommonWords = [];
for (const line of readFileSync(RAW, "utf-8").split(/\r?\n/)) {
  const [word, count] = line.trim().toUpperCase().split(/\s+/);
  if (!word || !count) continue;
  if (word.length < MIN_LENGTH) continue;
  if (!PLAIN_LETTERS.test(word)) continue;
  if (!uncommonWords.has(word)) continue;
  rankedCommonWords.push(word);
  uncommonWords.delete(word);
  if (rankedCommonWords.length >= COMMON_LIMIT) break;
}

const sortedUncommonWords = [...uncommonWords].sort();
mkdirSync(OUTPUT_FOLDER, { recursive: true });
writeFileSync(UNCOMMON_FILE, sortedUncommonWords.join("\n") + "\n");
writeFileSync(COMMON_FILE, rankedCommonWords.join("\n") + "\n");

console.log(
  `dictionary: ${rankedCommonWords.length} common words written to ${COMMON_FILE} and ${sortedUncommonWords.length} uncommon words written to ${UNCOMMON_FILE}`,
);
