
import { PlayerState } from './State';
import { InputState, StateID } from '../../types';
import * as THREE from 'three';
import { audioSystem } from '../../services/AudioSystem';

export class AttackState extends PlayerState {
  private timer: number = 0;
  private soundPlayed: boolean = false;

  enter(): void {
    this.timer = 0;
    this.player.velocity.x = 0;
    this.player.velocity.y = 0;
    this.player.isHitActive = false;
    this.soundPlayed = false;
  }

  update(dt: number, input: InputState, camera?: THREE.Camera): void {
    const OPTS = this.player.animConfig;
    this.timer += dt;
    const progress = Math.min(this.timer / OPTS.attackDuration, 1.0);

    if (progress >= 1.0) {
      this.player.switchState(StateID.IDLE);
      return;
    }

    const p = this.player.parts;
    const windupEnd = OPTS.attackWindupRatio;
    const slashEnd = windupEnd + 0.4;
    
    // LEGS: Combat Stance
    p.hipL.rotation.y = -0.5; 
    p.lowerLegL.rotation.y = 0.4; 
    
    p.hipR.rotation.y = 0.5;
    p.lowerLegR.rotation.y = 0.2;
    
    p.pelvis.position.z = 0.9;
    
    if (progress < windupEnd) {
        // === WINDUP ===
        this.player.isHitActive = false; // Safe
        const t = progress / windupEnd;
        const ease = t * t; 

        // Torso: Twist Right (-Z)
        const twist = -OPTS.attackTorsoTwist;
        p.abdomen.rotation.z = twist * ease;
        p.chest.rotation.z = twist * ease;
        p.head.rotation.z = -twist * 0.8 * ease;

        // Right Arm (Sword): Pull Back
        p.shoulderR.rotation.y = 0.5 * ease; // Pitch back
        p.shoulderR.rotation.x = 0.5 * ease; // Roll out
        p.lowerArmR.rotation.y = -1.5 * ease; // Bend elbow

        // Left Arm Guard
        p.shoulderL.rotation.y = -0.5 * ease; 
        p.lowerArmL.rotation.y = -1.0 * ease;

    } else if (progress < slashEnd) {
        // === SLASH (ACTIVE HIT) ===
        this.player.isHitActive = true; 
        
        if (!this.soundPlayed) {
          audioSystem.play('attack', 0.4, 0.8 + Math.random() * 0.4);
          this.soundPlayed = true;
        }
        
        const t = (progress - windupEnd) / (slashEnd - windupEnd);
        const ease = 1 - Math.pow(1 - t, 4);

        // Torso: Twist Left (+Z)
        const startTwist = -OPTS.attackTorsoTwist;
        const endTwist = OPTS.attackTorsoTwist;
        const currentTwist = THREE.MathUtils.lerp(startTwist, endTwist, ease);
        
        p.abdomen.rotation.z = currentTwist;
        p.chest.rotation.z = currentTwist;
        p.head.rotation.z = -currentTwist * 0.8;

        // Right Arm: Swing Across
        p.shoulderR.rotation.y = THREE.MathUtils.lerp(0.5, -0.5, ease);
        p.shoulderR.rotation.x = THREE.MathUtils.lerp(0.5, -1.5, ease); // Across body
        p.lowerArmR.rotation.y = THREE.MathUtils.lerp(-1.5, -0.1, ease); // Extend

    } else {
        // === RECOVERY ===
        this.player.isHitActive = false; // Safe
        const t = (progress - slashEnd) / (1.0 - slashEnd);
        const ease = t; 

        p.abdomen.rotation.z = THREE.MathUtils.lerp(OPTS.attackTorsoTwist, 0, ease);
        p.chest.rotation.z = THREE.MathUtils.lerp(OPTS.attackTorsoTwist, 0, ease);
        p.head.rotation.z = THREE.MathUtils.lerp(-OPTS.attackTorsoTwist * 0.8, 0, ease);

        p.shoulderR.rotation.y = THREE.MathUtils.lerp(-0.5, 0, ease);
        p.shoulderR.rotation.x = THREE.MathUtils.lerp(-1.5, 0.1, ease);
        p.lowerArmR.rotation.y = THREE.MathUtils.lerp(-0.1, -0.3, ease);
        
        p.hipL.rotation.y = THREE.MathUtils.lerp(-0.5, 0, ease);
        p.lowerLegL.rotation.y = THREE.MathUtils.lerp(0.4, 0, ease);
        p.hipR.rotation.y = THREE.MathUtils.lerp(0.5, 0, ease);
        p.lowerLegR.rotation.y = THREE.MathUtils.lerp(0.2, 0, ease);
        p.pelvis.position.z = THREE.MathUtils.lerp(0.9, 1.0, ease);
    }
  }

  exit(): void {
      this.player.isHitActive = false;
  }
}
