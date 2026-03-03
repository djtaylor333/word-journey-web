"use client";
import React from 'react';
import type { PlayerProgress, InboxReward } from '../logic/types';

interface InboxScreenProps {
  progress: PlayerProgress;
  onProgress: (p: PlayerProgress) => void;
  onBack: () => void;
}

function claimReward(progress: PlayerProgress, reward: InboxReward): PlayerProgress {
  return {
    ...progress,
    coins: progress.coins + (reward.coins ?? 0),
    diamonds: progress.diamonds + (reward.diamonds ?? 0),
    lives: progress.lives + (reward.lives ?? 0),
    pendingRewards: progress.pendingRewards.map(r =>
      r.id === reward.id ? { ...r, claimed: true } : r
    ),
  };
}

const InboxScreen: React.FC<InboxScreenProps> = ({ progress, onProgress, onBack }) => {
  const unclaimed = progress.pendingRewards.filter(r => !r.claimed);
  const claimed   = progress.pendingRewards.filter(r => r.claimed);

  const handleClaim = (reward: InboxReward) => {
    onProgress(claimReward(progress, reward));
  };

  const handleClaimAll = () => {
    let updated = { ...progress };
    for (const r of unclaimed) {
      updated = claimReward(updated, r);
    }
    onProgress(updated);
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-bg flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-safe pt-4 pb-3 border-b border-borderFilled/20">
        <button onClick={onBack} className="text-onSurface/60 hover:text-onBg text-2xl p-3 rounded-xl hover:bg-surface/80 active:scale-90 transition-all">←</button>
        <h1 className="flex-1 text-center font-bold text-onBg text-xl">📬 Inbox</h1>
        {unclaimed.length > 0 && (
          <button
            onClick={handleClaimAll}
            className="text-xs font-bold text-primary hover:opacity-80"
          >
            Claim All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-safe pb-8">
        {progress.pendingRewards.length === 0 && (
          <div className="flex flex-col items-center gap-3 pt-16 text-center">
            <div className="text-5xl">📭</div>
            <p className="text-onSurface/50">Your inbox is empty.<br />Complete challenges to earn rewards!</p>
          </div>
        )}

        {/* Unclaimed */}
        {unclaimed.map(reward => (
          <div
            key={reward.id}
            className="bg-surface border border-primary/30 rounded-2xl p-4 flex gap-3 items-start animate-pop-in"
          >
            <div className="text-2xl mt-0.5">🎁</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-onBg text-sm">{reward.title}</div>
              <div className="text-onSurface/60 text-xs mt-0.5 leading-snug">{reward.message}</div>
              {/* Preview rewards */}
              <div className="flex gap-3 mt-2 text-xs font-semibold">
                {reward.coins   ? <span className="text-coinGold">🪙 +{reward.coins.toLocaleString()}</span> : null}
                {reward.diamonds ? <span className="text-diamondCyan">💎 +{reward.diamonds}</span> : null}
                {reward.lives   ? <span className="text-heartRed">❤️ +{reward.lives}</span> : null}
              </div>
            </div>
            <button
              onClick={() => handleClaim(reward)}
              className="mt-1 px-3 py-1.5 rounded-xl bg-primary text-bg text-xs font-bold hover:opacity-90 transition-all active:scale-95"
            >
              Claim
            </button>
          </div>
        ))}

        {/* Claimed history */}
        {claimed.length > 0 && (
          <>
            <div className="text-onSurface/40 text-xs font-bold uppercase tracking-widest pt-2">
              Claimed
            </div>
            {claimed.map(reward => (
              <div
                key={reward.id}
                className="bg-surface/40 border border-borderFilled/30 rounded-2xl p-4 flex gap-3 items-start opacity-50"
              >
                <div className="text-2xl mt-0.5">✅</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-onSurface text-sm">{reward.title}</div>
                  <div className="text-onSurface/50 text-xs mt-0.5">{formatDate(reward.timestamp)}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default InboxScreen;
