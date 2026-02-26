

import { useState, useEffect } from 'react';
import './App.css';
import type { PlayerProgress, Difficulty, GameState } from './logic/game';
import { applyLevelCompletion } from './logic/game';
import { getRandomAdReward } from './logic/store';
import type { AdRewardResult } from './logic/store';
import { saveProgress, loadProgress } from './logic/progress';
import { LockOverlay } from './components/LockOverlay';
import { Keyboard } from './components/Keyboard';

const DEFAULT_PROGRESS: PlayerProgress = {
  coins: 0,
  diamonds: 0,
  easyLevel: 1,
  regularLevel: 1,
  hardLevel: 1,
  vipLevel: 1,
  lives: 5,
  addGuessItems: 0,
  removeLetterItems: 0,
  definitionItems: 0,
  showLetterItems: 0,
};

const WORDS = {
  easy: ['CAT', 'DOG', 'SUN', 'MOON', 'TREE'],
  regular: ['APPLE', 'HOUSE', 'RIVER', 'MOUSE', 'PLANT'],
  hard: ['PYTHON', 'JOURNEY', 'DIAMOND', 'SUBSCRIBE', 'ANDROID'],
  vip: ['EXCLUSIVE', 'PREMIUM', 'MEMBERSHIP', 'ADVANTAGE', 'REWARD'],
};

function getWord(difficulty: Difficulty, level: number): string {
  const list = WORDS[difficulty];
  return list[(level - 1) % list.length];
}

function App() {
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress() || DEFAULT_PROGRESS);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [level, setLevel] = useState<number>(progress.easyLevel);
  const [word, setWord] = useState<string>(getWord('easy', progress.easyLevel));
  const [guesses, setGuesses] = useState<string[]>([]);
  const [status, setStatus] = useState<'IN_PROGRESS' | 'WON' | 'LOST' | 'WAITING_FOR_LIFE'>('IN_PROGRESS');
  const [showVipLock, setShowVipLock] = useState(false);
  const [showAndroidLock, setShowAndroidLock] = useState(false);
  const [adReward, setAdReward] = useState<AdRewardResult | null>(null);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    setWord(getWord(difficulty, level));
    setGuesses([]);
    setStatus('IN_PROGRESS');
  }, [difficulty, level]);

  function handleKeyPress(key: string) {
    if (status !== 'IN_PROGRESS') return;
    if (key === 'BACKSPACE') {
      setGuesses(g => g.slice(0, -1));
    } else if (key === 'ENTER') {
      if (guesses.join('') === word) {
        setStatus('WON');
        let updated = applyLevelCompletion(progress, difficulty, level);
        updated = { ...updated };
        if (difficulty === 'easy') updated.easyLevel = level + 1;
        if (difficulty === 'regular') updated.regularLevel = level + 1;
        if (difficulty === 'hard') updated.hardLevel = level + 1;
        if (difficulty === 'vip') updated.vipLevel = level + 1;
        setProgress(updated);
      } else {
        setStatus('LOST');
        setProgress(p => ({ ...p, lives: p.lives - 1 }));
      }
    } else if (guesses.length < word.length && /^[A-Z]$/.test(key)) {
      setGuesses(g => [...g, key]);
    }
  }

  function handleDifficultyChange(d: Difficulty) {
    setDifficulty(d);
    if (d === 'vip') setShowVipLock(true);
    else setShowVipLock(false);
    setLevel(progress[`${d}Level`]);
  }

  function handleStoreItemClick(item: string) {
    if (item === 'android-only') {
      setShowAndroidLock(true);
      return;
    }
    setShowAndroidLock(false);
    if (item === 'vip-subscription') {
      setShowVipLock(true);
      return;
    }
    if (item === 'addGuess' && progress.coins >= 100) {
      setProgress(p => ({ ...p, coins: p.coins - 100, addGuessItems: p.addGuessItems + 1 }));
    }
    if (item === 'removeLetter' && progress.coins >= 150) {
      setProgress(p => ({ ...p, coins: p.coins - 150, removeLetterItems: p.removeLetterItems + 1 }));
    }
    if (item === 'definition' && progress.coins >= 200) {
      setProgress(p => ({ ...p, coins: p.coins - 200, definitionItems: p.definitionItems + 1 }));
    }
    if (item === 'showLetter' && progress.coins >= 250) {
      setProgress(p => ({ ...p, coins: p.coins - 250, showLetterItems: p.showLetterItems + 1 }));
    }
    if (item === 'buy-coins' && progress.diamonds >= 10) {
      setProgress(p => ({ ...p, diamonds: p.diamonds - 10, coins: p.coins + 500 }));
    }
    if (item === 'buy-diamonds' && progress.coins >= 100) {
      setProgress(p => ({ ...p, coins: p.coins - 100, diamonds: p.diamonds + 10 }));
    }
  }

  function handleWatchAd() {
    const reward = getRandomAdReward(Math.random);
    setAdReward(reward);
    let updated = { ...progress };
    if (reward.rewardType === 'item') updated.addGuessItems += reward.rewardAmount;
    if (reward.rewardType === 'coins') updated.coins += reward.rewardAmount;
    if (reward.rewardType === 'diamonds') updated.diamonds += reward.rewardAmount;
    setProgress(updated);
  }

  return (
    <div className="game-container">
      <h1>Word Journey Web</h1>
      <div className="difficulty-select">
        {(['easy','regular','hard','vip'] as Difficulty[]).map(d => (
          <button key={d} onClick={() => handleDifficultyChange(d)}>{d.toUpperCase()}</button>
        ))}
      </div>
      <div className="progress-info">
        <span>Coins: {progress.coins}</span>
        <span>Diamonds: {progress.diamonds}</span>
        <span>Lives: {progress.lives}</span>
      </div>
      <div className="level-info">
        <span>Level: {level}</span>
        <span>Word Length: {word.length}</span>
      </div>
      <div className="item-usage-row">
        <button disabled={progress.addGuessItems <= 0} onClick={() => {
          if (progress.addGuessItems > 0 && guesses.length < word.length) {
            // Add a random correct letter in the next empty slot
            const nextIdx = guesses.length;
            const correctLetter = word[nextIdx];
            setGuesses(g => [...g, correctLetter]);
            setProgress(p => ({ ...p, addGuessItems: p.addGuessItems - 1 }));
          }
        }}>Add Guess ({progress.addGuessItems})</button>
        <button disabled={progress.removeLetterItems <= 0 || guesses.length === 0} onClick={() => {
          if (progress.removeLetterItems > 0 && guesses.length > 0) {
            setGuesses(g => g.slice(0, -1));
            setProgress(p => ({ ...p, removeLetterItems: p.removeLetterItems - 1 }));
          }
        }}>Remove Letter ({progress.removeLetterItems})</button>
        <button disabled={progress.showLetterItems <= 0 || guesses.length >= word.length} onClick={() => {
          if (progress.showLetterItems > 0 && guesses.length < word.length) {
            // Reveal a correct letter at a random empty position
            const emptyIdx = guesses.length;
            const correctLetter = word[emptyIdx];
            setGuesses(g => {
              const newGuesses = [...g];
              newGuesses[emptyIdx] = correctLetter;
              return newGuesses;
            });
            setProgress(p => ({ ...p, showLetterItems: p.showLetterItems - 1 }));
          }
        }}>Show Letter ({progress.showLetterItems})</button>
        <button disabled={progress.definitionItems <= 0} onClick={() => {
          if (progress.definitionItems > 0) {
            alert('Definition: (Sample) This is a placeholder definition for the word.');
            setProgress(p => ({ ...p, definitionItems: p.definitionItems - 1 }));
          }
        }}>Definition ({progress.definitionItems})</button>
      </div>
      <div className="guess-row">
        {Array.from({ length: word.length }).map((_, i) => (
          <span key={i} className="guess-cell">{guesses[i] || '_'}</span>
        ))}
      </div>
      <Keyboard onKeyPress={handleKeyPress} wordLength={word.length} />
      {status === 'WON' && <div className="status-win">Correct! Next level unlocked.</div>}
      {status === 'LOST' && <div className="status-lose">Incorrect. Try again!</div>}
      <div className="store-section">
        <h2>Store</h2>
        <div className="store-items">
          <button onClick={() => handleStoreItemClick('addGuess')}>Buy Add Guess Item (100 coins)</button>
          <button onClick={() => handleStoreItemClick('removeLetter')}>Buy Remove Letter Item (150 coins)</button>
          <button onClick={() => handleStoreItemClick('definition')}>Buy Definition Item (200 coins)</button>
          <button onClick={() => handleStoreItemClick('showLetter')}>Buy Show Letter Item (250 coins)</button>
          <button onClick={() => handleStoreItemClick('android-only')}>Android Only Feature</button>
          <button onClick={() => handleStoreItemClick('vip-subscription')}>VIP Subscription</button>
        </div>
        <div className="store-currency">
          <button onClick={() => handleStoreItemClick('buy-coins')}>Buy 500 Coins (10 diamonds)</button>
          <button onClick={() => handleStoreItemClick('buy-diamonds')}>Buy 10 Diamonds (100 coins)</button>
        </div>
        <button onClick={handleWatchAd}>Watch Ad for Reward</button>
        {adReward && <div className="ad-reward">Ad Reward: {adReward.rewardType} +{adReward.rewardAmount}</div>}
      </div>
      {showVipLock && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100 }}>
          <LockOverlay message="VIP Feature - Subscribe to unlock" />
          <button style={{ position: 'absolute', top: 20, right: 20, zIndex: 101 }} onClick={() => setShowVipLock(false)}>Close</button>
        </div>
      )}
      {showAndroidLock && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100 }}>
          <LockOverlay message="Android Only Feature" />
          <button style={{ position: 'absolute', top: 20, right: 20, zIndex: 101 }} onClick={() => setShowAndroidLock(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default App;
