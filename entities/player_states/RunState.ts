
import { PlayerState } from './State';
import { InputState } from '../../types';
import { IdleState } from './IdleState';
import { JumpState } from './JumpState';
import { AttackState } from './AttackState';
import { BlitzState } from './BlitzState';
import { PhaseState } from './PhaseState';
import { GAME_CONFIG } from '../../constants';

export class RunState extends PlayerState {
  enter(): void {}

  update(dt: number, input: InputState): void {
    // 1. Logic & Transitions
    if (input.phase) {
        this.player.setState(new PhaseState(this.player));
        return;
    }
    if (input.jump && this.player.onGround) {
      this.player.setState(new JumpState(this.player));
      return;
    }
    if (input.attack) {
      this.player.setState(new AttackState(this.player));
      return;
    }
    if (input.blitz) {
        this.player.setState(new BlitzState(this.player));
        return;
    }
    if (input.move.x === 0 && input.move.y === 0) {
      this.player.setState(new IdleState(this.player));
      return;
    }

    // 2. Movement Physics
    const speed = GAME_CONFIG.PLAYER_SPEED;
    this.player.velocity.x = input.move.x * speed;
    this.player.velocity.z = input.move.y * speed;

    // Rotate Mesh
    const targetAngle = Math.atan2(this.player.velocity.x, this.player.velocity.z);
    this.player.mesh.rotation.y = targetAngle;

    // 3. Animation (Procedural)
    // READ FROM PLAYER CONFIG
    const OPTS = this.player.animConfig;
    
    const time = Date.now() * 0.012 * OPTS.runAnimSpeed;
    const p = this.player.parts;

    // Body Bounce
    p.pelvis.position.y = 1.0 + Math.abs(Math.sin(time * 2)) * 0.1;
    p.pelvis.rotation.x = 0.35; // Lean forward

    // Torso Twist
    p.abdomen.rotation.y = Math.cos(time) * OPTS.torsoTwist;
    p.chest.rotation.y = Math.cos(time) * OPTS.torsoTwist;

    // Legs (High Knees)
    p.hipL.rotation.x = Math.sin(time) * 1.1 - 0.3;
    p.lowerLegL.rotation.x = Math.max(0, -Math.cos(time) * 2.5);

    p.hipR.rotation.x = Math.sin(time + Math.PI) * 1.1 - 0.3;
    p.lowerLegR.rotation.x = Math.max(0, -Math.cos(time + Math.PI) * 2.5);

    // Arms
    // Left
    p.shoulderL.rotation.x = Math.sin(time + OPTS.armSyncPhase) * OPTS.armShoulderAmp;
    p.shoulderL.rotation.z = -OPTS.armZOffset;
    p.lowerArmL.rotation.x = OPTS.armElbowBase + Math.sin(time + OPTS.armSyncPhase + OPTS.elbowPhase) * OPTS.armElbowAmp;

    // Right (Opposite)
    p.shoulderR.rotation.x = Math.sin(time + OPTS.armSyncPhase + Math.PI) * OPTS.armShoulderAmp;
    p.shoulderR.rotation.z = OPTS.armZOffset;
    p.lowerArmR.rotation.x = OPTS.armElbowBase + Math.sin(time + OPTS.armSyncPhase + Math.PI + OPTS.elbowPhase) * OPTS.armElbowAmp;

    // Head Stabilization
    const totalTorsoRot = p.abdomen.rotation.y + p.chest.rotation.y;
    p.head.rotation.y = -totalTorsoRot * OPTS.headStabilize;
  }

  exit(): void {}
}
