"use client";
import React, { useState } from 'react';
import type { PlayerProgress, Screen, Difficulty } from '../logic/types';
import { DIFFICULTY_ACCENT, DIFFICULTY_LABELS, DIFFICULTY_MAX_GUESSES, BONUS_LIFE_EVERY } from '../logic/types';
import LivesDisplay from '../components/LivesDisplay';
import LockOverlay from '../components/LockOverlay';
import { SEASON_KEYS, SEASON_META, seasonalLevelField, type SeasonKey } from '../logic/seasonalWordPacks';

interface HomeScreenProps {
  progress: PlayerProgress;
  onNavigate: (s: Screen) => void;
}

const diffCards: { d: Difficulty; emoji: string; wordLen: number }[] = [
  { d: 'easy',    emoji: '🌿', wordLen: 4 },
  { d: 'regular', emoji: '⚔️', wordLen: 5 },
  { d: 'hard',    emoji: '🔥', wordLen: 6 },
  { d: 'vip',     emoji: '👑', wordLen: 0 },  // VIP is variable-length
];

const HomeScreen: React.FC<HomeScreenProps> = ({ progress, onNavigate }) => {
  const [showVipLock, setShowVipLock] = useState(false);

  const levelFor = (d: Difficulty): number => {
    if (d === 'easy') return progress.easyLevel;
    if (d === 'regular') return progress.regularLevel;
    if (d === 'hard') return progress.hardLevel;
    return progress.vipLevel;
  };

  const today = new Date().toISOString().slice(0, 10);
  const dailyReset = progress.dailyLastDate !== today;
  const allDailyDone = !dailyReset && progress.dailyCompleted4 && progress.dailyCompleted5 && progress.dailyCompleted6;

  const needsDaily = !allDailyDone;

  return (
    <div className="min-h-screen bg-bg flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe pt-4 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-coinGold font-bold">🪙 {progress.coins.toLocaleString()}</span>
          <span className="text-diamondCyan font-bold">💎 {progress.diamonds}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Inbox with unread badge */}
          <button
            onClick={() => onNavigate({ name: 'inbox' })}
            className="relative text-onSurface/70 hover:text-onBg text-xl transition-colors"
            title="Inbox"
          >
            📬
            {progress.pendingRewards.some(r => !r.claimed) && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accentHard rounded-full border-2 border-bg" />
            )}
          </button>
          <button onClick={() => onNavigate({ name: 'store' })} className="text-onSurface/70 hover:text-onBg text-xl transition-colors" title="Store">🛒</button>
          <button onClick={() => onNavigate({ name: 'statistics' })} className="text-onSurface/70 hover:text-onBg text-xl transition-colors" title="Statistics">📊</button>
          <button onClick={() => onNavigate({ name: 'settings' })} className="text-onSurface/70 hover:text-onBg text-xl transition-colors" title="Settings">⚙️</button>
        </div>
      </div>

      {/* Lives */}
      <div className="flex items-center justify-center gap-1.5 pb-4">
        <LivesDisplay progress={progress} />
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center mb-8 px-4">
        <div className="relative mb-3">
          {/* Compass ring */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-compass-spin" style={{ margin: '-8px' }} />
          {/* 2×2 letter grid */}
          <div className="grid grid-cols-2 gap-2 p-4 rounded-2xl bg-surface border border-borderFilled shadow-2xl">
            {[
              { l: 'W', c: 'bg-tileCorrect' },
              { l: 'J', c: 'bg-tilePresent' },
              { l: '?', c: 'bg-tileAbsent' },
              { l: '!', c: 'bg-tilePresent' },
            ].map(({ l, c }, i) => (
              <div key={i} className={`w-16 h-16 flex items-center justify-center rounded-lg font-bold text-2xl text-white ${c}`}>
                {l}
              </div>
            ))}
          </div>
        </div>
        <h1 className="text-4xl font-bold text-onBg" style={{ fontFamily: 'Georgia, serif' }}>
          Word Journeys
        </h1>
        <p className="text-primary text-base font-medium mt-1">Conquer the Lexicon</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-safe pb-8 space-y-5">
        {/* Adventure section */}
        <section>
          <h2 className="text-onSurface/70 text-sm font-bold uppercase tracking-widest mb-3">🗺️ Adventure</h2>
          <div className="grid grid-cols-2 gap-4">
            {diffCards.map(({ d, emoji, wordLen }) => {
              const accent = DIFFICULTY_ACCENT[d];
              const lv = levelFor(d);
              const isVip = d === 'vip';
              const maxGuesses = DIFFICULTY_MAX_GUESSES[d];
              const bonusLifeEvery = BONUS_LIFE_EVERY[d];
              const desc = isVip
                ? 'Mixed lengths • 6 guesses'
                : `${wordLen}-letter words • ${maxGuesses} guesses`;
              const subDesc = isVip
                ? 'x2 rewards • VIP only'
                : `Every ${bonusLifeEvery} levels = +1 life`;
              return (
                <button
                  key={d}
                  onClick={() => {
                    if (isVip && !progress.isVip) { setShowVipLock(true); return; }
                    onNavigate({ name: 'levelSelect', difficulty: d });
                  }}
                  className="relative flex flex-col items-center p-5 rounded-2xl bg-surface border border-borderFilled/50 hover:border-primary/40 transition-all active:scale-95 overflow-hidden"
                  style={{ borderColor: accent + '30' }}
                >
                  {isVip && !progress.isVip && (
                    <div className="absolute top-1.5 right-1.5 text-xs bg-primary text-bg font-bold px-1.5 py-0.5 rounded-full">
                      VIP
                    </div>
                  )}
                  <span className="text-3xl mb-1.5 animate-float">{emoji}</span>
                  <span className="font-bold text-base" style={{ color: accent }}>
                    {DIFFICULTY_LABELS[d]}
                  </span>
                  <span className="text-onSurface/50 text-xs text-center">{desc}</span>
                  <span className="text-onSurface/40 text-xs text-center">{subDesc}</span>
                  <span className="text-onSurface/70 font-semibold text-xs mt-1">Lv. {lv}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Star Levels — Coming Soon */}
        <section>
          <h2 className="text-onSurface/70 text-sm font-bold uppercase tracking-widest mb-3">⭐ Star Levels</h2>
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface border border-coinGold/30">
            <span className="text-4xl">⭐</span>
            <div className="flex-1">
              <div className="font-bold text-coinGold text-base">Star Levels</div>
              <div className="text-onSurface/50 text-sm">Unlock by earning stars in Adventure</div>
              <div className="text-onSurface/40 text-xs mt-0.5">Special challenge levels — coming soon!</div>
            </div>
            <div className="text-xs bg-surface/80 border border-borderFilled/30 text-onSurface/50 font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
              🔒 Soon
            </div>
          </div>
        </section>

        {/* Daily Challenge */}
        <section>
          <h2 className="text-onSurface/70 text-sm font-bold uppercase tracking-widest mb-3">📅 Daily Challenge</h2>
          <button
            onClick={() => onNavigate({ name: 'dailyChallenge' })}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl bg-surface border transition-all active:scale-[0.98] ${
              needsDaily ? 'border-accentRegular/50' : 'border-borderFilled/50'
            }`}
          >
            <span className="text-4xl">📅</span>
            <div className="flex-1 text-left">
              <div className="font-bold text-onBg text-base">Daily Challenge</div>
              <div className="text-onSurface/60 text-sm">3 new words every day / 4, 5, and 6 letters</div>
              {progress.dailyStreak > 0 && (
                <div className="text-accentHard text-xs font-bold mt-0.5">🔥 {progress.dailyStreak} day streak</div>
              )}
            </div>
            {allDailyDone && <span className="text-tileCorrect text-lg">✓</span>}
            {needsDaily && <span className="text-coinGold text-lg">▶</span>}
          </button>
        </section>

        {/* Themed Level Packs */}
        <section>
          <h2 className="text-onSurface/70 text-sm font-bold uppercase tracking-widest mb-3">🎭 Themed Packs</h2>
          {/* Quick-play strip: 6 season icons */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {SEASON_KEYS.map(sk => {
              const meta = SEASON_META[sk as SeasonKey];
              const field = seasonalLevelField(sk as SeasonKey) as keyof PlayerProgress;
              const level = (progress[field] as number) ?? 1;
              return (
                <button
                  key={sk}
                  onClick={() => onNavigate({ name: 'seasonalGame', seasonKey: sk, level })}
                  className="flex flex-col items-center p-3 rounded-xl bg-surface border transition-all active:scale-95"
                  style={{ borderColor: meta.accent + '40' }}
                >
                  <span className="text-2xl mb-0.5">{meta.emoji}</span>
                  <span className="text-xs font-semibold" style={{ color: meta.accent }}>
                    Lv {level}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => onNavigate({ name: 'themedPacks' })}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface border border-borderFilled/50 hover:border-primary/40 transition-all active:scale-[0.98]"
          >
            <span className="text-3xl">🎭</span>
            <div className="flex-1 text-left">
              <div className="font-bold text-onBg text-sm">Browse All Themed Packs</div>
              <div className="text-onSurface/50 text-xs">6 seasons · 100 levels each · 5-letter words</div>
            </div>
            <span className="text-onSurface/40">▶</span>
          </button>
        </section>

        {/* Timer Mode */}
        <section>
          <h2 className="text-onSurface/70 text-sm font-bold uppercase tracking-widest mb-3">⏱️ Timer Mode</h2>
          <button
            onClick={() => onNavigate({ name: 'timerMode' })}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-surface border border-borderFilled/50 hover:border-accentHard/40 transition-all active:scale-[0.98]"
          >
            <span className="text-4xl">⏱️</span>
            <div className="flex-1 text-left">
              <div className="font-bold text-onBg text-base">Timer Mode</div>
              <div className="text-onSurface/60 text-sm">Solve as many words as you can before time runs out</div>
            </div>
            <span className="text-onSurface/40">▶</span>
          </button>
        </section>

        {/* Streak Rewards reference */}
        <section>
          <h2 className="text-onSurface/70 text-sm font-bold uppercase tracking-widest mb-3">🎁 Streak Rewards</h2>
          <div className="bg-surface border border-borderFilled/30 rounded-2xl p-4 space-y-1.5 text-sm">
            {[
              ['3 days', '🪙 +100 bonus coins'],
              ['7 days', '🪙 +500 coins + 💎 1 diamond'],
              ['14 days', '🪙 +1,000 coins + 💎 3 diamonds'],
              ['30 days', '🪙 +2,000 coins + 💎 5 diamonds + ❤️ 1 life'],
            ].map(([days, reward]) => (
              <div key={days} className="flex justify-between">
                <span className="text-onSurface/60 font-medium">{days}</span>
                <span className="text-onSurface/80">{reward}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* VIP lock overlay */}
      {showVipLock && (
        <LockOverlay
          title="VIP Exclusive"
          message="VIP adventure mode is available in the Android app. Download to unlock unlimited VIP levels, exclusive themes, and more."
          onClose={() => setShowVipLock(false)}
        />
      )}
    </div>
  );
};

export default HomeScreen;
