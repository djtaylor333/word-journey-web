import { applyLevelCompletion, PlayerProgress } from './game';

describe('applyLevelCompletion', () => {
  it('awards 25 diamonds every 25 levels', () => {
    const progress: PlayerProgress = {
      coins: 0,
      diamonds: 0,
      easyLevel: 25,
      regularLevel: 0,
      hardLevel: 0,
      vipLevel: 0,
      lives: 3,
      addGuessItems: 0,
      removeLetterItems: 0,
      definitionItems: 0,
      showLetterItems: 0,
    };
    const updated = applyLevelCompletion(progress, 'easy', 25);
    expect(updated.diamonds).toBe(25);
  });
});
