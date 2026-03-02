// Device-local progress persistence

import type { PlayerProgress } from './game';

const STORAGE_KEY = 'word-journeys-progress';

export function saveProgress(progress: PlayerProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function loadProgress(): PlayerProgress | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
