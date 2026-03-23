"use client";
import React, { useEffect, useRef } from 'react';
import GameTile from './GameTile';
import type { TileState } from '../logic/types';
import type { GameState } from '../logic/types';

interface GameGridProps {
  gameState: GameState;
  highContrast?: boolean;
  compact?: boolean;
}

const GameGrid: React.FC<GameGridProps> = ({ gameState, highContrast = false, compact = false }) => {
  const {
    targetWord,
    completedGuesses,
    currentInput,
    maxGuesses,
    prefilledPositions,
    isInvalid,
    status,
  } = gameState;

  const wordLen = targetWord.length;
  const activeRowRef = useRef<HTMLDivElement>(null);

  // Shake the active row on invalid submission
  useEffect(() => {
    if (isInvalid && activeRowRef.current) {
      const el = activeRowRef.current;
      el.classList.remove('animate-shake');
      void el.offsetWidth;
      el.classList.add('animate-shake');
      const timer = setTimeout(() => el.classList.remove('animate-shake'), 600);
      return () => clearTimeout(timer);
    }
  }, [isInvalid]);

  // Scroll the active input row into view after each guess submission.
  // Uses 'nearest' so it only scrolls when the row is not fully visible,
  // preventing the grid from jumping to the bottom on every input.
  useEffect(() => {
    if (completedGuesses.length > 0 && activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedGuesses.length]);

  // Build the display for the active (current input) row
  const activeRowLetters = buildFullInputForDisplay(currentInput, prefilledPositions, wordLen);

  const rows = [];

  // Completed guess rows
  for (let r = 0; r < completedGuesses.length; r++) {
    const guess = completedGuesses[r];
    rows.push(
      <div key={`completed-${r}`} className={compact ? 'flex gap-0.5' : 'flex gap-1.5'}>
        {guess.letters.map((letter, i) => (
          <GameTile
            key={i}
            letter={letter}
            state={guess.states[i]}
            delay={i * 100}
            highContrast={highContrast}
            compact={compact}
          />
        ))}
      </div>
    );
  }

  // Active row
  const isActiveRowVisible = status === 'IN_PROGRESS' || status === 'OUT_OF_GUESSES';
  if (completedGuesses.length < maxGuesses && isActiveRowVisible) {
    rows.push(
      <div key="active" ref={activeRowRef} className={compact ? 'flex gap-0.5' : 'flex gap-1.5'}>
        {activeRowLetters.map(({ letter, state }, i) => (
          <GameTile
            key={i}
            letter={letter}
            state={state}
            isActive
            highContrast={highContrast}
            compact={compact}
          />
        ))}
      </div>
    );
  }

  // Empty rows
  const emptyRows = maxGuesses - completedGuesses.length - (isActiveRowVisible ? 1 : 0);
  for (let r = 0; r < Math.max(0, emptyRows); r++) {
    rows.push(
      <div key={`empty-${r}`} className={compact ? 'flex gap-0.5' : 'flex gap-1.5'}>
        {Array.from({ length: wordLen }).map((_, i) => (
          <GameTile key={i} letter="" state="EMPTY" highContrast={highContrast} compact={compact} />
        ))}
      </div>
    );
  }

  return (
    <div className={compact ? 'flex flex-col gap-0.5 items-center' : 'flex flex-col gap-1.5 items-center'}>
      {rows}
    </div>
  );
};

function buildFullInputForDisplay(
  currentInput: string[],
  prefilledPositions: Map<number, string>,
  wordLen: number
): { letter: string; state: TileState }[] {
  const result: { letter: string; state: TileState }[] = [];
  let inputIdx = 0;

  for (let i = 0; i < wordLen; i++) {
    if (prefilledPositions.has(i)) {
      result.push({ letter: prefilledPositions.get(i)!, state: 'HINT' });
    } else {
      const letter = currentInput[inputIdx] ?? '';
      result.push({ letter, state: letter ? 'FILLED' : 'EMPTY' });
      inputIdx++;
    }
  }

  return result;
}

export default GameGrid;
