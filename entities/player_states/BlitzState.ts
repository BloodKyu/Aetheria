
import { PlayerState } from './State';
import { InputState, StateID } from '../../types';
import * as THREE from 'three';

export class BlitzState extends PlayerState {
  private timer = 0;
  private duration = 0.15;
  private dashSpeed = 25;
  private originalMatColor: THREE.Color | null = null;

  enter(): void {
    this.timer = 0;
    // Direction is Forward (+X) relative to rotation
    let dir = new THREE.Vector3(1, 0, 0); 
    dir.applyAxisAngle(new THREE.Vector3(0,0,1), this.player.mesh.rotation.z);
    
    this.player.velocity.x = dir.x * this.dashSpeed;
    this.player.velocity.y = dir.y * this.dashSpeed;
    this.player.velocity.z = 0;

    const mat = (this.player.parts.chest.material as THREE.MeshLambertMaterial);
    this.originalMatColor = mat.color.clone();
    mat.color.setHex(0x00FFFF);
  }

  update(dt: number, input: InputState, camera?: THREE.Camera): void {
    this.timer += dt;
    if (this.timer > this.duration) {
        if (input.move.x !== 0 || input.move.y !== 0) {
            this.player.switchState(StateID.RUN);
        } else {
            this.player.switchState(StateID.IDLE);
        }
    }
    // Lean Forward (Pitch Y)
    this.player.parts.pelvis.rotation.y = 0.8;
    this.player.parts.shoulderL.rotation.y = -1.5; // Arms back
    this.player.parts.shoulderR.rotation.y = -1.5;
  }

  exit(): void {
      if (this.originalMatColor) {
        const mat = (this.player.parts.chest.material as THREE.MeshLambertMaterial);
        mat.color.copy(this.originalMatColor);
      }
      this.player.velocity.x = 0;
      this.player.velocity.y = 0;
  }
}
