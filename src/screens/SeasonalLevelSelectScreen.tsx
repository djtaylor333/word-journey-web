"use client";
import React, { useRef, useEffect } from 'react';
import type { PlayerProgress, Screen } from '../logic/types';
import { getSeasonalZone } from '../logic/types';
import { SEASON_META, seasonalLevelField, seasonalPackSize, type SeasonKey } from '../logic/seasonalWordPacks';
import LivesDisplay from '../components/LivesDisplay';

interface SeasonalLevelSelectScreenProps {
  seasonKey: string;
  progress: PlayerProgress;
  onNavigate: (s: Screen) => void;
  onBack: () => void;
}

// Zigzag column pattern (per zone of 10 levels): 0=left 20%, 1=center 50%, 2=right 80%
const ZIGZAG = [1, 2, 2, 1, 0, 0, 1, 2, 2, 1] as const;
const COL_PCT = [20, 50, 80] as const;
const NODE_SIZE = 64;

function getCol(level: number): 0 | 1 | 2 {
  return ZIGZAG[(level - 1) % ZIGZAG.length];
}

function connectorPath(fromCol: number, toCol: number): string {
  const x1 = COL_PCT[fromCol as 0 | 1 | 2];
  const x2 = COL_PCT[toCol as 0 | 1 | 2];
  return `M ${x1} 0 C ${x1} 25, ${x2} 25, ${x2} 50`;
}

const SeasonalLevelSelectScreen: React.FC<SeasonalLevelSelectScreenProps> = ({
  seasonKey, progress, onNavigate, onBack,
}) => {
  const meta = SEASON_META[seasonKey as SeasonKey];
  const field = seasonalLevelField(seasonKey as SeasonKey) as keyof PlayerProgress;
  const currentLevel = (progress[field] as number) ?? 1;
  const totalLevels = seasonalPackSize(seasonKey as SeasonKey);
  const accent = meta?.accent ?? '#86EFAC';

  const headerZone = getSeasonalZone(seasonKey, currentLevel);

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
      style={{ background: `linear-gradient(180deg, ${headerZone.bgFrom} 0%, ${headerZone.bgTo} 100%)` }}
    >
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
            <span className="text-2xl">{meta?.emoji}</span>
            <span className="font-bold text-onBg text-base">{meta?.label} Journey</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-semibold" style={{ color: headerZone.pathColor }}>
              {headerZone.emoji} {headerZone.name}
            </span>
            <span className="text-onSurface/40 text-xs">· Level {currentLevel} / {totalLevels}</span>
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
            const lvZone = getSeasonalZone(seasonKey, lv);
            const isCompleted = lv < currentLevel;
            const isCurrent   = lv === currentLevel;
            const isLocked    = lv > currentLevel;
            const starKey = `seasonal-${seasonKey}-${lv}`;
            const stars = (progress.levelStars as Record<string, number>)[starKey] ?? 0;
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
                      <span className="opacity-60 text-xs ml-1">lvl {lv}–{Math.min(lv + 9, totalLevels)}</span>
                    </div>
                  </div>
                )}

                {/* Curved connector */}
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
                        strokeDasharray={isCompleted ? 'none' : '6 4'}
                        fill="none"
                        opacity={isCompleted ? 0.7 : 0.4}
                      />
                    </svg>
                  </div>
                )}

                {/* Level node row */}
                <div className="relative flex items-center" style={{ height: `${NODE_SIZE}px` }}>
                  <button
                    ref={isCurrent ? currentLevelRef : undefined}
                    disabled={isLocked}
                    onClick={() => {
                      if (isLocked) return;
                      onNavigate({
                        name: 'seasonalGame',
                        seasonKey,
                        level: lv,
                        isReplay: isCompleted,
                      });
                    }}
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
      <div
        className="relative z-10 px-4 pb-safe pb-4 pt-3 backdrop-blur-sm border-t max-w-2xl mx-auto w-full"
        style={{ backgroundColor: `${headerZone.bgFrom}CC`, borderColor: `${accent}30` }}
      >
        <button
          onClick={() =>
            progress.lives > 0
              ? onNavigate({ name: 'seasonalGame', seasonKey, level: currentLevel })
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

export default SeasonalLevelSelectScreen;
