import type { PlayerProgress } from './types';

const STORAGE_KEY = 'word-journeys-progress';
const PLAYER_ID_KEY = 'word-journeys-player-id';

/**
 * Returns a stable UUID that identifies this browser/device.
 * Created on first visit, persisted in localStorage forever.
 * Safe to use as a future Google OAuth linkage key.
 */
export function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    // crypto.randomUUID is available in all modern browsers
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

export const DEFAULT_PROGRESS: PlayerProgress = {
  coins: 100,
  diamonds: 5,
  lives: 10,
  lastLifeRegenTimestamp: 0,
  addGuessItems: 0,
  removeLetterItems: 0,
  definitionItems: 0,
  showLetterItems: 0,
  easyLevel: 1,
  regularLevel: 1,
  hardLevel: 1,
  vipLevel: 1,
  easyLevelsCompleted: 0,
  regularLevelsCompleted: 0,
  hardLevelsCompleted: 0,
  vipLevelsCompleted: 0,
  levelStars: {},
  dailyStreak: 0,
  dailyBestStreak: 0,
  dailyLastDate: '',
  dailyCompleted4: false,
  dailyCompleted5: false,
  dailyCompleted6: false,
  dailyStars4: 0,
  dailyStars5: 0,
  dailyStars6: 0,
  dailyStreak4: 0,
  dailyStreak5: 0,
  dailyStreak6: 0,
  dailyBestStreak4: 0,
  dailyBestStreak5: 0,
  dailyBestStreak6: 0,
  loginStreak: 0,
  loginBestStreak: 0,
  lastLoginDate: '',
  totalWins: 0,
  totalLevelsCompleted: 0,
  totalGuesses: 0,
  totalItemsUsed: 0,
  totalDailyChallengesCompleted: 0,
  totalCoinsEarned: 0,
  totalStars: 0,
  totalTimePlayed: 0,
  bonusLives: 0,
  timerBestEasy: 0,
  timerBestRegular: 0,
  timerBestHard: 0,
  pendingRewards: [],
  darkMode: true,
  highContrast: false,
  sfxEnabled: true,
  musicEnabled: false,
  musicVolume: 70,
  sfxVolume: 100,
  textScale: 1.0,
  hasSeenOnboarding: false,
  isNewPlayer: true,
  savedGameState: null,
  isVip: false,
  devModeEnabled: false,
};

export function saveProgress(progress: PlayerProgress): void {
  if (typeof window === 'undefined') return;
  // Convert Set/Map to serializable form — they're not in progress, but be safe
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function loadProgress(): PlayerProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    // Merge with defaults to fill in any fields added in new versions
    const merged = { ...DEFAULT_PROGRESS, ...parsed };
    // Sanitize values that may have been corrupted by earlier bugs
    // (e.g. the win-loop bug that fired handleWin thousands of times)
    return {
      ...merged,
      lives:    Math.min(Math.max(0, merged.lives),    999),
      coins:    Math.min(Math.max(0, merged.coins),    9_999_999),
      diamonds: Math.min(Math.max(0, merged.diamonds), 9_999),
    };
  } catch {
    return null;
  }
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/** Update login streak based on today's date */
export function applyLoginStreak(progress: PlayerProgress): PlayerProgress {
  const today = new Date().toISOString().slice(0, 10);
  if (progress.lastLoginDate === today) return progress;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newStreak = progress.lastLoginDate === yesterday
    ? progress.loginStreak + 1
    : 1;
  const newBest = Math.max(progress.loginBestStreak, newStreak);

  return {
    ...progress,
    loginStreak: newStreak,
    loginBestStreak: newBest,
    lastLoginDate: today,
  };
}

/** Check daily challenge reset — reset completed booleans if date changed */
export function applyDailyReset(progress: PlayerProgress): PlayerProgress {
  const today = new Date().toISOString().slice(0, 10);
  if (progress.dailyLastDate === today) return progress;
  return {
    ...progress,
    dailyLastDate: today,
    dailyCompleted4: false,
    dailyCompleted5: false,
    dailyCompleted6: false,
    dailyStars4: 0,
    dailyStars5: 0,
    dailyStars6: 0,
  };
}

/**
 * Apply one-time new-player welcome bonus (500 coins + 5 diamonds + 3 of each item).
 * Only runs when `isNewPlayer === true`; clears the flag afterward.
 */
export function applyNewPlayerBonus(progress: PlayerProgress): PlayerProgress {
  if (!progress.isNewPlayer) return progress;
  return {
    ...progress,
    coins: 500,
    diamonds: 5,
    addGuessItems: 3,
    removeLetterItems: 3,
    definitionItems: 3,
    showLetterItems: 3,
    totalCoinsEarned: 500,
    isNewPlayer: false,
    pendingRewards: [
      ...progress.pendingRewards,
      {
        id: 'welcome-bonus',
        title: '🎉 Welcome to Word Journeys!',
        message: 'Here are some items to get you started: 500 coins, 5 diamonds, and 3 of each power-up!',
        coins: 500,
        diamonds: 5,
        claimed: false,
        timestamp: Date.now(),
      },
    ],
  };
}
