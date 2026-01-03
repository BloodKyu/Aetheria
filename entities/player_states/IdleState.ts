
import { PlayerState } from './State';
import { InputState } from '../../types';
import { RunState } from './RunState';
import { JumpState } from './JumpState';
import { AttackState } from './AttackState';
import { BlitzState } from './BlitzState';
import { PhaseState } from './PhaseState';

export class IdleState extends PlayerState {
  enter(): void {
    // Reset specific parts if needed
    this.player.velocity.x = 0;
    this.player.velocity.z = 0;
  }

  update(dt: number, input: InputState): void {
    // Transitions
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
    if (input.move.x !== 0 || input.move.y !== 0) {
      this.player.setState(new RunState(this.player));
      return;
    }

    // Idle Animation (Breathing)
    const time = Date.now() * 0.002;
    const breath = Math.sin(time * 2);

    const p = this.player.parts;
    p.pelvis.position.y = 1.0 + breath * 0.01;
    p.pelvis.rotation.x = 0;

    // A-Pose Relaxed
    p.shoulderL.rotation.x = 0;
    p.shoulderL.rotation.z = -0.1; 
    p.lowerArmL.rotation.x = -0.3;

    p.shoulderR.rotation.x = 0;
    p.shoulderR.rotation.z = 0.1;
    p.lowerArmR.rotation.x = -0.3;

    // Legs Still
    p.hipL.rotation.x = 0;
    p.lowerLegL.rotation.x = 0;
    p.hipR.rotation.x = 0;
    p.lowerLegR.rotation.x = 0;

    // Torso Breath
    p.abdomen.rotation.x = breath * 0.02;
    p.chest.rotation.x = breath * 0.02;
    p.abdomen.rotation.y = 0;
    p.chest.rotation.y = 0;

    p.head.rotation.y = 0;
  }

  exit(): void {}
}
