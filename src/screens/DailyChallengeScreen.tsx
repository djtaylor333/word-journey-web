"use client";
import React from 'react';
import type { PlayerProgress, Screen } from '../logic/types';
import { localDateStr } from '../logic/progressStore';

interface DailyChallengeScreenProps {
  progress: PlayerProgress;
  onNavigate: (s: Screen) => void;
  onBack: () => void;
}

const DAILY_LENGTHS: { len: 4 | 5 | 6; emoji: string; label: string; accentClass: string }[] = [
  { len: 4, emoji: '🌿', label: 'Easy',    accentClass: 'text-accentEasy   border-accentEasy/40' },
  { len: 5, emoji: '⚔️', label: 'Regular', accentClass: 'text-accentRegular border-accentRegular/40' },
  { len: 6, emoji: '🔥', label: 'Hard',    accentClass: 'text-accentHard    border-accentHard/40' },
];

const DailyChallengeScreen: React.FC<DailyChallengeScreenProps> = ({
  progress, onNavigate, onBack,
}) => {
  const today = localDateStr();
  const isToday = progress.dailyLastDate === today;

  const isCompleted = (len: 4 | 5 | 6) => {
    if (!isToday) return false;
    if (len === 4) return progress.dailyCompleted4;
    if (len === 5) return progress.dailyCompleted5;
    return progress.dailyCompleted6;
  };
  const getStars = (len: 4 | 5 | 6) => {
    if (len === 4) return progress.dailyStars4;
    if (len === 5) return progress.dailyStars5;
    return progress.dailyStars6;
  };

  const getStreak = (len: 4 | 5 | 6) => {
    if (len === 4) return progress.dailyStreak4;
    if (len === 5) return progress.dailyStreak5;
    return progress.dailyStreak6;
  };

  const getBestStreak = (len: 4 | 5 | 6) => {
    if (len === 4) return progress.dailyBestStreak4;
    if (len === 5) return progress.dailyBestStreak5;
    return progress.dailyBestStreak6;
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #1A0533, #0D1B2A)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-safe pt-4 pb-3 max-w-2xl mx-auto w-full">
        <button onClick={onBack} className="text-onSurface/60 hover:text-onBg text-2xl p-3 rounded-xl hover:bg-white/10 active:scale-90 transition-all">←</button>
        <h1 className="flex-1 text-center font-bold text-onBg text-xl">📅 Daily Challenge</h1>
        <div className="w-12" />
      </div>

      {/* Streak banner */}
      <div className="flex justify-around px-6 pb-5 max-w-2xl mx-auto w-full">
        {[
          { label: '🔥 Streak', val: progress.dailyStreak },
          { label: '⭐ Best',   val: progress.dailyBestStreak },
          { label: '🏆 Wins',  val: progress.totalDailyChallengesCompleted },
        ].map(({ label, val }) => (
          <div key={label} className="text-center">
            <div className="text-2xl font-bold text-onBg">{val}</div>
            <div className="text-sm text-onSurface/60">{label}</div>
          </div>
        ))}
      </div>

      {/* Challenge cards */}
      <div className="flex-1 px-4 space-y-4 pb-safe pb-8 max-w-2xl mx-auto w-full">
        {DAILY_LENGTHS.map(({ len, emoji, label, accentClass }) => {
          const done = isCompleted(len);
          const stars = getStars(len);
          const streak = getStreak(len);
          const bestStreak = getBestStreak(len);
          return (
            <button
              key={len}
              onClick={() => !done && onNavigate({ name: 'dailyGame', wordLength: len })}
              disabled={done}
              className={`
                w-full flex items-center gap-5 p-6 rounded-2xl bg-surface/80 border-2
                transition-all active:scale-[0.98]
                ${accentClass}
                ${!done ? 'hover:opacity-90' : 'opacity-70'}
              `}
            >
              <span className="text-4xl">{emoji}</span>
              <div className="flex-1 text-left">
                <div className="font-bold text-onBg text-lg">{label} — {len} letters</div>
                {done ? (
                  <div className="flex gap-0.5 mt-1">
                    {[1,2,3].map(s => (
                      <span key={s} className="text-coinGold">{s <= stars ? '★' : '☆'}</span>
                    ))}
                  </div>
                ) : (
                  <div className="text-onSurface/60 text-xs mt-0.5">Tap to play</div>
                )}
                {/* Per-length streak */}
                {streak > 0 && (
                  <div className="text-xs mt-1 flex items-center gap-2">
                    <span className="text-accentHard">🔥 {streak}-day streak</span>
                    {bestStreak > streak && (
                      <span className="text-onSurface/40">Best: {bestStreak}</span>
                    )}
                  </div>
                )}
              </div>
              {done
                ? <span className="text-tileCorrect text-2xl">✓</span>
                : <span className="text-onSurface/40 text-lg">▶</span>
              }
            </button>
          );
        })}

        {/* Streak rewards */}
        <div className="bg-surface/50 border border-borderFilled/30 rounded-2xl p-4 mt-2">
          <h3 className="font-bold text-onSurface/80 text-sm mb-3">🎁 Streak Rewards</h3>
          {[
            ['3-day streak',  '🪙 +100 bonus coins'],
            ['7-day streak',  '🪙 +500 coins + 💎 1 diamond'],
            ['14-day streak', '🪙 +1,000 coins + 💎 3 diamonds'],
            ['30-day streak', '🪙 +2,000 coins + 💎 5 diamonds + ❤️ 1 life'],
          ].map(([day, reward]) => (
            <div key={day} className="flex justify-between text-sm py-1">
              <span className="text-onSurface/60">{day}</span>
              <span className="text-onSurface/80">{reward}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyChallengeScreen;
