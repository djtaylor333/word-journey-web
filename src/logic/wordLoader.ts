import type { WordEntry } from './types';

interface WordsJson {
  [length: string]: WordEntry[];
}

let wordsCache: WordsJson | null = null;
let validWordsCache: Set<string> | null = null;

export async function loadWords(): Promise<WordsJson> {
  if (wordsCache) return wordsCache;
  const res = await fetch('/data/words.json');
  wordsCache = await res.json() as WordsJson;
  return wordsCache;
}

export async function loadValidWords(): Promise<Set<string>> {
  if (validWordsCache) return validWordsCache;
  const res = await fetch('/data/valid_words.json');
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

/** Deterministic daily word — same for all players on a given date */
export async function getDailyWord(date: string, length: number): Promise<WordEntry> {
  const bucket = await getWordsForLength(length);
  if (bucket.length === 0) return { word: 'HELLO', definition: 'A greeting' };
  // Create a hash from date string + length
  let hash = 0;
  const seed = `${date}-${length}`;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return bucket[hash % bucket.length];
}
