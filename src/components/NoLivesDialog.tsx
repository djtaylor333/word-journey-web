"use client";
import React from 'react';
import { formatCountdown } from '../logic/livesRegen';

interface NoLivesDialogProps {
  coins: number;
  diamonds: number;
  msUntilNext: number;
  onTradeCoins: () => void;
  onTradeDiamonds: () => void;
  onGoToStore: () => void;
  onWait: () => void;
}

const NoLivesDialog: React.FC<NoLivesDialogProps> = ({
  coins, diamonds, msUntilNext,
  onTradeCoins, onTradeDiamonds, onGoToStore, onWait,
}) => (
  <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
    <div className="bg-surface border border-heartRed/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-pop-in">
      <div className="text-4xl text-center mb-3">💔</div>
      <h3 className="text-xl font-bold text-center text-onBg mb-1">No Lives Left!</h3>
      {msUntilNext > 0 && (
        <p className="text-center text-heartRed font-mono text-lg font-bold mb-4">
          Next life in {formatCountdown(msUntilNext)}
        </p>
      )}

      <button
        onClick={onTradeCoins}
        disabled={coins < 1000}
        className="w-full py-3 rounded-xl bg-coinGold text-bg font-bold mb-3 disabled:opacity-40 hover:opacity-90 transition-opacity"
      >
        🪙 Trade 1,000 Coins for 1 Life
        <span className="block text-xs font-normal opacity-70">{coins} coins available</span>
      </button>

      <button
        onClick={onTradeDiamonds}
        disabled={diamonds < 3}
        className="w-full py-3 rounded-xl bg-diamondCyan text-bg font-bold mb-3 disabled:opacity-40 hover:opacity-90 transition-opacity"
      >
        💎 Trade 3 Diamonds for 1 Life
        <span className="block text-xs font-normal opacity-70">{diamonds} diamonds available</span>
      </button>

      <button
        onClick={onGoToStore}
        className="w-full py-3 rounded-xl border border-borderFilled text-onSurface/70 font-semibold mb-3 hover:text-onBg hover:border-onSurface/50 transition-colors"
      >
        🛒 Go to Store
      </button>

      <button
        onClick={onWait}
        className="w-full py-2 text-onSurface/50 text-sm hover:text-onSurface/80 transition-colors"
      >
        Wait for regen
      </button>
    </div>
  </div>
);

export default NoLivesDialog;
