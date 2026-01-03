
import { PlayerState } from './State';
import { InputState, StateID } from '../../types';
import * as THREE from 'three';

export class PhaseState extends PlayerState {
  
  enter(): void {
    this.setOpacity(0.3);
    this.player.velocity.set(0, 0, 0); 
  }

  update(dt: number, input: InputState, camera?: THREE.Camera): void {
    const time = Date.now() * 0.001;
    this.player.mesh.position.z = Math.sin(time) * 0.5 + 1.0;

    if (!input.phase) {
        this.player.switchState(StateID.IDLE);
    }

    this.player.mesh.rotation.z += dt;

    const p = this.player.parts;
    p.pelvis.rotation.y = 0;
    p.shoulderL.rotation.y = 0;
    p.shoulderL.rotation.x = 1.5; // T-Pose Roll
    p.shoulderR.rotation.y = 0;
    p.shoulderR.rotation.x = -1.5;
  }

  exit(): void {
    this.setOpacity(1.0);
    this.player.onGround = false; 
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
