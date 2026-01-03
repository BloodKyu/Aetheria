
import React from 'react';
import { GameState } from '../types';

interface Props {
  state: GameState;
}

export const HUD: React.FC<Props> = ({ state }) => {
  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-40 select-none">
      
      {/* HEALTH (Hearts) */}
      <div className="flex gap-1">
        {Array.from({ length: state.maxHealth }).map((_, i) => (
          <div 
            key={i} 
            className={`w-8 h-8 flex items-center justify-center transition-all ${
              i < state.health ? 'scale-100 opacity-100' : 'scale-90 opacity-40 grayscale'
            }`}
          >
             {/* Simple Heart SVG */}
             <svg viewBox="0 0 32 32" className="drop-shadow-md">
               <path 
                 fill="#ff0044" 
                 d="M16,28 C16,28 3,20 3,11 C3,7 6,4 10,4 C13,4 15,6 16,8 C17,6 19,4 22,4 C26,4 29,7 29,11 C29,20 16,28 16,28 Z" 
                 stroke="#770022" 
                 strokeWidth="2"
               />
               <path 
                 fill="rgba(255,255,255,0.4)" 
                 d="M7,10 C7,8 9,6 10,6 C11,6 12,6 12,6 C8,6 6,9 7,10 Z"
               />
             </svg>
          </div>
        ))}
      </div>

      {/* SCORE (Gem) */}
      <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
         <div className="w-5 h-5 animate-pulse">
            <svg viewBox="0 0 24 24" className="drop-shadow-sm">
                <path fill="#00FFFF" d="M12,2 L2,10 L12,22 L22,10 Z" stroke="#00AAAA" strokeWidth="1"/>
            </svg>
         </div>
         <span className="text-yellow-400 font-bold font-mono text-lg tracking-widest" style={{ textShadow: '1px 1px 0 #000' }}>
            {state.score.toString().padStart(3, '0')}
         </span>
      </div>

      {state.isGameOver && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
             <div className="text-center animate-bounce">
                <h2 className="text-4xl font-black text-red-500 tracking-widest stroke-black mb-2" style={{ textShadow: '4px 4px 0 #440000' }}>GAME OVER</h2>
                <p className="text-white font-mono text-sm blink">PRESS R TO RETRY</p>
             </div>
          </div>
      )}

    </div>
  );
};
