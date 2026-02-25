// Store logic for Word Journeys Web
// Ported from Android app, TypeScript version

import { PlayerProgress } from './game';

export type StoreRewardCategory = 'item' | 'coins' | 'diamonds';

export interface AdRewardResult {
  watched: boolean;
  rewardType: StoreRewardCategory;
  rewardAmount: number;
}

export function getRandomAdReward(random: () => number): AdRewardResult {
  const categoryRoll = Math.floor(random() * 3);
  if (categoryRoll === 0) {
    // Item: 1-3 count
    return {
      watched: true,
      rewardType: 'item',
      rewardAmount: 1 + Math.floor(random() * 3),
    };
  } else if (categoryRoll === 1) {
    // Coins: 50-500
    return {
      watched: true,
      rewardType: 'coins',
      rewardAmount: 50 + Math.floor(random() * 451),
    };
  } else {
    // Diamonds: 1-10
    return {
      watched: true,
      rewardType: 'diamonds',
      rewardAmount: 1 + Math.floor(random() * 10),
    };
  }
}
