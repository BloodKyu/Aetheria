
import * as THREE from 'three';
import { COLORS } from '../constants';
import { Player } from './Player';

export class Enemy {
  public mesh: THREE.Group;
  public isDead: boolean = false;
  
  private health: number = 3;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private invincibilityTimer: number = 0;
  private flashTimer: number = 0;
  
  // Parts
  private bodyMat: THREE.MeshLambertMaterial;

  constructor(position: THREE.Vector3) {
    this.mesh = new THREE.Group();
    this.mesh.position.copy(position);

    // Procedural Mesh: A floating Sentinel
    this.bodyMat = new THREE.MeshLambertMaterial({ color: 0x5522AA }); // Purple enemy
    
    // Main Body (Diamond shape)
    const bodyGeo = new THREE.OctahedronGeometry(0.5, 0);
    const body = new THREE.Mesh(bodyGeo, this.bodyMat);
    body.position.z = 1.0;
    this.mesh.add(body);

    // Eye
    const eyeGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 }); // Glowing red eye
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(0.35, 0, 1.0); // Front of body
    this.mesh.add(eye);
    
    // Floating bits
    const ringGeo = new THREE.TorusGeometry(0.8, 0.05, 4, 8);
    ringGeo.rotateX(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshLambertMaterial({ color: 0x888888 }));
    ring.position.z = 1.0;
    this.mesh.add(ring);
  }

  public update(dt: number, player: Player) {
    if (this.isDead) return;

    // 1. Timers
    if (this.invincibilityTimer > 0) this.invincibilityTimer -= dt;
    if (this.flashTimer > 0) {
        this.flashTimer -= dt;
        if (this.flashTimer <= 0) {
            this.bodyMat.color.setHex(0x5522AA); // Reset color
            this.bodyMat.emissive.setHex(0x000000);
        }
    }

    // 2. Physics / Knockback decay
    // Apply friction to velocity (knockback sliding)
    this.velocity.x *= 0.9;
    this.velocity.y *= 0.9;
    this.velocity.z *= 0.9;

    this.mesh.position.addScaledVector(this.velocity, dt);

    // 3. AI: Look at and Chase Player
    if (this.invincibilityTimer <= 0) {
        const toPlayer = new THREE.Vector3().subVectors(player.getPosition(), this.mesh.position);
        toPlayer.z = 0; // Ignore height difference for movement
        
        const dist = toPlayer.length();
        
        // Face Player
        if (dist > 0.1) {
            const angle = Math.atan2(toPlayer.y, toPlayer.x);
            this.mesh.rotation.z = angle;
        }

        // Move towards player if far away, but stop if too close (hit range)
        if (dist > 1.5 && dist < 15) {
            const moveSpeed = 2.0;
            const dir = toPlayer.normalize();
            this.mesh.position.x += dir.x * moveSpeed * dt;
            this.mesh.position.y += dir.y * moveSpeed * dt;
        }
    }

    // Floating Animation
    const time = Date.now() * 0.002;
    this.mesh.children[0].position.z = 1.0 + Math.sin(time) * 0.1; // Body Bob
    this.mesh.children[2].rotation.z = time; // Ring spin
  }

  public takeDamage(amount: number, knockbackDir: THREE.Vector3) {
      if (this.invincibilityTimer > 0) return;

      this.health -= amount;
      this.invincibilityTimer = 0.5; // 0.5s i-frames
      
      // Visual Feedback
      this.flashTimer = 0.2;
      this.bodyMat.color.setHex(0xFFFFFF); // Flash White
      this.bodyMat.emissive.setHex(0xFF0000);

      // Knockback
      this.velocity.copy(knockbackDir).multiplyScalar(10); // Knockback force
      
      if (this.health <= 0) {
          this.die();
      }
  }

  private die() {
      this.isDead = true;
      // Shrink away
      const scaleDown = () => {
          if (this.mesh.scale.x > 0.1) {
              this.mesh.scale.multiplyScalar(0.9);
              requestAnimationFrame(scaleDown);
          } else {
              this.mesh.visible = false;
          }
      };
      scaleDown();
  }
}
