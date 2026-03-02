"use client";
import React, { useState } from 'react';

interface OnboardingScreenProps {
  onDone: () => void;
}

const slides = [
  {
    emoji: '🗺️',
    title: 'Welcome to Word Journeys!',
    body: 'Embark on a lexical adventure. Solve word puzzles across beautiful zones, earn stars, and climb through hundreds of levels.',
  },
  {
    emoji: '🟩🟨',
    title: 'How to Play',
    body: `Guess the hidden word! After each guess, tiles change colour:\n🟩 Green = correct letter, correct spot\n🟨 Yellow = correct letter, wrong spot\n⬛ Grey = letter not in the word`,
  },
  {
    emoji: '⚡',
    title: 'Power-Ups',
    body: `+ Extra Guess — adds another row\n🚫 Remove Letter — eliminates a letter from the keyboard\n📖 Definition — reveals the word's meaning\n💡 Show Letter — reveals one letter in place`,
  },
  {
    emoji: '📅',
    title: 'Daily Challenge',
    body: 'Three fresh words every day — 4, 5, and 6 letters. Complete all three to keep your daily streak alive and earn bonus rewards!',
  },
  {
    emoji: '⏱️',
    title: 'Timer Mode',
    body: 'Race against the clock! Solve as many words as you can before time runs out. Correct words earn extra time. Beat your best score!',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const slide = slides[step];
  const isLast = step === slides.length - 1;

  const next = () => {
    if (isLast) {
      onDone();
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-between px-6 py-12">
      {/* Skip */}
      <div className="w-full flex justify-end">
        <button
          onClick={onDone}
          className="text-onSurface/40 hover:text-onSurface/70 text-sm transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm gap-6 animate-pop-in">
        <div className="text-6xl mb-2">{slide.emoji}</div>
        <h2 className="text-2xl font-bold text-onBg leading-tight">{slide.title}</h2>
        <p className="text-onSurface/70 text-base leading-relaxed whitespace-pre-line">{slide.body}</p>
      </div>

      {/* Dot indicators */}
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`rounded-full transition-all duration-300 ${
                i === step ? 'w-6 h-2.5 bg-primary' : 'w-2.5 h-2.5 bg-onSurface/20'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-full py-4 rounded-2xl font-bold text-lg text-bg bg-primary hover:opacity-90 transition-all active:scale-95 shadow-lg"
        >
          {isLast ? '🚀 Start Playing' : 'Next →'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
