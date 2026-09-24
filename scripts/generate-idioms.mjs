// Builds src/data/idioms.json from the compact per-category source files in src/data/raw/*.ts
// Run with: node scripts/generate-idioms.mjs
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_DIR = path.join(__dirname, '../src/data/raw');
const OUT_FILE = path.join(__dirname, '../src/data/idioms.json');

const CATEGORY_MAP = {
  everyday: 'Everyday',
  work: 'Work',
  business: 'Business',
  education: 'Education',
  money: 'Money',
  relationships: 'Relationships',
  emotions: 'Emotions',
  communication: 'Communication',
  success: 'Success',
  failure: 'Failure',
  problems: 'Problems',
  time: 'Time',
  decisions: 'Decisions',
  travel: 'Travel',
  health: 'Health',
  technology: 'Technology',
  social_life: 'Social Life',
  personality: 'Personality',
  food: 'Food',
  weather: 'Weather',
  other: 'Other',
};

const LEVEL_ORDER = ['A2', 'B1', 'B2', 'C1', 'C2'];
const DEFAULT_LEVEL_BY_CATEGORY = {
  everyday: 'A2', work: 'B1', business: 'B2', education: 'B1', money: 'B1',
  relationships: 'B1', emotions: 'B1', communication: 'B1', success: 'B1',
  failure: 'B2', problems: 'B2', time: 'B1', decisions: 'B1', travel: 'B1',
  health: 'B1', technology: 'B2', social_life: 'B1', personality: 'B1',
  food: 'B1', weather: 'B1', other: 'B1',
};

function normalizeKey(idiom) {
  return idiom
    .toLowerCase()
    .replace(/^(a|an|as|the|to)\s+/, '')
    .replace(/[.,!?']/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+(too)$/, '')
    .trim();
}

function slugify(idiom) {
  return idiom
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function extractArrayLiteral(src) {
  const start = src.indexOf('[');
  const end = src.lastIndexOf(']');
  const body = src.slice(start, end + 1);
  // eslint-disable-next-line no-new-func
  return new Function(`return ${body}`)();
}

function commonnessForLevel(level) {
  switch (level) {
    case 'A2': return 'very common';
    case 'B1': return 'very common';
    case 'B2': return 'common';
    case 'C1': return 'moderate';
    case 'C2': return 'rare';
    default: return 'common';
  }
}

function difficultyForLevel(level, idiomText) {
  const base = LEVEL_ORDER.indexOf(level) + 1; // 1..5
  const wordBonus = idiomText.split(' ').length >= 5 ? 0.5 : 0;
  return Math.min(5, Math.round((base + wordBonus) * 10) / 10);
}

function deriveTags(idiomText, categoryKey, level) {
  const stop = new Set(['a', 'an', 'the', 'to', 'your', 'someone', 'something', 'of', 'in', 'on', 'at', 'for', 'with', 'and', 'it', 'up', 'out']);
  const words = idiomText
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));
  const tags = new Set([categoryKey.replace('_', '-'), level.toLowerCase(), ...words.slice(0, 4)]);
  return Array.from(tags);
}

function buildRecords() {
  const files = readdirSync(RAW_DIR).filter((f) => f.endsWith('.ts') && f !== 'types.ts');
  const seen = new Map(); // normalizedKey -> idiom string (first occurrence)
  const usedIds = new Set();
  const records = [];
  let totalRaw = 0;
  const droppedDuplicates = [];

  for (const file of files) {
    const key = file.replace('.ts', '');
    const baseKey = key.replace(/\d+$/, '');
    const category = CATEGORY_MAP[baseKey];
    if (!category) continue;
    const src = readFileSync(path.join(RAW_DIR, file), 'utf-8');
    const arr = extractArrayLiteral(src);
    for (const tuple of arr) {
      totalRaw += 1;
      const [idiomText, meaningEn, meaningRu, example, levelOverride] = tuple;
      const normKey = normalizeKey(idiomText);
      if (seen.has(normKey)) {
        droppedDuplicates.push(`${idiomText}  (dup of "${seen.get(normKey)}", in ${file})`);
        continue;
      }
      seen.set(normKey, idiomText);
      const level = levelOverride || DEFAULT_LEVEL_BY_CATEGORY[baseKey] || 'B1';
      let id = slugify(idiomText);
      if (usedIds.has(id)) {
        let i = 2;
        while (usedIds.has(`${id}-${i}`)) i += 1;
        id = `${id}-${i}`;
      }
      usedIds.add(id);
      records.push({
        id,
        idiom: idiomText,
        level,
        meaning_en: meaningEn,
        meaning_ru: meaningRu,
        short_explanation: meaningEn.length > 60 ? meaningEn.slice(0, 57).trim() + '…' : meaningEn,
        example_sentence: example,
        example_context: `${category} • ${level} English`,
        category,
        pronunciation: `/ ${idiomText.toLowerCase()} /`,
        synonyms: [],
        antonyms: [],
        commonness: commonnessForLevel(level),
        difficulty: difficultyForLevel(level, idiomText),
        tags: deriveTags(idiomText, baseKey, level),
      });
    }
  }

  return { records, totalRaw, droppedDuplicates };
}

const { records, totalRaw, droppedDuplicates } = buildRecords();

const TARGET_COUNT = 1000;
let finalRecords = records;
if (records.length > TARGET_COUNT) {
  const excess = records.length - TARGET_COUNT;
  // Trim the least essential overflow from the "Other" catch-all category first,
  // removing from the end (the most recently added, most miscellaneous entries).
  const otherIndices = [];
  records.forEach((r, i) => { if (r.category === 'Other') otherIndices.push(i); });
  const toRemove = new Set(otherIndices.slice(-excess));
  finalRecords = records.filter((_, i) => !toRemove.has(i));
}

writeFileSync(OUT_FILE, JSON.stringify(finalRecords, null, 2));

console.log(`Raw entries scanned: ${totalRaw}`);
console.log(`Unique idioms found: ${records.length}`);
console.log(`Duplicates dropped: ${droppedDuplicates.length}`);
console.log(`Final dataset size (trimmed to target): ${finalRecords.length}`);
if (droppedDuplicates.length) {
  console.log('--- dropped duplicates ---');
  droppedDuplicates.forEach((d) => console.log('  -', d));
}

const byCategory = {};
for (const r of finalRecords) byCategory[r.category] = (byCategory[r.category] || 0) + 1;
console.log('--- by category ---');
Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => console.log(`  ${c}: ${n}`));
