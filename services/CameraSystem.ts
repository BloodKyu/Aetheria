
import * as THREE from 'three';
import { Player } from '../entities/Player';
import { InputState } from '../types';
import { GAME_CONFIG } from '../constants';

export class CameraSystem {
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    
    // Config
    private targetDistance = 10;
    private targetHeight = 5;
    private lookAtHeight = 1;
    private smoothSpeed = 5.0; // Lerp speed for position
    private rotationSpeed = 5.0; // Lerp speed for rotation

    // State
    private currentYaw: number = Math.PI; // Start behind player (assuming player faces +X or similar)
    private currentPitch: number = Math.PI / 6; // Slight look down
    private currentPosition: THREE.Vector3;
    
    // Collision
    private raycaster: THREE.Raycaster;

    constructor(camera: THREE.PerspectiveCamera, scene: THREE.Scene, initialPlayerPos: THREE.Vector3) {
        this.camera = camera;
        this.scene = scene;
        this.currentPosition = initialPlayerPos.clone().add(new THREE.Vector3(-10, 0, 10));
        this.raycaster = new THREE.Raycaster();
        
        // Initial setup
        this.updateCameraTransform(initialPlayerPos);
    }

    public update(dt: number, player: Player, input: InputState, obstacles: THREE.Object3D[], lockedTarget: THREE.Object3D | null) {
        const playerPos = player.getPosition();

        // 1. Z-TARGETING LOGIC
        if (lockedTarget) {
            // HARD LOCK: Camera positions behind player, looking at enemy
            // Vector from Player to Enemy
            const dx = lockedTarget.position.x - playerPos.x;
            const dy = lockedTarget.position.y - playerPos.y;
            
            // We want camera "behind" player relative to enemy line
            // Angle pointing from Enemy -> Player
            const angleEnemyToPlayer = Math.atan2(-dy, -dx);
            
            // Smoothly interpolate current Yaw to this optimal angle
            let diff = angleEnemyToPlayer - this.currentYaw;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            
            this.currentYaw += diff * dt * 5.0;

        } else if (input.focus) {
            // Manual Reset (Quick Turn)
            const targetYaw = player.mesh.rotation.z + Math.PI;
            
            let diff = targetYaw - this.currentYaw;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            
            this.currentYaw += diff * dt * 10; 
        }

        // 2. CALCULATE IDEAL POSITION
        // Convert Spherical (Yaw/Pitch/Dist) to Cartesian relative to Player
        const hDist = this.targetDistance * Math.cos(this.currentPitch);
        const vDist = this.targetDistance * Math.sin(this.currentPitch);

        const offsetX = hDist * Math.cos(this.currentYaw);
        const offsetY = hDist * Math.sin(this.currentYaw);

        const idealPosition = new THREE.Vector3(
            playerPos.x + offsetX,
            playerPos.y + offsetY,
            playerPos.z + this.targetHeight // Base height offset
        );

        // 3. COLLISION DETECTION (Spring Arm)
        // Raycast from Player Head to Ideal Camera Position
        const playerHeadPos = playerPos.clone().add(new THREE.Vector3(0, 0, this.lookAtHeight));
        const dirToCam = new THREE.Vector3().subVectors(idealPosition, playerHeadPos);
        const distToCam = dirToCam.length();
        dirToCam.normalize();

        this.raycaster.set(playerHeadPos, dirToCam);
        this.raycaster.far = distToCam;

        const intersects = this.raycaster.intersectObjects(obstacles, true);

        let finalPosition = idealPosition;

        if (intersects.length > 0) {
            // Hit a wall!
            const hit = intersects[0];
            const pullIn = dirToCam.multiplyScalar(-0.5); // 0.5 unit buffer
            finalPosition = hit.point.add(pullIn);
        }

        // 4. APPLY SMOOTHING
        this.currentPosition.lerp(finalPosition, dt * this.smoothSpeed);
        
        // 5. UPDATE CAMERA OBJECT
        this.camera.position.copy(this.currentPosition);
        
        // Look At logic
        if (lockedTarget) {
            // Look at midpoint between player and enemy to keep both in view
            const midPoint = new THREE.Vector3().lerpVectors(playerPos, lockedTarget.position, 0.5);
            midPoint.z += 1.0; // Look slightly up
            
            // Smooth lookat
            const currentLook = new THREE.Vector3(0,0,-1).applyQuaternion(this.camera.quaternion).add(this.camera.position);
            currentLook.lerp(midPoint, dt * 5.0);
            this.camera.lookAt(currentLook);
        } else {
            // Standard Look At Player
            const lookAtTarget = playerPos.clone().add(new THREE.Vector3(0, 0, this.lookAtHeight));
            this.camera.lookAt(lookAtTarget);
        }
    }

    private updateCameraTransform(target: THREE.Vector3) {
        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(target);
    }
}
