import type { WordEntry } from './types';

interface WordsJson {
  [length: string]: WordEntry[];
}

let wordsCache: WordsJson | null = null;
let validWordsCache: Set<string> | null = null;

// Prefix all data fetches with the Next.js basePath when deployed to GitHub Pages
const BASE_PATH = process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true' ? '/word-journey-web' : '';

export async function loadWords(): Promise<WordsJson> {
  if (wordsCache) return wordsCache;
  const res = await fetch(`${BASE_PATH}/data/words.json`);
  wordsCache = await res.json() as WordsJson;
  return wordsCache;
}

export async function loadValidWords(): Promise<Set<string>> {
  if (validWordsCache) return validWordsCache;
  const res = await fetch(`${BASE_PATH}/data/valid_words.json`);
  const data: unknown = await res.json();
  // Support both a flat string[] and a length-keyed { "4": string[], "5": string[], … }
  let words: string[];
  if (Array.isArray(data)) {
    words = data as string[];
  } else {
    words = Object.values(data as Record<string, string[]>).flat();
  }
  validWordsCache = new Set(words.map(w => w.toUpperCase()));
  return validWordsCache;
}

/** Get all words of a given length */
export async function getWordsForLength(length: number): Promise<WordEntry[]> {
  const words = await loadWords();
  return words[String(length)] ?? [];
}

/** Get a specific word by 1-based level index within a length bucket */
export async function getWordForLevel(
  length: number,
  level: number
): Promise<WordEntry> {
  const bucket = await getWordsForLength(length);
  if (bucket.length === 0) {
    return { word: 'HELLO', definition: 'A greeting' };
  }
  const idx = (level - 1) % bucket.length;
  return bucket[idx];
}

// ─── Daily Challenge — Android-parity seeding ────────────────────────────────
/**
 * Java-compatible LCG that mirrors java.util.Random exactly.
 * Needed so every player (web & Android) gets the same daily word.
 */
function javaRandom(seedLong: bigint): (bound: number) => number {
  const MULT = 0x5DEECE66Dn;
  const ADD  = 0xBn;
  const MASK = (1n << 48n) - 1n;
  let state = (seedLong ^ MULT) & MASK;

  function next(bits: number): number {
    state = (state * MULT + ADD) & MASK;
    return Number(state >> BigInt(48 - bits));
  }

  return function nextInt(bound: number): number {
    if ((bound & -bound) === bound) {     // power of 2 fast path
      return Number(BigInt(bound) * BigInt(next(31)) >> 31n);
    }
    let bits: number, val: number;
    do { bits = next(31); val = bits % bound; }
    while (bits - val + (bound - 1) < 0);
    return val;
  };
}

/**
 * Matches Android's DailyChallengeRepository.computeDateSeed exactly:
 *   datePart = DD * 1_000_000 + MM * 10_000 + YYYY
 *   seed     = datePart + wordLength * 31
 */
function computeDateSeed(dateStr: string, wordLength: number): bigint {
  const parts = dateStr.split('-');
  const year  = BigInt(parseInt(parts[0]) || 2024);
  const month = BigInt(parseInt(parts[1]) || 1);
  const day   = BigInt(parseInt(parts[2]) || 1);
  const datePart = day * 1_000_000n + month * 10_000n + year;
  return datePart + BigInt(wordLength) * 31n;
}

// Cached daily definitions: keyed by UPPERCASE word
let dailyDefinitionsCache: Map<string, string> | null = null;

async function loadDailyDefinitions(): Promise<Map<string, string>> {
  if (dailyDefinitionsCache) return dailyDefinitionsCache;
  try {
    const res = await fetch(`${BASE_PATH}/data/daily_word_definitions.json`);
    const raw = await res.json() as Record<string, string>;
    dailyDefinitionsCache = new Map(Object.entries(raw).map(([k, v]) => [k.toUpperCase(), v]));
  } catch {
    dailyDefinitionsCache = new Map();
  }
  return dailyDefinitionsCache;
}

// Cached daily pool: valid_words filtered to only words with definitions, level words excluded
let dailyPoolCache: Map<number, string[]> | null = null;

async function loadDailyPool(): Promise<Map<number, string[]>> {
  if (dailyPoolCache) return dailyPoolCache;

  const [validData, wordData, definitions] = await Promise.all([
    fetch(`${BASE_PATH}/data/valid_words.json`).then(r => r.json()),
    fetch(`${BASE_PATH}/data/words.json`).then(r => r.json()),
    loadDailyDefinitions(),
  ]);

  // Collect all level words to exclude from daily pool (matches Android behaviour)
  const levelWords = new Set<string>();
  for (const bucket of Object.values(wordData as Record<string, { word: string }[]>)) {
    for (const entry of bucket) levelWords.add(entry.word.toUpperCase());
  }

  // Build alphabetically-sorted pool per length — only words that have a definition,
  // matching Android's DailyChallengeRepository.buildWordList() filter so both platforms
  // serve the same word every day.
  const pool = new Map<number, string[]>();
  for (const [lenKey, rawWords] of Object.entries(validData as Record<string, string[]>)) {
    const len = parseInt(lenKey);
    if (len === 4 || len === 5 || len === 6) {
      const words = (rawWords as string[])
        .map(w => w.toUpperCase())
        .filter(w => !levelWords.has(w) && definitions.has(w))
        .sort();
      pool.set(len, words);
    }
  }

  dailyPoolCache = pool;
  return pool;
}

/**
 * Returns the daily challenge word for a given date + length, including its definition.
 * Algorithm is identical to Android's DailyChallengeRepository so both platforms
 * serve the same word every day.  The pool is pre-filtered to only words that have
 * verified definitions, guaranteeing the win screen can always display a definition.
 */
export async function getDailyWord(date: string, length: number): Promise<WordEntry> {
  const [pool, definitions] = await Promise.all([loadDailyPool(), loadDailyDefinitions()]);
  const words = pool.get(length) ?? [];
  if (words.length === 0) return { word: 'HELLO', definition: '' };
  const seed  = computeDateSeed(date, length);
  const idx   = javaRandom(seed)(words.length);
  const word  = words[idx];
  return { word, definition: definitions.get(word) ?? '' };
}
