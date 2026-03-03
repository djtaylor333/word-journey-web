"use client";
import React from 'react';
import type { PlayerProgress } from '../logic/types';

interface StatisticsScreenProps {
  progress: PlayerProgress;
  onBack: () => void;
}

const Row = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-borderFilled/20 last:border-0">
    <span className="text-onSurface/70 text-sm">{label}</span>
    <span className="text-onBg font-semibold text-sm">{value}</span>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-surface rounded-2xl p-4 mb-4">
    <h3 className="text-onSurface/50 text-xs uppercase tracking-widest font-semibold mb-3">{title}</h3>
    {children}
  </div>
);

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function totalStarsForDifficulty(levelStars: Record<string, number>, diff: string): number {
  return Object.entries(levelStars)
    .filter(([k]) => k.startsWith(diff + '-'))
    .reduce((sum, [, v]) => sum + v, 0);
}

const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ progress, onBack }) => {
  const pct = (a: number, b: number) =>
    b === 0 ? '—' : Math.round((a / b) * 100) + '%';

  const avgGuesses = progress.totalWins === 0 ? '—'
    : (progress.totalGuesses / progress.totalWins).toFixed(1);

  const starsEasy    = totalStarsForDifficulty(progress.levelStars, 'easy');
  const starsRegular = totalStarsForDifficulty(progress.levelStars, 'regular');
  const starsHard    = totalStarsForDifficulty(progress.levelStars, 'hard');
  const starsVip     = totalStarsForDifficulty(progress.levelStars, 'vip');
  const starsTotal   = starsEasy + starsRegular + starsHard + starsVip;

  return (
    <div className="min-h-screen flex flex-col bg-bg max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button onClick={onBack} className="text-onSurface/60 hover:text-onBg text-2xl p-3 rounded-xl hover:bg-surface/80 active:scale-90 transition-all">←</button>
        <h1 className="flex-1 text-center font-bold text-onBg text-xl">📊 Statistics</h1>
        <div className="w-8" />
      </div>

      <div className="flex-1 px-4 pb-8 overflow-y-auto">
        {/* Economy */}
        <Section title="Economy">
          <Row label="🪙 Coins" value={progress.coins.toLocaleString()} />
          <Row label="💎 Diamonds" value={progress.diamonds} />
          <Row label="❤️ Lives" value={progress.lives} />
          <Row label="🪙 Total earned" value={progress.totalCoinsEarned.toLocaleString()} />
          {(['addGuess','removeLetter','definition','showLetter'] as const).map(k => (
            <Row key={k} label={`  • ${k}`} value={(progress[`${k}Items` as keyof PlayerProgress] as number) ?? 0} />
          ))}
        </Section>

        {/* Adventure */}
        <Section title="Adventure Progress">
          {(['easy','regular','hard','vip'] as const).map(d => (
            <Row key={d} label={`${d[0].toUpperCase()}${d.slice(1)}`}
              value={`Level ${(progress[`${d}Level` as keyof PlayerProgress] as number) ?? 1}`} />
          ))}
          <Row label="Total levels completed" value={progress.totalLevelsCompleted} />
        </Section>

        {/* Stars */}
        <Section title="⭐ Stars Earned">
          <Row label="Total stars" value={`${starsTotal} ⭐`} />
          <Row label="  🌿 Easy"    value={`${starsEasy} / ${(progress.easyLevelsCompleted) * 3}`} />
          <Row label="  ⚔️ Regular" value={`${starsRegular} / ${(progress.regularLevelsCompleted) * 3}`} />
          <Row label="  🔥 Hard"    value={`${starsHard} / ${(progress.hardLevelsCompleted) * 3}`} />
          <Row label="  👑 VIP"     value={`${starsVip} / ${(progress.vipLevelsCompleted) * 3}`} />
        </Section>

        {/* Timer Mode */}
        <Section title="⏱️ Timer Mode Best Scores">
          <Row label="🌿 Easy best"    value={progress.timerBestEasy > 0 ? `${progress.timerBestEasy} words` : '—'} />
          <Row label="⚔️ Regular best" value={progress.timerBestRegular > 0 ? `${progress.timerBestRegular} words` : '—'} />
          <Row label="🔥 Hard best"    value={progress.timerBestHard > 0 ? `${progress.timerBestHard} words` : '—'} />
        </Section>

        {/* Daily Challenge */}
        <Section title="Daily Challenge">
          <Row label="🔥 Current streak" value={progress.dailyStreak} />
          <Row label="⭐ Best streak"    value={progress.dailyBestStreak} />
          <Row label="  4-letter streak" value={`${progress.dailyStreak4} / best ${progress.dailyBestStreak4}`} />
          <Row label="  5-letter streak" value={`${progress.dailyStreak5} / best ${progress.dailyBestStreak5}`} />
          <Row label="  6-letter streak" value={`${progress.dailyStreak6} / best ${progress.dailyBestStreak6}`} />
          <Row label="🏆 Total completed" value={progress.totalDailyChallengesCompleted} />
        </Section>

        {/* Login Streak */}
        <Section title="Login Streak">
          <Row label="🔥 Current streak" value={progress.loginStreak} />
          <Row label="⭐ Best streak"    value={progress.loginBestStreak} />
        </Section>

        {/* Overall */}
        <Section title="Overall">
          <Row label="Total wins"      value={progress.totalWins} />
          <Row label="Total guesses"   value={progress.totalGuesses} />
          <Row label="Avg guesses/win" value={avgGuesses} />
          <Row label="Items used"      value={progress.totalItemsUsed} />
          <Row label="Win rate"        value={pct(progress.totalWins, progress.totalWins + Math.max(0, progress.totalLevelsCompleted - progress.totalWins))} />
          {progress.totalTimePlayed > 0 && (
            <Row label="⏰ Time played" value={formatTime(progress.totalTimePlayed)} />
          )}
        </Section>
      </div>
    </div>
  );
};

export default StatisticsScreen;

