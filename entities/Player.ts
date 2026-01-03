import * as THREE from 'three';
import { InputState, AnimationConfig } from '../types';
import { GAME_CONFIG, COLORS } from '../constants';
import { PlayerState } from './player_states/State';
import { IdleState } from './player_states/IdleState';

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
    runAnimSpeed: 0.75,
    armShoulderAmp: 1.20,
    armSyncPhase: -1.54,
    armElbowBase: -1.50,
    armElbowAmp: 0.35,
    elbowPhase: 0.01,
    armZOffset: 0.46,
    torsoTwist: 0.30,
    headStabilize: 0.80
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
    this.onGround = false;
    this.mesh = new THREE.Group();
    this.parts = this.createProceduralMesh();
    this.animConfig = { ...DEFAULT_ANIM_CONFIG };
    
    // Initialize State
    this.currentState = new IdleState(this);
    this.currentState.enter();
  }

  public setState(newState: PlayerState) {
      this.currentState.exit();
      this.currentState = newState;
      this.currentState.enter();
  }
  
  public getCurrentStateName(): string {
      return this.currentState.constructor.name;
  }

  private createFaceTexture(): THREE.CanvasTexture {
    const size = 32; 
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
        ctx.fillStyle = '#ffccaa';
        ctx.fillRect(0, 0, size, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  private createProceduralMesh(): PlayerParts {
    const bodyMat = new THREE.MeshLambertMaterial({ color: COLORS.PLAYER });
    const skinMat = new THREE.MeshLambertMaterial({ color: COLORS.PLAYER_HEAD });
    const hairMat = new THREE.MeshLambertMaterial({ color: COLORS.HAIR });
    const shoeMat = new THREE.MeshLambertMaterial({ color: COLORS.SHOES });
    const shortsMat = new THREE.MeshLambertMaterial({ color: COLORS.SHORTS });
    const visorMat = new THREE.MeshLambertMaterial({ color: 0x111111 }); 
    
    const faceTexture = this.createFaceTexture();
    const headMat = new THREE.MeshLambertMaterial({ map: faceTexture });

    const createSegment = (w: number, h: number, d: number, mat: THREE.Material) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      geo.translate(0, -h / 2, 0);
      return new THREE.Mesh(geo, mat);
    };

    // 1. Pelvis
    const pelvisGeo = new THREE.BoxGeometry(0.38, 0.22, 0.26);
    const pelvis = new THREE.Mesh(pelvisGeo, shortsMat);
    pelvis.position.y = 1.0; 
    this.mesh.add(pelvis);

    // 2. Legs
    const createLeg = (isLeft: boolean) => {
        const sideSign = isLeft ? -1 : 1;
        const hipGroup = new THREE.Group();
        hipGroup.position.set(0.12 * sideSign, -0.1, 0); 
        pelvis.add(hipGroup);

        const upperLeg = createSegment(0.20, 0.42, 0.20, shortsMat);
        hipGroup.add(upperLeg);

        const lowerLeg = createSegment(0.14, 0.38, 0.14, skinMat);
        lowerLeg.position.y = -0.4;
        upperLeg.add(lowerLeg);

        const kneeCuff = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.12, 0.21), shortsMat);
        kneeCuff.position.y = -0.05; 
        lowerLeg.add(kneeCuff);

        const footGeo = new THREE.BoxGeometry(0.16, 0.12, 0.26);
        footGeo.translate(0, -0.06, 0.05); 
        const foot = new THREE.Mesh(footGeo, shoeMat);
        foot.position.y = -0.38;
        lowerLeg.add(foot);

        return { hip: hipGroup, upper: upperLeg, lower: lowerLeg };
    };

    const legL = createLeg(true);
    const legR = createLeg(false);

    // 3. Torso
    const abdomen = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.25, 0.22), bodyMat);
    abdomen.geometry.translate(0, 0.125, 0); 
    abdomen.position.y = 0.1;
    pelvis.add(abdomen);

    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.3), bodyMat);
    chest.geometry.translate(0, 0.175, 0); 
    chest.position.y = 0.25; 
    abdomen.add(chest);

    // 4. Head Group
    const headGroup = new THREE.Group();
    headGroup.position.y = 0.35; 
    chest.add(headGroup);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.15, 8);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 0.075; 
    headGroup.add(neck);

    // Head
    const headGeo = new THREE.SphereGeometry(0.24, 12, 10); 
    headGeo.scale(1, 1.25, 1); 
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.35;
    head.rotation.y = Math.PI; 
    headGroup.add(head);

    // Hair
    const hairCapGeo = new THREE.SphereGeometry(0.25, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.45);
    hairCapGeo.scale(1, 1.2, 1.1);
    const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
    head.add(hairCap); 
    const sideburnGeo = new THREE.BoxGeometry(0.06, 0.2, 0.1);
    const sideburnL = new THREE.Mesh(sideburnGeo, hairMat);
    sideburnL.position.set(-0.23, -0.05, 0);
    head.add(sideburnL);
    const sideburnR = new THREE.Mesh(sideburnGeo, hairMat);
    sideburnR.position.set(0.23, -0.05, 0);
    head.add(sideburnR);

    // Visor
    const visorGeo = new THREE.BoxGeometry(0.32, 0.08, 0.06); 
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, -0.08, -0.20);
    head.add(visor);

    // Nose/Ears
    const noseGeo = new THREE.ConeGeometry(0.04, 0.12, 4);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.rotation.x = Math.PI / 2; 
    nose.rotation.y = Math.PI / 4; 
    nose.position.set(0, -0.15, -0.22); 
    head.add(nose);
    const earGeo = new THREE.SphereGeometry(0.07, 6, 4);
    const earL = new THREE.Mesh(earGeo, skinMat);
    earL.position.set(-0.24, 0, 0.05);
    head.add(earL);
    const earR = new THREE.Mesh(earGeo, skinMat);
    earR.position.set(0.24, 0, 0.05);
    head.add(earR);

    // 5. Arms
    const createArm = (isLeft: boolean) => {
        const sideSign = isLeft ? -1 : 1;
        const shoulderGroup = new THREE.Group();
        shoulderGroup.position.set(0.25 * sideSign, 0.3, 0); 
        chest.add(shoulderGroup);

        const upperArm = createSegment(0.14, 0.38, 0.14, bodyMat);
        shoulderGroup.add(upperArm);

        const lowerArm = createSegment(0.11, 0.35, 0.11, skinMat); 
        lowerArm.position.y = -0.38;
        upperArm.add(lowerArm);

        const handGeo = new THREE.SphereGeometry(0.1, 6, 4);
        const hand = new THREE.Mesh(handGeo, skinMat);
        hand.position.y = -0.35;
        lowerArm.add(hand);

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
    // 1. Delegate to State
    this.currentState.update(dt, input);

    // 2. Physics Integration (Gravity & Position)
    // Note: States set Velocity, Player integrates Position
    this.velocity.y -= GAME_CONFIG.GRAVITY * dt;

    this.mesh.position.x += this.velocity.x * dt;
    this.mesh.position.y += this.velocity.y * dt;
    this.mesh.position.z += this.velocity.z * dt;

    // Floor Collision
    if (this.mesh.position.y < 0) {
      this.mesh.position.y = 0;
      this.velocity.y = 0;
      this.onGround = true;
    }
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position;
  }
}