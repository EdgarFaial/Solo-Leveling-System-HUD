
import React, { useState } from 'react';
import { Stats } from '../types';
import { User, Save, X, Camera, Image as ImageIcon } from 'lucide-react';

interface ProfileWindowProps {
  stats: Stats;
  onSave: (updated: Partial<Stats>) => void;
  onClose: () => void;
}

const AVATARS = ['👤', '⚔️', '🔥', '💧', '⚡', '🌑', '👑', '🐺', '🐉', '💀'];

const ProfileWindow: React.FC<ProfileWindowProps> = ({ stats, onSave, onClose }) => {
  const [name, setName] = useState(stats.playerName);
  const [age, setAge] = useState(stats.age);
  const [goal, setGoal] = useState(stats.customGoal || "");
  const [avatar, setAvatar] = useState(stats.avatar || '👤');

  const handleSave = () => {
    onSave({ playerName: name.toUpperCase(), age, customGoal: goal, avatar });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-6 backdrop-blur-3xl animate-in zoom-in-95 duration-300">
      <div className="w-full max-w-md system-panel border-cyan-400 cut-corners p-8 bg-cyan-950/10">
        <div className="flex justify-between items-center mb-8 border-b border-cyan-400/20 pb-4">
          <h2 className="system-font text-cyan-400 text-lg uppercase font-black italic flex items-center gap-3">
            <User size={20} /> Perfil da Unidade
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={24} /></button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 border-2 border-cyan-400 cut-corners flex items-center justify-center text-5xl bg-cyan-400/5 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
              {avatar}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {AVATARS.map(a => (
                <button 
                  key={a} 
                  onClick={() => setAvatar(a)}
                  className={`w-8 h-8 flex items-center justify-center border cut-corners transition-all ${avatar === a ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-white/10 text-white hover:border-cyan-400'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Identificador Nomimal:</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-transparent border-b border-cyan-400/40 p-2 text-white font-black uppercase outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Ciclo de Idade:</label>
              <input type="number" value={age} onChange={e => setAge(parseInt(e.target.value))} className="w-full bg-transparent border-b border-cyan-400/40 p-2 text-white font-black outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Objetivo Direcionador:</label>
              <textarea value={goal} onChange={e => setGoal(e.target.value)} className="w-full bg-transparent border border-cyan-400/40 p-3 text-white font-black uppercase text-[10px] outline-none h-20 resize-none" />
            </div>
          </div>

          <button onClick={handleSave} className="w-full bg-cyan-400 text-black font-black py-4 system-font text-xs uppercase italic tracking-widest mt-4 shadow-lg hover:bg-white transition-all flex items-center justify-center gap-3">
            <Save size={18} /> [ SINCRONIZAR PERFIL ]
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileWindow;
