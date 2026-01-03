
import React, { useEffect, useState } from 'react';
import { debugManager } from '../services/DebugManager';
import { AnimationPreview } from './AnimationPreview';

const ANIM_STATES = ['Idle', 'Run', 'Jump', 'Attack', 'Blitz', 'Phase'];

export const DebugUI: React.FC = () => {
  const [params, setParams] = useState({ ...debugManager.draftConfig });
  const [visible, setVisible] = useState(false);
  const [selectedState, setSelectedState] = useState('Run');

  useEffect(() => {
    // Subscribe to draft changes (though we drive them from here mostly)
    const unsubscribe = debugManager.subscribeDraft((newConfig) => {
        setParams(newConfig);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleChange = (key: keyof typeof params, value: number) => {
      debugManager.setDraft(key, value);
  };

  const handleApply = () => {
      debugManager.commit();
  };

  if (!visible) return (
    <button 
      onClick={() => setVisible(true)}
      className="absolute top-4 left-4 bg-gray-900/80 text-white px-3 py-1 text-xs font-mono border border-gray-600 rounded hover:bg-gray-700 transition-colors z-[100]"
    >
      ⚙️ STUDIO
    </button>
  );

  return (
    <div className="absolute top-4 left-4 bg-gray-900/95 text-white p-4 w-[400px] max-h-[90vh] overflow-y-auto font-mono text-xs z-[100] rounded-lg border border-gray-700 shadow-2xl flex flex-col gap-4">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-700">
        <h3 className="font-bold text-yellow-400 tracking-wider">ANIMATION STUDIO</h3>
        <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-white">✕</button>
      </div>

      {/* Preview Window */}
      <div className="relative">
          <AnimationPreview config={params} stateName={selectedState} />
          <div className="absolute bottom-2 right-2 text-[10px] text-gray-500 bg-black/50 px-2 rounded">
              LMB: Rotate • RMB: Pan
          </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
          <select 
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white flex-1"
          >
              {ANIM_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button 
            onClick={handleApply}
            className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-1 rounded"
          >
              APPLY TO GAME
          </button>
      </div>
      
      {/* Sliders */}
      <div className="space-y-4 pr-2 overflow-y-auto max-h-[300px]">
        {Object.entries(params).map(([key, val]) => (
          <div key={key}>
            <div className="flex justify-between mb-1 text-gray-300">
              <label>{key}</label>
              <span className="text-blue-300">{val.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min={key.includes('Base') ? -3 : key.includes('Offset') || key.includes('Phase') ? -3.14 : 0} 
              max={key.includes('Phase') ? 6.28 : 3} 
              step={0.01}
              value={val}
              onChange={(e) => handleChange(key as any, parseFloat(e.target.value))}
              className="w-full accent-yellow-400 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
