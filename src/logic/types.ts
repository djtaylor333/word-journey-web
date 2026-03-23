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
  | { name: 'seasonalLevelSelect'; seasonKey: string }
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

// ─── Seasonal Zone Maps ────────────────────────────────────────────────────────
// Each seasonal pack has 10 uniquely-themed zones replacing the standard adventure zones.

export const EASTER_ZONES: Zone[] = [
  { name: 'Bunny Meadow',    emoji: '🐰', bgFrom: '#1A2810', bgTo: '#2E3D1A', pathColor: '#A3E635' },
  { name: 'Egg Hunt Garden', emoji: '🥚', bgFrom: '#112118', bgTo: '#1E3A2A', pathColor: '#6EE7B7' },
  { name: 'Chick Parade',    emoji: '🐣', bgFrom: '#211808', bgTo: '#3D3210', pathColor: '#FDE68A' },
  { name: 'Daisy Fields',    emoji: '🌸', bgFrom: '#210D18', bgTo: '#3D1A2E', pathColor: '#F9A8D4' },
  { name: 'Rainbow Bridge',  emoji: '🌈', bgFrom: '#0D1821', bgTo: '#1A2D3D', pathColor: '#7DD3FC' },
  { name: 'Clover Hills',    emoji: '🍀', bgFrom: '#082110', bgTo: '#0D3D1A', pathColor: '#4ADE80' },
  { name: 'Blossom Cave',    emoji: '🌺', bgFrom: '#210D0D', bgTo: '#3D1A1A', pathColor: '#FCA5A5' },
  { name: 'Painted Eggs',    emoji: '🎨', bgFrom: '#180D21', bgTo: '#2A1A3D', pathColor: '#C084FC' },
  { name: 'Spring Pond',     emoji: '🐸', bgFrom: '#081810', bgTo: '#0D2D1A', pathColor: '#86EFAC' },
  { name: 'Easter Sunrise',  emoji: '🌅', bgFrom: '#211808', bgTo: '#3D2A10', pathColor: '#FDE68A' },
];

export const VALENTINES_ZONES: Zone[] = [
  { name: 'Rose Garden',      emoji: '🌹', bgFrom: '#210810', bgTo: '#3D0D1A', pathColor: '#FDA4AF' },
  { name: 'Love Meadow',      emoji: '💕', bgFrom: '#210D18', bgTo: '#3D1A2E', pathColor: '#E879F9' },
  { name: 'Candy Hearts',     emoji: '🍬', bgFrom: '#180D21', bgTo: '#2E1A3D', pathColor: '#C084FC' },
  { name: 'Lovebird Forest',  emoji: '🕊️', bgFrom: '#082118', bgTo: '#0D3D2A', pathColor: '#6EE7B7' },
  { name: 'Chocolate Hills',  emoji: '🍫', bgFrom: '#210D08', bgTo: '#3D1A10', pathColor: '#FCA5A5' },
  { name: 'Starry Romance',   emoji: '⭐', bgFrom: '#0D0D21', bgTo: '#1A1A3D', pathColor: '#818CF8' },
  { name: 'Picnic Bluffs',    emoji: '🧺', bgFrom: '#1A2110', bgTo: '#2E3D1A', pathColor: '#A3E635' },
  { name: 'Petal Cascade',    emoji: '🌸', bgFrom: '#211810', bgTo: '#3D2A1A', pathColor: '#FBBF24' },
  { name: 'Heart Cove',       emoji: '💖', bgFrom: '#210818', bgTo: '#3D0D2D', pathColor: '#F9A8D4' },
  { name: 'Valentine Peak',   emoji: '💝', bgFrom: '#210D0D', bgTo: '#3D1A1A', pathColor: '#FDA4AF' },
];

export const SUMMER_ZONES: Zone[] = [
  { name: 'Sunny Beach',      emoji: '🏖️', bgFrom: '#211608', bgTo: '#3D2A0D', pathColor: '#FDE68A' },
  { name: 'Coral Reef',       emoji: '🐠', bgFrom: '#081821', bgTo: '#0D2D3D', pathColor: '#67E8F9' },
  { name: 'Tropical Forest',  emoji: '🌴', bgFrom: '#082110', bgTo: '#0D3D1A', pathColor: '#4ADE80' },
  { name: 'Lemonade Stand',   emoji: '🍋', bgFrom: '#211808', bgTo: '#3D3210', pathColor: '#FDE68A' },
  { name: 'BBQ Grounds',      emoji: '🔥', bgFrom: '#210D08', bgTo: '#3D1A0D', pathColor: '#FB923C' },
  { name: 'Waterfall Oasis',  emoji: '💦', bgFrom: '#081818', bgTo: '#0D2D2D', pathColor: '#34D399' },
  { name: 'Sprinkler Park',   emoji: '🌈', bgFrom: '#0D0D21', bgTo: '#1A1A3D', pathColor: '#7DD3FC' },
  { name: 'Ice Cream Hills',  emoji: '🍦', bgFrom: '#210D18', bgTo: '#3D1A2E', pathColor: '#F9A8D4' },
  { name: 'Festival Grounds', emoji: '🎆', bgFrom: '#210810', bgTo: '#3D0D1A', pathColor: '#FCA5A5' },
  { name: 'Sunset Horizon',   emoji: '🌅', bgFrom: '#211808', bgTo: '#3D2810', pathColor: '#FBBF24' },
];

export const HALLOWEEN_ZONES: Zone[] = [
  { name: 'Haunted Forest',   emoji: '🌲', bgFrom: '#0D0D08', bgTo: '#1A1A0D', pathColor: '#BEF264' },
  { name: 'Pumpkin Patch',    emoji: '🎃', bgFrom: '#210D08', bgTo: '#3D1A0D', pathColor: '#FB923C' },
  { name: 'Ghost Graveyard',  emoji: '👻', bgFrom: '#0D0D18', bgTo: '#1A1A2D', pathColor: '#818CF8' },
  { name: "Witch's Cauldron", emoji: '🧙', bgFrom: '#081008', bgTo: '#0D1A0D', pathColor: '#4ADE80' },
  { name: 'Vampire Castle',   emoji: '🏰', bgFrom: '#180810', bgTo: '#2D0D1A', pathColor: '#FDA4AF' },
  { name: 'Skull Cavern',     emoji: '💀', bgFrom: '#100808', bgTo: '#1A0D0D', pathColor: '#F87171' },
  { name: 'Candy Trail',      emoji: '🍬', bgFrom: '#210D21', bgTo: '#3D1A3D', pathColor: '#C084FC' },
  { name: 'Spider Bog',       emoji: '🕷️', bgFrom: '#081008', bgTo: '#0D1A0D', pathColor: '#86EFAC' },
  { name: 'Shadow Realm',     emoji: '🌑', bgFrom: '#080808', bgTo: '#0D0D0D', pathColor: '#94A3B8' },
  { name: 'Halloween Peak',   emoji: '🎃', bgFrom: '#210D04', bgTo: '#3D1A08', pathColor: '#FBBF24' },
];

export const THANKSGIVING_ZONES: Zone[] = [
  { name: 'Harvest Fields',   emoji: '🌾', bgFrom: '#211508', bgTo: '#3D2A0D', pathColor: '#FDE68A' },
  { name: 'Apple Orchard',    emoji: '🍎', bgFrom: '#210D08', bgTo: '#3D1A0D', pathColor: '#FCA5A5' },
  { name: 'Pilgrim Trail',    emoji: '🗺️', bgFrom: '#181208', bgTo: '#2A2010', pathColor: '#FCD34D' },
  { name: 'Golden Meadow',    emoji: '🍁', bgFrom: '#211808', bgTo: '#3D2810', pathColor: '#FB923C' },
  { name: 'Pumpkin Spice',    emoji: '☕', bgFrom: '#180E08', bgTo: '#2D1810', pathColor: '#FBBF24' },
  { name: 'Turkey Valley',    emoji: '🦃', bgFrom: '#181A08', bgTo: '#2A3010', pathColor: '#A3E635' },
  { name: 'Cranberry Bogs',   emoji: '🫐', bgFrom: '#210810', bgTo: '#3D0D1A', pathColor: '#FDA4AF' },
  { name: 'Cornucopia Cave',  emoji: '🌽', bgFrom: '#211808', bgTo: '#3D2A10', pathColor: '#FBBF24' },
  { name: 'Family Hearth',    emoji: '🔥', bgFrom: '#210D04', bgTo: '#3D1A08', pathColor: '#FB923C' },
  { name: 'Gratitude Summit', emoji: '🌅', bgFrom: '#211810', bgTo: '#3D2A18', pathColor: '#FDE68A' },
];

export const CHRISTMAS_ZONES: Zone[] = [
  { name: "Santa's Village",   emoji: '🎅', bgFrom: '#210808', bgTo: '#3D0D0D', pathColor: '#FCA5A5' },
  { name: 'Winter Wonderland', emoji: '❄️', bgFrom: '#081821', bgTo: '#0D2D3D', pathColor: '#7DD3FC' },
  { name: 'Gift Grotto',       emoji: '🎁', bgFrom: '#210810', bgTo: '#3D0D1A', pathColor: '#FDA4AF' },
  { name: 'Candy Cane Lane',   emoji: '🍬', bgFrom: '#210D0D', bgTo: '#3D1A1A', pathColor: '#FCA5A5' },
  { name: 'Christmas Forest',  emoji: '🎄', bgFrom: '#081808', bgTo: '#0D2D10', pathColor: '#4ADE80' },
  { name: 'Elf Workshop',      emoji: '🧝', bgFrom: '#082108', bgTo: '#0D3D0D', pathColor: '#86EFAC' },
  { name: 'Frozen Lake',       emoji: '🏒', bgFrom: '#081821', bgTo: '#0D2A3D', pathColor: '#67E8F9' },
  { name: 'Reindeer Run',      emoji: '🦌', bgFrom: '#181408', bgTo: '#2D2010', pathColor: '#FBBF24' },
  { name: 'Fireplace Hollow',  emoji: '🔥', bgFrom: '#210D04', bgTo: '#3D1A08', pathColor: '#FB923C' },
  { name: 'North Pole Peak',   emoji: '⭐', bgFrom: '#0D0D21', bgTo: '#1A1A3D', pathColor: '#818CF8' },
];

const SEASONAL_ZONE_MAP: Record<string, Zone[]> = {
  easter:       EASTER_ZONES,
  valentines:   VALENTINES_ZONES,
  summer:       SUMMER_ZONES,
  halloween:    HALLOWEEN_ZONES,
  thanksgiving: THANKSGIVING_ZONES,
  christmas:    CHRISTMAS_ZONES,
};

/** Returns the zone theme for [level] within a seasonal pack, or standard adventure zones. */
export function getSeasonalZone(seasonKey: string, level: number): Zone {
  const zoneList = SEASONAL_ZONE_MAP[seasonKey] ?? ZONES;
  return zoneList[Math.floor((level - 1) / 10) % 10];
}
