"use client";
import React from 'react';
import type { PlayerProgress, Screen } from '../logic/types';
import { SEASON_KEYS, SEASON_META, seasonalLevelField, seasonalPackSize, type SeasonKey } from '../logic/seasonalWordPacks';
import LivesDisplay from '../components/LivesDisplay';

interface ThemedPacksScreenProps {
  progress: PlayerProgress;
  onNavigate: (s: Screen) => void;
  onBack: () => void;
}

const ThemedPacksScreen: React.FC<ThemedPacksScreenProps> = ({ progress, onNavigate, onBack }) => {
  return (
    <div className="min-h-screen bg-bg flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe pt-4 pb-3">
        <button
          onClick={onBack}
          className="text-onSurface/60 hover:text-onBg text-2xl p-2 rounded-xl hover:bg-surface/80 active:scale-90 transition-all"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-onBg">🎭 Themed Level Packs</h1>
        <div className="w-10" /> {/* spacer */}
      </div>

      {/* Lives & coins strip */}
      <div className="flex items-center justify-center gap-4 pb-3 text-sm font-semibold">
        <LivesDisplay progress={progress} />
        <span className="text-coinGold">🪙 {progress.coins.toLocaleString()}</span>
      </div>

      {/* Description */}
      <p className="text-center text-onSurface/50 text-xs px-6 pb-5">
        100 themed 5-letter words per season · All-year access · Progress saved locally
      </p>

      {/* Pack cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-safe pb-8 space-y-4">
        {SEASON_KEYS.map(seasonKey => {
          const meta = SEASON_META[seasonKey];
          const field = seasonalLevelField(seasonKey) as keyof PlayerProgress;
          const currentLevel = (progress[field] as number) ?? 1;
          // Levels completed = highest level started (currentLevel - 1), capped at pack size
          const packSize = seasonalPackSize(seasonKey);
          const completed = Math.min(currentLevel - 1, packSize);
          const progressPct = (completed / packSize) * 100;
          const isFinished = completed >= packSize;

          return (
            <button
              key={seasonKey}
              onClick={() => onNavigate({ name: 'seasonalLevelSelect', seasonKey })}
              className="w-full text-left flex items-center gap-4 p-5 rounded-2xl bg-surface border transition-all active:scale-[0.98] hover:border-opacity-60"
              style={{ borderColor: meta.accent + '50' }}
            >
              {/* Season icon */}
              <div
                className="w-14 h-14 flex items-center justify-center rounded-xl text-3xl flex-shrink-0"
                style={{ backgroundColor: meta.accent + '22' }}
              >
                {meta.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-onBg text-sm">{meta.label}</span>
                  {isFinished && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: meta.accent + '33', color: meta.accent }}
                    >
                      ✓ Done
                    </span>
                  )}
                </div>
                <div className="text-onSurface/50 text-xs mb-2">
                  {meta.dateHint} · {completed}/{packSize} levels · Level {isFinished ? packSize : currentLevel}
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-bg overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progressPct}%`,
                      backgroundColor: meta.accent,
                    }}
                  />
                </div>
              </div>

              {/* Arrow */}
              <span className="text-onSurface/30 text-lg flex-shrink-0">▶</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemedPacksScreen;
