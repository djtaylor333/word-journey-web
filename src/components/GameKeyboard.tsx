"use client";
import React, { useEffect } from 'react';
import type { TileState } from '../logic/types';

interface GameKeyboardProps {
  keyStates: Record<string, TileState>;
  removedLetters: Set<string>;
  onKeyPress: (key: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

const ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','DEL'],
];

function keyBgStyle(state: TileState | undefined, removed: boolean): string {
  if (removed) return 'bg-tileAbsent/40 text-onSurface/30 cursor-not-allowed';
  switch (state) {
    case 'CORRECT': return 'bg-tileCorrect text-white';
    case 'PRESENT': return 'bg-tilePresent text-bg';
    case 'ABSENT':  return 'bg-tileAbsent  text-onSurface/60';
    case 'HINT':    return 'bg-tileHint    text-white';
    default:        return 'bg-keyDefault  text-onBg';
  }
}

const GameKeyboard: React.FC<GameKeyboardProps> = ({
  keyStates,
  removedLetters,
  onKeyPress,
  disabled = false,
  compact = false,
}) => {
  // Physical keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (disabled) return;
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) onKeyPress(key);
      if (e.key === 'Backspace' || e.key === 'Delete') onKeyPress('BACKSPACE');
      if (e.key === 'Enter') onKeyPress('ENTER');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onKeyPress, disabled]);

  return (
    <div className={`flex flex-col items-center w-full max-w-lg select-none ${compact ? 'gap-1' : 'gap-1.5'}`}>
      {ROWS.map((row, ri) => (
        <div key={ri} className={`flex justify-center w-full ${compact ? 'gap-0.5' : 'gap-1'}`}>
          {row.map(key => {
            const isAction = key === 'ENTER' || key === 'DEL';
            const removed = removedLetters.has(key);
            const state = keyStates[key];
            const colorClass = keyBgStyle(state, removed);

            return (
              <button
                key={key}
                disabled={disabled || removed}
                onClick={() => !disabled && !removed && onKeyPress(key === 'DEL' ? 'BACKSPACE' : key)}
                className={`
                  ${isAction
                    ? compact ? 'px-2 text-xs font-bold' : 'px-3 sm:px-4 text-sm sm:text-base font-bold'
                    : compact ? 'w-7 text-sm font-bold' : 'w-9 sm:w-11 text-lg sm:text-xl font-bold'
                  }
                  ${compact ? 'h-9' : 'h-14 sm:h-16'}
                  rounded
                  flex items-center justify-center
                  transition-colors duration-200
                  active:scale-95
                  ${colorClass}
                `}
              >
                {key === 'DEL' ? '⌫' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default GameKeyboard;
