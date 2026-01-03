
export class AssetLoader {
  private audioContext: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();

  constructor() {
    // We defer AudioContext creation until interaction to comply with browser policies
  }

  public init(ctx: AudioContext) {
    this.audioContext = ctx;
    this.generateSounds();
  }

  public getBuffer(id: string): AudioBuffer | undefined {
    return this.buffers.get(id);
  }

  private generateSounds() {
    if (!this.audioContext) return;

    // 1. JUMP (Rising Sine)
    this.buffers.set('jump', this.createBuffer(0.2, (t) => {
      const freq = 150 + t * 400; // Sweep up
      return Math.sin(t * freq * Math.PI * 2) * (1 - t);
    }));

    // 2. ATTACK (Noise burst + Low Sine)
    this.buffers.set('attack', this.createBuffer(0.15, (t) => {
      const noise = (Math.random() * 2 - 1) * (1 - t);
      const whoosh = Math.sin(t * 200 * Math.PI * 2) * 0.5;
      return (noise + whoosh) * 0.8;
    }));

    // 3. COLLECT (High Ping / Coin)
    this.buffers.set('collect', this.createBuffer(0.3, (t) => {
      // Dual tone
      const tone1 = Math.sin(t * 1200 * Math.PI * 2);
      const tone2 = Math.sin(t * 1800 * Math.PI * 2);
      return (tone1 + tone2) * 0.5 * Math.exp(-t * 10);
    }));

    // 4. HIT/DAMAGE (Low Square/Saw)
    this.buffers.set('hit', this.createBuffer(0.3, (t) => {
      const freq = 100 - t * 50;
      // Square-ish wave
      const val = Math.sin(t * freq * Math.PI * 2) > 0 ? 0.5 : -0.5;
      return val * (1 - t);
    }));

    // 5. ENEMY HIT (Thud)
    this.buffers.set('enemy_hit', this.createBuffer(0.1, (t) => {
        const freq = 80;
        return (Math.random() * 2 - 1) * Math.exp(-t * 20);
    }));
  }

  private createBuffer(duration: number, fn: (t: number) => number): AudioBuffer {
    if (!this.audioContext) throw new Error("No AudioContext");
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      // t goes from 0 to 1 over duration
      // actually fn expects time in seconds usually, let's pass normalized time 0->1 for ease?
      // Let's pass actual time in seconds for frequency math, but normalized for envelopes
      const t = i / length; 
      data[i] = fn(t); 
    }
    return buffer;
  }
}

export const assetLoader = new AssetLoader();
