"use client";
import React, { useEffect, useRef, useState } from 'react';
import type { Difficulty } from '../logic/types';
import { DIFFICULTY_ACCENT, DIFFICULTY_LABELS } from '../logic/types';
import { starsFromGuesses } from '../logic/gameEngine';

interface WinDialogProps {
  difficulty: Difficulty;
  level: number;
  targetWord: string;
  definition: string;
  guessCount: number;
  coinsEarned: number;
  isReplay: boolean;
  onNextLevel: () => void;
  onMainMenu: () => void;
}

const CONFETTI_COLORS = ['#F59E0B','#22C55E','#3B82F6','#EF4444','#A855F7','#06B6D4','#F97316','#EC4899'];

const WinDialog: React.FC<WinDialogProps> = ({
  difficulty, level, targetWord, definition, guessCount,
  coinsEarned, isReplay, onNextLevel, onMainMenu,
}) => {
  const stars = starsFromGuesses(guessCount);
  const accent = DIFFICULTY_ACCENT[difficulty];
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const particles = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      duration: `${2 + Math.random() * 2}s`,
      delay: `${Math.random() * 0.5}s`,
      rotation: `${Math.random() * 360}deg`,
    }))
  );

  // Count-up animation for coins
  useEffect(() => {
    if (coinsEarned <= 0 || isReplay) return;
    const steps = 20;
    const step = coinsEarned / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, coinsEarned);
      setDisplayedCoins(Math.floor(current));
      if (current >= coinsEarned) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [coinsEarned, isReplay]);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 overflow-hidden">
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.current.map(p => (
          <div
            key={p.id}
            className="confetti-particle"
            style={{
              left: p.left,
              backgroundColor: p.color,
              animationDuration: p.duration,
              animationDelay: p.delay,
              transform: `rotate(${p.rotation})`,
            }}
          />
        ))}
      </div>

      <div className="bg-surface border rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-pop-in relative"
           style={{ borderColor: accent + '60' }}>
        {/* Trophy */}
        <div className="text-6xl text-center mb-2 animate-bounce-trophy">🏆</div>
        <h2 className="text-2xl font-bold text-center mb-1" style={{ color: accent }}>
          Level Solved!
        </h2>
        <p className="text-center text-onSurface/60 text-sm mb-3">
          {DIFFICULTY_LABELS[difficulty]} · Level {level}
        </p>

        {/* Stars */}
        <div className="flex justify-center gap-1 text-3xl mb-3">
          {[1,2,3].map(s => (
            <span key={s} className={s <= stars ? 'text-coinGold' : 'text-borderFilled'}>★</span>
          ))}
        </div>

        {/* Word revealed */}
        <div className="bg-surfaceVariant rounded-xl p-3 mb-3 text-center">
          <div className="text-2xl font-bold tracking-widest text-tileCorrect mb-1">{targetWord}</div>
          {definition && (
            <p className="text-onSurface/70 text-sm italic">{definition}</p>
          )}
        </div>

        {/* Coins earned */}
        {!isReplay && coinsEarned > 0 && (
          <div className="flex items-center justify-center gap-2 mb-4 animate-coin-pop">
            <span className="text-coinGold text-xl">🪙</span>
            <span className="text-coinGold font-bold text-lg">+{displayedCoins} coins</span>
          </div>
        )}
        {isReplay && (
          <div className="text-center text-onSurface/50 text-sm mb-4">
            🔄 Replay — No rewards or life cost
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onMainMenu}
            className="flex-1 py-2.5 rounded-lg border border-borderFilled text-onSurface/70 hover:text-onBg hover:border-onSurface/50 transition-colors text-sm font-semibold"
          >
            🏠 Menu
          </button>
          <button
            onClick={onNextLevel}
            className="flex-1 py-2.5 rounded-lg font-bold text-bg transition-colors text-sm"
            style={{ backgroundColor: accent }}
          >
            Next Level ➡
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinDialog;
