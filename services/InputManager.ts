
import { InputState, Vector2 } from '../types';

class InputManager {
  private state: InputState;

  constructor() {
    this.state = {
      move: { x: 0, y: 0 },
      jump: false,
      attack: false,
      blitz: false,
      phase: false,
    };

    this.initKeyboardListeners();
  }

  private initKeyboardListeners() {
    window.addEventListener('keydown', (e) => this.handleKey(e, true));
    window.addEventListener('keyup', (e) => this.handleKey(e, false));
  }

  private handleKey(e: KeyboardEvent, isDown: boolean) {
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.state.move.y = isDown ? -1 : 0;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.state.move.y = isDown ? 1 : 0;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.state.move.x = isDown ? -1 : 0;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.state.move.x = isDown ? 1 : 0;
        break;
      case 'Space':
        this.state.jump = isDown;
        break;
      case 'KeyF':
      case 'Enter':
        this.state.attack = isDown;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
      case 'KeyZ':
        this.state.blitz = isDown;
        break;
      case 'KeyP':
        if (isDown) this.state.phase = !this.state.phase; // Toggle
        break;
    }
  }

  // --- API for Virtual Controls (React UI) ---

  public setVirtualJoystick(vector: Vector2) {
    const len = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (len > 1) {
      this.state.move.x = vector.x / len;
      this.state.move.y = vector.y / len;
    } else {
      this.state.move = vector;
    }
  }

  public setVirtualButton(action: 'jump' | 'attack' | 'blitz', pressed: boolean) {
    if (action === 'jump') this.state.jump = pressed;
    if (action === 'attack') this.state.attack = pressed;
    if (action === 'blitz') this.state.blitz = pressed;
  }

  public getState(): InputState {
    return { ...this.state };
  }
}

export const inputManager = new InputManager();
