
import * as THREE from 'three';
import { Player } from '../entities/Player';
import { Environment } from '../entities/Environment';
import { inputManager } from './InputManager';
import { debugManager } from './DebugManager';
import { GAME_CONFIG, COLORS } from '../constants';

export class GameEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  private animationId: number = 0;
  
  private player: Player;
  private environment: Environment;
  private debugUnsub: () => void;

  constructor(container: HTMLElement) {
    this.container = container;
    
    // 1. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setSize(GAME_CONFIG.INTERNAL_WIDTH, GAME_CONFIG.INTERNAL_HEIGHT, false);
    
    // Force canvas to fill parent container (Fullscreen fix)
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    
    // Important: The canvas in DOM will be scaled up by CSS, so we keep internal buffer small
    // to mimic N64 resolution and "pixelated" filter.
    this.renderer.setClearColor(COLORS.SKY);
    
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
    dirLight.position.set(10, 20, 10);
    this.scene.add(dirLight);

    // 5. Entities
    this.environment = new Environment();
    this.scene.add(this.environment.mesh);

    this.player = new Player();
    this.scene.add(this.player.mesh);
    
    // Listen for Debug Updates
    this.debugUnsub = debugManager.subscribeApply((config) => {
        this.player.animConfig = config;
    });

    // 6. Utils
    this.clock = new THREE.Clock();
    
    // 7. Events
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Start
    this.loop();
  }

  private handleResize() {
    // We maintain the internal low resolution, but the CSS handles the display size.
    // However, if we wanted to support responsive ASPECT RATIO change on the low-res buffer:
    // Ideally N64 games were 4:3. We can force 4:3 or allow widescreen. 
    // Let's stick to the container's aspect ratio but render at low res.
    
    // Calculate aspect ratio of the container (screen)
    const aspect = this.container.clientWidth / this.container.clientHeight;
    
    // Update camera
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    // Re-set size? No, strictly stick to 320 width, calculate height based on aspect?
    // Or stick to fixed 320x240 and stretch? 
    // Best practice for "Modern Retro": Fixed vertical resolution (e.g. 240p), dynamic width.
    const renderHeight = GAME_CONFIG.INTERNAL_HEIGHT;
    const renderWidth = Math.floor(renderHeight * aspect);
    
    this.renderer.setSize(renderWidth, renderHeight, false);
  }

  private updateCamera() {
    const playerPos = this.player.getPosition();
    
    // Simple Follow Camera
    const offset = new THREE.Vector3(
      GAME_CONFIG.CAMERA_OFFSET.x,
      GAME_CONFIG.CAMERA_OFFSET.y,
      GAME_CONFIG.CAMERA_OFFSET.z
    );
    
    this.camera.position.copy(playerPos).add(offset);
    this.camera.lookAt(
        playerPos.x + GAME_CONFIG.CAMERA_LOOK_AT_OFFSET.x,
        playerPos.y + GAME_CONFIG.CAMERA_LOOK_AT_OFFSET.y,
        playerPos.z + GAME_CONFIG.CAMERA_LOOK_AT_OFFSET.z
    );
  }

  private loop() {
    this.animationId = requestAnimationFrame(this.loop.bind(this));
    
    const dt = Math.min(this.clock.getDelta(), 0.1); // Cap delta to avoid huge jumps
    const input = inputManager.getState();

    this.player.update(dt, input);
    this.updateCamera();

    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.handleResize.bind(this));
    if (this.debugUnsub) this.debugUnsub();
    this.container.removeChild(this.renderer.domElement);
    this.renderer.dispose();
  }
}
