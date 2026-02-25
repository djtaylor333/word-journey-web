
import { getRandomAdReward } from './store';
import { PlayerProgress } from './game';

describe('Store logic', () => {
  it('should return a valid ad reward', () => {
    const reward = getRandomAdReward(() => 0.1);
    expect(['item', 'coins', 'diamonds']).toContain(reward.rewardType);
    expect(reward.watched).toBe(true);
    expect(reward.rewardAmount).toBeGreaterThan(0);
  });
  it('returns item reward when random returns 0', () => {
    const result = getRandomAdReward(() => 0);
    expect(result.rewardType).toBe('item');
    expect(result.rewardAmount).toBeGreaterThanOrEqual(1);
    expect(result.rewardAmount).toBeLessThanOrEqual(3);
  });
  it('returns coins reward when random returns 0.4', () => {
    const result = getRandomAdReward(() => 0.4);
    expect(result.rewardType).toBe('coins');
    expect(result.rewardAmount).toBeGreaterThanOrEqual(50);
    expect(result.rewardAmount).toBeLessThanOrEqual(500);
  });
  it('returns diamonds reward when random returns 0.8', () => {
    const result = getRandomAdReward(() => 0.8);
    expect(result.rewardType).toBe('diamonds');
    expect(result.rewardAmount).toBeGreaterThanOrEqual(1);
    expect(result.rewardAmount).toBeLessThanOrEqual(10);
  });
});
