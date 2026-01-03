
import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './services/GameEngine';
import { MobileControls } from './components/MobileControls';
import { DebugUI } from './components/DebugUI';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    // Detect mobile touch capability
    const checkMobile = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(hasTouch);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Init Engine
    if (containerRef.current && !engineRef.current) {
      engineRef.current = new GameEngine(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Game Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full flex items-center justify-center"
      />
      
      {/* UI Overlay */}
      <div className="absolute top-4 right-4 pointer-events-none text-white font-bold text-right drop-shadow-md z-10">
        <h1 className="text-2xl tracking-widest text-yellow-400" style={{ textShadow: '2px 2px #aa0000' }}>RETRO QUEST</h1>
        <p className="text-sm opacity-80">EARLY BUILD v0.1</p>
        <p className="text-xs opacity-60 mt-1 hidden md:block">WASD to Move • SPACE to Jump • F to Attack</p>
      </div>

      {/* Animation Debugger */}
      <DebugUI />

      {/* Mobile Controls Overlay */}
      {isMobile && <MobileControls />}
      
      {/* Scanline Effect Overlay (CSS Trick) */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20 z-20" />
    </div>
  );
}

export default App;
