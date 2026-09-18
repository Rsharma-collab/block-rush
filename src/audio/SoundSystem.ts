/**
 * SoundSystem.ts
 * Web Audio API procedural synthesizer for BLOCK RUSH.
 * Zero external audio assets needed; provides instant, robust audio.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private musicStep: number = 0;
  private tempo: number = 130;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSfxVolume(vol: number) {
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public setMusicVolume(vol: number) {
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public playJump() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(460, t + 0.15);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch {
      // Audio context might fail silently if disabled
    }
  }

  public playSlide() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;
      // White noise burst for slide friction
      const bufferSize = this.ctx.sampleRate * 0.18;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(300, t + 0.18);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(t);
    } catch {}
  }

  public playLaneSwitch() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(420, t + 0.08);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch {}
  }

  public playCollectGCore(combo: number = 1) {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;

      // Base pitches that ascend with combo
      const baseFreq = 523.25; // C5
      const mult = Math.min(2.5, 1 + (combo - 1) * 0.05);

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(baseFreq * mult, t);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * mult * 1.5, t + 0.12);

      osc2.frequency.setValueAtTime(baseFreq * mult * 2, t + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * mult * 2.5, t + 0.16);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);

      osc1.start(t);
      osc1.stop(t + 0.12);
      osc2.start(t + 0.04);
      osc2.stop(t + 0.18);
    } catch {}
  }

  public playCollectBlock() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(480, t + 0.09);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.09);
    } catch {}
  }

  public playPowerUp() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A major arpeggio

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = t + idx * 0.07;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.22, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(noteTime);
        osc.stop(noteTime + 0.2);
      });
    } catch {}
  }

  public playBuildBridge() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;

      // 3 rapid mechanical block placements
      [0, 0.07, 0.14].forEach((offset, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = t + offset;

        osc.type = 'square';
        osc.frequency.setValueAtTime(200 + idx * 80, time);
        osc.frequency.exponentialRampToValueAtTime(100, time + 0.06);

        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.07);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(time);
        osc.stop(time + 0.07);
      });
    } catch {}
  }

  public playShieldBreak() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;

      // Crystalline shatter
      const notes = [1200, 950, 700, 450];
      notes.forEach((freq, i) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = t + i * 0.04;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.2, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(noteTime);
        osc.stop(noteTime + 0.15);
      });
    } catch {}
  }

  public playHit() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.28);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.28);
    } catch {}
  }

  public playEventAlert() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.linearRampToValueAtTime(580, t + 0.2);
      osc.frequency.linearRampToValueAtTime(300, t + 0.4);
      osc.frequency.linearRampToValueAtTime(650, t + 0.6);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.7);
    } catch {}
  }

  public startMusic() {
    if (this.isMusicPlaying) return;
    this.initCtx();
    this.isMusicPlaying = true;
    this.musicStep = 0;

    // Upbeat block-runner chiptune bass & lead loop
    const stepDuration = 60 / this.tempo / 4; // 16th notes
    const bassline = [110, 110, 130.81, 110, 146.83, 110, 164.81, 130.81];
    const melody = [440, 0, 523.25, 659.25, 0, 587.33, 523.25, 0, 659.25, 0, 783.99, 880, 0, 783.99, 659.25, 587.33];

    this.musicInterval = window.setInterval(() => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;
      const t = this.ctx.currentTime;

      // Bass note every 8th
      if (this.musicStep % 2 === 0) {
        const bassIdx = (this.musicStep / 2) % bassline.length;
        const bFreq = bassline[bassIdx];
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();

        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(bFreq, t);

        bGain.gain.setValueAtTime(0.2, t);
        bGain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

        bOsc.connect(bGain);
        bGain.connect(this.musicGain);
        bOsc.start(t);
        bOsc.stop(t + 0.2);
      }

      // Melody note
      const mIdx = this.musicStep % melody.length;
      const mFreq = melody[mIdx];
      if (mFreq > 0) {
        const mOsc = this.ctx.createOscillator();
        const mGain = this.ctx.createGain();

        mOsc.type = 'square';
        mOsc.frequency.setValueAtTime(mFreq, t);

        mGain.gain.setValueAtTime(0.08, t);
        mGain.gain.exponentialRampToValueAtTime(0.005, t + 0.12);

        mOsc.connect(mGain);
        mGain.connect(this.musicGain);
        mOsc.start(t);
        mOsc.stop(t + 0.12);
      }

      // Snare on beats 4 and 12
      if (this.musicStep % 8 === 4) {
        const snareBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.06, this.ctx.sampleRate);
        const sData = snareBuffer.getChannelData(0);
        for (let i = 0; i < sData.length; i++) {
          sData[i] = (Math.random() * 2 - 1) * (1 - i / sData.length);
        }
        const sSource = this.ctx.createBufferSource();
        sSource.buffer = snareBuffer;
        const sGain = this.ctx.createGain();
        sGain.gain.setValueAtTime(0.06, t);
        sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        sSource.connect(sGain);
        sGain.connect(this.musicGain);
        sSource.start(t);
      }

      this.musicStep++;
    }, stepDuration * 1000);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}

export const sound = new SoundSystem();
