"use client";
import React, { useRef, useEffect } from 'react';
import type { Difficulty, PlayerProgress, Screen } from '../logic/types';
import { DIFFICULTY_LABELS, DIFFICULTY_ACCENT, getZone, wordLengthForLevel } from '../logic/types';
import LivesDisplay from '../components/LivesDisplay';

interface LevelSelectScreenProps {
  difficulty: Difficulty;
  progress: PlayerProgress;
  onNavigate: (s: Screen) => void;
  onBack: () => void;
}

const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  difficulty, progress, onNavigate, onBack,
}) => {
  const accent = DIFFICULTY_ACCENT[difficulty];
  const currentLevel = (() => {
    if (difficulty === 'easy') return progress.easyLevel;
    if (difficulty === 'regular') return progress.regularLevel;
    if (difficulty === 'hard') return progress.hardLevel;
    return progress.vipLevel;
  })();

  const totalLevels = Math.max(currentLevel + 5, 30);
  const zone = getZone(currentLevel);
  const isVip = difficulty === 'vip';

  // Refs for auto-scroll to current level
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentLevelRef = useRef<HTMLButtonElement>(null);

  // Scroll to current level node on mount
  useEffect(() => {
    if (currentLevelRef.current) {
      currentLevelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <div
      className="h-screen flex flex-col relative"
      style={{ background: `linear-gradient(135deg, ${zone.bgFrom}, ${zone.bgTo})` }}
    >
      {/* VIP golden shimmer overlay */}
      {isVip && <div className="vip-shimmer fixed inset-0 z-0 pointer-events-none" />}

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-safe pt-4 pb-3 max-w-2xl mx-auto w-full">
        <button onClick={onBack} className="text-onSurface/60 hover:text-onBg text-2xl p-3 rounded-xl hover:bg-black/20 active:scale-90 transition-all">←</button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{zone.emoji}</span>
            <span className="font-bold text-onBg">{zone.name}</span>
          </div>
          <div className="text-xs font-semibold" style={{ color: accent }}>
            {DIFFICULTY_LABELS[difficulty]} · {wordLengthForLevel(difficulty, currentLevel)}-letter words
          </div>
        </div>
        <LivesDisplay progress={progress} compact />
      </div>

      {/* Level grid */}
      <div ref={scrollContainerRef} className="relative z-10 flex-1 overflow-y-auto pb-safe pb-8">
        <div className="max-w-2xl mx-auto px-4">
        <div className="flex flex-col items-center gap-0">
          {Array.from({ length: totalLevels }, (_, i) => i + 1).map(lv => {
            const isCompleted = lv < currentLevel;
            const isCurrent   = lv === currentLevel;
            const isLocked    = lv > currentLevel;
            const stars = progress.levelStars[`${difficulty}-${lv}`] ?? 0;

            return (
              <div key={lv} className="flex flex-col items-center">
                {/* Dashed path segment (above every node except level 1) */}
                {lv > 1 && (
                  <div
                    className="w-0.5 h-6 opacity-40"
                    style={{ background: zone.pathColor, borderRight: `2px dashed ${zone.pathColor}` }}
                  />
                )}

                {/* Level node */}
                <button
                  ref={isCurrent ? currentLevelRef : undefined}
                  disabled={isLocked}
                  onClick={() => !isLocked && onNavigate({ name: 'game', difficulty, level: lv })}
                  className={`
                    w-20 h-20 rounded-full flex flex-col items-center justify-center
                    font-bold text-base shadow-lg transition-all active:scale-90
                    ${isCurrent
                      ? 'scale-125 shadow-xl ring-4'
                      : isCompleted
                        ? 'scale-100 opacity-90'
                        : 'opacity-30 cursor-not-allowed scale-90'
                    }
                  `}
                  style={{
                    backgroundColor: isCurrent ? accent : isCompleted ? accent + 'CC' : '#333',
                    color: isCurrent || isCompleted ? '#1C1610' : '#888',
                    ['--tw-ring-color' as string]: accent,
                    boxShadow: isCurrent ? `0 0 20px ${accent}80` : undefined,
                  }}
                >
                  {isLocked ? '🔒' : (
                    <>
                      <span className="text-xs font-bold leading-none">{lv}</span>
                      {isCompleted && stars > 0 && (
                        <div className="flex gap-0 mt-0.5">
                          {[1,2,3].map(s => (
                            <span key={s} className="text-[8px]">{s <= stars ? '★' : '☆'}</span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-4 pb-safe pb-4 pt-3 bg-bg/60 backdrop-blur-sm border-t border-borderFilled/20">
        <button
          onClick={() => progress.lives > 0
            ? onNavigate({ name: 'game', difficulty, level: currentLevel })
            : undefined
          }
          disabled={progress.lives <= 0}
          className="w-full py-3 rounded-xl font-bold text-bg transition-all disabled:opacity-40"
          style={{ backgroundColor: accent }}
        >
          {progress.lives > 0
            ? `▶ Continue — Level ${currentLevel}`
            : '💔 No lives — wait for regen'
          }
        </button>
      </div>
        </div>
    </div>
  );
};

export default LevelSelectScreen;
