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

// Zigzag column pattern (per zone of 10 levels): 0=left 20%, 1=center 50%, 2=right 80%
const ZIGZAG = [1, 2, 2, 1, 0, 0, 1, 2, 2, 1] as const;
// Center x-positions as percentage of container width
const COL_PCT = [20, 50, 80] as const;
// Node diameter
const NODE_SIZE = 64;

function getCol(level: number): 0 | 1 | 2 {
  return ZIGZAG[(level - 1) % ZIGZAG.length];
}

/** SVG path string for a cubic bezier connector between two column positions */
function connectorPath(fromCol: number, toCol: number): string {
  const x1 = COL_PCT[fromCol as 0 | 1 | 2];
  const x2 = COL_PCT[toCol as 0 | 1 | 2];
  return `M ${x1} 0 C ${x1} 25, ${x2} 25, ${x2} 50`;
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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentLevelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (currentLevelRef.current) {
      currentLevelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <div
      className="h-screen flex flex-col relative"
      style={{ background: `linear-gradient(180deg, ${zone.bgFrom} 0%, ${zone.bgTo} 100%)` }}
    >
      {isVip && <div className="vip-shimmer fixed inset-0 z-0 pointer-events-none" />}

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-safe pt-4 pb-3 max-w-2xl mx-auto w-full">
        <button
          onClick={onBack}
          className="text-onSurface/60 hover:text-onBg text-2xl p-3 rounded-xl hover:bg-black/20 active:scale-90 transition-all"
        >
          ←
        </button>
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

      {/* Scrollable level path */}
      <div ref={scrollContainerRef} className="relative z-10 flex-1 overflow-y-auto pb-safe pb-8">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {Array.from({ length: totalLevels }, (_, i) => {
            const lv = i + 1;
            const col = getCol(lv);
            const prevCol = lv > 1 ? getCol(lv - 1) : col;
            const lvZone = getZone(lv);
            const isCompleted = lv < currentLevel;
            const isCurrent   = lv === currentLevel;
            const isLocked    = lv > currentLevel;
            const stars = progress.levelStars[`${difficulty}-${lv}`] ?? 0;
            const isZoneStart = (lv - 1) % 10 === 0;

            return (
              <div key={lv}>
                {/* Zone section banner at the start of each zone */}
                {isZoneStart && (
                  <div className="flex items-center justify-center my-3">
                    <div
                      className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${lvZone.bgFrom}f0, ${lvZone.bgTo}f0)`,
                        border: `1.5px solid ${lvZone.pathColor}70`,
                        color: lvZone.pathColor,
                        boxShadow: `0 4px 16px ${lvZone.pathColor}20`,
                      }}
                    >
                      <span className="text-lg">{lvZone.emoji}</span>
                      <span>{lvZone.name}</span>
                      <span className="opacity-60 text-xs ml-1">lvl {lv}–{lv + 9}</span>
                    </div>
                  </div>
                )}

                {/* Curved connector from previous node to this one */}
                {lv > 1 && (
                  <div className="relative w-full" style={{ height: '48px' }}>
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 100 50"
                      preserveAspectRatio="none"
                    >
                      <path
                        d={connectorPath(prevCol, col)}
                        stroke={lvZone.pathColor}
                        strokeWidth="1.8"
                        strokeDasharray="6 4"
                        fill="none"
                        opacity="0.5"
                      />
                    </svg>
                  </div>
                )}

                {/* Level node row */}
                <div className="relative flex items-center" style={{ height: `${NODE_SIZE}px` }}>
                  <button
                    ref={isCurrent ? currentLevelRef : undefined}
                    disabled={isLocked}
                    onClick={() => !isLocked && onNavigate({ name: 'game', difficulty, level: lv })}
                    style={{
                      width: `${NODE_SIZE}px`,
                      height: `${NODE_SIZE}px`,
                      marginLeft: `calc(${COL_PCT[col]}% - ${NODE_SIZE / 2}px)`,
                      backgroundColor: isCurrent ? accent : isCompleted ? accent + 'CC' : '#333',
                      color: isCurrent || isCompleted ? '#1C1610' : '#888',
                      ['--tw-ring-color' as string]: accent,
                      boxShadow: isCurrent ? `0 0 24px ${accent}80` : undefined,
                      transform: isCurrent ? 'scale(1.2)' : isLocked ? 'scale(0.85)' : 'scale(1)',
                      zIndex: isCurrent ? 10 : 1,
                    }}
                    className={`
                      rounded-full flex flex-col items-center justify-center
                      font-bold shadow-lg transition-all active:scale-90 relative
                      ${isCurrent ? 'ring-4' : ''}
                      ${isLocked ? 'opacity-30 cursor-not-allowed' : ''}
                    `}
                  >
                    {isLocked ? (
                      <span className="text-xl">🔒</span>
                    ) : (
                      <>
                        <span className="text-sm font-bold leading-none">{lv}</span>
                        {isCompleted && stars > 0 && (
                          <div className="flex gap-px mt-1">
                            {[1, 2, 3].map(s => (
                              <span key={s} className="text-[9px] leading-none">
                                {s <= stars ? '★' : '☆'}
                              </span>
                            ))}
                          </div>
                        )}
                        {isCurrent && (
                          <span className="text-[9px] mt-0.5 opacity-80">▶</span>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom continue bar */}
      <div className="relative z-10 px-4 pb-safe pb-4 pt-3 bg-bg/60 backdrop-blur-sm border-t border-borderFilled/20 max-w-2xl mx-auto w-full">
        <button
          onClick={() =>
            progress.lives > 0
              ? onNavigate({ name: 'game', difficulty, level: currentLevel })
              : undefined
          }
          disabled={progress.lives <= 0}
          className="w-full py-3 rounded-xl font-bold text-bg transition-all disabled:opacity-40"
          style={{ backgroundColor: accent }}
        >
          {progress.lives > 0
            ? `▶ Continue — Level ${currentLevel}`
            : '💔 No lives — wait for regen'}
        </button>
      </div>
    </div>
  );
};

export default LevelSelectScreen;
