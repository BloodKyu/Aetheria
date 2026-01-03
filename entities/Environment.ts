
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
    // PlaneGeometry defaults to XY plane. 
    // In Z-Up world, ground IS the XY plane.
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshLambertMaterial({ color: COLORS.GROUND });
    const ground = new THREE.Mesh(geometry, material);
    // No rotation needed for Z-up!
    ground.receiveShadow = true;
    this.mesh.add(ground);
  }

  private buildTrees() {
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 1.5, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: COLORS.TREE_TRUNK });
    const leavesGeo = new THREE.ConeGeometry(1.5, 3, 8);
    const leavesMat = new THREE.MeshLambertMaterial({ color: COLORS.TREE_LEAVES });

    // Rotate geometries to align with Z-up (Cylinder/Cone defaults to Y-up)
    trunkGeo.rotateX(Math.PI / 2);
    leavesGeo.rotateX(Math.PI / 2);

    for (let i = 0; i < 20; i++) {
      const tree = new THREE.Group();
      
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.z = 0.75; // Move UP in Z
      
      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.z = 2.5; // Move UP in Z

      tree.add(trunk);
      tree.add(leaves);

      const x = (Math.random() - 0.5) * 80;
      const y = (Math.random() - 0.5) * 80; // Ground is XY
      if (Math.abs(x) > 5 || Math.abs(y) > 5) {
        tree.position.set(x, y, 0);
        this.mesh.add(tree);
      }
    }
  }

  private buildObstacles() {
    // BoxGeometry maps to (Front, Side, Up) in our logic, but local geometry is (X, Y, Z).
    // So 2, 2, 2 is a cube.
    const geo = new THREE.BoxGeometry(2, 2, 2);
    const mat = new THREE.MeshLambertMaterial({ color: COLORS.OBSTACLE });

    for (let i = 0; i < 5; i++) {
        const box = new THREE.Mesh(geo, mat);
        box.position.set(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60,
            1 // Center is at Z=1 (sitting on 0)
        );
        this.mesh.add(box);
    }
  }
}
