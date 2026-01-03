
import { assetLoader } from './AssetLoader';

class AudioSystem {
  private ctx: AudioContext | null = null;
  private isInit = false;

  public init() {
    if (this.isInit) return;
    
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      assetLoader.init(this.ctx);
      this.isInit = true;
    } catch (e) {
      console.warn("Audio init failed", e);
    }
  }

  public play(id: string, volume: number = 0.5, pitch: number = 1.0) {
    if (!this.isInit || !this.ctx) return;

    // Resume if suspended (browser requirement on first click)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const buffer = assetLoader.getBuffer(id);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = pitch;

    const gain = this.ctx.createGain();
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(this.ctx.destination);
    
    source.start();
  }
}

export const audioSystem = new AudioSystem();
