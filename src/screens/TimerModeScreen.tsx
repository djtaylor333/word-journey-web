"use client";
import React, { useState, useEffect, useRef } from 'react';
import type { PlayerProgress } from '../logic/types';
import { evaluateGuess } from '../logic/gameEngine';
import { getWordsForLength } from '../logic/wordLoader';

interface TimerModeScreenProps {
  progress: PlayerProgress;
  onProgress: (p: PlayerProgress) => void;
  onBack: () => void;
}

type Phase = 'SETUP' | 'COUNTDOWN' | 'PLAYING' | 'RECAP';

const DIFF_CONFIG: Record<string, { label: string; len: number; accent: string; startMs: number }> = {
  easy:    { label: 'Easy',    len: 4, accent: '#2DD4BF', startMs: 3*60*1000 },
  regular: { label: 'Regular', len: 5, accent: '#F59E0B', startMs: 4*60*1000 },
  hard:    { label: 'Hard',    len: 6, accent: '#EF4444', startMs: 5*60*1000 },
};
const BONUS_MS = 30_000;

const TimerModeScreen: React.FC<TimerModeScreenProps> = ({ progress, onProgress, onBack }) => {
  const [phase, setPhase] = useState<Phase>('SETUP');
  const [diff, setDiff] = useState<string>('regular');
  const [countdown, setCountdown] = useState(3);
  const [timeMs, setTimeMs] = useState(0);
  const [score, setScore] = useState(0);
  const [wordsWords, setWordsWords] = useState<string[]>([]);
  const [wordIdx, setWordIdx] = useState(0);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [shake] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const len = DIFF_CONFIG[diff].len;

  const getBest = (d: string) => {
    if (d === 'easy') return progress.timerBestEasy ?? 0;
    if (d === 'hard') return progress.timerBestHard ?? 0;
    return progress.timerBestRegular ?? 0;
  };

  /* Load words when phase transitions to COUNTDOWN */
  useEffect(() => {
    if (phase === 'COUNTDOWN') {
      getWordsForLength(len).then(entries => {
        const words = entries.map(e => e.word.toUpperCase());
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        setWordsWords(shuffled);
      });
      setCountdown(3);
      const iv = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) { clearInterval(iv); setPhase('PLAYING'); return 0; }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(iv);
    }
  }, [phase, len]);

  /* Timer tick */
  useEffect(() => {
    if (phase !== 'PLAYING') return;
    const start = DIFF_CONFIG[diff].startMs;
    setTimeMs(start);
    const iv = setInterval(() => {
      setTimeMs(t => {
        if (t <= 1000) {
          clearInterval(iv);
          // Save best score before switching to recap
          setScore(finalScore => {
            const best = getBest(diff);
            if (finalScore > best) {
              setIsNewBest(true);
              const field = diff === 'easy' ? 'timerBestEasy' : diff === 'hard' ? 'timerBestHard' : 'timerBestRegular';
              onProgress({ ...progress, [field]: finalScore });
            }
            return finalScore;
          });
          setPhase('RECAP');
          return 0;
        }
        return t - 1000;
      });
    }, 1000);
    intervalRef.current = iv;
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, diff]);

  /* Keyboard */
  useEffect(() => {
    if (phase !== 'PLAYING') return;
    const handler = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      if (k === 'ENTER') submit();
      else if (k === 'BACKSPACE') setCurrent(c => c.slice(0, -1));
      else if (/^[A-Z]$/.test(k) && current.length < len) setCurrent(c => c + k);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const target = wordsWords[wordIdx] ?? '';

  function submit() {
    if (current.length !== len) return;
    const newGuesses = [...guesses, current];
    if (current === target.toUpperCase()) {
      setScore(s => s + 1);
      setTimeMs(t => Math.min(t + BONUS_MS, DIFF_CONFIG[diff].startMs));
      setGuesses([]);
      setCurrent('');
      setWordIdx(i => i + 1);
    } else if (newGuesses.length >= 6) {
      setGuesses([]);
      setCurrent('');
      setWordIdx(i => i + 1);
    } else {
      setGuesses(newGuesses);
      setCurrent('');
    }
  }

  const pct = (timeMs / DIFF_CONFIG[diff].startMs) * 100;
  const mins = Math.floor(timeMs / 60000);
  const secs = Math.floor((timeMs % 60000) / 1000);
  const timerColor = pct < 25 ? '#EF4444' : pct < 50 ? '#F59E0B' : '#2DD4BF';

  return (
    <div className="min-h-screen flex flex-col bg-bg max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button onClick={onBack} className="text-onSurface/60 hover:text-onBg text-2xl p-3 rounded-xl hover:bg-surface/80 active:scale-90 transition-all">←</button>
        <h1 className="flex-1 text-center font-bold text-onBg text-xl">⏱ Timer Mode</h1>
        <div className="w-8" />
      </div>

      {/* SETUP */}
      {phase === 'SETUP' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <p className="text-onSurface/70 text-center text-sm">Solve as many words as you can before time runs out! Each correct word adds +30s.</p>
          <div className="w-full space-y-3">
            {Object.entries(DIFF_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setDiff(key)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${diff === key ? 'border-current' : 'border-borderFilled/30 opacity-60'}`}
                style={{ borderColor: diff === key ? cfg.accent : undefined, color: cfg.accent }}
              >
                <span className="font-bold">{cfg.label}</span>
                <span className="text-xs text-onSurface/60 ml-2">— {cfg.len} letters, {cfg.startMs/60000} min</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setPhase('COUNTDOWN')}
            className="bg-accentRegular text-bg font-bold px-10 py-3 rounded-full text-lg active:scale-95 transition-transform"
          >
            Start!
          </button>
        </div>
      )}

      {/* COUNTDOWN */}
      {phase === 'COUNTDOWN' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-9xl font-black text-accentRegular animate-pop-in">
            {countdown > 0 ? countdown : 'GO!'}
          </div>
        </div>
      )}

      {/* PLAYING */}
      {phase === 'PLAYING' && (
        <div className="flex-1 flex flex-col items-center px-4 gap-3">
          {/* Timer bar */}
          <div className="w-full h-3 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${pct}%`, backgroundColor: timerColor }}
            />
          </div>
          <div className="text-2xl font-mono font-bold" style={{ color: timerColor }}>
            {mins}:{String(secs).padStart(2, '0')}
          </div>
          <div className="text-onSurface/60 text-sm">Score: <span className="text-onBg font-bold">{score}</span></div>

          {/* Mini grid */}
          <div className="flex flex-col gap-1.5 mt-2">
            {Array.from({ length: 6 }, (_, r) => {
              const guess = guesses[r];
              const isActive = r === guesses.length;
              return (
                <div key={r} className={`flex gap-1.5 ${isActive && shake ? 'animate-shake' : ''}`}>
                  {Array.from({ length: len }, (_, c) => {
                    const ch = guess
                      ? guess[c]
                      : isActive ? current[c] ?? '' : '';
                    const state = guess ? evaluateGuess(guess, target.toUpperCase())[c] : null;
                    return (
                      <div
                        key={c}
                        className="w-10 h-10 rounded border-2 flex items-center justify-center text-lg font-bold text-onBg"
                        style={{
                          borderColor: state === 'CORRECT' ? '#538D4E' : state === 'PRESENT' ? '#C9A84C' : state === 'ABSENT' ? '#555759' : ch ? '#818384' : '#3A3A3C',
                          backgroundColor: state === 'CORRECT' ? '#538D4E33' : state === 'PRESENT' ? '#C9A84C33' : state === 'ABSENT' ? '#55575933' : 'transparent',
                        }}
                      >
                        {ch}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* On-screen keyboard */}
          <div className="mt-auto w-full pb-4">
            {[['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['ENTER','Z','X','C','V','B','N','M','⌫']].map((row, ri) => (
              <div key={ri} className="flex justify-center gap-1 mb-1">
                {row.map(k => (
                  <button
                    key={k}
                    onPointerDown={() => {
                      if (k === 'ENTER') submit();
                      else if (k === '⌫') setCurrent(c => c.slice(0,-1));
                      else if (current.length < len) setCurrent(c => c + k);
                    }}
                    className="bg-surface text-onBg rounded font-bold text-xs py-3 active:opacity-70"
                    style={{ minWidth: k.length > 1 ? 48 : 32 }}
                  >
                    {k}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECAP */}
      {phase === 'RECAP' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
          <div className="text-6xl animate-bounce-trophy">⏱</div>
          <div className="text-5xl font-black text-onBg">{score}</div>
          <div className="text-onSurface/70">words solved</div>
          <div className="text-sm text-onSurface/50">{DIFF_CONFIG[diff].label} mode</div>
          {isNewBest && (
            <div className="bg-primary/20 border border-primary/40 rounded-2xl px-6 py-3 text-center animate-pop-in">
              <div className="text-primary font-bold">🏆 New Personal Best!</div>
            </div>
          )}
          <div className="text-xs text-onSurface/40">
            Personal best: {getBest(diff)} words
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => { setScore(0); setGuesses([]); setCurrent(''); setWordIdx(0); setIsNewBest(false); setPhase('SETUP'); }}
              className="bg-surface border border-borderFilled/40 text-onBg px-6 py-3 rounded-full font-bold active:scale-95 transition-transform"
            >
              Play Again
            </button>
            <button onClick={onBack} className="bg-accentRegular text-bg px-6 py-3 rounded-full font-bold active:scale-95 transition-transform">
              Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerModeScreen;
