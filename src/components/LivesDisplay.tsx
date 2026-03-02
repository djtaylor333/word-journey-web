"use client";
import React, { useState, useEffect } from 'react';
import type { PlayerProgress } from '../logic/types';
import { MAX_REGEN_LIVES, applyLivesRegen, formatCountdown } from '../logic/livesRegen';

interface LivesDisplayProps {
  progress: PlayerProgress;
  /** If true, shows as a compact horizontal chip (for headers). Default = false (full row). */
  compact?: boolean;
}

const LivesDisplay: React.FC<LivesDisplayProps> = ({ progress, compact = false }) => {
  const [msUntilNext, setMsUntilNext] = useState(0);

  // Initialise countdown
  useEffect(() => {
    if (progress.lives < MAX_REGEN_LIVES) {
      const { msUntilNext: ms } = applyLivesRegen(progress);
      setMsUntilNext(ms);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.lives, progress.lastLifeRegenTimestamp]);

  // Tick every second
  useEffect(() => {
    if (msUntilNext <= 0) return;
    const interval = setInterval(() => {
      setMsUntilNext(prev => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [msUntilNext]);

  const showCountdown = progress.lives < MAX_REGEN_LIVES && msUntilNext > 0;

  if (compact) {
    // Compact chip for headers: ❤️ 7 (+2💙) 08:23
    return (
      <div className="flex items-center gap-1 text-sm">
        <span className="text-heartRed">❤️</span>
        <span className="text-onSurface font-bold">
          {Math.min(progress.lives, MAX_REGEN_LIVES)}
        </span>
        {progress.lives > MAX_REGEN_LIVES && (
          <span className="text-bonusBlue font-bold text-xs">
            +{progress.lives - MAX_REGEN_LIVES}💙
          </span>
        )}
        {showCountdown && (
          <span className="text-onSurface/50 text-xs ml-1">{formatCountdown(msUntilNext)}</span>
        )}
      </div>
    );
  }

  // Full display: row of hearts + countdown below
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: Math.min(progress.lives, MAX_REGEN_LIVES) }).map((_, i) => (
          <span key={i} className="text-lg text-heartRed">♥</span>
        ))}
        {progress.lives > MAX_REGEN_LIVES && (
          <span className="text-bonusBlue font-bold text-sm ml-1">
            +{progress.lives - MAX_REGEN_LIVES}💙
          </span>
        )}
        {progress.lives === 0 && (
          <span className="text-onSurface/30 text-sm">No lives</span>
        )}
      </div>
      {showCountdown && (
        <div className="text-xs text-onSurface/50 mt-0.5">
          Next ❤️ in {formatCountdown(msUntilNext)}
        </div>
      )}
    </div>
  );
};

export default LivesDisplay;
