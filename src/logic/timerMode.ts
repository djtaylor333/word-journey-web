/**
 * Timer Mode scoring helpers.
 * These are extracted as pure functions so they can be unit-tested independently
 * of React component state.
 */

export const TIMER_FULL_BONUS_MS = 30_000;
export const TIMER_HALF_BONUS_MS = 15_000;

/**
 * Returns the bonus milliseconds awarded when a player solves a Timer Mode word.
 * If the player revealed the definition hint that word, the bonus is halved.
 */
export function calcBonusMs(definitionUsed: boolean): number {
  return definitionUsed ? TIMER_HALF_BONUS_MS : TIMER_FULL_BONUS_MS;
}

/**
 * Returns the bonus in whole seconds (for display purposes).
 */
export function calcBonusSecs(definitionUsed: boolean): number {
  return calcBonusMs(definitionUsed) / 1000;
}
