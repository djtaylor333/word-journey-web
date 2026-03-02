"use client";
import React from 'react';
import type { PlayerProgress } from '../logic/types';
import LockOverlay from '../components/LockOverlay';

interface SettingsScreenProps {
  progress: PlayerProgress;
  onProgress: (p: PlayerProgress) => void;
  onBack: () => void;
}

const ToggleRow = ({
  label, description, value, onChange,
}: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center gap-3 py-3 border-b border-borderFilled/20 last:border-0">
    <div className="flex-1">
      <div className="text-onBg text-sm font-medium">{label}</div>
      {description && <div className="text-onSurface/50 text-xs">{description}</div>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-tileCorrect' : 'bg-surface'}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-onBg rounded-full shadow transition-all ${value ? 'left-7' : 'left-1'}`}
      />
    </button>
  </div>
);

const SliderRow = ({
  label, value, onChange, min = 0, max = 100, step = 1,
}: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) => (
  <div className="py-3 border-b border-borderFilled/20 last:border-0">
    <div className="flex justify-between items-center mb-2">
      <span className="text-onBg text-sm font-medium">{label}</span>
      <span className="text-onSurface/60 text-xs font-semibold">{value}%</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-2 accent-primary rounded cursor-pointer"
    />
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-surface rounded-2xl p-4 mb-4">
    <h3 className="text-onSurface/50 text-xs uppercase tracking-widest font-semibold mb-3">{title}</h3>
    {children}
  </div>
);

const TEXT_SCALES = [
  { label: 'Small (85%)', value: 0.85 },
  { label: 'Normal (100%)', value: 1.0 },
  { label: 'Large (115%)', value: 1.15 },
];

const SettingsScreen: React.FC<SettingsScreenProps> = ({ progress, onProgress, onBack }) => {
  const [lockVisible, setLockVisible] = React.useState(false);

  const update = (partial: Partial<PlayerProgress>) => onProgress({ ...progress, ...partial });

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button onClick={onBack} className="text-onSurface/60 hover:text-onBg text-xl p-1">←</button>
        <h1 className="flex-1 text-center font-bold text-onBg text-lg">⚙️ Settings</h1>
        <div className="w-8" />
      </div>

      <div className="flex-1 px-4 pb-8 overflow-y-auto">
        {/* Accessibility */}
        <Section title="Accessibility">
          <ToggleRow
            label="⚡ High Contrast"
            description="Improves accessibility for color-blind users (orange/blue instead of green/yellow)"
            value={progress.highContrast}
            onChange={v => update({ highContrast: v })}
          />
          {/* Text scale */}
          <div className="py-3 border-b border-borderFilled/20 last:border-0">
            <div className="text-onBg text-sm font-medium mb-2">🔤 Text Scale</div>
            <div className="flex gap-2">
              {TEXT_SCALES.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => update({ textScale: value })}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    progress.textScale === value
                      ? 'bg-primary text-bg border-primary'
                      : 'bg-surface text-onSurface/60 border-borderFilled/30 hover:border-primary/30'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Sound */}
        <Section title="Preferences">
          <ToggleRow
            label="🔊 Sound Effects"
            description="Play sounds on key presses and wins"
            value={progress.sfxEnabled}
            onChange={v => update({ sfxEnabled: v })}
          />
          {progress.sfxEnabled && (
            <SliderRow
              label="   SFX Volume"
              value={progress.sfxVolume}
              onChange={v => update({ sfxVolume: v })}
            />
          )}
          <ToggleRow
            label="🎵 Music"
            description="Background music (earphone recommended)"
            value={progress.musicEnabled}
            onChange={v => update({ musicEnabled: v })}
          />
          {progress.musicEnabled && (
            <SliderRow
              label="   Music Volume"
              value={progress.musicVolume}
              onChange={v => update({ musicVolume: v })}
            />
          )}
          <ToggleRow
            label="🌙 Dark Mode"
            description="Dark background (currently always on for web)"
            value={progress.darkMode}
            onChange={v => update({ darkMode: v })}
          />
        </Section>

        {/* Themes — VIP Android only */}
        <Section title="🎨 Themes">
          <p className="text-onSurface/60 text-xs mb-3">Unlock exclusive themes with VIP on Android</p>
          {[
            { id: 'forest',  name: '🌿 Forest',   preview: '#2D5A27' },
            { id: 'ocean',   name: '🌊 Ocean',     preview: '#1565C0' },
            { id: 'sunset',  name: '🌅 Sunset',    preview: '#E64A19' },
            { id: 'galaxy',  name: '🌌 Galaxy',    preview: '#4A148C' },
            { id: 'default', name: '🏠 Default',   preview: '#1C1610' },
          ].map(theme => (
            <button
              key={theme.id}
              onClick={() => theme.id !== 'default' && setLockVisible(true)}
              className={`flex items-center gap-3 py-2.5 w-full border-b border-borderFilled/20 last:border-0 ${theme.id !== 'default' ? 'opacity-70' : ''}`}
            >
              <span className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.preview }} />
              <span className="text-onBg text-sm flex-1 text-left">{theme.name}</span>
              {theme.id !== 'default' && <span className="text-accentVip text-xs">👑 VIP</span>}
              {theme.id === 'default' && <span className="text-tileCorrect text-xs">✓ Active</span>}
            </button>
          ))}
        </Section>

        {/* About */}
        <Section title="About">
          <div className="text-onSurface/60 text-xs space-y-1">
            <div className="flex justify-between"><span>Version</span><span className="text-onBg">Web Preview</span></div>
            <div className="flex justify-between"><span>Android app</span>
              <a
                href="https://play.google.com/store"
                target="_blank" rel="noopener noreferrer"
                className="text-hintBorder underline"
              >
                Google Play ↗
              </a>
            </div>
            <p className="pt-2 text-onSurface/40">Get the full experience with VIP, cloud sync, and exclusive content on the Android app.</p>
          </div>
        </Section>
      </div>

      {lockVisible && (
        <LockOverlay
          title="VIP Themes"
          message="Unlock exclusive themes with a VIP subscription on Android."
          onClose={() => setLockVisible(false)}
        />
      )}
    </div>
  );
};

export default SettingsScreen;

