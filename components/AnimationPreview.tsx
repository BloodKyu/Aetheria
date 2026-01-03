
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Player } from '../entities/Player';
import { AnimationConfig } from '../types';
import { COLORS } from '../constants';

interface Props {
    config: AnimationConfig;
    stateName: string; // 'Idle', 'Run', 'Attack', 'Jump', etc.
}

export const AnimationPreview: React.FC<Props> = ({ config, stateName }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const playerRef = useRef<Player | null>(null);
    const frameIdRef = useRef<number>(0);

    // Init Scene
    useEffect(() => {
        if (!containerRef.current) return;

        // 1. Setup
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(w, h);
        renderer.setClearColor(0x222222, 1);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Grid
        const grid = new THREE.GridHelper(10, 10, 0x444444, 0x333333);
        scene.add(grid);

        // Lights
        const amb = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(amb);
        const dir = new THREE.DirectionalLight(0xffffff, 1);
        dir.position.set(2, 5, 3);
        scene.add(dir);

        // Camera
        const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50);
        camera.position.set(3, 2, 4);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.target.set(0, 1, 0);
        controls.update();

        // Player
        const player = new Player();
        scene.add(player.mesh);
        playerRef.current = player;

        // Loop
        const clock = new THREE.Clock();
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            const dt = clock.getDelta();
            
            // Loop Logic:
            // Since we want to preview specific animations, we must feed inputs to trigger them.
            // Also we must reset position to keep them in view (treadmill).
            
            if (playerRef.current) {
                const p = playerRef.current;
                
                // Mock Input
                const mockInput = {
                    move: { x: 0, y: 0 },
                    jump: false,
                    attack: false,
                    blitz: false,
                    phase: false
                };

                // Override inputs based on requested state
                // This forces the state machine to transition naturally
                switch(stateName) {
                    case 'Run':
                        mockInput.move = { x: 0, y: 1 };
                        break;
                    case 'Jump':
                        // To loop jump, we might need to reset ground
                        if (p.onGround) mockInput.jump = true;
                        break;
                    case 'Attack':
                         // Attack is transient. We need to re-trigger it if back in Idle
                         if (p.getCurrentStateName() === 'IdleState') {
                             mockInput.attack = true;
                         }
                        break;
                    case 'Blitz':
                        if (p.getCurrentStateName() === 'IdleState') {
                            mockInput.blitz = true;
                        }
                        break;
                    case 'Phase':
                         // Phase is toggle based
                         mockInput.phase = true; // Input manager handles toggle, but here we feed raw state? 
                         // State machine checks `input.phase`. 
                         // Actually PhaseState checks `if (!input.phase) exit`. 
                         // So keeping it true holds the state.
                         break;
                }

                p.update(dt, mockInput);

                // Treadmill Effect: Keep player at center
                p.mesh.position.set(0, p.mesh.position.y, 0);
                
                // If it's a jump, we allow Y to change, but X/Z pinned.
                // If Run, we want animation but no displacement.
            }

            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(frameIdRef.current);
            renderer.dispose();
            if (containerRef.current) containerRef.current.innerHTML = '';
        };
    }, [stateName]); // Re-init if state changes? Or just logic. Actually dependency on stateName inside animate is via closure. 
    // Re-running effect is safer to reset player state.

    // Update Config Live
    useEffect(() => {
        if (playerRef.current) {
            playerRef.current.animConfig = { ...config };
        }
    }, [config]);

    return <div ref={containerRef} className="w-full h-64 rounded bg-gray-900 shadow-inner border border-gray-700" />;
};
