// Core game logic for Word Journeys Web
// Ported from Android app, TypeScript version

export type Difficulty = 'easy' | 'regular' | 'hard' | 'vip';

export interface PlayerProgress {
  coins: number;
  diamonds: number;
  easyLevel: number;
  regularLevel: number;
  hardLevel: number;
  vipLevel: number;
  lives: number;
  addGuessItems: number;
  removeLetterItems: number;
  definitionItems: number;
  showLetterItems: number;
  // ...other fields as needed
}

export interface GameState {
  difficulty: Difficulty;
  level: number;
  word: string;
  guesses: string[];
  status: 'IN_PROGRESS' | 'WON' | 'LOST' | 'WAITING_FOR_LIFE';
  // ...other fields as needed
}

export function applyLevelCompletion(progress: PlayerProgress, _difficulty: Difficulty, completedLevel: number): PlayerProgress {
  let updated = { ...progress };
  // Area completion reward: every 25 levels
  if (completedLevel % 25 === 0 && completedLevel > 0) {
    updated.diamonds += 25;
  }
  // ...other rewards logic
  return updated;
}
