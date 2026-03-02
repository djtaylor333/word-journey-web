"use client";
import React, { useEffect, useRef, useState } from 'react';
import type { TileState } from '../logic/types';

interface GameTileProps {
  letter: string;
  state: TileState;
  delay?: number; // ms stagger delay for revealed tiles
  isActive?: boolean; // current input row
  highContrast?: boolean;
}

/** Returns colour classes for a given tile state, optionally high-contrast. */
function tileColorClasses(state: TileState, highContrast: boolean): string {
  if (highContrast) {
    switch (state) {
      case 'CORRECT': return 'bg-[#F5793A] border-[#F5793A] text-white';   // orange
      case 'PRESENT': return 'bg-[#85C0F9] border-[#85C0F9] text-bg';      // blue
      case 'ABSENT':  return 'bg-tileAbsent border-tileAbsent text-onSurface';
      case 'HINT':    return 'bg-tileHint   border-tileHintBorder text-white';
      case 'FILLED':  return 'bg-tileFilled border-borderFilled  text-onBg';
      default:        return 'bg-transparent border-borderEmpty   text-onBg';
    }
  }
  switch (state) {
    case 'CORRECT': return 'bg-tileCorrect border-tileCorrect text-white';
    case 'PRESENT': return 'bg-tilePresent border-tilePresent text-bg';
    case 'ABSENT':  return 'bg-tileAbsent  border-tileAbsent  text-onSurface';
    case 'HINT':    return 'bg-tileHint    border-tileHintBorder text-white';
    case 'FILLED':  return 'bg-tileFilled  border-borderFilled  text-onBg';
    default:        return 'bg-transparent border-borderEmpty    text-onBg';
  }
}

const FLIP_DURATION_MS = 500; // must match tailwind tile-flip duration

const GameTile: React.FC<GameTileProps> = ({ letter, state, delay = 0, isActive = false, highContrast = false }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // displayState drives the colour — we swap it at the flip midpoint
  const [displayState, setDisplayState] = useState<TileState>(state);

  // When a tile is revealed, schedule colour swap at the midpoint of the flip
  useEffect(() => {
    const isRevealed = state === 'CORRECT' || state === 'PRESENT' || state === 'ABSENT';
    if (!isRevealed) {
      setDisplayState(state);
      return;
    }

    const el = innerRef.current;
    if (!el) return;

    // Remove class, force reflow, re-add with delay
    el.classList.remove('animate-tile-flip');
    el.style.animationDelay = `${delay}ms`;
    void el.offsetWidth; // force reflow
    el.classList.add('animate-tile-flip');

    // Swap colour at the exact midpoint (half-duration + delay)
    const colorTimer = window.setTimeout(() => {
      setDisplayState(state);
    }, delay + FLIP_DURATION_MS / 2);

    return () => window.clearTimeout(colorTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Scale bounce when a letter is typed
  useEffect(() => {
    if (state === 'FILLED' && letter) {
      const el = innerRef.current;
      if (!el) return;
      el.classList.remove('animate-tile-bounce');
      void el.offsetWidth;
      el.classList.add('animate-tile-bounce');
    }
  }, [letter, state]);

  const colorClasses = tileColorClasses(displayState, highContrast);

  return (
    /* Perspective wrapper — never animates itself */
    <div
      ref={outerRef}
      className="w-14 h-14 sm:w-16 sm:h-16 select-none cursor-default"
      style={{ perspective: '400px' }}
    >
      {/* Inner card — receives flip & bounce animations */}
      <div
        ref={innerRef}
        className={`
          w-full h-full
          flex items-center justify-center
          border-2 rounded
          text-2xl sm:text-3xl font-bold tracking-widest
          ${colorClasses}
          ${isActive && !letter ? 'border-onSurface/40' : ''}
        `}
        style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
      >
        {letter}
      </div>
    </div>
  );
};

export default GameTile;
