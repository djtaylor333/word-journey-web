// Responsive keyboard component for touch and physical input
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5em' }}>
      {KEYS.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.3em' }}>
          {row.map(k => (
            <button key={k} style={{ padding: '0.7em 1em', fontSize: '1em' }} onClick={() => onKeyPress(k)}>{k}</button>
          ))}
        </div>
      ))}
      <div style={{ display: 'flex', gap: '0.3em' }}>
        <button style={{ padding: '0.7em 1em', fontSize: '1em' }} onClick={() => onKeyPress('BACKSPACE')}>⌫</button>
        <button style={{ padding: '0.7em 1em', fontSize: '1em' }} onClick={() => onKeyPress('ENTER')}>⏎</button>
      </div>
    </div>
  );
};
