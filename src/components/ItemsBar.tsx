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
  compact?: boolean;
}

interface ItemBtnProps {
  emoji: string;
  label: string;
  count: number;
  onClick: () => void;
  disabled: boolean;
  compact?: boolean;
}

const ItemBtn: React.FC<ItemBtnProps> = ({ emoji, label, count, onClick, disabled, compact = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex flex-col items-center gap-0 rounded-lg
      ${compact ? 'px-1.5 py-1 min-w-[48px]' : 'px-2 py-1.5 min-w-[60px]'}
      transition-all active:scale-95
      ${disabled
        ? 'bg-surface/40 text-onSurface/30 cursor-not-allowed'
        : 'bg-surface hover:bg-surfaceVariant text-onBg border border-borderFilled/50'
      }
    `}
  >
    <span className={compact ? 'text-base' : 'text-xl'}>{emoji}</span>
    <span className={`leading-tight text-center text-onSurface ${compact ? 'text-[8px]' : 'text-[10px]'}`}>{label}</span>
    <span className={`font-bold ${compact ? 'text-[9px]' : 'text-xs'} ${count > 0 ? 'text-coinGold' : 'text-onSurface/40'}`}>
      {count > 0 ? `×${count}` : '0'}
    </span>
  </button>
);

const ItemsBar: React.FC<ItemsBarProps> = ({
  addGuessItems, removeLetterItems, definitionItems, showLetterItems,
  onAddGuess, onRemoveLetter, onDefinition, onShowLetter,
  definitionUsed, hasDefinition, disabled = false, compact = false,
}) => (
  <div className={`flex justify-center flex-wrap ${compact ? 'gap-1' : 'gap-2'}`}>
    <ItemBtn emoji="➕" label="Add Guess"    count={addGuessItems}     onClick={onAddGuess}     disabled={disabled || addGuessItems <= 0}     compact={compact} />
    <ItemBtn emoji="🚫" label="Remove Letter" count={removeLetterItems} onClick={onRemoveLetter} disabled={disabled || removeLetterItems <= 0} compact={compact} />
    {hasDefinition && (
      <ItemBtn emoji="📖" label="Definition"   count={definitionItems}  onClick={onDefinition}  disabled={disabled || definitionItems <= 0 || definitionUsed} compact={compact} />
    )}
    <ItemBtn emoji="💡" label="Show Letter"  count={showLetterItems}  onClick={onShowLetter}  disabled={disabled || showLetterItems <= 0} compact={compact} />
  </div>
);

export default ItemsBar;
