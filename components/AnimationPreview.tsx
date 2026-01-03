import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Player } from '../entities/Player';
import { AnimationConfig, StateID } from '../types';

interface Props {
    config: AnimationConfig;
    stateName: string; 
}

export const AnimationPreview: React.FC<Props> = ({ config, stateName }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<Player | null>(null);
    const frameIdRef = useRef<number>(0);
    const controlsRef = useRef<OrbitControls | null>(null);
    const stateNameRef = useRef(stateName);

    // Sync state name ref for the animation loop
    useEffect(() => {
        stateNameRef.current = stateName;
        // Trigger a reset on state change to ensure visual snap
        if (playerRef.current) {
            const p = playerRef.current;
            p.mesh.position.set(0,0,0);
            p.velocity.set(0,0,0);
            p.onGround = true;
            // Briefly switch to IDLE then to the target state logic handled in loop
            p.switchState(StateID.IDLE); 
        }
    }, [stateName]);

    // Sync config
    useEffect(() => {
        if (playerRef.current) {
            playerRef.current.animConfig = { ...config };
        }
    }, [config]);

    useEffect(() => {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = '';
        
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width || 300; 
        const height = rect.height || 200;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0x1a1a1a, 1);
        containerRef.current.appendChild(renderer.domElement);

        const scene = new THREE.Scene();

        // Grid
        const grid = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
        grid.rotateX(Math.PI / 2);
        scene.add(grid);

        const axes = new THREE.AxesHelper(1);
        scene.add(axes);
        
        const amb = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(amb);
        const dir = new THREE.DirectionalLight(0xffffff, 1);
        dir.position.set(-2, 5, 3);
        scene.add(dir);

        // Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
        camera.up.set(0, 0, 1);
        camera.position.set(-3.5, -3.5, 2.5); // Isometric-ish view
        camera.lookAt(0,0,1);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = true;
        controls.enableDamping = true;
        controls.target.set(0, 0, 1);
        controls.update();
        controlsRef.current = controls;

        const p = new Player();
        p.onGround = true;
        p.mesh.position.set(0, 0, 0);
        p.animConfig = { ...config }; 
        scene.add(p.mesh);
        playerRef.current = p;

        const clock = new THREE.Clock();
        
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            const dt = clock.getDelta();

            if (playerRef.current) {
                const p = playerRef.current;
                const targetState = stateNameRef.current;

                const mockInput = {
                    move: { x: 0, y: 0 },
                    jump: false,
                    attack: false,
                    blitz: false,
                    phase: false,
                    focus: false
                };

                // Continuous Input Simulation
                switch(targetState) {
                    case 'Run':
                        mockInput.move = { x: 0, y: -1 }; // Run Forward
                        break;
                    case 'Jump':
                        // If on ground, jump again
                        if (p.onGround) mockInput.jump = true;
                        break;
                    case 'Attack':
                        // If Idle, Attack again
                        if (p.getCurrentStateName() === 'IdleState') mockInput.attack = true;
                        break;
                    case 'Blitz':
                        if (p.getCurrentStateName() === 'IdleState') mockInput.blitz = true;
                        break;
                    case 'Phase':
                        mockInput.phase = true;
                        break;
                }

                p.update(dt, mockInput);
                
                // Keep player centered and on grid for preview
                p.mesh.position.x = 0;
                p.mesh.position.y = 0;
                
                // Reset loop for Run/Jump
                if (p.mesh.position.z < -2) {
                    p.mesh.position.z = 0;
                    p.velocity.set(0,0,0);
                    p.onGround = true;
                    p.switchState(StateID.IDLE);
                }
            }

            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const resizeObserver = new ResizeObserver(() => {
            if (containerRef.current && renderer) {
                const newW = containerRef.current.clientWidth;
                const newH = containerRef.current.clientHeight;
                if (newW > 0 && newH > 0) {
                    renderer.setSize(newW, newH);
                    camera.aspect = newW / newH;
                    camera.updateProjectionMatrix();
                }
            }
        });
        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(frameIdRef.current);
            renderer.dispose();
            if (containerRef.current) containerRef.current.innerHTML = '';
        };
    }, []);

    return <div ref={containerRef} className="w-full h-full" />;
};