
import * as THREE from 'three';
import { COLORS } from '../constants';

export class Environment {
  public mesh: THREE.Group;
  public colliders: THREE.Box3[] = [];

  constructor() {
    this.mesh = new THREE.Group();
    this.buildLevel();
  }

  public getColliders(): THREE.Box3[] {
      return this.colliders;
  }

  private buildLevel() {
    // 1. Ground Plane
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshLambertMaterial({ color: COLORS.GROUND });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    this.mesh.add(ground);
    
    // Physics: Ground is handled by z < 0 check in Player, but let's add a floor box just in case we want pits later.
    // For now, infinite floor at Z=0 is handled in Player.ts, so we skip adding a collider for the main ground to save checks.

    // 2. Structures
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const woodMat = new THREE.MeshLambertMaterial({ color: COLORS.TREE_TRUNK });
    const grassMat = new THREE.MeshLambertMaterial({ color: COLORS.TREE_LEAVES });

    // Helper to create a solid block
    const addBlock = (x: number, y: number, z: number, w: number, h: number, d: number, mat: THREE.Material) => {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, mat);
        // BoxGeometry centers at 0,0,0. We want z to be bottom aligned usually, but let's stick to center
        // Center position provided.
        mesh.position.set(x, y, z + d/2); // z param is floor level
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.mesh.add(mesh);

        // Compute World AABB
        const box = new THREE.Box3().setFromObject(mesh);
        this.colliders.push(box);
    };

    // --- Training Ground Layout ---

    // North Wall
    addBlock(0, 40, 0, 80, 2, 8, stoneMat);
    // South Wall
    addBlock(0, -40, 0, 80, 2, 8, stoneMat);
    // East Wall
    addBlock(40, 0, 0, 2, 80, 8, stoneMat);
    // West Wall
    addBlock(-40, 0, 0, 2, 80, 8, stoneMat);

    // Central Temple Base
    addBlock(0, 10, 0, 12, 12, 4, stoneMat);
    
    // Upper Temple Platform
    addBlock(0, 10, 4, 8, 8, 1, stoneMat);

    // Ramp (Constructed of small steps for AABB simplicity)
    for(let i=0; i<8; i++) {
        // Stairs leading up to the base (Height 4)
        addBlock(0, -2 + i, i * 0.5, 6, 1, 0.5, stoneMat);
    }

    // Floating Platforms (Jump Training)
    // Low
    addBlock(-12, 0, 2, 4, 4, 0.5, woodMat);
    // Medium
    addBlock(-18, 5, 4, 4, 4, 0.5, woodMat);
    // High
    addBlock(-12, 12, 6, 4, 4, 0.5, woodMat);

    // Tree Clusters
    this.addTreeCluster(20, 20);
    this.addTreeCluster(-25, -25);
    this.addTreeCluster(25, -20);
  }

  private addTreeCluster(cx: number, cy: number) {
      const trunkMat = new THREE.MeshLambertMaterial({ color: COLORS.TREE_TRUNK });
      const leavesMat = new THREE.MeshLambertMaterial({ color: COLORS.TREE_LEAVES });

      for(let i=0; i<3; i++) {
          const x = cx + (Math.random() - 0.5) * 8;
          const y = cy + (Math.random() - 0.5) * 8;
          
          const trunkH = 2 + Math.random();
          const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, trunkH, 6);
          trunkGeo.rotateX(Math.PI/2);
          
          const trunk = new THREE.Mesh(trunkGeo, trunkMat);
          trunk.position.set(x, y, trunkH/2);
          this.mesh.add(trunk);

          const leavesGeo = new THREE.ConeGeometry(2, 4, 8);
          leavesGeo.rotateX(Math.PI/2);
          const leaves = new THREE.Mesh(leavesGeo, leavesMat);
          leaves.position.set(x, y, trunkH + 1.5);
          this.mesh.add(leaves);

          // Tree Collider (Trunk only)
          const box = new THREE.Box3();
          box.setFromCenterAndSize(new THREE.Vector3(x, y, trunkH/2), new THREE.Vector3(1, 1, trunkH));
          this.colliders.push(box);
      }
  }
}
