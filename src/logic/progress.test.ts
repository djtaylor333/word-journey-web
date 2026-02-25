import { saveProgress, loadProgress } from './progress';
import { PlayerProgress } from './game';

describe('Progress persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load progress', () => {
    const progress: PlayerProgress = {
      coins: 100,
      diamonds: 5,
      easyLevel: 2,
      regularLevel: 1,
      hardLevel: 1,
      vipLevel: 1,
      lives: 3,
      addGuessItems: 1,
      removeLetterItems: 0,
      definitionItems: 0,
      showLetterItems: 0,
    };
    saveProgress(progress);
    const loaded = loadProgress();
    expect(loaded).toEqual(progress);
  });
});
