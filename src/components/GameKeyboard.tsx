"use client";
import React, { useEffect } from 'react';
import type { TileState } from '../logic/types';

interface GameKeyboardProps {
  keyStates: Record<string, TileState>;
  removedLetters: Set<string>;
  onKeyPress: (key: string) => void;
  disabled?: boolean;
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
    <div className="flex flex-col items-center gap-1.5 w-full max-w-lg select-none">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1 justify-center w-full">
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
                  ${isAction ? 'px-2 sm:px-3 text-xs sm:text-sm font-bold' : 'w-8 sm:w-9 text-base sm:text-lg font-bold'}
                  h-12 sm:h-14
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
