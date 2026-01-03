
import { PlayerState } from './State';
import { InputState } from '../../types';
import { IdleState } from './IdleState';
import * as THREE from 'three';

export class PhaseState extends PlayerState {
  
  enter(): void {
    // Make Transparent
    this.setOpacity(0.3);
    this.player.velocity.set(0, 0, 0); // Stop moving
  }

  update(dt: number, input: InputState): void {
    // Float Up and Down gently
    const time = Date.now() * 0.001;
    this.player.mesh.position.y = Math.sin(time) * 0.5 + 1.0;

    // Exit if Phase toggled off
    if (!input.phase) {
        this.player.setState(new IdleState(this.player));
    }

    // Rotate slowly
    this.player.mesh.rotation.y += dt;

    // T-Pose for dominance/meditation
    const p = this.player.parts;
    p.pelvis.rotation.x = 0;
    p.shoulderL.rotation.x = 0;
    p.shoulderL.rotation.z = 1.5;
    p.shoulderR.rotation.x = 0;
    p.shoulderR.rotation.z = -1.5;
    p.hipL.rotation.x = 0;
    p.hipR.rotation.x = 0;
  }

  exit(): void {
    this.setOpacity(1.0);
    this.player.onGround = false; // Might drop
  }

  private setOpacity(opacity: number) {
     this.player.mesh.traverse((obj) => {
         if (obj instanceof THREE.Mesh) {
             const mat = obj.material as THREE.MeshLambertMaterial;
             mat.transparent = opacity < 1.0;
             mat.opacity = opacity;
         }
     });
  }
}
