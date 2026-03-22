/**
 * Unit tests for gameEngine.ts
 * Covers: evaluateGuess, mergeKeyStates, starsFromGuesses, coinsForWin,
 *         createInitialGameState, handleKeyPress, buildFullInput,
 *         applyAddGuess, applyBonusGuessesForLife, applyRemoveLetter,
 *         applyShowLetter, shouldAwardBonusLife
 */
import {
  evaluateGuess,
  mergeKeyStates,
  starsFromGuesses,
  coinsForWin,
  createInitialGameState,
  handleKeyPress,
  buildFullInput,
  applyAddGuess,
  applyBonusGuessesForLife,
  applyRemoveLetter,
  applyShowLetter,
  shouldAwardBonusLife,
  MAX_GUESSES,
} from './gameEngine';
import { DIFFICULTY_MAX_GUESSES, BONUS_ATTEMPTS_PER_LIFE } from './types';
import type { GameState } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeGame(target: string, overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialGameState('easy', 1, target, ''),
    ...overrides,
  };
}

const ALL_WORDS = new Set(['CRANE', 'SHARP', 'FLAME', 'BOOST', 'WORDS', 'TRACK', 'BANDS', 'BANDY', 'BANES']);

// ─── evaluateGuess ────────────────────────────────────────────────────────────
describe('evaluateGuess', () => {
  it('all CORRECT when guess equals target', () => {
    const result = evaluateGuess('CRANE', 'CRANE');
    expect(result).toEqual(['CORRECT', 'CORRECT', 'CORRECT', 'CORRECT', 'CORRECT']);
  });

  it('all ABSENT when no letters match', () => {
    const result = evaluateGuess('ZZZZZ', 'CRANE');
    expect(result).toEqual(['ABSENT', 'ABSENT', 'ABSENT', 'ABSENT', 'ABSENT']);
  });

  it('marks PRESENT for correct letter wrong position', () => {
    // C is in CRANE at pos 0; guessing it at pos 4 = PRESENT
    const result = evaluateGuess('RRRNC', 'CRANE');
    expect(result[4]).toBe('PRESENT');
  });

  it('handles duplicate letters correctly — only one PRESENT for one occurrence', () => {
    // target CRANE has one E; guess EERIE has two E's
    const result = evaluateGuess('EEXXX', 'CRANE');
    // First E is PRESENT (one E in CRANE), second X are ABSENT
    const presentCount = result.filter(r => r === 'PRESENT').length;
    expect(presentCount).toBeLessThanOrEqual(1); // only one E in target
  });

  it('CORRECT takes priority over PRESENT for same letter', () => {
    // target: CANAL, guess: CANAL — all correct
    const result = evaluateGuess('CANAL', 'CANAL');
    expect(result.every(s => s === 'CORRECT')).toBe(true);
  });

  it('works with 4-letter words', () => {
    const result = evaluateGuess('BARK', 'BARS');
    expect(result[0]).toBe('CORRECT'); // B
    expect(result[1]).toBe('CORRECT'); // A
    expect(result[2]).toBe('CORRECT'); // R
    expect(result[3]).toBe('ABSENT');  // K not in BARS
  });

  it('works with 6-letter words', () => {
    const result = evaluateGuess('AROUND', 'ABLAZE');
    expect(result[0]).toBe('CORRECT'); // A in pos 0
  });

  it('is case-insensitive', () => {
    const upper = evaluateGuess('CRANE', 'CRANE');
    const lower = evaluateGuess('crane', 'crane');
    expect(upper).toEqual(lower);
  });
});

// ─── mergeKeyStates ───────────────────────────────────────────────────────────
describe('mergeKeyStates', () => {
  it('adds new letters to an empty map', () => {
    const result = mergeKeyStates({}, ['A', 'B'], ['CORRECT', 'ABSENT']);
    expect(result['A']).toBe('CORRECT');
    expect(result['B']).toBe('ABSENT');
  });

  it('upgrades ABSENT → PRESENT → CORRECT (never downgrades)', () => {
    let states = mergeKeyStates({}, ['A'], ['ABSENT']);
    states = mergeKeyStates(states, ['A'], ['PRESENT']);
    states = mergeKeyStates(states, ['A'], ['CORRECT']);
    expect(states['A']).toBe('CORRECT');
  });

  it('does not downgrade CORRECT to PRESENT', () => {
    let states = mergeKeyStates({}, ['A'], ['CORRECT']);
    states = mergeKeyStates(states, ['A'], ['PRESENT']);
    expect(states['A']).toBe('CORRECT');
  });

  it('does not downgrade PRESENT to ABSENT', () => {
    let states = mergeKeyStates({}, ['A'], ['PRESENT']);
    states = mergeKeyStates(states, ['A'], ['ABSENT']);
    expect(states['A']).toBe('PRESENT');
  });
});

// ─── starsFromGuesses ─────────────────────────────────────────────────────────
describe('starsFromGuesses', () => {
  it('1 guess = 3 stars (perfect)', () => expect(starsFromGuesses(1)).toBe(3));
  it('2 guesses = 2 stars',         () => expect(starsFromGuesses(2)).toBe(2));
  it('3 guesses = 2 stars',         () => expect(starsFromGuesses(3)).toBe(2));
  it('4 guesses = 1 star',          () => expect(starsFromGuesses(4)).toBe(1));
  it('5 guesses = 1 star',          () => expect(starsFromGuesses(5)).toBe(1));
  it('6 guesses = 1 star',          () => expect(starsFromGuesses(6)).toBe(1));
});

// ─── coinsForWin ──────────────────────────────────────────────────────────────
describe('coinsForWin', () => {
  it('easy 1 guess = 30 coins (10 base × 3 stars)', () => {
    expect(coinsForWin('easy', 1)).toBe(30);
  });

  it('easy 4 guesses = 10 coins (10 base × 1 star)', () => {
    expect(coinsForWin('easy', 4)).toBe(10);
  });

  it('hard 1 guess = 105 coins (35 base × 3 stars)', () => {
    expect(coinsForWin('hard', 1)).toBe(105);
  });

  it('vip earns more coins than easy for same guesses', () => {
    expect(coinsForWin('vip', 2)).toBeGreaterThan(coinsForWin('easy', 2));
  });
});

// ─── createInitialGameState ───────────────────────────────────────────────────
describe('createInitialGameState', () => {
  it('stores target word uppercased', () => {
    const state = createInitialGameState('easy', 1, 'crane', '');
    expect(state.targetWord).toBe('CRANE');
  });

  it('starts with status IN_PROGRESS', () => {
    const state = createInitialGameState('regular', 3, 'FLAME', 'a blazing fire');
    expect(state.status).toBe('IN_PROGRESS');
  });

  it('starts with empty input and no guesses', () => {
    const state = createInitialGameState('hard', 1, 'TRACKS', '');
    expect(state.currentInput).toHaveLength(0);
    expect(state.completedGuesses).toHaveLength(0);
  });

  it('sets maxGuesses from DIFFICULTY_MAX_GUESSES (easy=8)', () => {
    const easyState = createInitialGameState('easy', 1, 'ABLE', '');
    expect(easyState.maxGuesses).toBe(8);
    expect(easyState.maxGuesses).toBe(DIFFICULTY_MAX_GUESSES['easy']);
  });

  it('sets maxGuesses to 6 for regular/hard/vip', () => {
    expect(createInitialGameState('regular', 1, 'WORDS', '').maxGuesses).toBe(6);
    expect(createInitialGameState('hard', 1, 'TRACKS', '').maxGuesses).toBe(6);
    expect(createInitialGameState('vip', 1, 'FLAME', '').maxGuesses).toBe(6);
  });
});

// ─── handleKeyPress ───────────────────────────────────────────────────────────
describe('handleKeyPress', () => {
  it('adds a letter to currentInput', () => {
    const state = makeGame('CRANE');
    const next = handleKeyPress(state, 'C', ALL_WORDS);
    expect(next.currentInput).toEqual(['C']);
  });

  it('removes last letter on BACKSPACE', () => {
    const state = makeGame('CRANE', { currentInput: ['C', 'R'] });
    const next = handleKeyPress(state, 'BACKSPACE', ALL_WORDS);
    expect(next.currentInput).toEqual(['C']);
  });

  it('BACKSPACE on empty input does nothing', () => {
    const state = makeGame('CRANE');
    const next = handleKeyPress(state, 'BACKSPACE', ALL_WORDS);
    expect(next.currentInput).toHaveLength(0);
  });

  it('does not exceed word length', () => {
    // CRANE is 5 letters, try to type 6
    const state = makeGame('CRANE', { currentInput: ['C', 'R', 'A', 'N', 'E'] });
    const next = handleKeyPress(state, 'X', ALL_WORDS);
    expect(next.currentInput).toHaveLength(5);
  });

  it('marks isInvalid on short ENTER attempt', () => {
    const state = makeGame('CRANE', { currentInput: ['C', 'R'] });
    const next = handleKeyPress(state, 'ENTER', ALL_WORDS);
    expect(next.isInvalid).toBe(true);
  });

  it('rejects removed letters', () => {
    const removed = new Set<string>(['X']);
    const state = makeGame('CRANE', { removedLetters: removed });
    const next = handleKeyPress(state, 'X', ALL_WORDS);
    expect(next.currentInput).toHaveLength(0);
  });

  it('does nothing when game is already WON', () => {
    const state = makeGame('CRANE', { status: 'WON' });
    const next = handleKeyPress(state, 'C', ALL_WORDS);
    expect(next).toBe(state);
  });

  it('ENTER on valid word transitions to WON', () => {
    const state = makeGame('CRANE', { currentInput: ['C', 'R', 'A', 'N', 'E'] });
    const next = handleKeyPress(state, 'ENTER', ALL_WORDS);
    expect(next.status).toBe('WON');
    expect(next.coinsEarned).toBeGreaterThan(0);
  });

  it('ENTER marks invalid for unknown word', () => {
    const state = makeGame('CRANE', { currentInput: ['Q', 'Q', 'Q', 'Q', 'Q'] });
    const next = handleKeyPress(state, 'ENTER', ALL_WORDS);
    expect(next.isInvalid).toBe(true);
    expect(next.status).toBe('IN_PROGRESS');
  });

  it('reaches OUT_OF_GUESSES after exhausting guesses', () => {
    // Fill 6 wrong guesses
    let state = makeGame('CRANE', { maxGuesses: 6 });
    for (let i = 0; i < 6; i++) {
      state = handleKeyPress({ ...state, currentInput: ['B', 'O', 'O', 'S', 'T'] }, 'ENTER', ALL_WORDS);
      if (state.status !== 'IN_PROGRESS') break;
    }
    expect(state.status).toBe('OUT_OF_GUESSES');
  });
});

// ─── buildFullInput ───────────────────────────────────────────────────────────
describe('buildFullInput', () => {
  it('returns current input letters with no prefills', () => {
    const state = makeGame('CRANE', { currentInput: ['C', 'R'] });
    const result = buildFullInput(state);
    expect(result[0]).toBe('C');
    expect(result[1]).toBe('R');
    expect(result[2]).toBe('');
  });

  it('merges prefilled positions with user input', () => {
    const prefilled = new Map([[0, 'C'], [4, 'E']]);
    const state = makeGame('CRANE', {
      prefilledPositions: prefilled,
      currentInput: ['R', 'A', 'N'],
    });
    const result = buildFullInput(state);
    expect(result).toEqual(['C', 'R', 'A', 'N', 'E']);
  });
});

// ─── applyAddGuess ────────────────────────────────────────────────────────────
describe('applyAddGuess', () => {
  it('increases maxGuesses by 1', () => {
    const state = makeGame('CRANE', { status: 'OUT_OF_GUESSES', maxGuesses: 6 });
    const next = applyAddGuess(state);
    expect(next.maxGuesses).toBe(7);
    expect(next.status).toBe('IN_PROGRESS');
  });

  it('does nothing on WON game', () => {
    const state = makeGame('CRANE', { status: 'WON' });
    const next = applyAddGuess(state);
    expect(next).toBe(state);
  });
});

// ─── applyBonusGuessesForLife ─────────────────────────────────────────────────
describe('applyBonusGuessesForLife', () => {
  it('grants BONUS_ATTEMPTS_PER_LIFE guesses for easy (3)', () => {
    const state = makeGame('ABLE', { difficulty: 'easy', status: 'OUT_OF_GUESSES', maxGuesses: 8 });
    const next = applyBonusGuessesForLife(state);
    expect(next.maxGuesses).toBe(8 + BONUS_ATTEMPTS_PER_LIFE['easy']); // 11
    expect(next.status).toBe('IN_PROGRESS');
  });

  it('grants BONUS_ATTEMPTS_PER_LIFE guesses for regular (2)', () => {
    const state = makeGame('CRANE', { difficulty: 'regular', status: 'OUT_OF_GUESSES', maxGuesses: 6 });
    const next = applyBonusGuessesForLife(state);
    expect(next.maxGuesses).toBe(6 + BONUS_ATTEMPTS_PER_LIFE['regular']); // 8
    expect(next.status).toBe('IN_PROGRESS');
  });

  it('grants BONUS_ATTEMPTS_PER_LIFE guesses for hard (1)', () => {
    const state = makeGame('TRACKS', { difficulty: 'hard', status: 'OUT_OF_GUESSES', maxGuesses: 6 });
    const next = applyBonusGuessesForLife(state);
    expect(next.maxGuesses).toBe(7); // 6 + 1
    expect(next.status).toBe('IN_PROGRESS');
  });

  it('does nothing on WON game', () => {
    const state = makeGame('CRANE', { status: 'WON' });
    const next = applyBonusGuessesForLife(state);
    expect(next).toBe(state);
  });
});

// ─── applyRemoveLetter ────────────────────────────────────────────────────────
describe('applyRemoveLetter', () => {
  it('adds letter to removedLetters when not in target', () => {
    const state = makeGame('CRANE');
    const next = applyRemoveLetter(state, 'B');
    expect(next.removedLetters.has('B')).toBe(true);
  });

  it('sets key state to ABSENT', () => {
    const state = makeGame('CRANE');
    const next = applyRemoveLetter(state, 'B');
    expect(next.keyStates['B']).toBe('ABSENT');
  });

  it('does not remove a letter that IS in the target', () => {
    const state = makeGame('CRANE');
    const next = applyRemoveLetter(state, 'C');
    expect(next.removedLetters.has('C')).toBe(false);
    expect(next).toBe(state);
  });
});

// ─── applyShowLetter ──────────────────────────────────────────────────────────
describe('applyShowLetter', () => {
  it('reveals the first letter of the target', () => {
    const state = makeGame('CRANE');
    const next = applyShowLetter(state);
    expect(next.prefilledPositions.get(0)).toBe('C');
    expect(next.keyStates['C']).toBe('HINT');
  });

  it('reveals next un-filled position on second call', () => {
    let state = makeGame('CRANE');
    state = applyShowLetter(state);
    state = applyShowLetter(state);
    expect(state.prefilledPositions.get(0)).toBe('C');
    expect(state.prefilledPositions.get(1)).toBe('R');
  });

  it('does nothing when all positions are already revealed', () => {
    const prefilled = new Map([...Array(5)].map((_, i) => [i, 'CRANE'[i]]));
    const state = makeGame('CRANE', { prefilledPositions: prefilled });
    const next = applyShowLetter(state);
    expect(next).toBe(state);
  });
});

// ─── shouldAwardBonusLife ─────────────────────────────────────────────────────
describe('shouldAwardBonusLife', () => {
  it('awards bonus life at milestone levels (easy every 10)', () => {
    expect(shouldAwardBonusLife('easy', 10)).toBe(true);
    expect(shouldAwardBonusLife('easy', 20)).toBe(true);
  });

  it('does not award at non-milestone levels', () => {
    expect(shouldAwardBonusLife('easy', 9)).toBe(false);
    expect(shouldAwardBonusLife('easy', 11)).toBe(false);
  });

  it('does not award at level 0', () => {
    expect(shouldAwardBonusLife('easy', 0)).toBe(false);
  });

  it('regular mode has its own milestone interval', () => {
    // Regular has BONUS_LIFE_EVERY = 5 (verify it awards at multiples of 5)
    expect(shouldAwardBonusLife('regular', 5)).toBe(true);
  });
});
