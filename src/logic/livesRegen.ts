import type { PlayerProgress } from './types';

const REGEN_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
export const MAX_REGEN_LIVES = 10;

/**
 * Apply accumulated life regeneration based on elapsed time.
 * Returns updated progress and milliseconds until next regen.
 */
export function applyLivesRegen(progress: PlayerProgress): {
  updated: PlayerProgress;
  msUntilNext: number;
} {
  const now = Date.now();

  if (progress.lives >= MAX_REGEN_LIVES) {
    return { updated: progress, msUntilNext: 0 };
  }

  const timestamp = progress.lastLifeRegenTimestamp || now;
  const elapsed = now - timestamp;
  const livesEarned = Math.floor(elapsed / REGEN_INTERVAL_MS);

  if (livesEarned === 0) {
    const msUntilNext = REGEN_INTERVAL_MS - (elapsed % REGEN_INTERVAL_MS);
    return { updated: progress, msUntilNext };
  }

  const newLives = Math.min(progress.lives + livesEarned, MAX_REGEN_LIVES);
  const consumed = livesEarned * REGEN_INTERVAL_MS;
  const newTimestamp = newLives >= MAX_REGEN_LIVES ? now : timestamp + consumed;

  const updated: PlayerProgress = {
    ...progress,
    lives: newLives,
    lastLifeRegenTimestamp: newTimestamp,
  };

  const msUntilNext = newLives >= MAX_REGEN_LIVES
    ? 0
    : REGEN_INTERVAL_MS - ((now - newTimestamp) % REGEN_INTERVAL_MS);

  return { updated, msUntilNext };
}

/** Start regen timer when a life is spent */
export function startRegenTimer(progress: PlayerProgress): PlayerProgress {
  if (progress.lives >= MAX_REGEN_LIVES) {
    return { ...progress, lastLifeRegenTimestamp: 0 };
  }
  if (progress.lastLifeRegenTimestamp === 0) {
    return { ...progress, lastLifeRegenTimestamp: Date.now() };
  }
  return progress;
}

/** Format ms as MM:SS */
export function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
