/**
 * Unit tests for progressStore.ts
 * Covers: localDateStr, applyDailyReset, applyLoginStreak,
 *         applyNewPlayerBonus, loadProgress (sanitization), DEFAULT_PROGRESS
 */
import {
  localDateStr,
  applyDailyReset,
  applyLoginStreak,
  applyNewPlayerBonus,
  saveProgress,
  loadProgress,
  DEFAULT_PROGRESS,
} from './progressStore';
import type { PlayerProgress } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeProgress(overrides: Partial<PlayerProgress> = {}): PlayerProgress {
  return { ...DEFAULT_PROGRESS, ...overrides };
}

/** Format a Date as YYYY-MM-DD using local time — mirrors localDateStr logic */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─── localDateStr ─────────────────────────────────────────────────────────────
describe('localDateStr', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    const result = localDateStr();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns the local date, not UTC', () => {
    const now = new Date();
    expect(localDateStr(now)).toBe(toLocalDateStr(now));
  });

  it('formats a specific date correctly', () => {
    // 2026-03-01 at noon local
    const d = new Date(2026, 2, 1, 12, 0, 0); // month is 0-indexed
    expect(localDateStr(d)).toBe('2026-03-01');
  });

  it('pads month and day with leading zeros', () => {
    const d = new Date(2026, 0, 5, 12, 0, 0); // Jan 5
    expect(localDateStr(d)).toBe('2026-01-05');
  });
});

// ─── applyDailyReset ──────────────────────────────────────────────────────────
describe('applyDailyReset', () => {
  it('returns same object when dailyLastDate is today (already won today)', () => {
    const today = localDateStr();
    const p = makeProgress({ dailyLastDate: today, dailyCompleted4: true });
    const result = applyDailyReset(p);
    expect(result).toBe(p); // reference equality — no mutation
    expect(result.dailyCompleted4).toBe(true);
  });

  it('clears completion flags when date is from a prior day', () => {
    const yesterday = localDateStr(new Date(Date.now() - 86_400_000));
    const p = makeProgress({
      dailyLastDate: yesterday,
      dailyCompleted4: true,
      dailyCompleted5: true,
      dailyCompleted6: true,
      dailyStars4: 2,
      dailyStars5: 3,
      dailyStars6: 1,
    });
    const result = applyDailyReset(p);
    expect(result.dailyCompleted4).toBe(false);
    expect(result.dailyCompleted5).toBe(false);
    expect(result.dailyCompleted6).toBe(false);
    expect(result.dailyStars4).toBe(0);
    expect(result.dailyStars5).toBe(0);
    expect(result.dailyStars6).toBe(0);
  });

  it('does NOT overwrite dailyLastDate — keeps old win date for streak check', () => {
    const yesterday = localDateStr(new Date(Date.now() - 86_400_000));
    const p = makeProgress({ dailyLastDate: yesterday });
    const result = applyDailyReset(p);
    // Must preserve the last win date so handleWin can detect a consecutive streak
    expect(result.dailyLastDate).toBe(yesterday);
  });

  it('does NOT reset other progress fields', () => {
    const yesterday = localDateStr(new Date(Date.now() - 86_400_000));
    const p = makeProgress({
      dailyLastDate: yesterday,
      dailyStreak: 5,
      dailyBestStreak: 10,
      coins: 999,
      easyLevel: 7,
    });
    const result = applyDailyReset(p);
    expect(result.dailyStreak).toBe(5);
    expect(result.dailyBestStreak).toBe(10);
    expect(result.coins).toBe(999);
    expect(result.easyLevel).toBe(7);
  });

  it('clears flags for a brand-new player (empty dailyLastDate)', () => {
    const p = makeProgress({
      dailyLastDate: '',
      dailyCompleted5: true,
    });
    const result = applyDailyReset(p);
    expect(result.dailyCompleted5).toBe(false);
  });
});

// ─── applyLoginStreak ─────────────────────────────────────────────────────────
describe('applyLoginStreak', () => {
  it('starts streak at 1 on first login', () => {
    const p = makeProgress({ lastLoginDate: '', loginStreak: 0 });
    const result = applyLoginStreak(p);
    expect(result.loginStreak).toBe(1);
    expect(result.lastLoginDate).toBe(localDateStr());
  });

  it('does not change streak if already logged in today', () => {
    const today = localDateStr();
    const p = makeProgress({ lastLoginDate: today, loginStreak: 4 });
    const result = applyLoginStreak(p);
    expect(result).toBe(p); // reference equality — no work done
    expect(result.loginStreak).toBe(4);
  });

  it('increments streak by 1 for consecutive days', () => {
    const yesterday = localDateStr(new Date(Date.now() - 86_400_000));
    const p = makeProgress({ lastLoginDate: yesterday, loginStreak: 3 });
    const result = applyLoginStreak(p);
    expect(result.loginStreak).toBe(4);
  });

  it('resets streak to 1 when a day is missed', () => {
    const twoDaysAgo = localDateStr(new Date(Date.now() - 2 * 86_400_000));
    const p = makeProgress({ lastLoginDate: twoDaysAgo, loginStreak: 10 });
    const result = applyLoginStreak(p);
    expect(result.loginStreak).toBe(1);
  });

  it('updates loginBestStreak when streak exceeds previous best', () => {
    const yesterday = localDateStr(new Date(Date.now() - 86_400_000));
    const p = makeProgress({ lastLoginDate: yesterday, loginStreak: 7, loginBestStreak: 7 });
    const result = applyLoginStreak(p);
    expect(result.loginStreak).toBe(8);
    expect(result.loginBestStreak).toBe(8);
  });

  it('does not lower loginBestStreak on reset', () => {
    const twoDaysAgo = localDateStr(new Date(Date.now() - 2 * 86_400_000));
    const p = makeProgress({ lastLoginDate: twoDaysAgo, loginStreak: 20, loginBestStreak: 20 });
    const result = applyLoginStreak(p);
    expect(result.loginStreak).toBe(1);
    expect(result.loginBestStreak).toBe(20);
  });
});

// ─── applyNewPlayerBonus ──────────────────────────────────────────────────────
describe('applyNewPlayerBonus', () => {
  it('gives 500 coins and 5 diamonds to a new player', () => {
    const p = makeProgress({ isNewPlayer: true, coins: 100, diamonds: 0 });
    const result = applyNewPlayerBonus(p);
    expect(result.coins).toBe(500);
    expect(result.diamonds).toBe(5);
  });

  it('gives 3 of each power-up item', () => {
    const p = makeProgress({ isNewPlayer: true });
    const result = applyNewPlayerBonus(p);
    expect(result.addGuessItems).toBe(3);
    expect(result.removeLetterItems).toBe(3);
    expect(result.definitionItems).toBe(3);
    expect(result.showLetterItems).toBe(3);
  });

  it('clears the isNewPlayer flag', () => {
    const p = makeProgress({ isNewPlayer: true });
    const result = applyNewPlayerBonus(p);
    expect(result.isNewPlayer).toBe(false);
  });

  it('adds a welcome reward to pendingRewards', () => {
    const p = makeProgress({ isNewPlayer: true, pendingRewards: [] });
    const result = applyNewPlayerBonus(p);
    expect(result.pendingRewards).toHaveLength(1);
    expect(result.pendingRewards[0].id).toBe('welcome-bonus');
    expect(result.pendingRewards[0].claimed).toBe(false);
  });

  it('is a no-op if isNewPlayer is false', () => {
    const p = makeProgress({ isNewPlayer: false, coins: 200, diamonds: 3 });
    const result = applyNewPlayerBonus(p);
    expect(result).toBe(p);
    expect(result.coins).toBe(200);
    expect(result.diamonds).toBe(3);
  });
});

// ─── loadProgress / saveProgress ─────────────────────────────────────────────
describe('loadProgress', () => {
  beforeEach(() => localStorage.clear());

  it('returns null when localStorage is empty', () => {
    expect(loadProgress()).toBeNull();
  });

  it('round-trips basic fields through save/load', () => {
    const p = makeProgress({ coins: 1234, diamonds: 17, easyLevel: 5 });
    saveProgress(p);
    const loaded = loadProgress();
    expect(loaded).not.toBeNull();
    expect(loaded!.coins).toBe(1234);
    expect(loaded!.diamonds).toBe(17);
    expect(loaded!.easyLevel).toBe(5);
  });

  it('caps lives at 999 (sanitizes corruption)', () => {
    saveProgress(makeProgress({ lives: 79_517 }));
    const loaded = loadProgress();
    expect(loaded!.lives).toBeLessThanOrEqual(999);
  });

  it('caps coins at 9,999,999 (sanitizes corruption)', () => {
    saveProgress(makeProgress({ coins: 99_000_000 }));
    const loaded = loadProgress();
    expect(loaded!.coins).toBeLessThanOrEqual(9_999_999);
  });

  it('clamps negative values to 0', () => {
    saveProgress(makeProgress({ coins: -50, lives: -5 }));
    const loaded = loadProgress();
    expect(loaded!.coins).toBe(0);
    expect(loaded!.lives).toBe(0);
  });

  it('fills in missing fields with DEFAULT_PROGRESS values (forward compatibility)', () => {
    // Simulate an old save that doesn't have newer fields
    const oldSave = { coins: 300, diamonds: 2, lives: 5 };
    localStorage.setItem('word-journeys-progress', JSON.stringify(oldSave));
    const loaded = loadProgress();
    expect(loaded!.textScale).toBe(DEFAULT_PROGRESS.textScale);
    expect(loaded!.darkMode).toBe(DEFAULT_PROGRESS.darkMode);
    expect(loaded!.dailyStreak).toBe(0);
  });

  it('returns null on corrupt JSON', () => {
    localStorage.setItem('word-journeys-progress', '{ not valid json !!');
    expect(loadProgress()).toBeNull();
  });
});

// ─── DEFAULT_PROGRESS shape ───────────────────────────────────────────────────
describe('DEFAULT_PROGRESS', () => {
  it('has hasSeenOnboarding false by default (new players see onboarding)', () => {
    expect(DEFAULT_PROGRESS.hasSeenOnboarding).toBe(false);
  });

  it('has darkMode true by default', () => {
    expect(DEFAULT_PROGRESS.darkMode).toBe(true);
  });

  it('starts levels all at 1', () => {
    expect(DEFAULT_PROGRESS.easyLevel).toBe(1);
    expect(DEFAULT_PROGRESS.regularLevel).toBe(1);
    expect(DEFAULT_PROGRESS.hardLevel).toBe(1);
    expect(DEFAULT_PROGRESS.vipLevel).toBe(1);
  });

  it('starts with no completed daily challenges', () => {
    expect(DEFAULT_PROGRESS.dailyCompleted4).toBe(false);
    expect(DEFAULT_PROGRESS.dailyCompleted5).toBe(false);
    expect(DEFAULT_PROGRESS.dailyCompleted6).toBe(false);
  });

  it('starts with empty pending rewards', () => {
    expect(DEFAULT_PROGRESS.pendingRewards).toHaveLength(0);
  });
});
