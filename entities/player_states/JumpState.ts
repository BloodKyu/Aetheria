
import { PlayerState } from './State';
import { InputState, StateID } from '../../types';
import { GAME_CONFIG } from '../../constants';

export class JumpState extends PlayerState {
  enter(): void {
    this.player.velocity.z = GAME_CONFIG.JUMP_FORCE;
    this.player.onGround = false;
  }

  update(dt: number, input: InputState): void {
    const airSpeed = GAME_CONFIG.PLAYER_SPEED * 0.8;
    if (input.move.x !== 0 || input.move.y !== 0) {
        this.player.velocity.x = input.move.y * -airSpeed;
        this.player.velocity.y = input.move.x * -airSpeed;
        this.player.mesh.rotation.z = Math.atan2(this.player.velocity.y, this.player.velocity.x);
    }

    if (this.player.onGround) {
      if (input.move.x !== 0 || input.move.y !== 0) {
        this.player.switchState(StateID.RUN);
      } else {
        this.player.switchState(StateID.IDLE);
      }
      return;
    }
    
    if (input.attack) { this.player.switchState(StateID.ATTACK); return; }

    const OPTS = this.player.animConfig;
    const time = Date.now() * 0.01 * OPTS.jumpPedalSpeed; 
    const p = this.player.parts;

    p.pelvis.position.z = 1.0 + Math.sin(time * 2) * 0.02;
    p.pelvis.rotation.y = OPTS.jumpForwardLean;
    
    p.head.rotation.z = 0;
    p.head.rotation.y = 0.2; 

    const wobble = Math.sin(time * 3) * OPTS.jumpArmWobble;
    
    // Jump Pose Override
    // Previous hardcoded offsets are now baked into jump_pose_... defaults
    
    // Shoulders
    p.shoulderL.rotation.set(
        OPTS.jump_pose_ArmL_Upper_X + wobble,
        OPTS.jump_pose_ArmL_Upper_Y, // Use direct slider value
        OPTS.jump_pose_ArmL_Upper_Z
    );
    p.lowerArmL.rotation.set(
        OPTS.jump_pose_ArmL_Lower_X,
        OPTS.jump_pose_ArmL_Lower_Y, 
        OPTS.jump_pose_ArmL_Lower_Z
    );

    p.shoulderR.rotation.set(
        OPTS.jump_pose_ArmR_Upper_X - wobble,
        OPTS.jump_pose_ArmR_Upper_Y, // Use direct slider value
        OPTS.jump_pose_ArmR_Upper_Z
    );
    p.lowerArmR.rotation.set(
        OPTS.jump_pose_ArmR_Lower_X,
        OPTS.jump_pose_ArmR_Lower_Y,
        OPTS.jump_pose_ArmR_Lower_Z
    );

    // Legs - Cycling
    const legY = Math.sin(time) * OPTS.jumpLegAmp;
    const kneeY = Math.max(0.1, (1 - Math.sin(time)) * 1.5);
    
    const legYR = Math.sin(time + Math.PI) * OPTS.jumpLegAmp;
    const kneeYR = Math.max(0.1, (1 - Math.sin(time + Math.PI)) * 1.5);

    p.hipL.rotation.set(OPTS.jump_pose_LegL_Upper_X, OPTS.jump_pose_LegL_Upper_Y + legY, OPTS.jump_pose_LegL_Upper_Z);
    p.lowerLegL.rotation.set(OPTS.jump_pose_LegL_Lower_X, OPTS.jump_pose_LegL_Lower_Y + kneeY, OPTS.jump_pose_LegL_Lower_Z);

    p.hipR.rotation.set(OPTS.jump_pose_LegR_Upper_X, OPTS.jump_pose_LegR_Upper_Y + legYR, OPTS.jump_pose_LegR_Upper_Z);
    p.lowerLegR.rotation.set(OPTS.jump_pose_LegR_Lower_X, OPTS.jump_pose_LegR_Lower_Y + kneeYR, OPTS.jump_pose_LegR_Lower_Z);
  }

  exit(): void {}
}
