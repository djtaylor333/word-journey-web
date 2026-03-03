/**
 * soundManager.ts
 *
 * Procedural audio synthesiser using the Web Audio API.
 * No audio files needed — all sounds are synthesised on-the-fly.
 *
 * Usage:
 *   import { SoundManager } from './soundManager';
 *   SoundManager.configure({ sfxEnabled: true, sfxVolume: 80 });
 *   SoundManager.play('keyPress');
 */

type SoundName =
  | 'keyPress'
  | 'tileFlip'
  | 'tileCorrect'
  | 'tilePresent'
  | 'tileAbsent'
  | 'rowSubmit'
  | 'win'
  | 'lose'
  | 'powerUp'
  | 'dailyComplete';

interface Config {
  sfxEnabled: boolean;
  sfxVolume: number;    // 0–100
  musicEnabled: boolean;
  musicVolume: number;  // 0–100
}

class _SoundManager {
  private ctx: AudioContext | null = null;
  private config: Config = { sfxEnabled: true, sfxVolume: 100, musicEnabled: false, musicVolume: 70 };

  // ── Music ─────────────────────────────────────────────────
  // C pentatonic minor arpeggio: C4, Eb4, F4, G4, Bb4, C5, Bb4, G4
  private readonly MUSIC_NOTES = [261.63, 311.13, 349.23, 392.00, 466.16, 523.25, 466.16, 392.00];
  private readonly BEAT_MS = 550;
  private musicBeat = 0;
  private musicTimer: ReturnType<typeof setTimeout> | null = null;
  private musicGain: GainNode | null = null;
  private musicPlaying = false;

  private startMusic(): void {
    if (this.musicPlaying) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    this.musicPlaying = true;
    this.musicBeat = 0;
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = (this.config.musicVolume / 100) * 0.12;
    this.musicGain.connect(ctx.destination);
    this.tickMusic();
  }

  private tickMusic(): void {
    if (!this.musicPlaying) return;
    const ctx = this.getCtx();
    if (!ctx || !this.musicGain) return;
    const freq = this.MUSIC_NOTES[this.musicBeat % this.MUSIC_NOTES.length];
    this.musicBeat++;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(env);
    env.connect(this.musicGain);
    const now = ctx.currentTime;
    const beat = this.BEAT_MS / 1000;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(1, now + beat * 0.1);
    env.gain.setValueAtTime(1, now + beat * 0.6);
    env.gain.linearRampToValueAtTime(0, now + beat * 0.95);
    osc.start(now);
    osc.stop(now + beat);
    this.musicTimer = setTimeout(() => this.tickMusic(), this.BEAT_MS);
  }

  private stopMusic(): void {
    this.musicPlaying = false;
    if (this.musicTimer !== null) { clearTimeout(this.musicTimer); this.musicTimer = null; }
    if (this.musicGain) { try { this.musicGain.disconnect(); } catch { /* ignore */ } this.musicGain = null; }
    this.musicBeat = 0;
  }

  configure(cfg: Partial<Config>): void {
    const prevMusic = this.config.musicEnabled;
    this.config = { ...this.config, ...cfg };
    if (this.config.musicEnabled && !prevMusic) {
      this.startMusic();
    } else if (!this.config.musicEnabled && prevMusic) {
      this.stopMusic();
    } else if (this.musicGain && 'musicVolume' in cfg) {
      this.musicGain.gain.value = (this.config.musicVolume / 100) * 0.12;
    }
  }

  /** Call once on first user interaction to unlock AudioContext */
  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => null);
    }
    return this.ctx;
  }

  private get gain(): number {
    return (this.config.sfxVolume / 100) * 0.35; // master attenuation
  }

  play(sound: SoundName): void {
    if (!this.config.sfxEnabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;

    try {
      switch (sound) {
        case 'keyPress':      return this.playKeyPress(ctx);
        case 'tileFlip':      return this.playTileFlip(ctx);
        case 'tileCorrect':   return this.playTileCorrect(ctx);
        case 'tilePresent':   return this.playTilePresent(ctx);
        case 'tileAbsent':    return this.playTileAbsent(ctx);
        case 'rowSubmit':     return this.playRowSubmit(ctx);
        case 'win':           return this.playWin(ctx);
        case 'lose':          return this.playLose(ctx);
        case 'powerUp':       return this.playPowerUp(ctx);
        case 'dailyComplete': return this.playDailyComplete(ctx);
      }
    } catch {
      // fail silently — audio is non-critical
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private osc(
    ctx: AudioContext,
    type: OscillatorType,
    freq: number,
    startAt: number,
    duration: number,
    gainPeak: number,
    freqEnd?: number,
  ): void {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, startAt);
    g.gain.linearRampToValueAtTime(gainPeak * this.gain, startAt + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    g.connect(ctx.destination);

    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, startAt);
    if (freqEnd !== undefined) {
      o.frequency.exponentialRampToValueAtTime(freqEnd, startAt + duration);
    }
    o.connect(g);
    o.start(startAt);
    o.stop(startAt + duration + 0.01);
  }

  private noise(ctx: AudioContext, startAt: number, duration: number, gainPeak: number): void {
    const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 0.5;

    const g = ctx.createGain();
    g.gain.setValueAtTime(gainPeak * this.gain, startAt);
    g.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    src.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    src.start(startAt);
    src.stop(startAt + duration);
  }

  // ── Individual sounds ──────────────────────────────────────────────────────

  private playKeyPress(ctx: AudioContext): void {
    const t = ctx.currentTime;
    this.noise(ctx, t, 0.04, 0.18);
    this.osc(ctx, 'sine', 320, t, 0.05, 0.12);
  }

  private playTileFlip(ctx: AudioContext): void {
    const t = ctx.currentTime;
    this.osc(ctx, 'sine', 440, t, 0.08, 0.15, 380);
  }

  private playTileCorrect(ctx: AudioContext): void {
    const t = ctx.currentTime;
    this.osc(ctx, 'triangle', 523, t,        0.12, 0.4); // C5
    this.osc(ctx, 'triangle', 659, t + 0.06, 0.10, 0.3); // E5
  }

  private playTilePresent(ctx: AudioContext): void {
    const t = ctx.currentTime;
    this.osc(ctx, 'sine', 440, t, 0.13, 0.3); // A4
    this.osc(ctx, 'sine', 550, t + 0.07, 0.08, 0.2);
  }

  private playTileAbsent(ctx: AudioContext): void {
    const t = ctx.currentTime;
    this.osc(ctx, 'sawtooth', 180, t, 0.12, 0.18, 140);
    this.noise(ctx, t, 0.11, 0.08);
  }

  private playRowSubmit(ctx: AudioContext): void {
    const t = ctx.currentTime;
    this.osc(ctx, 'sine', 480, t,        0.09, 0.12);
    this.osc(ctx, 'sine', 540, t + 0.06, 0.09, 0.10);
    this.osc(ctx, 'sine', 600, t + 0.11, 0.09, 0.10);
  }

  private playWin(ctx: AudioContext): void {
    // Ascending fanfare: C – E – G – C'
    const notes = [523, 659, 784, 1046];
    notes.forEach((freq, i) => {
      this.osc(ctx, 'triangle', freq, ctx.currentTime + i * 0.13, 0.3, 0.5);
    });
    // Shimmer on top
    this.osc(ctx, 'sine', 2093, ctx.currentTime + 0.4, 0.4, 0.2);
  }

  private playLose(ctx: AudioContext): void {
    const t = ctx.currentTime;
    // Descending minor: A – F – D – A (lower)
    const notes = [440, 349, 294, 220];
    notes.forEach((freq, i) => {
      this.osc(ctx, 'sawtooth', freq, t + i * 0.18, 0.3, 0.35);
    });
  }

  private playPowerUp(ctx: AudioContext): void {
    const t = ctx.currentTime;
    // Sparkle arpeggio
    [523, 784, 1046, 1568].forEach((freq, i) => {
      this.osc(ctx, 'sine', freq, t + i * 0.07, 0.18, 0.35);
    });
  }

  private playDailyComplete(ctx: AudioContext): void {
    // More elaborate success fanfare
    const t = ctx.currentTime;
    [523, 659, 784, 1046, 1318].forEach((freq, i) => {
      this.osc(ctx, 'triangle', freq, t + i * 0.11, 0.35, 0.45);
    });
    this.osc(ctx, 'sine', 2093, t + 0.55, 0.5, 0.2);
  }
}

export const SoundManager = new _SoundManager();
