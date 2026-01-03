
import { AnimationConfig } from '../types';
import { DEFAULT_ANIM_CONFIG } from '../entities/Player';

type Listener = (config: AnimationConfig) => void;

class DebugManager {
  // "Draft" is what the UI sliders change (for Preview)
  draftConfig: AnimationConfig;
  
  // "Applied" is what the Game Player uses
  appliedConfig: AnimationConfig;

  listeners: Set<Listener> = new Set();
  applyListeners: Set<Listener> = new Set();

  constructor() {
      this.draftConfig = { ...DEFAULT_ANIM_CONFIG };
      this.appliedConfig = { ...DEFAULT_ANIM_CONFIG };
  }

  // Called by UI Sliders
  setDraft(key: keyof AnimationConfig, value: number) {
    this.draftConfig[key] = value;
    this.notifyDraft();
  }

  // Called by Apply Button
  commit() {
      this.appliedConfig = { ...this.draftConfig };
      this.notifyApply();
  }

  // Subscribe to Draft Changes (Preview Window)
  subscribeDraft(cb: Listener) {
    this.listeners.add(cb);
    // Initial callback
    cb(this.draftConfig);
    return () => this.listeners.delete(cb);
  }

  // Subscribe to Applied Changes (Game Engine)
  subscribeApply(cb: Listener) {
      this.applyListeners.add(cb);
      // Initial
      cb(this.appliedConfig);
      return () => this.applyListeners.delete(cb);
  }

  private notifyDraft() {
    this.listeners.forEach(cb => cb({ ...this.draftConfig }));
  }

  private notifyApply() {
    this.applyListeners.forEach(cb => cb({ ...this.appliedConfig }));
  }
}

export const debugManager = new DebugManager();
