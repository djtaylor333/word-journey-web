"use client";
import React from 'react';

interface ItemsBarProps {
  addGuessItems: number;
  removeLetterItems: number;
  definitionItems: number;
  showLetterItems: number;
  onAddGuess: () => void;
  onRemoveLetter: () => void;
  onDefinition: () => void;
  onShowLetter: () => void;
  definitionUsed: boolean;
  hasDefinition: boolean;
  disabled?: boolean;
}

interface ItemBtnProps {
  emoji: string;
  label: string;
  count: number;
  onClick: () => void;
  disabled: boolean;
}

const ItemBtn: React.FC<ItemBtnProps> = ({ emoji, label, count, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[60px]
      transition-all active:scale-95
      ${disabled
        ? 'bg-surface/40 text-onSurface/30 cursor-not-allowed'
        : 'bg-surface hover:bg-surfaceVariant text-onBg border border-borderFilled/50'
      }
    `}
  >
    <span className="text-xl">{emoji}</span>
    <span className="text-[10px] leading-tight text-center text-onSurface">{label}</span>
    <span className={`text-xs font-bold ${count > 0 ? 'text-coinGold' : 'text-onSurface/40'}`}>
      {count > 0 ? `×${count}` : '0'}
    </span>
  </button>
);

const ItemsBar: React.FC<ItemsBarProps> = ({
  addGuessItems, removeLetterItems, definitionItems, showLetterItems,
  onAddGuess, onRemoveLetter, onDefinition, onShowLetter,
  definitionUsed, hasDefinition, disabled = false,
}) => (
  <div className="flex gap-2 justify-center flex-wrap">
    <ItemBtn emoji="➕" label="Add Guess"    count={addGuessItems}     onClick={onAddGuess}     disabled={disabled || addGuessItems <= 0} />
    <ItemBtn emoji="🚫" label="Remove Letter" count={removeLetterItems} onClick={onRemoveLetter} disabled={disabled || removeLetterItems <= 0} />
    {hasDefinition && (
      <ItemBtn emoji="📖" label="Definition"   count={definitionItems}  onClick={onDefinition}  disabled={disabled || definitionItems <= 0 || definitionUsed} />
    )}
    <ItemBtn emoji="💡" label="Show Letter"  count={showLetterItems}  onClick={onShowLetter}  disabled={disabled || showLetterItems <= 0} />
  </div>
);

export default ItemsBar;
