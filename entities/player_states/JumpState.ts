
import { PlayerState } from './State';
import { InputState } from '../../types';
import { IdleState } from './IdleState';
import { RunState } from './RunState';
import { AttackState } from './AttackState';
import { GAME_CONFIG } from '../../constants';

export class JumpState extends PlayerState {
  enter(): void {
    this.player.velocity.y = GAME_CONFIG.JUMP_FORCE;
    this.player.onGround = false;
  }

  update(dt: number, input: InputState): void {
    // Air Control (Limited)
    const airSpeed = GAME_CONFIG.PLAYER_SPEED * 0.8;
    if (input.move.x !== 0 || input.move.y !== 0) {
        this.player.velocity.x = input.move.x * airSpeed;
        this.player.velocity.z = input.move.y * airSpeed;
        this.player.mesh.rotation.y = Math.atan2(this.player.velocity.x, this.player.velocity.z);
    }

    // Transitions
    if (this.player.onGround) {
      if (input.move.x !== 0 || input.move.y !== 0) {
        this.player.setState(new RunState(this.player));
      } else {
        this.player.setState(new IdleState(this.player));
      }
      return;
    }
    
    // Jump Attack
    if (input.attack) {
        this.player.setState(new AttackState(this.player));
        return;
    }

    // Animation: Jump Pose
    const p = this.player.parts;
    p.pelvis.position.y = 1.0;
    p.pelvis.rotation.x = 0;
    
    p.hipL.rotation.x = -1.0; 
    p.lowerLegL.rotation.x = 0.5;
    
    p.hipR.rotation.x = 0.5; 
    p.lowerLegR.rotation.x = 0.5;
    
    // Arms up for jump
    p.shoulderL.rotation.x = -2.5; 
    p.lowerArmL.rotation.x = -0.5;

    p.shoulderR.rotation.x = -2.5;
    p.lowerArmR.rotation.x = -0.5;
    
    p.head.rotation.y = 0;
  }

  exit(): void {}
}
