
import { PlayerState } from './State';
import { InputState } from '../../types';
import { IdleState } from './IdleState';

export class AttackState extends PlayerState {
  private timer: number = 0;
  private duration: number = 0.3; // Seconds

  enter(): void {
    this.timer = 0;
    // Stop movement during attack? Or allow slide? Let's stop for "weight"
    this.player.velocity.x *= 0.2;
    this.player.velocity.z *= 0.2;
  }

  update(dt: number, input: InputState): void {
    this.timer += dt;
    const progress = this.timer / this.duration;

    if (this.timer >= this.duration) {
      this.player.setState(new IdleState(this.player));
      return;
    }

    // Animation: Spin Attack
    const p = this.player.parts;
    const spinAngle = progress * Math.PI * 2;
    
    // Full body spin
    this.player.mesh.rotation.y += dt * 20;

    p.shoulderL.rotation.x = -1.5;
    p.shoulderL.rotation.z = 1.5; // Arms out
    p.shoulderR.rotation.x = -1.5;
    p.shoulderR.rotation.z = -1.5;
  }

  exit(): void {}
}
