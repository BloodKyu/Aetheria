
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
  focus: boolean; // Z-Targeting / Camera Reset
}

export interface GameState {
  health: number;
  maxHealth: number;
  score: number;
  isGameOver: boolean;
}

export enum ButtonType {
  JUMP = 'JUMP',
  ATTACK = 'ATTACK'
}

export enum StateID {
  IDLE = 'Idle',
  RUN = 'Run',
  JUMP = 'Jump',
  ATTACK = 'Attack',
  BLITZ = 'Blitz',
  PHASE = 'Phase'
}

export interface AnimationConfig {
  // ============================
  // === IDLE POSE =============
  // ============================
  idle_pose_ArmL_Upper_X: number;
  idle_pose_ArmL_Upper_Y: number;
  idle_pose_ArmL_Upper_Z: number;
  idle_pose_ArmL_Lower_X: number;
  idle_pose_ArmL_Lower_Y: number;
  idle_pose_ArmL_Lower_Z: number;

  idle_pose_ArmR_Upper_X: number;
  idle_pose_ArmR_Upper_Y: number;
  idle_pose_ArmR_Upper_Z: number;
  idle_pose_ArmR_Lower_X: number;
  idle_pose_ArmR_Lower_Y: number;
  idle_pose_ArmR_Lower_Z: number;

  idle_pose_LegL_Upper_X: number;
  idle_pose_LegL_Upper_Y: number;
  idle_pose_LegL_Upper_Z: number;
  idle_pose_LegL_Lower_X: number;
  idle_pose_LegL_Lower_Y: number;
  idle_pose_LegL_Lower_Z: number;

  idle_pose_LegR_Upper_X: number;
  idle_pose_LegR_Upper_Y: number;
  idle_pose_LegR_Upper_Z: number;
  idle_pose_LegR_Lower_X: number;
  idle_pose_LegR_Lower_Y: number;
  idle_pose_LegR_Lower_Z: number;

  // ============================
  // === RUN POSE ==============
  // ============================
  run_pose_ArmL_Upper_X: number;
  run_pose_ArmL_Upper_Y: number;
  run_pose_ArmL_Upper_Z: number;
  run_pose_ArmL_Lower_X: number;
  run_pose_ArmL_Lower_Y: number;
  run_pose_ArmL_Lower_Z: number;

  run_pose_ArmR_Upper_X: number;
  run_pose_ArmR_Upper_Y: number;
  run_pose_ArmR_Upper_Z: number;
  run_pose_ArmR_Lower_X: number;
  run_pose_ArmR_Lower_Y: number;
  run_pose_ArmR_Lower_Z: number;

  run_pose_LegL_Upper_X: number;
  run_pose_LegL_Upper_Y: number;
  run_pose_LegL_Upper_Z: number;
  run_pose_LegL_Lower_X: number;
  run_pose_LegL_Lower_Y: number;
  run_pose_LegL_Lower_Z: number;

  run_pose_LegR_Upper_X: number;
  run_pose_LegR_Upper_Y: number;
  run_pose_LegR_Upper_Z: number;
  run_pose_LegR_Lower_X: number;
  run_pose_LegR_Lower_Y: number;
  run_pose_LegR_Lower_Z: number;

  // ============================
  // === JUMP POSE =============
  // ============================
  jump_pose_ArmL_Upper_X: number;
  jump_pose_ArmL_Upper_Y: number; // Defaults to high value for "Hands Up"
  jump_pose_ArmL_Upper_Z: number;
  jump_pose_ArmL_Lower_X: number;
  jump_pose_ArmL_Lower_Y: number;
  jump_pose_ArmL_Lower_Z: number;

  jump_pose_ArmR_Upper_X: number;
  jump_pose_ArmR_Upper_Y: number;
  jump_pose_ArmR_Upper_Z: number;
  jump_pose_ArmR_Lower_X: number;
  jump_pose_ArmR_Lower_Y: number;
  jump_pose_ArmR_Lower_Z: number;

  jump_pose_LegL_Upper_X: number;
  jump_pose_LegL_Upper_Y: number;
  jump_pose_LegL_Upper_Z: number;
  jump_pose_LegL_Lower_X: number;
  jump_pose_LegL_Lower_Y: number;
  jump_pose_LegL_Lower_Z: number;

  jump_pose_LegR_Upper_X: number;
  jump_pose_LegR_Upper_Y: number;
  jump_pose_LegR_Upper_Z: number;
  jump_pose_LegR_Lower_X: number;
  jump_pose_LegR_Lower_Y: number;
  jump_pose_LegR_Lower_Z: number;

  // --- DYNAMICS ---
  
  // Run
  runAnimSpeed: number;
  armShoulderAmp: number;
  armSyncPhase: number;
  armElbowAmp: number;
  elbowPhase: number;
  torsoTwist: number;
  headStabilize: number;
  
  // Idle
  idleBreathSpeed: number;
  idleBreathAmp: number;
  
  // Jump
  jumpPedalSpeed: number;
  jumpLegAmp: number;
  jumpArmWobble: number;
  jumpForwardLean: number;

  // Attack
  attackDuration: number;    
  attackWindupRatio: number; 
  attackSlashAmp: number;    
  attackTorsoTwist: number;  
}
