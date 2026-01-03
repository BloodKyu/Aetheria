
import * as THREE from 'three';
import { Player } from '../entities/Player';
import { Environment } from '../entities/Environment';
import { Enemy } from '../entities/Enemy';
import { Collectible } from '../entities/Collectible';
import { inputManager } from './InputManager';
import { debugManager } from './DebugManager';
import { audioSystem } from './AudioSystem';
import { GAME_CONFIG, COLORS } from '../constants';
import { CameraSystem } from './CameraSystem';
import { GameState, InputState } from '../types';

export class GameEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  private animationId: number = 0;
  
  private player: Player;
  private enemies: Enemy[] = [];
  private collectibles: Collectible[] = [];
  private environment: Environment;
  private cameraSystem: CameraSystem;
  
  // Targeting
  private reticle: THREE.Mesh;
  private hardTarget: Enemy | null = null;
  private softTarget: Enemy | null = null;
  
  private score: number = 0;
  private debugUnsub: () => void;
  private onStateChange?: (state: GameState) => void;

  // SPAWN CONFIG
  private readonly START_POS = new THREE.Vector3(0, -15, 0);

  constructor(container: HTMLElement, onStateChange?: (state: GameState) => void) {
    this.container = container;
    this.onStateChange = onStateChange;
    
    // 0. GLOBAL Z-UP CONFIGURATION
    THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

    // 1. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setSize(GAME_CONFIG.INTERNAL_WIDTH, GAME_CONFIG.INTERNAL_HEIGHT, false);
    
    // Force canvas to fill parent container (Fullscreen fix)
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    
    this.renderer.setClearColor(COLORS.SKY);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;
    
    // Append to DOM
    this.container.appendChild(this.renderer.domElement);
    
    // 2. Setup Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(GAME_CONFIG.FOG_COLOR, GAME_CONFIG.FOG_NEAR, GAME_CONFIG.FOG_FAR);

    // 3. Setup Camera
    this.camera = new THREE.PerspectiveCamera(60, GAME_CONFIG.INTERNAL_WIDTH / GAME_CONFIG.INTERNAL_HEIGHT, 0.1, 1000);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    // Light coming from sun (High Z, angled)
    dirLight.position.set(-10, 20, 30);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    // 5. Entities
    this.environment = new Environment();
    this.scene.add(this.environment.mesh);

    this.player = new Player();
    this.player.mesh.position.copy(this.START_POS); // Set initial position
    this.scene.add(this.player.mesh);
    
    this.spawnEntities();

    // 6. Targeting UI (Reticle)
    const retGeo = new THREE.RingGeometry(0.3, 0.4, 32);
    const retMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthTest: false });
    this.reticle = new THREE.Mesh(retGeo, retMat);
    this.reticle.renderOrder = 999; // Draw on top
    this.reticle.visible = false;
    this.scene.add(this.reticle);

    // 7. Systems
    this.cameraSystem = new CameraSystem(this.camera, this.scene, this.player.getPosition());

    // Listen for Debug Updates
    this.debugUnsub = debugManager.subscribeApply((config) => {
        this.player.animConfig = config;
    });

    // 8. Utils
    this.clock = new THREE.Clock();
    
    // 9. Events
    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('mousedown', this.initAudio.bind(this));
    window.addEventListener('keydown', this.handleGlobalKeys.bind(this));
    
    // Start
    this.loop();
  }

  private initAudio() {
    audioSystem.init();
    window.removeEventListener('mousedown', this.initAudio.bind(this));
  }
  
  private handleGlobalKeys(e: KeyboardEvent) {
      // Reload on R
      if (e.key.toLowerCase() === 'r') {
          this.resetGame();
      }
      this.initAudio();
  }

  private resetGame() {
      // 1. Reset Player
      this.player.reset(this.START_POS);
      
      // 2. Clear Entities
      this.enemies.forEach(e => this.scene.remove(e.mesh));
      this.enemies = [];
      this.collectibles.forEach(c => this.scene.remove(c.mesh));
      this.collectibles = [];
      
      // 3. Respawn
      this.spawnEntities();
      
      // 4. Reset Score
      this.score = 0;
      
      // 5. Reset Camera target
      this.hardTarget = null;
      this.softTarget = null;
      
      audioSystem.play('collect'); // Feedback
  }

  private spawnEntities() {
      // Enemies
      const enemyPositions = [
          new THREE.Vector3(5, 5, 0.5),
          new THREE.Vector3(-15, 8, 0.5),
          new THREE.Vector3(0, 10, 4.5) // On top of temple
      ];

      enemyPositions.forEach(pos => {
          const enemy = new Enemy(pos);
          this.enemies.push(enemy);
          this.scene.add(enemy.mesh);
      });

      // Collectibles
      const gemPositions = [
          new THREE.Vector3(0, -5, 1),
          new THREE.Vector3(0, 10, 6), // Top of temple
          new THREE.Vector3(-12, 12, 7.5), // High platform
          new THREE.Vector3(-18, 5, 5.5), // Mid platform
      ];

      gemPositions.forEach(pos => {
          const gem = new Collectible(pos, 0x00FFFF); // Cyan gems
          this.collectibles.push(gem);
          this.scene.add(gem.mesh);
      });
  }

  private handleResize() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    const renderHeight = GAME_CONFIG.INTERNAL_HEIGHT;
    const renderWidth = Math.floor(renderHeight * aspect);
    this.renderer.setSize(renderWidth, renderHeight, false);
  }

  private updateTargeting(dt: number, input: InputState) {
      // 1. Find Best Candidate (Soft Lock)
      // Filter visible enemies within range
      let bestCandidate: Enemy | null = null;
      let closestDist = 20; // Max Lock Range

      const playerPos = this.player.getPosition();
      const playerFwd = new THREE.Vector3(1,0,0).applyAxisAngle(new THREE.Vector3(0,0,1), this.player.mesh.rotation.z);

      this.enemies.forEach(e => {
          if (e.isDead) return;
          const dist = e.mesh.position.distanceTo(playerPos);
          if (dist < closestDist) {
              // Check angle (must be somewhat in front)
              const toEnemy = new THREE.Vector3().subVectors(e.mesh.position, playerPos).normalize();
              const dot = playerFwd.dot(toEnemy);
              if (dot > 0.3) { // 0.3 is fairly wide FOV
                 closestDist = dist;
                 bestCandidate = e;
              }
          }
      });
      
      this.softTarget = bestCandidate;

      // 2. Handle Lock Logic (Hard Lock)
      if (input.focus) {
          // If we have a soft target and no hard target, LOCK IT
          if (this.softTarget && !this.hardTarget) {
              this.hardTarget = this.softTarget;
          }
          // If hard target dies or gets too far, unlock
          if (this.hardTarget) {
              if (this.hardTarget.isDead || this.hardTarget.mesh.position.distanceTo(playerPos) > 25) {
                  this.hardTarget = null;
              }
          }
      } else {
          // Release lock
          this.hardTarget = null;
      }

      // 3. Update Visuals
      const target = this.hardTarget || this.softTarget;
      
      if (target) {
          this.reticle.visible = true;
          this.reticle.position.copy(target.mesh.position);
          this.reticle.position.z += 1.2; // Float above head
          this.reticle.lookAt(this.camera.position); // Billboard
          
          const mat = this.reticle.material as THREE.MeshBasicMaterial;
          if (this.hardTarget) {
              // Red + Rotating
              mat.color.setHex(0xFF0000);
              this.reticle.rotation.z += dt * 5;
          } else {
              // Yellow + Pulse
              mat.color.setHex(0xFFFF00);
              const scale = 1.0 + Math.sin(Date.now() * 0.01) * 0.2;
              this.reticle.scale.set(scale, scale, scale);
          }
      } else {
          this.reticle.visible = false;
      }
      
      // 4. Pass Target to Player for Strafing
      this.player.lockTarget = this.hardTarget ? this.hardTarget.mesh.position : null;
  }

  private checkCombat() {
      // Clean up dead enemies
      for (let i = this.enemies.length - 1; i >= 0; i--) {
          if (this.enemies[i].isDead && !this.enemies[i].mesh.visible) {
              this.scene.remove(this.enemies[i].mesh);
              this.enemies.splice(i, 1);
          }
      }
      
      const playerPos = this.player.getPosition();
      
      // 1. Enemy -> Player Damage
      if (this.player.health > 0) {
          this.enemies.forEach(enemy => {
             if (enemy.isDead) return;
             // Simple Distance check for now as enemies are spherical
             const dist = enemy.mesh.position.distanceTo(playerPos);
             if (dist < 1.0) {
                 const knockDir = new THREE.Vector3().subVectors(playerPos, enemy.mesh.position).normalize();
                 this.player.takeDamage(1, knockDir);
             }
          });
      }

      // 2. Player -> Enemy Damage
      if (!this.player.isHitActive) return;

      const attackRange = 2.5; // Sword length approximation
      const forward = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0,0,1), this.player.mesh.rotation.z);

      this.enemies.forEach(enemy => {
          if (enemy.isDead) return;

          const toEnemy = new THREE.Vector3().subVectors(enemy.mesh.position, playerPos);
          const dist = toEnemy.length();

          if (dist < attackRange) {
              // Check angle (Dot product)
              toEnemy.normalize();
              const angle = forward.dot(toEnemy);
              
              if (angle > 0.4) {
                  enemy.takeDamage(1, forward);
                  audioSystem.play('enemy_hit', 0.6);
              }
          }
      });
  }

  private checkCollectibles() {
      const pBox = this.player.getBoundingBox();
      this.collectibles.forEach(c => {
          if (c.checkCollection(pBox)) {
              this.score += 1;
              audioSystem.play('collect', 0.4, 1.0 + Math.random() * 0.2);
          }
      });
  }

  private loop() {
    this.animationId = requestAnimationFrame(this.loop.bind(this));
    
    const dt = Math.min(this.clock.getDelta(), 0.1); 
    const input = inputManager.getState();
    
    // Logic Updates
    this.updateTargeting(dt, input);

    // Pass environment colliders to player for physics
    // Pass CAMERA for relative movement
    this.player.update(dt, input, this.environment.getColliders(), this.camera);
    
    this.enemies.forEach(e => e.update(dt, this.player));
    this.collectibles.forEach(c => c.update(dt));

    this.checkCombat();
    this.checkCollectibles();

    // Update Camera System
    // We pass the hardTarget mesh to the camera system for "Z-Targeting" focus
    this.cameraSystem.update(dt, this.player, input, [this.environment.mesh], this.hardTarget ? this.hardTarget.mesh : null);

    this.renderer.render(this.scene, this.camera);
    
    // Broadcast State
    if (this.onStateChange) {
        this.onStateChange({
            health: this.player.health,
            maxHealth: this.player.maxHealth,
            score: this.score,
            isGameOver: this.player.health <= 0
        });
    }
  }

  public dispose() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.handleResize.bind(this));
    if (this.debugUnsub) this.debugUnsub();
    this.container.removeChild(this.renderer.domElement);
    this.renderer.dispose();
  }
}
