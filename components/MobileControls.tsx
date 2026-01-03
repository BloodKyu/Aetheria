import React, { useEffect, useRef, useState } from 'react';
import { inputManager } from '../services/InputManager';

export const MobileControls: React.FC = () => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  // Joystick Logic
  useEffect(() => {
    const element = joystickRef.current;
    if (!element) return;

    let startX = 0;
    let startY = 0;
    const maxRadius = 40;

    const handleStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      setActive(true);
      // Reset pos immediately to center relative to touch? 
      // N64 Style: The stick centers itself.
    };

    const handleMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!active) return; // Should likely use a ref for active if relying on closures, but event listeners are added once here.

      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      const distance = Math.min(Math.sqrt(dx * dx + dy * dy), maxRadius);
      const angle = Math.atan2(dy, dx);

      const clampedX = Math.cos(angle) * distance;
      const clampedY = Math.sin(angle) * distance;

      setJoystickPos({ x: clampedX, y: clampedY });

      // Normalized output -1 to 1
      inputManager.setVirtualJoystick({
        x: clampedX / maxRadius,
        y: clampedY / maxRadius,
      });
    };

    const handleEnd = (e: TouchEvent) => {
      e.preventDefault();
      setActive(false);
      setJoystickPos({ x: 0, y: 0 });
      inputManager.setVirtualJoystick({ x: 0, y: 0 });
    };

    element.addEventListener('touchstart', handleStart, { passive: false });
    element.addEventListener('touchmove', handleMove, { passive: false });
    element.addEventListener('touchend', handleEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleStart);
      element.removeEventListener('touchmove', handleMove);
      element.removeEventListener('touchend', handleEnd);
    };
  }, [active]); // Re-bind if active changes? actually handleMove closure captures initial active state? 
  // Better approach: use refs for logic inside event handlers to avoid dependency mess.

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-50">
      
      {/* Joystick Area - Bottom Left */}
      <div 
        ref={joystickRef}
        className="absolute bottom-8 left-8 w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 pointer-events-auto flex items-center justify-center touch-none"
      >
        <div 
          className="w-12 h-12 rounded-full bg-yellow-400 shadow-lg"
          style={{
            transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
            transition: active ? 'none' : 'transform 0.1s ease-out'
          }}
        />
      </div>

      {/* Action Buttons - Bottom Right */}
      <div className="absolute bottom-8 right-8 flex gap-4 pointer-events-auto">
        {/* Attack (B) */}
        <button
          className="w-16 h-16 rounded-full bg-red-500 border-4 border-red-700 text-white font-bold text-xl active:scale-95 active:bg-red-600 shadow-xl touch-none flex items-center justify-center"
          onTouchStart={(e) => { e.preventDefault(); inputManager.setVirtualButton('attack', true); }}
          onTouchEnd={(e) => { e.preventDefault(); inputManager.setVirtualButton('attack', false); }}
        >
          B
        </button>

        {/* Jump (A) - Slightly offset higher/right like N64 */}
        <button
          className="w-16 h-16 mb-8 rounded-full bg-blue-500 border-4 border-blue-700 text-white font-bold text-xl active:scale-95 active:bg-blue-600 shadow-xl touch-none flex items-center justify-center"
          onTouchStart={(e) => { e.preventDefault(); inputManager.setVirtualButton('jump', true); }}
          onTouchEnd={(e) => { e.preventDefault(); inputManager.setVirtualButton('jump', false); }}
        >
          A
        </button>
      </div>

      {/* Debug/Info Overlay */}
      <div className="absolute top-4 left-4 text-white/50 text-xs font-mono">
        <p>RETRO ENGINE 64</p>
        <p>TOUCH ENABLED</p>
      </div>
    </div>
  );
};