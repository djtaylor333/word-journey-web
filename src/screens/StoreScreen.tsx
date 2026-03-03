"use client";
import React, { useState } from 'react';
import type { PlayerProgress } from '../logic/types';
import { STORE_ITEMS, LIVES_OPTIONS, COIN_PACKS, DIAMOND_PACKS, BUNDLES, VIP_PLANS } from '../logic/storeLogic';
import LockOverlay from '../components/LockOverlay';

interface StoreScreenProps {
  progress: PlayerProgress;
  onProgress: (p: PlayerProgress) => void;
  onBack: () => void;
}

type Tab = 'items' | 'lives' | 'bundles' | 'coins' | 'diamonds' | 'vip';
const TABS: { key: Tab; label: string }[] = [
  { key: 'items',    label: '⚡ Items' },
  { key: 'lives',    label: '❤️ Lives' },
  { key: 'bundles',  label: '🎁 Bundles' },
  { key: 'coins',    label: '🪙 Coins' },
  { key: 'diamonds', label: '💎 Diamonds' },
  { key: 'vip',      label: '👑 VIP' },
];

const StoreScreen: React.FC<StoreScreenProps> = ({ progress, onProgress, onBack }) => {
  const [tab, setTab] = useState<Tab>('items');
  const [lockMsg, setLockMsg] = useState<{ title: string; message: string } | null>(null);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }

  function buyItemWithCoins(itemId: string, cost: number, qty: number = 1) {
    if (progress.coins < cost) { showToast('Not enough coins!'); return; }
    const fieldMap: Record<string, keyof PlayerProgress> = {
      addGuess: 'addGuessItems', removeLetter: 'removeLetterItems',
      definition: 'definitionItems', showLetter: 'showLetterItems',
    };
    const field = fieldMap[itemId];
    if (!field) return;
    onProgress({ ...progress, coins: progress.coins - cost, [field]: ((progress[field] as number) ?? 0) + qty });
    showToast('Purchased! \u2713');
  }

  function buyLivesWithCoins() {
    const cost = LIVES_OPTIONS.coinsForLife.costCoins;
    if (progress.coins < cost) { showToast('Not enough coins!'); return; }
    onProgress({ ...progress, coins: progress.coins - cost, lives: Math.min(progress.lives + 1, 30) });
    showToast('+1 life! ✓');
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={onBack} className="text-onSurface/60 hover:text-onBg text-2xl p-3 rounded-xl hover:bg-surface/80 active:scale-90 transition-all">←</button>
        <h1 className="flex-1 text-center font-bold text-onBg text-xl">🏪 Store</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-coinGold font-bold">🪙 {progress.coins.toLocaleString()}</span>
          <span className="text-diamondBlue font-bold">💎 {progress.diamonds}</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex overflow-x-auto gap-1 px-3 pb-2 scrollbar-none">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
              ${tab === t.key ? 'bg-accentRegular text-bg' : 'bg-surface text-onSurface/70'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-8 space-y-3 overflow-y-auto">

        {/* ITEMS tab */}
        {tab === 'items' && (Object.entries(STORE_ITEMS) as [string, { label: string; cost: number }][]).map(([id, item]) => (
          <div key={id} className="bg-surface rounded-2xl p-4 flex items-center gap-3">
            <span className="text-3xl">{item.label.split(' ')[0]}</span>
            <div className="flex-1">
              <div className="font-bold text-onBg text-sm">{item.label.replace(/^\S+\s/, '')}</div>
              <div className="text-onSurface/50 text-xs mt-0.5">
                  In stock: <span className="text-coinGold">{(progress[({ addGuess:'addGuessItems', removeLetter:'removeLetterItems', definition:'definitionItems', showLetter:'showLetterItems' } as Record<string, keyof PlayerProgress>)[id]] as number) ?? 0}</span>
              </div>
            </div>
            <button
              onClick={() => buyItemWithCoins(id, item.cost)}
              className="bg-coinGold/20 border border-coinGold/40 text-coinGold text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform"
            >
              🪙 {item.cost}
            </button>
          </div>
        ))}

        {/* LIVES tab */}
        {tab === 'lives' && (
          <>
            <div className="bg-surface rounded-2xl p-4 flex items-center gap-3">
              <span className="text-3xl">❤️</span>
              <div className="flex-1">
                <div className="font-bold text-onBg text-sm">+1 Life</div>
                <div className="text-onSurface/60 text-xs">Refill your lives with coins</div>
              </div>
              <button
                onClick={buyLivesWithCoins}
                className="bg-coinGold/20 border border-coinGold/40 text-coinGold text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform"
              >
                🪙 {LIVES_OPTIONS.coinsForLife.costCoins}
              </button>
            </div>
            <div className="bg-surface rounded-2xl p-4 flex items-center gap-3">
              <span className="text-3xl">❤️</span>
              <div className="flex-1">
                <div className="font-bold text-onBg text-sm">+1 Life</div>
                <div className="text-onSurface/60 text-xs">Buy with diamonds</div>
              </div>
              <button
                onClick={() => setLockMsg({ title: 'Android Only', message: 'Diamond purchases are available in the Android app.' })}
                className="bg-diamondBlue/20 border border-diamondBlue/40 text-diamondBlue text-xs font-bold px-3 py-2 rounded-xl"
              >
                💎 {LIVES_OPTIONS.diamondsForLife.costDiamonds}
              </button>
            </div>
          </>
        )}

        {/* BUNDLES tab — Android only */}
        {tab === 'bundles' && BUNDLES.map(b => (
          <div key={b.id} className="bg-surface rounded-2xl p-4 flex items-center gap-3">
            <span className="text-3xl">🎁</span>
            <div className="flex-1">
              <div className="font-bold text-onBg text-sm">{b.label}</div>
              <div className="text-onSurface/60 text-xs">{b.description}</div>
            </div>
            <button
              onClick={() => setLockMsg({ title: 'Android Only', message: 'Bundle purchases require the Android app.' })}
              className="bg-accentVip/20 border border-accentVip/40 text-accentVip text-xs font-bold px-3 py-2 rounded-xl"
            >
              🎟 Buy
            </button>
          </div>
        ))}

        {/* COINS tab — Android only */}
        {tab === 'coins' && COIN_PACKS.map(pack => (
          <div key={pack.id} className="bg-surface rounded-2xl p-4 flex items-center gap-3">
            <span className="text-3xl">🪙</span>
            <div className="flex-1">
              <div className="font-bold text-onBg text-sm">{pack.label}</div>
              <div className="text-onSurface/60 text-xs">{pack.description}</div>
            </div>
            <button
              onClick={() => setLockMsg({ title: 'Android Only', message: 'Coin pack purchases are available in the Android app.' })}
              className="bg-coinGold/20 border border-coinGold/40 text-coinGold text-xs font-bold px-3 py-2 rounded-xl"
            >
              Buy
            </button>
          </div>
        ))}

        {/* DIAMONDS tab — Android only */}
        {tab === 'diamonds' && DIAMOND_PACKS.map(pack => (
          <div key={pack.id} className="bg-surface rounded-2xl p-4 flex items-center gap-3">
            <span className="text-3xl">💎</span>
            <div className="flex-1">
              <div className="font-bold text-onBg text-sm">{pack.label}</div>
              <div className="text-onSurface/60 text-xs">{pack.description}</div>
            </div>
            <button
              onClick={() => setLockMsg({ title: 'Android Only', message: 'Diamond pack purchases are available in the Android app.' })}
              className="bg-diamondBlue/20 border border-diamondBlue/40 text-diamondBlue text-xs font-bold px-3 py-2 rounded-xl"
            >
              Buy
            </button>
          </div>
        ))}

        {/* VIP tab — Android only */}
        {tab === 'vip' && (
          <>
            <div className="rounded-2xl p-4 text-center vip-shimmer bg-surface mb-2">
              <div className="text-3xl mb-1">👑</div>
              <div className="font-bold text-accentVip text-lg">Word Journey VIP</div>
              <div className="text-onSurface/70 text-xs mt-1">Unlimited lives · Exclusive themes · No ads · VIP word packs · 2× coins</div>
            </div>
            {VIP_PLANS.map(plan => (
              <button
                key={plan.id}
                onClick={() => setLockMsg({ title: 'Android Only', message: 'VIP subscriptions are managed through the Android app.' })}
                className="w-full bg-surface border border-accentVip/40 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
              >
                <div className="flex-1 text-left">
                  <div className="font-bold text-accentVip text-sm">{plan.label}</div>
                  {plan.savings && <div className="text-tileCorrect text-xs">{plan.savings}</div>}
                </div>
                <div className="text-accentVip font-bold text-sm">{plan.price}</div>
              </button>
            ))}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-surface border border-tileCorrect/40 text-onBg text-sm px-6 py-2 rounded-full animate-pop-in shadow-lg">
          {toast}
        </div>
      )}

      {/* Lock overlay */}
      {lockMsg && (
        <LockOverlay title={lockMsg.title} message={lockMsg.message} onClose={() => setLockMsg(null)} />
      )}
    </div>
  );
};

export default StoreScreen;
