
import * as THREE from 'three';
import { InputState, AnimationConfig, StateID } from '../types';
import { GAME_CONFIG, COLORS } from '../constants';
import { PlayerState } from './player_states/State';
import { IdleState } from './player_states/IdleState';
import { RunState } from './player_states/RunState';
import { JumpState } from './player_states/JumpState';
import { AttackState } from './player_states/AttackState';
import { BlitzState } from './player_states/BlitzState';
import { PhaseState } from './player_states/PhaseState';

export interface PlayerParts {
    pelvis: THREE.Mesh;
    abdomen: THREE.Mesh;
    chest: THREE.Mesh;
    head: THREE.Mesh;
    shoulderL: THREE.Group;
    upperArmL: THREE.Mesh;
    lowerArmL: THREE.Mesh;
    shoulderR: THREE.Group;
    upperArmR: THREE.Mesh;
    lowerArmR: THREE.Mesh;
    hipL: THREE.Group;
    upperLegL: THREE.Mesh;
    lowerLegL: THREE.Mesh;
    hipR: THREE.Group;
    upperLegR: THREE.Mesh;
    lowerLegR: THREE.Mesh;
}

export const DEFAULT_ANIM_CONFIG: AnimationConfig = {
    // --- IDLE DEFAULTS ---
    idle_pose_ArmL_Upper_X: 0.25,
    idle_pose_ArmL_Upper_Y: -0.09,
    idle_pose_ArmL_Upper_Z: 0.0,
    idle_pose_ArmL_Lower_X: 0.0,
    idle_pose_ArmL_Lower_Y: -0.5,
    idle_pose_ArmL_Lower_Z: 0.0,

    idle_pose_ArmR_Upper_X: -0.28,
    idle_pose_ArmR_Upper_Y: 0.30,
    idle_pose_ArmR_Upper_Z: 0.0,
    idle_pose_ArmR_Lower_X: 0.0,
    idle_pose_ArmR_Lower_Y: -0.5,
    idle_pose_ArmR_Lower_Z: 0.0,

    idle_pose_LegL_Upper_X: 0.09,
    idle_pose_LegL_Upper_Y: -0.09,
    idle_pose_LegL_Upper_Z: 0.34,
    idle_pose_LegL_Lower_X: 0.0,
    idle_pose_LegL_Lower_Y: 0.28,
    idle_pose_LegL_Lower_Z: 0.0,

    idle_pose_LegR_Upper_X: -0.05,
    idle_pose_LegR_Upper_Y: -0.12,
    idle_pose_LegR_Upper_Z: -0.28,
    idle_pose_LegR_Lower_X: 0.0,
    idle_pose_LegR_Lower_Y: 0.18,
    idle_pose_LegR_Lower_Z: 0.0,

    // --- RUN DEFAULTS ---
    run_pose_ArmL_Upper_X: 0.49,
    run_pose_ArmL_Upper_Y: 0.46,
    run_pose_ArmL_Upper_Z: 0.0,
    run_pose_ArmL_Lower_X: 0.0,
    run_pose_ArmL_Lower_Y: -1.45,
    run_pose_ArmL_Lower_Z: 0.0,

    run_pose_ArmR_Upper_X: -0.46,
    run_pose_ArmR_Upper_Y: -0.15,
    run_pose_ArmR_Upper_Z: 0.0,
    run_pose_ArmR_Lower_X: 0.0,
    run_pose_ArmR_Lower_Y: -0.50,
    run_pose_ArmR_Lower_Z: 0.0,

    run_pose_LegL_Upper_X: 0.0,
    run_pose_LegL_Upper_Y: 0.0,
    run_pose_LegL_Upper_Z: 0.0,
    run_pose_LegL_Lower_X: 0.0,
    run_pose_LegL_Lower_Y: 0.0,
    run_pose_LegL_Lower_Z: 0.0,

    run_pose_LegR_Upper_X: 0.0,
    run_pose_LegR_Upper_Y: 0.0,
    run_pose_LegR_Upper_Z: 0.0,
    run_pose_LegR_Lower_X: 0.0,
    run_pose_LegR_Lower_Y: 0.0,
    run_pose_LegR_Lower_Z: 0.0,

    // --- JUMP DEFAULTS (Arms Up, Legs spread) ---
    jump_pose_ArmL_Upper_X: -0.25,
    jump_pose_ArmL_Upper_Y: -1.95, // Previously -0.15 - 1.8
    jump_pose_ArmL_Upper_Z: 0.0,
    jump_pose_ArmL_Lower_X: 0.0,
    jump_pose_ArmL_Lower_Y: -0.5,
    jump_pose_ArmL_Lower_Z: 0.0,

    jump_pose_ArmR_Upper_X: 0.25,
    jump_pose_ArmR_Upper_Y: -1.95, 
    jump_pose_ArmR_Upper_Z: 0.0,
    jump_pose_ArmR_Lower_X: 0.0,
    jump_pose_ArmR_Lower_Y: -0.5,
    jump_pose_ArmR_Lower_Z: 0.0,

    jump_pose_LegL_Upper_X: 0.0,
    jump_pose_LegL_Upper_Y: 0.0,
    jump_pose_LegL_Upper_Z: 0.0,
    jump_pose_LegL_Lower_X: 0.0,
    jump_pose_LegL_Lower_Y: 0.0,
    jump_pose_LegL_Lower_Z: 0.0,

    jump_pose_LegR_Upper_X: 0.0,
    jump_pose_LegR_Upper_Y: 0.0,
    jump_pose_LegR_Upper_Z: 0.0,
    jump_pose_LegR_Lower_X: 0.0,
    jump_pose_LegR_Lower_Y: 0.0,
    jump_pose_LegR_Lower_Z: 0.0,

    // --- DYNAMICS ---
    runAnimSpeed: 0.75,
    armShoulderAmp: 1.20,
    armSyncPhase: 1.58,  
    armElbowAmp: 0.34,
    elbowPhase: 0.00,
    torsoTwist: 0.30,
    headStabilize: 0.80,
    
    idleBreathSpeed: 1.0,
    idleBreathAmp: 0.02,
    
    jumpPedalSpeed: 0.45,
    jumpLegAmp: 0.78,
    jumpArmWobble: 0.23,
    jumpForwardLean: 0.00,

    attackDuration: 0.35,      
    attackWindupRatio: 0.25,   
    attackSlashAmp: 2.0,       
    attackTorsoTwist: 1.0
};

export class Player {
  public mesh: THREE.Group;
  public velocity: THREE.Vector3;
  public onGround: boolean;
  public parts: PlayerParts;
  public animConfig: AnimationConfig;
  
  private currentState: PlayerState;

  constructor() {
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.onGround = true; 
    this.mesh = new THREE.Group();
    this.parts = this.createProceduralMesh();
    this.animConfig = { ...DEFAULT_ANIM_CONFIG };
    
    this.currentState = new IdleState(this);
    this.currentState.enter();
  }

  public switchState(id: StateID) {
    let newState: PlayerState;
    switch(id) {
        case StateID.IDLE: newState = new IdleState(this); break;
        case StateID.RUN: newState = new RunState(this); break;
        case StateID.JUMP: newState = new JumpState(this); break;
        case StateID.ATTACK: newState = new AttackState(this); break;
        case StateID.BLITZ: newState = new BlitzState(this); break;
        case StateID.PHASE: newState = new PhaseState(this); break;
        default: newState = new IdleState(this); break;
    }
    if (this.currentState) this.currentState.exit();
    this.currentState = newState;
    this.currentState.enter();
  }
  
  public getCurrentStateName(): string {
      return this.currentState.constructor.name;
  }

  // --- MESH GENERATION ---
  private createBlock(front: number, side: number, up: number, mat: THREE.Material): THREE.Mesh {
      const geo = new THREE.BoxGeometry(front, side, up);
      return new THREE.Mesh(geo, mat);
  }

  private createProceduralMesh(): PlayerParts {
    const bodyMat = new THREE.MeshLambertMaterial({ color: COLORS.PLAYER });
    const skinMat = new THREE.MeshLambertMaterial({ color: COLORS.PLAYER_HEAD });
    const hairMat = new THREE.MeshLambertMaterial({ color: COLORS.HAIR });
    const shoeMat = new THREE.MeshLambertMaterial({ color: COLORS.SHOES });
    const shortsMat = new THREE.MeshLambertMaterial({ color: COLORS.SHORTS });
    const headMat = new THREE.MeshLambertMaterial({ color: COLORS.PLAYER_HEAD }); 

    // 1. Pelvis (Root Center)
    const pelvis = this.createBlock(0.26, 0.38, 0.22, shortsMat);
    pelvis.position.z = 1.0; 
    this.mesh.add(pelvis);

    // 2. Legs
    const createLeg = (isLeft: boolean) => {
        const yDir = isLeft ? 1 : -1;
        const hipGroup = new THREE.Group();
        hipGroup.position.set(0, 0.12 * yDir, -0.1); 
        pelvis.add(hipGroup);

        const upperLeg = this.createBlock(0.20, 0.20, 0.42, shortsMat);
        upperLeg.position.z = -0.21;
        hipGroup.add(upperLeg);

        const lowerLeg = this.createBlock(0.14, 0.14, 0.38, skinMat);
        lowerLeg.position.z = -0.4;
        upperLeg.add(lowerLeg); 

        upperLeg.geometry.translate(0, 0, -0.21);
        upperLeg.position.z = 0;

        lowerLeg.geometry.translate(0, 0, -0.19);
        lowerLeg.position.z = -0.42;

        const foot = this.createBlock(0.26, 0.16, 0.12, shoeMat);
        foot.geometry.translate(0.05, 0, -0.06); 
        foot.position.z = -0.38;
        lowerLeg.add(foot);

        return { hip: hipGroup, upper: upperLeg, lower: lowerLeg };
    };

    const legL = createLeg(true);
    const legR = createLeg(false);

    // 3. Torso
    const abdomen = this.createBlock(0.22, 0.34, 0.25, bodyMat);
    abdomen.geometry.translate(0, 0, 0.125); 
    abdomen.position.z = 0.11; 
    pelvis.add(abdomen);

    const chest = this.createBlock(0.30, 0.45, 0.35, bodyMat);
    chest.geometry.translate(0, 0, 0.175);
    chest.position.z = 0.25;
    abdomen.add(chest);

    // 4. Head Group
    const headGroup = new THREE.Group();
    headGroup.position.z = 0.35;
    chest.add(headGroup);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.15, 8).rotateX(Math.PI/2), skinMat);
    neck.position.z = 0.075;
    headGroup.add(neck);

    // HEAD
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), headMat);
    head.scale.set(1, 0.9, 1.15); 
    head.position.z = 0.35;
    headGroup.add(head);

    // VISOR
    const visor = this.createBlock(0.05, 0.28, 0.06, new THREE.MeshLambertMaterial({ color: 0x333333 }));
    visor.position.set(0.25, 0, 0.02); 
    head.add(visor);

    // NOSE
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.15, 4), skinMat);
    nose.rotation.z = -Math.PI / 2;
    nose.rotation.x = Math.PI / 4; 
    nose.position.set(0.23, 0, -0.06); 
    head.add(nose);

    // EARS
    const earGeo = new THREE.BoxGeometry(0.08, 0.03, 0.12);
    const earL = new THREE.Mesh(earGeo, skinMat);
    earL.position.set(0, 0.22, 0); 
    head.add(earL);
    const earR = new THREE.Mesh(earGeo, skinMat);
    earR.position.set(0, -0.22, 0); 
    head.add(earR);

    // SIMPLE HAIRCUT (Bowl Cut)
    const hairGroup = new THREE.Group();
    head.add(hairGroup);

    // Main Cap
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat);
    hairCap.rotation.x = -0.2; 
    hairCap.position.set(-0.02, 0, 0.05);
    hairCap.scale.set(1.0, 0.95, 1.16);
    hairGroup.add(hairCap);

    // Bangs
    const bangs = this.createBlock(0.1, 0.28, 0.1, hairMat);
    bangs.position.set(0.20, 0, 0.18);
    bangs.rotation.y = 0.2; 
    hairGroup.add(bangs);

    // Sideburns
    const sbL = this.createBlock(0.12, 0.04, 0.15, hairMat);
    sbL.position.set(0.05, 0.26, 0); // +Y Left
    hairGroup.add(sbL);

    const sbR = this.createBlock(0.12, 0.04, 0.15, hairMat);
    sbR.position.set(0.05, -0.26, 0); // -Y Right
    hairGroup.add(sbR);


    // 5. Arms
    const createArm = (isLeft: boolean) => {
        const yDir = isLeft ? 1 : -1;
        const shoulderGroup = new THREE.Group();
        shoulderGroup.position.set(0, 0.25 * yDir, 0.3); 
        chest.add(shoulderGroup);

        const upperArm = this.createBlock(0.14, 0.14, 0.38, bodyMat);
        upperArm.geometry.translate(0, 0, -0.19); 
        shoulderGroup.add(upperArm);

        const lowerArm = this.createBlock(0.11, 0.11, 0.35, skinMat);
        lowerArm.geometry.translate(0, 0, -0.175); 
        lowerArm.position.z = -0.38;
        upperArm.add(lowerArm);

        if (!isLeft) {
            const swordGroup = new THREE.Group();
            swordGroup.position.z = -0.35;
            
            const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.15).rotateZ(Math.PI/2), new THREE.MeshLambertMaterial({color: 0x444444}));
            handle.position.x = 0.075;
            
            const guard = this.createBlock(0.02, 0.15, 0.05, new THREE.MeshLambertMaterial({color: 0xFFD700}));
            guard.position.x = 0.16;

            const blade = this.createBlock(0.6, 0.06, 0.02, new THREE.MeshLambertMaterial({color: 0xEEEEEE}));
            blade.position.x = 0.46;

            swordGroup.add(handle, guard, blade);
            lowerArm.add(swordGroup);
        }

        return { shoulder: shoulderGroup, upper: upperArm, lower: lowerArm };
    };

    const armL = createArm(true);
    const armR = createArm(false);

    return {
        pelvis, abdomen, chest, head: headGroup as unknown as THREE.Mesh,
        shoulderL: armL.shoulder, upperArmL: armL.upper, lowerArmL: armL.lower,
        shoulderR: armR.shoulder, upperArmR: armR.upper, lowerArmR: armR.lower,
        hipL: legL.hip, upperLegL: legL.upper, lowerLegL: legL.lower,
        hipR: legR.hip, upperLegR: legR.upper, lowerLegR: legR.lower,
    };
  }

  public update(dt: number, input: InputState) {
    this.currentState.update(dt, input);

    // Physics
    this.velocity.z -= GAME_CONFIG.GRAVITY * dt;

    this.mesh.position.x += this.velocity.x * dt;
    this.mesh.position.y += this.velocity.y * dt;
    this.mesh.position.z += this.velocity.z * dt;

    // Floor
    if (this.mesh.position.z < 0) {
      this.mesh.position.z = 0;
      this.velocity.z = 0;
      this.onGround = true;
    }
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position;
  }
}
