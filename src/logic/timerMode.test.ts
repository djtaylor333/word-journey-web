import {
  calcBonusMs,
  calcBonusSecs,
  TIMER_FULL_BONUS_MS,
  TIMER_HALF_BONUS_MS,
} from './timerMode';

describe('Timer Mode bonus calculation', () => {
  describe('calcBonusMs', () => {
    it('returns full bonus (30 000 ms) when definition was NOT used', () => {
      expect(calcBonusMs(false)).toBe(30_000);
    });

    it('returns half bonus (15 000 ms) when definition WAS used', () => {
      expect(calcBonusMs(true)).toBe(15_000);
    });

    it('half bonus is exactly half of full bonus', () => {
      expect(calcBonusMs(true)).toBe(calcBonusMs(false) / 2);
    });

    it('full bonus matches TIMER_FULL_BONUS_MS constant', () => {
      expect(calcBonusMs(false)).toBe(TIMER_FULL_BONUS_MS);
    });

    it('half bonus matches TIMER_HALF_BONUS_MS constant', () => {
      expect(calcBonusMs(true)).toBe(TIMER_HALF_BONUS_MS);
    });
  });

  describe('calcBonusSecs', () => {
    it('returns 30 seconds when definition NOT used', () => {
      expect(calcBonusSecs(false)).toBe(30);
    });

    it('returns 15 seconds when definition WAS used', () => {
      expect(calcBonusSecs(true)).toBe(15);
    });

    it('is consistent with calcBonusMs (ms / 1000)', () => {
      expect(calcBonusSecs(false)).toBe(calcBonusMs(false) / 1000);
      expect(calcBonusSecs(true)).toBe(calcBonusMs(true) / 1000);
    });
  });

  describe('accumulated bonus across multiple words', () => {
    it('two words without definition = 60 000 ms total', () => {
      const total = calcBonusMs(false) + calcBonusMs(false);
      expect(total).toBe(60_000);
    });

    it('two words with definition both times = 30 000 ms total', () => {
      const total = calcBonusMs(true) + calcBonusMs(true);
      expect(total).toBe(30_000);
    });

    it('mixed session: one normal + one with definition = 45 000 ms', () => {
      const total = calcBonusMs(false) + calcBonusMs(true);
      expect(total).toBe(45_000);
    });

    it('mixed session with definition is less than all-normal session', () => {
      const allNormal = calcBonusMs(false) * 3;
      const mixed = calcBonusMs(false) * 2 + calcBonusMs(true);
      expect(mixed).toBeLessThan(allNormal);
    });
  });
});
