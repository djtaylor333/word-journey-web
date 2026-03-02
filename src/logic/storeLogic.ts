import type { AdRewardResult } from './types';

export const STORE_ITEMS = {
  addGuess:     { label: '➕ Add a Guess',     cost: 200, currency: 'coins' as const },
  removeLetter: { label: '🚫 Remove a Letter', cost: 150, currency: 'coins' as const },
  definition:   { label: '📖 Definition Hint', cost: 300, currency: 'coins' as const },
  showLetter:   { label: '💡 Show Letter',     cost: 250, currency: 'coins' as const },
};

export const LIVES_OPTIONS = {
  coinsForLife:    { label: 'Trade 1,000 Coins for 1 Life', costCoins: 1000 },
  diamondsForLife: { label: 'Trade 3 Diamonds for 1 Life',  costDiamonds: 3 },
};

export const COIN_PACKS = [
  { id: 'coins_500',  label: '500 Coins',  description: 'Starter Pack',  coins: 500 },
  { id: 'coins_1500', label: '1,500 Coins', description: 'Popular Pack', coins: 1500 },
  { id: 'coins_5000', label: '5,000 Coins', description: 'Best Value — Save 30%!', coins: 5000 },
];

export const DIAMOND_PACKS = [
  { id: 'diamonds_10',  label: '10 Diamonds',  description: 'Starter Pack',  diamonds: 10 },
  { id: 'diamonds_50',  label: '50 Diamonds',  description: 'Popular Pack',  diamonds: 50 },
  { id: 'diamonds_200', label: '200 Diamonds', description: 'Best Value',    diamonds: 200 },
];

export const BUNDLES = [
  {
    id: 'bundle_starter',
    label: '🎒 Starter Bundle',
    description: '1,000 coins · 5 diamonds · 5× each item',
    coins: 1000, diamonds: 5, lives: 0, items: 5,
  },
  {
    id: 'bundle_adventurer',
    label: '⚔️ Adventurer Bundle',
    description: '3,000 coins · 20 diamonds · 10 lives · 10× each item',
    coins: 3000, diamonds: 20, lives: 10, items: 10,
  },
  {
    id: 'bundle_champion',
    label: '🏆 Champion Bundle',
    description: '10,000 coins · 100 diamonds · 25 lives · 25× each item',
    coins: 10000, diamonds: 100, lives: 25, items: 25,
  },
];

export const VIP_PLANS = [
  { id: 'vip_monthly', label: 'Monthly VIP', price: '$1.99/mo', savings: '' },
  { id: 'vip_yearly',  label: 'Yearly VIP',  price: '$14.99/yr', savings: 'Save 37%!' },
];

const ITEM_TYPES = ['addGuess', 'removeLetter', 'definition', 'showLetter'] as const;

/** Simulate watching an ad and returning a random reward */
export function getRandomAdReward(
  type: 'coins' | 'life' | 'item',
  random: () => number = Math.random
): AdRewardResult {
  if (type === 'coins') {
    return { rewardType: 'coins', rewardAmount: 100, watched: true };
  }
  if (type === 'life') {
    return { rewardType: 'life', rewardAmount: 1, watched: true };
  }
  const itemType = ITEM_TYPES[Math.floor(random() * ITEM_TYPES.length)];
  return { rewardType: 'item', rewardAmount: 1, watched: true, itemType };
}
