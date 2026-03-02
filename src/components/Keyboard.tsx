"use client";
import React, { useEffect } from 'react';

export interface KeyboardProps {
  onKeyPress: (key: string) => void;
  wordLength: number;
}

const KEYS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];

export const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, wordLength: _wordLength }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) onKeyPress(key);
      if (key === 'BACKSPACE') onKeyPress('BACKSPACE');
      if (key === 'ENTER') onKeyPress('ENTER');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onKeyPress]);

  return (
    <div className="flex flex-col items-center gap-2">
      {KEYS.map((row, i) => (
        <div key={i} className="flex gap-2">
          {row.map(k => (
            <button
              key={k}
              className="px-4 py-2 rounded bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-lg shadow-md hover:bg-yellow-400 hover:text-black transition-all duration-200"
              onClick={() => onKeyPress(k)}
            >{k}</button>
          ))}
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <button
          className="px-4 py-2 rounded bg-gray-700 text-yellow-300 font-bold text-lg shadow-md hover:bg-yellow-400 hover:text-black transition-all duration-200"
          onClick={() => onKeyPress('BACKSPACE')}
        >⌫</button>
        <button
          className="px-4 py-2 rounded bg-green-700 text-white font-bold text-lg shadow-md hover:bg-yellow-400 hover:text-black transition-all duration-200"
          onClick={() => onKeyPress('ENTER')}
        >⏎</button>
      </div>
    </div>
  );
};
