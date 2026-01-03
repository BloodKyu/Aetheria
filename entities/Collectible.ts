
import * as THREE from 'three';

export class Collectible {
    public mesh: THREE.Mesh;
    public isCollected: boolean = false;
    private box: THREE.Box3;
    private floatOffset: number;
    private baseZ: number;

    constructor(position: THREE.Vector3, color: number = 0xFFD700) {
        const geo = new THREE.OctahedronGeometry(0.3, 0);
        const mat = new THREE.MeshLambertMaterial({ color: color, emissive: 0x444444 });
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.position.copy(position);
        this.baseZ = position.z;
        this.floatOffset = Math.random() * 100;

        this.box = new THREE.Box3();
        this.updateBox();
    }

    public update(dt: number) {
        if (this.isCollected) return;

        // Animate
        const time = Date.now() * 0.003;
        this.mesh.rotation.z = time;
        this.mesh.position.z = this.baseZ + Math.sin(time + this.floatOffset) * 0.2;
        this.updateBox();
    }

    public checkCollection(playerBox: THREE.Box3): boolean {
        if (this.isCollected) return false;
        
        if (this.box.intersectsBox(playerBox)) {
            this.collect();
            return true;
        }
        return false;
    }

    private updateBox() {
        // slightly larger hit box than visual
        const size = 0.5;
        this.box.min.set(this.mesh.position.x - size, this.mesh.position.y - size, this.mesh.position.z - size);
        this.box.max.set(this.mesh.position.x + size, this.mesh.position.y + size, this.mesh.position.z + size);
    }

    private collect() {
        this.isCollected = true;
        // Simple "poof" effect animation could go here, for now just hide
        this.mesh.visible = false;
        
        // Flash up scale effect
        // (In a real engine, we'd spawn a ParticleSystem here)
    }
}
