
import { PlayerState } from './State';
import { InputState, StateID } from '../../types';
import * as THREE from 'three';

export class IdleState extends PlayerState {
  enter(): void {
    this.player.velocity.x = 0;
    this.player.velocity.y = 0; // Stop horizontal
  }

  update(dt: number, input: InputState, camera?: THREE.Camera): void {
    if (input.phase) { this.player.switchState(StateID.PHASE); return; }
    if (input.jump && this.player.onGround) { this.player.switchState(StateID.JUMP); return; }
    if (input.attack) { this.player.switchState(StateID.ATTACK); return; }
    if (input.blitz) { this.player.switchState(StateID.BLITZ); return; }
    if (input.move.x !== 0 || input.move.y !== 0) { this.player.switchState(StateID.RUN); return; }

    // LOCK ON ROTATION
    if (this.player.lockTarget) {
      const dx = this.player.lockTarget.x - this.player.mesh.position.x;
      const dy = this.player.lockTarget.y - this.player.mesh.position.y;
      const targetAngle = Math.atan2(dy, dx);
      // Smoothly rotate towards target
      let angleDiff = targetAngle - this.player.mesh.rotation.z;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      this.player.mesh.rotation.z += angleDiff * dt * 10;
    }

    const OPTS = this.player.animConfig;
    const time = Date.now() * 0.002 * OPTS.idleBreathSpeed;
    const breath = Math.sin(time * 2);
    const p = this.player.parts;

    // Pelvis Bob (Z-axis)
    p.pelvis.position.z = 1.0 + breath * 0.01;
    p.pelvis.rotation.y = 0;

    // --- APPLY IDLE POSE ---

    // Left Arm
    p.shoulderL.rotation.set(
      OPTS.idle_pose_ArmL_Upper_X, 
      OPTS.idle_pose_ArmL_Upper_Y + (breath * 0.05), // Add breathing
      OPTS.idle_pose_ArmL_Upper_Z
    );
    p.lowerArmL.rotation.set(
      OPTS.idle_pose_ArmL_Lower_X,
      OPTS.idle_pose_ArmL_Lower_Y,
      OPTS.idle_pose_ArmL_Lower_Z
    );

    // Right Arm
    p.shoulderR.rotation.set(
      OPTS.idle_pose_ArmR_Upper_X,
      OPTS.idle_pose_ArmR_Upper_Y + (breath * 0.05),
      OPTS.idle_pose_ArmR_Upper_Z
    );
    p.lowerArmR.rotation.set(
      OPTS.idle_pose_ArmR_Lower_X,
      OPTS.idle_pose_ArmR_Lower_Y,
      OPTS.idle_pose_ArmR_Lower_Z
    );

    // Left Leg
    p.hipL.rotation.set(
      OPTS.idle_pose_LegL_Upper_X,
      OPTS.idle_pose_LegL_Upper_Y,
      OPTS.idle_pose_LegL_Upper_Z
    );
    p.lowerLegL.rotation.set(
      OPTS.idle_pose_LegL_Lower_X,
      OPTS.idle_pose_LegL_Lower_Y,
      OPTS.idle_pose_LegL_Lower_Z
    );

    // Right Leg
    p.hipR.rotation.set(
      OPTS.idle_pose_LegR_Upper_X,
      OPTS.idle_pose_LegR_Upper_Y,
      OPTS.idle_pose_LegR_Upper_Z
    );
    p.lowerLegR.rotation.set(
      OPTS.idle_pose_LegR_Lower_X,
      OPTS.idle_pose_LegR_Lower_Y,
      OPTS.idle_pose_LegR_Lower_Z
    );

    // Torso Breath
    p.abdomen.rotation.y = breath * OPTS.idleBreathAmp;
    p.chest.rotation.y = breath * OPTS.idleBreathAmp;
    
    // Twist
    p.abdomen.rotation.z = 0;
    p.chest.rotation.z = 0;
    p.head.rotation.z = 0;
  }

  exit(): void {}
}
