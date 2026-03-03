/**
 * Unit tests for livesRegen.ts
 * Covers: applyLivesRegen (full, partial, zero), startRegenTimer, formatCountdown
 */
import { applyLivesRegen, startRegenTimer, formatCountdown, MAX_REGEN_LIVES } from './livesRegen';
import type { PlayerProgress } from './types';
import { DEFAULT_PROGRESS } from './progressStore';

const REGEN_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes (must match livesRegen.ts)

function makeProgress(lives: number, lastLifeRegenTimestamp = 0): PlayerProgress {
  return { ...DEFAULT_PROGRESS, lives, lastLifeRegenTimestamp };
}

// ─── applyLivesRegen ─────────────────────────────────────────────────────────
describe('applyLivesRegen', () => {
  it('returns same progress and msUntilNext=0 when lives are full', () => {
    const p = makeProgress(MAX_REGEN_LIVES);
    const { updated, msUntilNext } = applyLivesRegen(p);
    expect(updated).toBe(p);
    expect(msUntilNext).toBe(0);
  });

  it('returns msUntilNext > 0 when no interval has elapsed', () => {
    const now = Date.now();
    const p = makeProgress(5, now); // regenerating, but no full interval elapsed
    const { updated, msUntilNext } = applyLivesRegen(p);
    expect(updated.lives).toBe(5); // no change
    expect(msUntilNext).toBeGreaterThan(0);
    expect(msUntilNext).toBeLessThanOrEqual(REGEN_INTERVAL_MS);
  });

  it('adds 1 life after exactly 1 interval', () => {
    const past = Date.now() - REGEN_INTERVAL_MS;
    const p = makeProgress(5, past);
    const { updated } = applyLivesRegen(p);
    expect(updated.lives).toBe(6);
  });

  it('adds multiple lives for multiple elapsed intervals', () => {
    const past = Date.now() - (3 * REGEN_INTERVAL_MS);
    const p = makeProgress(5, past);
    const { updated } = applyLivesRegen(p);
    expect(updated.lives).toBe(8);
  });

  it('caps lives at MAX_REGEN_LIVES even with many intervals', () => {
    const past = Date.now() - (100 * REGEN_INTERVAL_MS);
    const p = makeProgress(3, past);
    const { updated } = applyLivesRegen(p);
    expect(updated.lives).toBe(MAX_REGEN_LIVES);
  });

  it('sets msUntilNext to 0 when lives reach maximum', () => {
    const past = Date.now() - (100 * REGEN_INTERVAL_MS);
    const p = makeProgress(3, past);
    const { msUntilNext } = applyLivesRegen(p);
    expect(msUntilNext).toBe(0);
  });

  it('advances the timestamp after awarding lives', () => {
    const past = Date.now() - REGEN_INTERVAL_MS;
    const p = makeProgress(5, past);
    const { updated } = applyLivesRegen(p);
    expect(updated.lastLifeRegenTimestamp).toBeGreaterThan(past);
  });
});

// ─── startRegenTimer ─────────────────────────────────────────────────────────
describe('startRegenTimer', () => {
  it('sets timestamp when lives are below max and no timer is running', () => {
    const p = makeProgress(5, 0);
    const result = startRegenTimer(p);
    expect(result.lastLifeRegenTimestamp).toBeGreaterThan(0);
    expect(result.lastLifeRegenTimestamp).toBeLessThanOrEqual(Date.now() + 100);
  });

  it('does not override an already-running timer', () => {
    const existingTs = Date.now() - 60_000;
    const p = makeProgress(5, existingTs);
    const result = startRegenTimer(p);
    expect(result.lastLifeRegenTimestamp).toBe(existingTs);
  });

  it('clears timestamp when lives are at max', () => {
    const p = makeProgress(MAX_REGEN_LIVES, Date.now());
    const result = startRegenTimer(p);
    expect(result.lastLifeRegenTimestamp).toBe(0);
  });
});

// ─── formatCountdown ──────────────────────────────────────────────────────────
describe('formatCountdown', () => {
  it('formats 0ms as 00:00', () => {
    expect(formatCountdown(0)).toBe('00:00');
  });

  it('formats exactly 1 minute as 01:00', () => {
    expect(formatCountdown(60_000)).toBe('01:00');
  });

  it('formats 10 minutes as 10:00', () => {
    expect(formatCountdown(10 * 60 * 1000)).toBe('10:00');
  });

  it('pads seconds with leading zero', () => {
    expect(formatCountdown(65_000)).toBe('01:05');
  });

  it('rounds up to the nearest second', () => {
    // 1500ms → ceil(1.5s) = 2s → 00:02
    expect(formatCountdown(1500)).toBe('00:02');
  });

  it('handles 9 minutes 59 seconds', () => {
    expect(formatCountdown(9 * 60 * 1000 + 59 * 1000)).toBe('09:59');
  });
});
