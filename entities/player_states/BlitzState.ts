
import { PlayerState } from './State';
import { InputState } from '../../types';
import { IdleState } from './IdleState';
import { RunState } from './RunState';
import * as THREE from 'three';

export class BlitzState extends PlayerState {
  private timer = 0;
  private duration = 0.15; // Fast dash
  private dashSpeed = 25;
  private originalMatColor: THREE.Color | null = null;

  enter(): void {
    this.timer = 0;
    // Calculate Dash Direction
    let dir = new THREE.Vector3(0, 0, -1); // Default forward relative to mesh
    if (this.player.velocity.lengthSq() > 0.1) {
        dir = this.player.velocity.clone().normalize();
    } else {
        dir.applyEuler(this.player.mesh.rotation);
    }
    
    // Set Dash Velocity
    this.player.velocity.x = dir.x * this.dashSpeed;
    this.player.velocity.z = dir.z * this.dashSpeed;
    this.player.velocity.y = 0; // No gravity during blitz?

    // Visual: Turn Cyan
    const mat = (this.player.parts.chest.material as THREE.MeshLambertMaterial);
    this.originalMatColor = mat.color.clone();
    mat.color.setHex(0x00FFFF);
  }

  update(dt: number, input: InputState): void {
    this.timer += dt;
    
    // Trail effect could go here (spawning mesh copies)

    if (this.timer > this.duration) {
        if (input.move.x !== 0 || input.move.y !== 0) {
            this.player.setState(new RunState(this.player));
        } else {
            this.player.setState(new IdleState(this.player));
        }
    }
    
    // Lean into dash
    this.player.parts.pelvis.rotation.x = 0.8;
    this.player.parts.shoulderL.rotation.x = 1.5; // Arms back (Naruto run style)
    this.player.parts.shoulderR.rotation.x = 1.5;
  }

  exit(): void {
      // Restore Color
      if (this.originalMatColor) {
        const mat = (this.player.parts.chest.material as THREE.MeshLambertMaterial);
        mat.color.copy(this.originalMatColor);
      }
      this.player.velocity.x = 0;
      this.player.velocity.z = 0;
  }
}
