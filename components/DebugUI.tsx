
import React, { useEffect, useState, useRef } from 'react';
import { debugManager } from '../services/DebugManager';
import { AnimationPreview } from './AnimationPreview';
import { AnimationConfig } from '../types';

const ANIM_STATES = ['Idle', 'Run', 'Jump', 'Attack', 'Blitz', 'Phase'];

interface SliderGroup {
  id: string;
  title: string;
  keys?: (keyof AnimationConfig)[];
  prefix?: string;
}

// Helpers to generate group configs for a state
const createPoseGroups = (prefix: string, stateLabel: string) => ({
  [`${prefix}_L_ARM`]: { id: `${prefix}_l_arm`, title: `${stateLabel} Left Arm`, prefix: `${prefix}_pose_ArmL` },
  [`${prefix}_R_ARM`]: { id: `${prefix}_r_arm`, title: `${stateLabel} Right Arm`, prefix: `${prefix}_pose_ArmR` },
  [`${prefix}_L_LEG`]: { id: `${prefix}_l_leg`, title: `${stateLabel} Left Leg`, prefix: `${prefix}_pose_LegL` },
  [`${prefix}_R_LEG`]: { id: `${prefix}_r_leg`, title: `${stateLabel} Right Leg`, prefix: `${prefix}_pose_LegR` },
});

// Dynamic Groups definition
const GROUPS: Record<string, SliderGroup> = {
  // Idle
  ...createPoseGroups('idle', 'Idle'),
  IDLE_DYN: { id: 'idle_dyn', title: 'Idle Breathing', keys: ['idleBreathSpeed', 'idleBreathAmp'] },

  // Run
  ...createPoseGroups('run', 'Run'),
  RUN_GEN: { id: 'run_gen', title: 'Run General', keys: ['runAnimSpeed', 'torsoTwist', 'headStabilize'] },
  RUN_ARMS: { id: 'run_arms', title: 'Run Arms Cycle', keys: ['armShoulderAmp', 'armSyncPhase', 'armElbowAmp', 'elbowPhase'] },

  // Jump
  ...createPoseGroups('jump', 'Jump'),
  JUMP_DYN: { id: 'jump_dyn', title: 'Jump Physics', keys: ['jumpPedalSpeed', 'jumpLegAmp', 'jumpArmWobble', 'jumpForwardLean'] },

  // Attack
  ATTACK: { id: 'attack', title: 'Sword Swing', keys: ['attackDuration', 'attackWindupRatio', 'attackSlashAmp', 'attackTorsoTwist'] }
};

const STATE_CONFIG: Record<string, string[]> = {
  Idle:   ['IDLE_DYN', 'idle_L_ARM', 'idle_R_ARM', 'idle_L_LEG', 'idle_R_LEG'],
  Run:    ['RUN_GEN', 'RUN_ARMS', 'run_L_ARM', 'run_R_ARM', 'run_L_LEG', 'run_R_LEG'],
  Jump:   ['JUMP_DYN', 'jump_L_ARM', 'jump_R_ARM', 'jump_L_LEG', 'jump_R_LEG'],
  Attack: ['ATTACK'],
  Blitz:  [],
  Phase:  []
};

export const DebugUI: React.FC = () => {
  const [params, setParams] = useState({ ...debugManager.draftConfig });
  const [visible, setVisible] = useState(false);
  const [selectedState, setSelectedState] = useState('Idle');
  
  // Persist window size
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = debugManager.subscribeDraft((newConfig) => {
        setParams(newConfig);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleChange = (key: keyof AnimationConfig, value: number) => {
      debugManager.setDraft(key, value);
  };

  const handleApply = () => {
      debugManager.commit();
  };

  const getKeysForGroup = (group: SliderGroup): string[] => {
    if (group.keys) return group.keys;
    if (group.prefix) {
      return Object.keys(params).filter(k => k.startsWith(group.prefix!));
    }
    return [];
  };

  const renderGroup = (groupKey: string) => {
    const group = GROUPS[groupKey];
    if (!group) return null;
    const keys = getKeysForGroup(group);
    if (keys.length === 0) return null;

    return (
      <div key={group.id} className="mb-2 border border-gray-700 rounded bg-gray-800/30">
        <div className="bg-gray-800/80 px-2 py-1 text-[10px] font-bold text-yellow-500 uppercase tracking-wider border-b border-gray-700">
          {group.title}
        </div>
        <div className="p-2 grid grid-cols-1 gap-2">
          {keys.map(key => {
            const val = params[key as keyof AnimationConfig];
            const isRotation = key.toLowerCase().includes('pose') || key.toLowerCase().includes('phase') || key.toLowerCase().includes('twist');
            const min = isRotation ? -3.14 : -5;
            const max = isRotation ? 3.14 : 5;
            // Clean up label: remove prefixes
            let label = key.replace(/idle_pose_|run_pose_|jump_pose_|idle|run|jump|attack/g, '').replace(/_/g, ' ');
            // Handle edge cases where replacement leaves messy string or empty
            if (!label || label.trim() === '') label = key;

            return (
              <div key={key}>
                <div className="flex justify-between text-gray-400 text-[10px] font-mono">
                  <span>{label}</span>
                  <span className="text-blue-300">{val.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min={min} 
                  max={max} 
                  step={0.01}
                  value={val}
                  onChange={(e) => handleChange(key as keyof AnimationConfig, parseFloat(e.target.value))}
                  className="w-full accent-yellow-400 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer hover:bg-gray-500"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!visible) return (
    <button 
      onClick={() => setVisible(true)}
      className="absolute top-20 right-4 bg-gray-900/90 text-white px-3 py-2 text-xs font-mono border border-gray-600 rounded hover:bg-gray-700 transition-colors z-[100] shadow-lg backdrop-blur-sm"
    >
      ⚙️ STUDIO
    </button>
  );

  return (
    <div 
      ref={panelRef}
      className="absolute top-4 right-4 bg-gray-900/95 text-white flex flex-col font-mono text-xs z-[100] rounded-lg border border-gray-600 shadow-2xl overflow-hidden"
      style={{ 
          width: '340px', 
          height: '600px',
          minWidth: '300px', 
          minHeight: '400px',
          resize: 'both',
          maxWidth: '90vw',
          maxHeight: '90vh'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-2 border-b border-gray-700 bg-gray-800 shrink-0 cursor-move">
        <h3 className="font-bold text-yellow-400 tracking-wider flex items-center gap-2">
          <span>⚙️</span> ANIMATION STUDIO
        </h3>
        <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-white px-2 font-bold">✕</button>
      </div>

      {/* Preview Area */}
      <div className="relative h-48 bg-black border-b border-gray-700 shrink-0">
          <AnimationPreview config={params} stateName={selectedState} />
          <div className="absolute bottom-1 right-1 text-[9px] text-gray-500 pointer-events-none">
              LMB: Rotate • RMB: Pan
          </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 p-3 bg-gray-800 border-b border-gray-700 shrink-0">
          <div>
            <label className="block text-[9px] text-gray-400 mb-1 uppercase font-bold">Animation State</label>
            <select 
              value={selectedState} 
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white focus:border-yellow-400 outline-none hover:bg-gray-700 cursor-pointer"
            >
                {ANIM_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button 
            onClick={handleApply}
            className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-2 rounded shadow text-[11px] transition-transform active:scale-95 border border-green-600 uppercase tracking-wide"
          >
            Apply Changes to Game
          </button>
      </div>
      
      {/* Sliders Area */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-gray-900">
         {STATE_CONFIG[selectedState]?.map(groupKey => renderGroup(groupKey))}
         
         {STATE_CONFIG[selectedState]?.length === 0 && (
           <div className="p-4 text-center text-gray-500 italic">
             No parameters available for this state.
           </div>
         )}
      </div>
      
      {/* Resize Handle Hint */}
      <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 bg-gradient-to-tl from-gray-500 to-transparent pointer-events-none"></div>
    </div>
  );
};
