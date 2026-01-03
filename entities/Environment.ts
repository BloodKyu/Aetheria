import * as THREE from 'three';
import { COLORS } from '../constants';

export class Environment {
  public mesh: THREE.Group;

  constructor() {
    this.mesh = new THREE.Group();
    this.buildGround();
    this.buildTrees();
    this.buildObstacles();
  }

  private buildGround() {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshLambertMaterial({ color: COLORS.GROUND });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.mesh.add(ground);
  }

  private buildTrees() {
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 1.5, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: COLORS.TREE_TRUNK });
    const leavesGeo = new THREE.ConeGeometry(1.5, 3, 8);
    const leavesMat = new THREE.MeshLambertMaterial({ color: COLORS.TREE_LEAVES });

    for (let i = 0; i < 20; i++) {
      const tree = new THREE.Group();
      
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.75;
      
      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.y = 2.5;

      tree.add(trunk);
      tree.add(leaves);

      // Random Position excluding center
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      if (Math.abs(x) > 5 || Math.abs(z) > 5) {
        tree.position.set(x, 0, z);
        this.mesh.add(tree);
      }
    }
  }

  private buildObstacles() {
    const geo = new THREE.BoxGeometry(2, 2, 2);
    const mat = new THREE.MeshLambertMaterial({ color: COLORS.OBSTACLE });

    for (let i = 0; i < 5; i++) {
        const box = new THREE.Mesh(geo, mat);
        box.position.set(
            (Math.random() - 0.5) * 60,
            1,
            (Math.random() - 0.5) * 60
        );
        this.mesh.add(box);
    }
  }
}