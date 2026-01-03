
export interface Vector2 {
  x: number;
  y: number;
}

export interface InputState {
  move: Vector2;
  jump: boolean;
  attack: boolean;
  blitz: boolean; // Dash/Teleport
  phase: boolean; // Safe mode toggle
}

export enum ButtonType {
  JUMP = 'JUMP',
  ATTACK = 'ATTACK'
}

export interface AnimationConfig {
  runAnimSpeed: number;
  armShoulderAmp: number;
  armSyncPhase: number;
  armElbowBase: number;
  armElbowAmp: number;
  elbowPhase: number;
  armZOffset: number;
  torsoTwist: number;
  headStabilize: number;
}
