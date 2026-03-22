"use client";
import React from 'react';
import type { Difficulty } from '../logic/types';
import { BONUS_ATTEMPTS_PER_LIFE } from '../logic/types';

interface NeedMoreGuessesDialogProps {
  difficulty: Difficulty;
  lives: number;
  coins: number;
  addGuessItems: number;
  onUseLife: () => void;        // spend a life for bonusAttemptsPerLife extra guesses
  onUseCoinsForContinue: () => void;  // spend 1000 coins for bonusAttemptsPerLife guesses
  onUseItem: () => void;   // use 1 Add Guess item (free from inventory)
  onBuyGuess: () => void;  // buy 1 guess for 200 coins
  onGoToStore: () => void;
  onDismiss: () => void;
}

const NeedMoreGuessesDialog: React.FC<NeedMoreGuessesDialogProps> = ({
  difficulty, lives, coins, addGuessItems,
  onUseLife, onUseCoinsForContinue, onUseItem, onBuyGuess, onGoToStore, onDismiss,
}) => {
  const bonus = BONUS_ATTEMPTS_PER_LIFE[difficulty];
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-surface border border-borderFilled rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-pop-in">
        <div className="text-4xl text-center mb-3">😰</div>
        <h3 className="text-xl font-bold text-center text-onBg mb-2">Out of Guesses!</h3>
        <p className="text-center text-onSurface/70 text-sm mb-5">Keep trying — you can still guess the word!</p>

        {/* Use a Life — always visible */}
        <button
          onClick={onUseLife}
          disabled={lives <= 0}
          className="w-full py-3 rounded-xl bg-heartRed text-white font-bold mb-3 disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          ❤️ Use a Life (+{bonus} guesses)
          <span className="block text-xs font-normal opacity-80">{lives} {lives === 1 ? 'life' : 'lives'} remaining</span>
        </button>

        {/* Use 1000 Coins — always visible as an alternative */}
        <button
          onClick={onUseCoinsForContinue}
          disabled={coins < 1000}
          className="w-full py-3 rounded-xl bg-tilePresent text-white font-bold mb-3 disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          🪙 Use 1,000 Coins (+{bonus} guesses)
          <span className="block text-xs font-normal opacity-80">{coins.toLocaleString()} coins available</span>
        </button>

        {addGuessItems > 0 && (
          <button
            onClick={onUseItem}
            className="w-full py-3 rounded-xl bg-tileCorrect text-white font-bold mb-3 hover:opacity-90 transition-opacity"
          >
            ➕ Use Add Guess Item ({addGuessItems} in inventory)
          </button>
        )}

        <button
          onClick={onBuyGuess}
          disabled={coins < 200}
          className="w-full py-3 rounded-xl bg-primary text-bg font-bold mb-3 disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          ➕ Add 1 Guess (200 coins) — {coins >= 200 ? `${coins.toLocaleString()} available` : 'Not enough coins'}
        </button>

        <button
          onClick={onGoToStore}
          className="w-full py-3 rounded-xl border border-borderFilled text-onSurface/70 font-semibold mb-3 hover:text-onBg hover:border-onSurface/50 transition-colors"
        >
          🛒 Go to Store
        </button>

        <button
          onClick={onDismiss}
          className="w-full py-2 text-onSurface/50 text-sm hover:text-onSurface/80 transition-colors"
        >
          Give up on this word
        </button>
      </div>
    </div>
  );
};

export default NeedMoreGuessesDialog;
