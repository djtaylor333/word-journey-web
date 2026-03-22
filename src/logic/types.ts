// ─── Tile & Keyboard ──────────────────────────────────────────────────────────
export type TileState = 'CORRECT' | 'PRESENT' | 'ABSENT' | 'EMPTY' | 'FILLED' | 'HINT';

// ─── Difficulties ─────────────────────────────────────────────────────────────
export type Difficulty = 'easy' | 'regular' | 'hard' | 'vip';

export const DIFFICULTY_WORD_LENGTHS: Record<Difficulty, number | 'vip-cycle'> = {
  easy: 4,
  regular: 5,
  hard: 6,
  vip: 'vip-cycle',
};

/** VIP word length cycles: level index 0→4 = 3,4,5,6,7 letters */
export function vipWordLength(level: number): number {
  return [3, 4, 5, 6, 7][(level - 1) % 5];
}

export function wordLengthForLevel(difficulty: Difficulty, level: number): number {
  if (difficulty === 'vip') return vipWordLength(level);
  return DIFFICULTY_WORD_LENGTHS[difficulty] as number;
}

/** Levels complete before a bonus life is awarded per difficulty */
export const BONUS_LIFE_EVERY: Record<Difficulty, number> = {
  easy: 10,
  regular: 5,
  hard: 3,
  vip: 5,
};

/** Maximum guesses per difficulty (EASY gets 2 extra to ease players in) */
export const DIFFICULTY_MAX_GUESSES: Record<Difficulty, number> = {
  easy: 8,
  regular: 6,
  hard: 6,
  vip: 6,
};

/** Extra guesses granted when spending a life mid-level */
export const BONUS_ATTEMPTS_PER_LIFE: Record<Difficulty, number> = {
  easy: 3,
  regular: 2,
  hard: 1,
  vip: 2,
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  regular: 'Regular',
  hard: 'Hard',
  vip: 'VIP',
};

export const DIFFICULTY_ACCENT: Record<Difficulty, string> = {
  easy: '#2DD4BF',
  regular: '#F59E0B',
  hard: '#EF4444',
  vip: '#C9A84C',
};

// ─── Completed Guess ──────────────────────────────────────────────────────────
export interface CompletedGuess {
  letters: string[];
  states: TileState[];
}

// ─── In-Game State ────────────────────────────────────────────────────────────
export interface GameState {
  difficulty: Difficulty;
  level: number;
  targetWord: string;
  definition: string;
  completedGuesses: CompletedGuess[];
  currentInput: string[];
  maxGuesses: number;
  keyStates: Record<string, TileState>;
  removedLetters: Set<string>;
  prefilledPositions: Map<number, string>;
  status: 'IN_PROGRESS' | 'WON' | 'LOST' | 'OUT_OF_GUESSES';
  isInvalid: boolean; // triggers shake
  isReplay: boolean;
  coinsEarned: number;
  starsEarned: number;
}

// ─── Player Progress ──────────────────────────────────────────────────────────
export interface PlayerProgress {
  // Currency & items
  coins: number;
  diamonds: number;
  lives: number;
  lastLifeRegenTimestamp: number;
  addGuessItems: number;
  removeLetterItems: number;
  definitionItems: number;
  showLetterItems: number;

  // Adventure level progress
  easyLevel: number;
  regularLevel: number;
  hardLevel: number;
  vipLevel: number;
  easyLevelsCompleted: number;
  regularLevelsCompleted: number;
  hardLevelsCompleted: number;
  vipLevelsCompleted: number;

  // Stars per level (key = "easy-1", "regular-3", etc.)
  levelStars: Record<string, number>;

  // Daily challenge
  dailyStreak: number;
  dailyBestStreak: number;
  dailyLastDate: string;
  dailyCompleted4: boolean;
  dailyCompleted5: boolean;
  dailyCompleted6: boolean;
  dailyStars4: number;
  dailyStars5: number;
  dailyStars6: number;

  // Login streak
  loginStreak: number;
  loginBestStreak: number;
  lastLoginDate: string;

  // Statistics
  totalWins: number;
  totalLevelsCompleted: number;
  totalGuesses: number;
  totalItemsUsed: number;
  totalDailyChallengesCompleted: number;

  // Inbox rewards pending
  pendingRewards: InboxReward[];

  // Bonus lives pool (earned from gameplay, displayed separately)
  bonusLives: number;

  // Timer Mode best scores (words solved in one session)
  timerBestEasy: number;
  timerBestRegular: number;
  timerBestHard: number;

  // Extra stats
  totalCoinsEarned: number;
  totalStars: number;
  totalTimePlayed: number; // seconds

  // Daily per-length streaks
  dailyStreak4: number;
  dailyStreak5: number;
  dailyStreak6: number;
  dailyBestStreak4: number;
  dailyBestStreak5: number;
  dailyBestStreak6: number;

  // Settings
  darkMode: boolean;
  highContrast: boolean;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  musicVolume: number;   // 0–100
  sfxVolume: number;     // 0–100
  textScale: number;     // 0.85 | 1.0 | 1.15

  // Onboarding
  hasSeenOnboarding: boolean;
  isNewPlayer: boolean;

  // Mid-game save (JSON-serialisable snapshot)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  savedGameState: Record<string, any> | null;

  // VIP
  isVip: boolean;

  // Developer mode (hidden; unlocked in Settings)
  devModeEnabled: boolean;

  // Seasonal themed level packs (1-based, wraps at 100)
  seasonalEasterLevel: number;
  seasonalValentinesLevel: number;
  seasonalSummerLevel: number;
  seasonalHalloweenLevel: number;
  seasonalThanksgivingLevel: number;
  seasonalChristmasLevel: number;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export interface AdRewardResult {
  rewardType: 'coins' | 'life' | 'item';
  rewardAmount: number;
  watched: boolean;
  itemType?: 'addGuess' | 'removeLetter' | 'definition' | 'showLetter';
}

// ─── Inbox ────────────────────────────────────────────────────────────────────
export interface InboxReward {
  id: string;
  title: string;
  message: string;
  coins?: number;
  diamonds?: number;
  lives?: number;
  claimed: boolean;
  timestamp: number;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export type Screen =
  | { name: 'home' }
  | { name: 'onboarding' }
  | { name: 'inbox' }
  | { name: 'levelSelect'; difficulty: Difficulty }
  | { name: 'game'; difficulty: Difficulty; level: number; isReplay?: boolean }
  | { name: 'dailyChallenge' }
  | { name: 'dailyGame'; wordLength: number }
  | { name: 'timerMode' }
  | { name: 'store'; tab?: string }
  | { name: 'statistics' }
  | { name: 'settings' }
  | { name: 'themedPacks' }
  | { name: 'seasonalGame'; seasonKey: string; level: number; isReplay?: boolean };

// ─── Word Entry ───────────────────────────────────────────────────────────────
export interface WordEntry {
  word: string;
  definition: string;
}

// ─── Zone Map (Level Select) ───────────────────────────────────────────────────
export interface Zone {
  name: string;
  emoji: string;
  bgFrom: string;
  bgTo: string;
  pathColor: string;
}

export const ZONES: Zone[] = [
  { name: 'Enchanted Meadow', emoji: '🌿', bgFrom: '#0D2B1D', bgTo: '#1A3D2B', pathColor: '#2DD4BF' },
  { name: 'Crystal Cavern',   emoji: '💎', bgFrom: '#101835', bgTo: '#1E2B5E', pathColor: '#67E8F9' },
  { name: 'Sunset Desert',    emoji: '🏜️', bgFrom: '#2B1800', bgTo: '#4A2C00', pathColor: '#F59E0B' },
  { name: 'Frozen Peaks',     emoji: '🏔️', bgFrom: '#0A1A2A', bgTo: '#102840', pathColor: '#BAE6FD' },
  { name: 'Volcanic Core',    emoji: '🌋', bgFrom: '#2B0800', bgTo: '#4A1200', pathColor: '#EF4444' },
  { name: 'Mystic Forest',    emoji: '🌲', bgFrom: '#0B2210', bgTo: '#163520', pathColor: '#86EFAC' },
  { name: 'Starlit Sky',      emoji: '🌌', bgFrom: '#0A0A1F', bgTo: '#14143A', pathColor: '#A78BFA' },
  { name: 'Ocean Depths',     emoji: '🌊', bgFrom: '#001826', bgTo: '#003045', pathColor: '#22D3EE' },
  { name: 'Ancient Ruins',    emoji: '🏛️', bgFrom: '#1A1400', bgTo: '#302600', pathColor: '#D97706' },
  { name: 'Dragon\'s Summit', emoji: '🐉', bgFrom: '#1A0A00', bgTo: '#351500', pathColor: '#F97316' },
];

export function getZone(level: number): Zone {
  return ZONES[Math.floor((level - 1) / 10) % ZONES.length];
}
