"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Difficulty, PlayerProgress, Screen } from '../logic/types';
import { DIFFICULTY_ACCENT, DIFFICULTY_LABELS, wordLengthForLevel, BONUS_LIFE_EVERY } from '../logic/types';
import type { GameState } from '../logic/types';
import {
  createInitialGameState, handleKeyPress, applyAddGuess,
  applyRemoveLetter, applyShowLetter,
} from '../logic/gameEngine';
import { getWordForLevel, loadValidWords, getDailyWord } from '../logic/wordLoader';
import { startRegenTimer, applyLivesRegen } from '../logic/livesRegen';
import { SoundManager } from '../logic/soundManager';
import GameGrid from '../components/GameGrid';
import GameKeyboard from '../components/GameKeyboard';
import ItemsBar from '../components/ItemsBar';
import WinDialog from '../components/WinDialog';
import NeedMoreGuessesDialog from '../components/NeedMoreGuessesDialog';
import NoLivesDialog from '../components/NoLivesDialog';

interface GameScreenProps {
  difficulty: Difficulty;
  level: number;
  isReplay?: boolean;
  isDailyChallenge?: boolean;
  progress: PlayerProgress;
  onProgressUpdate: (p: PlayerProgress) => void;
  onNavigate: (s: Screen) => void;
  onBack: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  difficulty, level, isReplay = false, isDailyChallenge = false,
  progress, onProgressUpdate, onNavigate, onBack,
}) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [validWords, setValidWords] = useState<Set<string>>(new Set());
  const [showNoLives, setShowNoLives] = useState(false);
  const [showRemovePicker, setShowRemovePicker] = useState(false);
  const [definitionUsed, setDefinitionUsed] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);
  const [msUntilNext, setMsUntilNext] = useState(0);
  const lifeSpent = useRef(false);
  const gameLoadedRef = useRef(false);  // true once a GameState has been set
  const winHandledRef = useRef(false);  // prevent handleWin firing more than once
  const loseHandledRef = useRef(false); // prevent lose sound firing more than once

  // Sync SoundManager config whenever audio settings change
  useEffect(() => {
    SoundManager.configure({ sfxEnabled: progress.sfxEnabled, sfxVolume: progress.sfxVolume });
  }, [progress.sfxEnabled, progress.sfxVolume]);

  // ── Serialise/deserialise GameState (Set + Map aren't JSON-safe) ──────────
  const saveKey = `${difficulty}-${level}`;

  function serializeGameState(gs: GameState): Record<string, unknown> {
    return {
      ...gs,
      removedLetters: Array.from(gs.removedLetters),
      prefilledPositions: Array.from(gs.prefilledPositions.entries()),
    };
  }

  function deserializeGameState(obj: Record<string, unknown>): GameState {
    return {
      ...(obj as Omit<GameState, 'removedLetters' | 'prefilledPositions'>),
      removedLetters: new Set(obj.removedLetters as string[]),
      prefilledPositions: new Map(obj.prefilledPositions as [number, string][]),
    };
  }

  // ── Persist mid-game state whenever it changes ───────────────────────────
  useEffect(() => {
    // Don't run until a game has been fully loaded
    if (!gameLoadedRef.current) return;

    if (!gameState || isReplay || gameState.status !== 'IN_PROGRESS') {
      // Clear save when game ends or in replay
      if (progress.savedGameState?.key === saveKey) {
        onProgressUpdate({ ...progress, savedGameState: null });
      }
      return;
    }
    const serialized = serializeGameState(gameState);
    onProgressUpdate({ ...progress, savedGameState: { key: saveKey, state: serialized } });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.status, gameState?.completedGuesses.length, gameState?.currentInput.length]);

  // Load word and valid words
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isReplay && progress.lives <= 0) {
        const { msUntilNext: ms } = applyLivesRegen(progress);
        setMsUntilNext(ms);
        setShowNoLives(true);
        return;
      }

      const wordLen = wordLengthForLevel(difficulty, level);
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const [entry, vw] = await Promise.all([
        isDailyChallenge
          ? getDailyWord(today, wordLen)
          : getWordForLevel(wordLen, level),
        loadValidWords(),
      ]);

      if (cancelled) return;

      setValidWords(vw);

      // Restore saved mid-game state if available for this level
      const saved = progress.savedGameState;
      if (!isReplay && saved && saved.key === saveKey && saved.state) {
        try {
          const restored = deserializeGameState(saved.state as Record<string, unknown>);
          if (restored.status === 'IN_PROGRESS') {
            setGameState(restored);
            gameLoadedRef.current = true;
            setDefinitionUsed(false);
            // Life already spent in the previous session
            lifeSpent.current = true;
            return;
          }
        } catch {
          // ignore corrupt save — fall through to fresh game
        }
      }

      setGameState(createInitialGameState(difficulty, level, entry.word, entry.definition, isReplay));
      gameLoadedRef.current = true;
      setDefinitionUsed(false);

      // Spend a life when entering the game (not replay)
      if (!isReplay && !lifeSpent.current) {
        lifeSpent.current = true;
        const updated = startRegenTimer({ ...progress, lives: progress.lives - 1 });
        onProgressUpdate(updated);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, level, isReplay]);

  // Countdown timer tick
  useEffect(() => {
    if (msUntilNext <= 0) return;
    const interval = setInterval(() => {
      setMsUntilNext(prev => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [msUntilNext]);

  // Fire handleWin exactly once when status flips to WON
  useEffect(() => {
    if (gameState?.status === 'WON' && !winHandledRef.current) {
      winHandledRef.current = true;
      SoundManager.play(isDailyChallenge ? 'dailyComplete' : 'win');
      handleWin();
    }
    if (gameState?.status === 'LOST' && !loseHandledRef.current) {
      loseHandledRef.current = true;
      SoundManager.play('lose');
    }
  // handleWin reads progress via closure; status is the only trigger needed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.status]);

  const onKey = useCallback((key: string) => {
    if (!gameState) return;
    if (showRemovePicker) {
      if (/^[A-Z]$/.test(key)) {
        SoundManager.play('powerUp');
        setGameState(prev => prev ? applyRemoveLetter(prev, key) : prev);
        onProgressUpdate({ ...progress, removeLetterItems: progress.removeLetterItems - 1, totalItemsUsed: progress.totalItemsUsed + 1 });
        setShowRemovePicker(false);
      }
      return;
    }
    // Play key-press click for letter and backspace keys
    if (/^[A-Z]$/.test(key) || key === 'BACKSPACE') {
      SoundManager.play('keyPress');
    }
    const next = handleKeyPress(gameState, key, validWords);
    // Row just submitted — play staggered tile reveal sounds
    if (next.completedGuesses.length > gameState.completedGuesses.length) {
      const row = next.completedGuesses[next.completedGuesses.length - 1];
      row.states.forEach((state, i) => {
        setTimeout(() => {
          if (state === 'CORRECT')      SoundManager.play('tileCorrect');
          else if (state === 'PRESENT') SoundManager.play('tilePresent');
          else                          SoundManager.play('tileAbsent');
        }, i * 220);
      });
    }
    setGameState(next);
  }, [gameState, validWords, showRemovePicker, progress, onProgressUpdate]);

  const handleAddGuess = () => {
    if (!gameState || progress.addGuessItems <= 0) return;
    SoundManager.play('powerUp');
    const next = applyAddGuess(gameState);
    setGameState(next);
    onProgressUpdate({ ...progress, addGuessItems: progress.addGuessItems - 1, totalItemsUsed: progress.totalItemsUsed + 1 });
  };

  const handleShowLetter = () => {
    if (!gameState || progress.showLetterItems <= 0) return;
    SoundManager.play('powerUp');
    const next = applyShowLetter(gameState);
    setGameState(next);
    onProgressUpdate({ ...progress, showLetterItems: progress.showLetterItems - 1, totalItemsUsed: progress.totalItemsUsed + 1 });
  };

  const handleDefinition = () => {
    if (!gameState || progress.definitionItems <= 0 || definitionUsed) return;
    SoundManager.play('powerUp');
    setDefinitionUsed(true);
    setShowDefinition(true);
    onProgressUpdate({ ...progress, definitionItems: progress.definitionItems - 1, totalItemsUsed: progress.totalItemsUsed + 1 });
  };

  const handleWin = () => {
    if (!gameState) return;
    const { coinsEarned, starsEarned } = gameState;

    if (isDailyChallenge) {
      // Daily challenge: update coins/stars/totalWins only — do NOT touch level progression
      const updated: PlayerProgress = {
        ...progress,
        coins: progress.coins + coinsEarned,
        totalWins: progress.totalWins + 1,
        totalDailyChallengesCompleted: progress.totalDailyChallengesCompleted + 1,
        totalGuesses: progress.totalGuesses + gameState.completedGuesses.length,
        savedGameState: null,
      };
      onProgressUpdate(updated);
      return;
    }

    const levelKey = `${difficulty}-${level}`;
    const existingStars = progress.levelStars[levelKey] ?? 0;
    const newStars = Math.max(existingStars, starsEarned);

    const diffKey = `${difficulty}LevelsCompleted` as keyof PlayerProgress;
    const prevCompleted = (progress[diffKey] as number) ?? 0;
    const newCompleted = prevCompleted + 1;

    const levelProg = `${difficulty}Level` as keyof PlayerProgress;
    const currentLevel = progress[levelProg] as number;
    const newLevel = level >= currentLevel ? level + 1 : currentLevel;

    // Bonus life check
    const bonusLifeEvery = BONUS_LIFE_EVERY[difficulty];
    const earnedBonusLife = newCompleted % bonusLifeEvery === 0;
    const newLives = earnedBonusLife ? progress.lives + 1 : progress.lives;

    const updated: PlayerProgress = {
      ...progress,
      coins: progress.coins + coinsEarned,
      lives: newLives,
      levelStars: { ...progress.levelStars, [levelKey]: newStars },
      [diffKey]: newCompleted,
      [levelProg]: newLevel,
      totalWins: progress.totalWins + 1,
      totalLevelsCompleted: progress.totalLevelsCompleted + 1,
      totalGuesses: progress.totalGuesses + gameState.completedGuesses.length,
      savedGameState: null,
    };
    onProgressUpdate(updated);
  };

  const handleNextLevel = () => {
    if (isDailyChallenge) {
      onNavigate({ name: 'dailyChallenge' });
      return;
    }
    onNavigate({ name: 'game', difficulty, level: level + 1 });
  };

  const handleNoLivesTradeCoins = () => {
    if (progress.coins < 1000) return;
    const updated = { ...progress, coins: progress.coins - 1000, lives: progress.lives + 1 };
    onProgressUpdate(updated);
    setShowNoLives(false);
    window.location.reload(); // re-init
  };

  const handleNoLivesTradeDiamonds = () => {
    if (progress.diamonds < 3) return;
    const updated = { ...progress, diamonds: progress.diamonds - 3, lives: progress.lives + 1 };
    onProgressUpdate(updated);
    setShowNoLives(false);
    window.location.reload();
  };

  const accent = DIFFICULTY_ACCENT[difficulty];
  const isVip = difficulty === 'vip';

  if (showNoLives) {
    return (
      <NoLivesDialog
        coins={progress.coins}
        diamonds={progress.diamonds}
        msUntilNext={msUntilNext}
        onTradeCoins={handleNoLivesTradeCoins}
        onTradeDiamonds={handleNoLivesTradeDiamonds}
        onGoToStore={() => onNavigate({ name: 'store' })}
        onWait={onBack}
      />
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-onBg text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col overflow-hidden">
      {/* VIP shimmer overlay */}
      {isVip && <div className="vip-shimmer fixed inset-0 z-0 pointer-events-none" />}

      {/* Top bar */}
      <div className="relative z-10 px-4 pt-safe pt-3 pb-2">
        {/* Row 1 */}
        <div className="flex items-center gap-2 mb-1.5">
          <button onClick={onBack} className="text-onSurface/60 hover:text-onBg p-1 -ml-1 text-xl">←</button>
          <div className="flex-1 text-center">
            <span className="font-bold text-onBg text-base">
            {isDailyChallenge ? '📅 Daily Challenge' : `Level ${level}`}
          </span>
            <span
              className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: accent + '33', color: accent }}
            >
              {DIFFICULTY_LABELS[difficulty]}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-heartRed">❤️</span>
            <span className="text-onSurface font-bold">{Math.min(progress.lives, 10)}</span>
            {progress.lives > 10 && (
              <span className="text-bonusBlue font-bold text-xs">+{progress.lives - 10}</span>
            )}
          </div>
        </div>
        {/* Row 2 */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="text-coinGold font-semibold">🪙 {progress.coins.toLocaleString()}</span>
          <span className="text-diamondCyan font-semibold">💎 {progress.diamonds}</span>
          <button onClick={() => onNavigate({ name: 'store' })} className="text-onSurface/60 hover:text-onBg">🛒</button>
        </div>
        {isReplay && (
          <div className="text-center text-xs text-primary/70 mt-1">
            🔄 Replay — No rewards or life cost
          </div>
        )}
      </div>

      {/* Game area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4 px-4 py-2">
        <GameGrid gameState={gameState} highContrast={progress.highContrast} />
        <ItemsBar
          addGuessItems={progress.addGuessItems}
          removeLetterItems={progress.removeLetterItems}
          definitionItems={progress.definitionItems}
          showLetterItems={progress.showLetterItems}
          onAddGuess={handleAddGuess}
          onRemoveLetter={() => setShowRemovePicker(true)}
          onDefinition={handleDefinition}
          onShowLetter={handleShowLetter}
          definitionUsed={definitionUsed}
          hasDefinition={!!(gameState.definition)}
          disabled={gameState.status !== 'IN_PROGRESS' && gameState.status !== 'OUT_OF_GUESSES'}
        />
      </div>

      {/* Keyboard */}
      <div className="relative z-10 px-2 pb-safe pb-4">
        <GameKeyboard
          keyStates={gameState.keyStates}
          removedLetters={gameState.removedLetters}
          onKeyPress={onKey}
          disabled={gameState.status !== 'IN_PROGRESS' || showRemovePicker}
        />
      </div>

      {/* Remove letter picker overlay */}
      {showRemovePicker && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-end">
          <div className="w-full bg-surface border-t border-borderFilled p-4">
            <p className="text-center text-onSurface/70 text-sm mb-3">
              🚫 Tap a letter to remove it from the keyboard
            </p>
            <GameKeyboard
              keyStates={gameState.keyStates}
              removedLetters={gameState.removedLetters}
              onKeyPress={onKey}
              disabled={false}
            />
            <button
              onClick={() => setShowRemovePicker(false)}
              className="w-full mt-3 py-2 text-onSurface/50 text-sm hover:text-onSurface/80"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Definition dialog */}
      {showDefinition && gameState.definition && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-surface border border-borderFilled rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-pop-in">
            <div className="text-3xl text-center mb-2">📖</div>
            <h3 className="text-lg font-bold text-center text-onBg mb-3">Word Definition</h3>
            <p className="text-onSurface/80 text-center italic">{gameState.definition}</p>
            <button
              onClick={() => setShowDefinition(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-primary text-bg font-bold"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Need more guesses dialog */}
      {gameState.status === 'OUT_OF_GUESSES' && (
        <NeedMoreGuessesDialog
          addGuessItems={progress.addGuessItems}
          coins={progress.coins}
          onUseItem={() => {
            handleAddGuess();
            onProgressUpdate({ ...progress, addGuessItems: progress.addGuessItems - 1 });
          }}
          onBuyGuess={() => {
            if (progress.coins >= 200) {
              onProgressUpdate({ ...progress, coins: progress.coins - 200 });
              setGameState(prev => prev ? applyAddGuess(prev) : prev);
            }
          }}
          onGoToStore={() => onNavigate({ name: 'store' })}
          onDismiss={onBack}
        />
      )}

      {/* Win dialog */}
      {gameState.status === 'WON' && (
        <WinDialog
          difficulty={difficulty}
          level={level}
          targetWord={gameState.targetWord}
          definition={gameState.definition}
          guessCount={gameState.completedGuesses.length}
          coinsEarned={gameState.coinsEarned}
          isReplay={isReplay}
          isDailyChallenge={isDailyChallenge}
          onNextLevel={handleNextLevel}
          onMainMenu={onBack}
        />
      )}
    </div>
  );
};

export default GameScreen;
