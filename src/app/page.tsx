"use client";
import { useState, useEffect } from 'react';
import type { Screen, Difficulty } from '../logic/types';
import type { PlayerProgress } from '../logic/types';
import { DEFAULT_PROGRESS, loadProgress, saveProgress, applyLoginStreak, applyDailyReset, applyNewPlayerBonus, getOrCreatePlayerId } from '../logic/progressStore';
import { applyLivesRegen, startRegenTimer } from '../logic/livesRegen';

import HomeScreen        from '../screens/HomeScreen';
import LevelSelectScreen from '../screens/LevelSelectScreen';
import GameScreen        from '../screens/GameScreen';
import DailyChallengeScreen from '../screens/DailyChallengeScreen';
import TimerModeScreen   from '../screens/TimerModeScreen';
import StoreScreen       from '../screens/StoreScreen';
import StatisticsScreen  from '../screens/StatisticsScreen';
import SettingsScreen    from '../screens/SettingsScreen';
import OnboardingScreen  from '../screens/OnboardingScreen';
import InboxScreen       from '../screens/InboxScreen';

// Map daily word length → difficulty
function diffForLen(n: number): Difficulty {
  if (n <= 4) return 'easy';
  if (n === 5) return 'regular';
  return 'hard';
}

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress>(DEFAULT_PROGRESS);
  const [screenStack, setScreenStack] = useState<Screen[]>([{ name: 'home' }]);
  const [ready, setReady] = useState(false);

  /* ─── Initialise progress from localStorage ───────────────────────────── */
  useEffect(() => {
    getOrCreatePlayerId(); // ensure a stable player ID exists for future Google sync
    let p = loadProgress() ?? DEFAULT_PROGRESS;
    p = applyNewPlayerBonus(p);  // one-time welcome bonus on first launch
    p = applyLoginStreak(p);
    p = applyDailyReset(p);
    const { updated } = applyLivesRegen(p);
    p = startRegenTimer(updated);
    setProgress(p);
    saveProgress(p);

    // Show onboarding for first-time players
    if (!p.hasSeenOnboarding) {
      setScreenStack([{ name: 'onboarding' }]);
    }
    setReady(true);
  }, []);

  /* ─── Persist on every progress change ───────────────────────────────── */
  useEffect(() => {
    if (ready) saveProgress(progress);
  }, [progress, ready]);

  /* ─── Save on tab hide / close (belt-and-suspenders) ─────────────────── */
  useEffect(() => {
    if (!ready) return;
    const handleHide = () => saveProgress(progress);
    document.addEventListener('visibilitychange', handleHide);
    window.addEventListener('beforeunload', handleHide);
    return () => {
      document.removeEventListener('visibilitychange', handleHide);
      window.removeEventListener('beforeunload', handleHide);
    };
  }, [progress, ready]);

  /* ─── Lives regen timer ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!ready || progress.lives >= 10) return;
    const { msUntilNext } = applyLivesRegen(progress);
    if (msUntilNext <= 0) return;
    const timeout = setTimeout(() => {
      setProgress(p => {
        const { updated } = applyLivesRegen(p);
        return updated;
      });
    }, msUntilNext);
    return () => clearTimeout(timeout);
  }, [progress.lives, progress.lastLifeRegenTimestamp, ready]);

  /* ─── Navigation helpers ───────────────────────────────────────────────── */
  function navigate(s: Screen) { setScreenStack(stack => [...stack, s]); }
  function goBack() {
    setScreenStack(stack => stack.length > 1 ? stack.slice(0, -1) : stack);
  }
  function navigateHome() { setScreenStack([{ name: 'home' }]); }

  const current = screenStack[screenStack.length - 1];

  if (!ready) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-onSurface/50 text-sm animate-pulse">Loading…</div>
      </div>
    );
  }

  /* ─── Route ─────────────────────────────────────────────────────────────── */
  if (current.name === 'onboarding') {
    return (
      <OnboardingScreen
        onDone={() => {
          setProgress(p => ({ ...p, hasSeenOnboarding: true }));
          setScreenStack([{ name: 'home' }]);
        }}
      />
    );
  }

  if (current.name === 'inbox') {
    return (
      <InboxScreen
        progress={progress}
        onProgress={setProgress}
        onBack={goBack}
      />
    );
  }

  if (current.name === 'home') {
    return <HomeScreen progress={progress} onNavigate={navigate} />;
  }

  if (current.name === 'levelSelect') {
    return (
      <LevelSelectScreen
        difficulty={current.difficulty}
        progress={progress}
        onNavigate={navigate}
        onBack={goBack}
      />
    );
  }

  if (current.name === 'game') {
    return (
      <GameScreen
        difficulty={current.difficulty}
        level={current.level}
        isReplay={current.isReplay}
        progress={progress}
        onProgressUpdate={setProgress}
        onNavigate={navigate}
        onBack={goBack}
      />
    );
  }

  if (current.name === 'dailyChallenge') {
    return (
      <DailyChallengeScreen
        progress={progress}
        onNavigate={navigate}
        onBack={goBack}
      />
    );
  }

  if (current.name === 'dailyGame') {
    const diff = diffForLen(current.wordLength);
    return (
      <GameScreen
        difficulty={diff}
        level={0}
        isDailyChallenge={true}
        progress={progress}
        onProgressUpdate={p => {
          const len = current.wordLength as 4 | 5 | 6;
          const field = len === 4 ? 'dailyCompleted4' : len === 5 ? 'dailyCompleted5' : 'dailyCompleted6';
          const streakField = len === 4 ? 'dailyStreak4' : len === 5 ? 'dailyStreak5' : 'dailyStreak6';
          const bestField = len === 4 ? 'dailyBestStreak4' : len === 5 ? 'dailyBestStreak5' : 'dailyBestStreak6';
          const newStreak = (p[streakField] ?? 0) + 1;
          setProgress({
            ...p,
            [field]: true,
            dailyLastDate: new Date().toISOString().slice(0, 10),
            [streakField]: newStreak,
            [bestField]: Math.max(p[bestField] ?? 0, newStreak),
          });
        }}
        onNavigate={(s) => { if (s.name === 'home') return navigateHome(); navigate(s); }}
        onBack={goBack}
      />
    );
  }

  if (current.name === 'timerMode') {
    return <TimerModeScreen progress={progress} onProgress={setProgress} onBack={goBack} />;
  }

  if (current.name === 'store') {
    return <StoreScreen progress={progress} onProgress={setProgress} onBack={goBack} />;
  }

  if (current.name === 'statistics') {
    return <StatisticsScreen progress={progress} onBack={goBack} />;
  }

  if (current.name === 'settings') {
    return <SettingsScreen progress={progress} onProgress={setProgress} onBack={goBack} />;
  }

  return <HomeScreen progress={progress} onNavigate={navigate} />;
}

