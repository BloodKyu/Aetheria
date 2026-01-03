
import { PlayerState } from './State';
import { InputState, StateID } from '../../types';
import { GAME_CONFIG } from '../../constants';

export class RunState extends PlayerState {
  enter(): void {}

  update(dt: number, input: InputState): void {
    if (input.phase) { this.player.switchState(StateID.PHASE); return; }
    if (input.jump && this.player.onGround) { this.player.switchState(StateID.JUMP); return; }
    if (input.attack) { this.player.switchState(StateID.ATTACK); return; }
    if (input.blitz) { this.player.switchState(StateID.BLITZ); return; }
    if (input.move.x === 0 && input.move.y === 0) { this.player.switchState(StateID.IDLE); return; }

    // MOVEMENT MAPPING
    const speed = GAME_CONFIG.PLAYER_SPEED;
    this.player.velocity.x = input.move.y * -speed; 
    this.player.velocity.y = input.move.x * -speed; 

    // Facing Rotation
    const targetAngle = Math.atan2(this.player.velocity.y, this.player.velocity.x);
    this.player.mesh.rotation.z = targetAngle;

    // ANIMATION
    const OPTS = this.player.animConfig;
    const time = Date.now() * 0.012 * OPTS.runAnimSpeed;
    const p = this.player.parts;

    // Body Bounce
    p.pelvis.position.z = 1.0 + Math.abs(Math.sin(time * 2)) * 0.1;
    p.pelvis.rotation.y = 0.35; 

    // Torso Twist
    p.abdomen.rotation.z = Math.cos(time) * OPTS.torsoTwist;
    p.chest.rotation.z = Math.cos(time) * OPTS.torsoTwist;

    // Legs (Pitch Y) - Added to RUN Base Pose
    const legLRunY = Math.sin(time) * 1.1 - 0.3;
    const legLRunKnee = Math.max(0, -Math.cos(time) * 2.5);

    const legRRunY = Math.sin(time + Math.PI) * 1.1 - 0.3;
    const legRRunKnee = Math.max(0, -Math.cos(time + Math.PI) * 2.5);

    p.hipL.rotation.set(OPTS.run_pose_LegL_Upper_X, OPTS.run_pose_LegL_Upper_Y + legLRunY, OPTS.run_pose_LegL_Upper_Z);
    p.lowerLegL.rotation.set(OPTS.run_pose_LegL_Lower_X, OPTS.run_pose_LegL_Lower_Y + legLRunKnee, OPTS.run_pose_LegL_Lower_Z);

    p.hipR.rotation.set(OPTS.run_pose_LegR_Upper_X, OPTS.run_pose_LegR_Upper_Y + legRRunY, OPTS.run_pose_LegR_Upper_Z);
    p.lowerLegR.rotation.set(OPTS.run_pose_LegR_Lower_X, OPTS.run_pose_LegR_Lower_Y + legRRunKnee, OPTS.run_pose_LegR_Lower_Z);

    // Arms (Pitch Y) - Added to RUN Base Pose
    const armLRunY = Math.sin(time + OPTS.armSyncPhase) * OPTS.armShoulderAmp;
    const armLRunElbow = Math.sin(time + OPTS.armSyncPhase + OPTS.elbowPhase) * OPTS.armElbowAmp;

    const armRRunY = Math.sin(time + OPTS.armSyncPhase + Math.PI) * OPTS.armShoulderAmp;
    const armRRunElbow = Math.sin(time + OPTS.armSyncPhase + Math.PI + OPTS.elbowPhase) * OPTS.armElbowAmp;

    // Apply Run Pose + Anim
    p.shoulderL.rotation.set(
        OPTS.run_pose_ArmL_Upper_X, 
        OPTS.run_pose_ArmL_Upper_Y + armLRunY, 
        OPTS.run_pose_ArmL_Upper_Z
    );
    p.lowerArmL.rotation.set(
        OPTS.run_pose_ArmL_Lower_X,
        OPTS.run_pose_ArmL_Lower_Y + armLRunElbow,
        OPTS.run_pose_ArmL_Lower_Z
    );

    p.shoulderR.rotation.set(
        OPTS.run_pose_ArmR_Upper_X,
        OPTS.run_pose_ArmR_Upper_Y + armRRunY,
        OPTS.run_pose_ArmR_Upper_Z
    );
    p.lowerArmR.rotation.set(
        OPTS.run_pose_ArmR_Lower_X,
        OPTS.run_pose_ArmR_Lower_Y + armRRunElbow,
        OPTS.run_pose_ArmR_Lower_Z
    );

    // Head Stabilize
    const totalTorsoRot = p.abdomen.rotation.z + p.chest.rotation.z;
    p.head.rotation.z = -totalTorsoRot * OPTS.headStabilize;
  }

  exit(): void {}
}
