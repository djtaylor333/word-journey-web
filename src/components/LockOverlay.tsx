"use client";
import React from 'react';

interface LockOverlayProps {
  title?: string;
  message?: string;
  onClose?: () => void;
}

const LockOverlay: React.FC<LockOverlayProps> = ({
  title = 'Android Only Feature',
  message = 'This feature is available in the Android app. Download Word Journeys on the Google Play Store.',
  onClose,
}) => (
  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
    <div className="bg-surface border border-primary/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-pop-in text-center">
      <div className="text-5xl mb-3">🔒</div>
      <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
      <p className="text-onSurface/80 text-sm mb-6">{message}</p>
      <div className="flex flex-col gap-3">
        <a
          href="https://play.google.com/store"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary text-bg font-bold py-2.5 px-6 rounded-lg hover:bg-coinGold transition-colors block"
        >
          📱 Get the Android App
        </a>
        {onClose && (
          <button
            onClick={onClose}
            className="text-onSurface/60 text-sm hover:text-onSurface transition-colors py-1"
          >
            Maybe later
          </button>
        )}
      </div>
    </div>
  </div>
);

export default LockOverlay;
