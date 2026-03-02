import type { TileState, CompletedGuess, GameState, Difficulty } from './types';
import { BONUS_LIFE_EVERY } from './types';

export const MAX_GUESSES = 6;

// ─── Wordle Evaluation ────────────────────────────────────────────────────────
/**
 * Evaluate a guess against the target word using Wordle rules.
 * Handles duplicate letters correctly.
 */
export function evaluateGuess(guess: string, target: string): TileState[] {
  const g = guess.toUpperCase();
  const t = target.toUpperCase();
  const n = t.length;
  const result: TileState[] = new Array(n).fill('ABSENT');
  const targetCounts: Record<string, number> = {};

  // Count letters in target (excluding CORRECT positions)
  for (let i = 0; i < n; i++) {
    if (g[i] !== t[i]) {
      targetCounts[t[i]] = (targetCounts[t[i]] ?? 0) + 1;
    }
  }

  // First pass: mark CORRECT
  for (let i = 0; i < n; i++) {
    if (g[i] === t[i]) {
      result[i] = 'CORRECT';
    }
  }

  // Second pass: mark PRESENT
  for (let i = 0; i < n; i++) {
    if (result[i] === 'CORRECT') continue;
    if (targetCounts[g[i]] && targetCounts[g[i]] > 0) {
      result[i] = 'PRESENT';
      targetCounts[g[i]]--;
    }
  }

  return result;
}

// ─── Key State Merging ────────────────────────────────────────────────────────
/** Merge a new guess into the keyboard letter states, keeping best state. */
export function mergeKeyStates(
  existing: Record<string, TileState>,
  letters: string[],
  states: TileState[]
): Record<string, TileState> {
  const priority: Record<TileState, number> = {
    CORRECT: 4,
    PRESENT: 3,
    ABSENT: 2,
    HINT: 1,
    FILLED: 0,
    EMPTY: 0,
  };
  const updated = { ...existing };
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    const state = states[i];
    if (!updated[letter] || priority[state] > priority[updated[letter]]) {
      updated[letter] = state;
    }
  }
  return updated;
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
export function starsFromGuesses(guessCount: number): number {
  if (guessCount <= 1) return 3;
  if (guessCount <= 3) return 2;
  return 1;
}

// ─── Coins Earned ─────────────────────────────────────────────────────────────
const COINS_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 10,
  regular: 20,
  hard: 35,
  vip: 50,
};

export function coinsForWin(difficulty: Difficulty, guessCount: number): number {
  const base = COINS_BY_DIFFICULTY[difficulty];
  const stars = starsFromGuesses(guessCount);
  return base * stars;
}

// ─── Initial State ────────────────────────────────────────────────────────────
export function createInitialGameState(
  difficulty: Difficulty,
  level: number,
  targetWord: string,
  definition: string,
  isReplay = false
): GameState {
  return {
    difficulty,
    level,
    targetWord: targetWord.toUpperCase(),
    definition,
    completedGuesses: [],
    currentInput: [],
    maxGuesses: MAX_GUESSES,
    keyStates: {},
    removedLetters: new Set(),
    prefilledPositions: new Map(),
    status: 'IN_PROGRESS',
    isInvalid: false,
    isReplay,
    coinsEarned: 0,
    starsEarned: 0,
  };
}

// ─── Key Press Handler ────────────────────────────────────────────────────────
export function handleKeyPress(
  state: GameState,
  key: string,
  validWords: Set<string>
): GameState {
  if (state.status !== 'IN_PROGRESS') return state;

  const freePositions = state.targetWord.length - state.prefilledPositions.size;

  if (key === 'BACKSPACE') {
    if (state.currentInput.length === 0) return state;
    return { ...state, currentInput: state.currentInput.slice(0, -1), isInvalid: false };
  }

  if (key === 'ENTER') {
    return submitGuess(state, validWords);
  }

  if (/^[A-Z]$/.test(key)) {
    if (state.currentInput.length >= freePositions) return state;
    if (state.removedLetters.has(key)) return state;
    return { ...state, currentInput: [...state.currentInput, key], isInvalid: false };
  }

  return state;
}

// ─── Build Full Input ─────────────────────────────────────────────────────────
/** Merge currentInput with prefilledPositions to reconstruct the full word being typed */
export function buildFullInput(state: GameState): string[] {
  const result: string[] = new Array(state.targetWord.length).fill('');
  // Fill prefilled first
  state.prefilledPositions.forEach((char, pos) => {
    result[pos] = char;
  });
  // Fill user input into remaining positions
  let inputIdx = 0;
  for (let i = 0; i < result.length; i++) {
    if (result[i] === '' && inputIdx < state.currentInput.length) {
      result[i] = state.currentInput[inputIdx++];
    }
  }
  return result;
}

// ─── Submit Guess ─────────────────────────────────────────────────────────────
function submitGuess(state: GameState, validWords: Set<string>): GameState {
  const wordLen = state.targetWord.length;
  const freePositions = wordLen - state.prefilledPositions.size;

  if (state.currentInput.length < freePositions) {
    return { ...state, isInvalid: true };
  }

  const fullInput = buildFullInput(state);
  const guessWord = fullInput.join('');

  // Validate against dictionary (allow target word always)
  if (guessWord !== state.targetWord && validWords.size > 0 && !validWords.has(guessWord)) {
    return { ...state, isInvalid: true };
  }

  const states = evaluateGuess(guessWord, state.targetWord);
  const completedGuess: CompletedGuess = { letters: fullInput, states };
  const newCompletedGuesses = [...state.completedGuesses, completedGuess];
  const newKeyStates = mergeKeyStates(state.keyStates, fullInput, states);

  const won = guessWord === state.targetWord;
  const guessCount = newCompletedGuesses.length;
  const outOfGuesses = !won && guessCount >= state.maxGuesses;

  let status: GameState['status'] = 'IN_PROGRESS';
  let coinsEarned = 0;
  let starsEarned = 0;

  if (won) {
    status = 'WON';
    starsEarned = starsFromGuesses(guessCount);
    coinsEarned = coinsForWin(state.difficulty, guessCount);
  } else if (outOfGuesses) {
    status = 'OUT_OF_GUESSES';
  }

  return {
    ...state,
    completedGuesses: newCompletedGuesses,
    currentInput: [],
    keyStates: newKeyStates,
    status,
    isInvalid: false,
    coinsEarned,
    starsEarned,
  };
}

// ─── Apply Item: Add a Guess ──────────────────────────────────────────────────
export function applyAddGuess(state: GameState): GameState {
  if (state.status !== 'OUT_OF_GUESSES' && state.status !== 'IN_PROGRESS') return state;
  return { ...state, maxGuesses: state.maxGuesses + 1, status: 'IN_PROGRESS' };
}

// ─── Apply Item: Remove a Letter ──────────────────────────────────────────────
export function applyRemoveLetter(state: GameState, letter: string): GameState {
  // Only remove letters actually NOT in the target word
  if (state.targetWord.includes(letter)) return state;
  const newRemoved = new Set(state.removedLetters);
  newRemoved.add(letter);
  const newKeyStates = { ...state.keyStates, [letter]: 'ABSENT' as TileState };
  return { ...state, removedLetters: newRemoved, keyStates: newKeyStates };
}

// ─── Apply Item: Show Letter ──────────────────────────────────────────────────
/** Show a correct letter at the next un-prefilled position */
export function applyShowLetter(state: GameState): GameState {
  for (let i = 0; i < state.targetWord.length; i++) {
    if (!state.prefilledPositions.has(i)) {
      const newPrefilled = new Map(state.prefilledPositions);
      newPrefilled.set(i, state.targetWord[i]);
      const newKeyStates = { ...state.keyStates };
      newKeyStates[state.targetWord[i]] = 'HINT';
      return { ...state, prefilledPositions: newPrefilled, keyStates: newKeyStates };
    }
  }
  return state;
}

// ─── Progress: Should Award Bonus Life ────────────────────────────────────────
export function shouldAwardBonusLife(
  difficulty: Difficulty,
  levelsCompleted: number
): boolean {
  return levelsCompleted > 0 && levelsCompleted % BONUS_LIFE_EVERY[difficulty] === 0;
}
