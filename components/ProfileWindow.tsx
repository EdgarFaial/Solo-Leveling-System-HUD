
import React, { useState, useRef } from 'react';
import { Stats } from '../types';
import { User, Save, X, Camera, Shield, Crown, Zap, Eye, Brain, Activity, Hexagon, Ghost } from 'lucide-react';

interface ProfileWindowProps {
  stats: Stats;
  onSave: (updated: Partial<Stats>) => void;
  onClose: () => void;
}

// Custom HUD icons for Solo Leveling Aesthetic
const HUD_ICONS = [
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="%2300e5ff" stroke-width="4"><path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z"/><path d="M50 30 L70 50 L50 70 L30 50 Z"/></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="%2300e5ff" stroke-width="4"><circle cx="50" cy="50" r="40"/><path d="M50 20 V80 M20 50 H80"/><path d="M30 30 L70 70 M30 70 L70 30"/></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="%2300e5ff" stroke-width="4"><path d="M10 10 L90 10 L90 90 L10 90 Z"/><path d="M50 10 V90 M10 50 H90"/></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="%2300e5ff" stroke-width="4"><path d="M50 5 L95 25 V75 L50 95 L5 75 V25 Z"/><path d="M50 30 V70 M30 50 H70"/></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="%2300e5ff" stroke-width="4"><path d="M20 20 L80 80 M80 20 L20 80"/><circle cx="50" cy="50" r="10"/></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="%2300e5ff" stroke-width="4"><path d="M50 5 Q95 5 95 50 Q95 95 50 95 Q5 95 5 50 Q5 5 50 5"/><path d="M30 40 L50 60 L70 40"/></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="%2300e5ff" stroke-width="4"><path d="M10 50 L50 10 L90 50 L50 90 Z"/><path d="M50 30 V70"/></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="%2300e5ff" stroke-width="4"><path d="M10 10 L40 40 L10 70 M90 10 L60 40 L90 70"/><circle cx="50" cy="80" r="10"/></svg>'
];

const ProfileWindow: React.FC<ProfileWindowProps> = ({ stats, onSave, onClose }) => {
  const [name, setName] = useState(stats.playerName);
  const [age, setAge] = useState(stats.age);
  const [goal, setGoal] = useState(stats.customGoal || "");
  const [avatar, setAvatar] = useState(stats.avatar || HUD_ICONS[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
const [mode, setMode] = useState(stats.systemMode);

  const handleSave = () => {
  // MODIFIQUE a chamada onSave para incluir systemMode:
  onSave({ 
    playerName: name.toUpperCase(), 
    age, 
    customGoal: goal, 
    avatar,
    systemMode: mode  // ADICIONE ESTA LINHA
  });
  onClose();
};

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-3xl animate-in zoom-in-95 duration-300">
      <div className="w-full max-w-md system-panel border-cyan-400 cut-corners p-6 md:p-8 bg-cyan-950/10 max-h-[95vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-8 border-b border-cyan-400/20 pb-4">
          <h2 className="system-font text-cyan-400 text-base md:text-lg uppercase font-black italic flex items-center gap-3">
            <User size={20} /> Perfil da Unidade
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="relative group">
              <div className="w-24 h-24 md:w-28 md:h-28 border-2 border-cyan-400 cut-corners overflow-hidden flex items-center justify-center bg-cyan-400/5 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover p-2" />
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-cyan-400 text-black cut-corners flex items-center justify-center shadow-lg hover:bg-white transition-all z-10"
              >
                <Camera size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <div className="space-y-3 w-full">
              <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest block text-center">Protocolos de Assinatura Visual:</span>
              <div className="flex flex-wrap justify-center gap-2">
                {HUD_ICONS.map((url, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setAvatar(url)}
                    className={`w-9 h-9 md:w-10 md:h-10 border cut-corners overflow-hidden transition-all bg-black/40 p-1.5 ${avatar === url ? 'border-cyan-400 ring-1 ring-cyan-400 scale-110' : 'border-white/10 hover:border-cyan-400/50'}`}
                  >
                    <img src={url} alt={`Icon ${idx}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Identificador Nominal:</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/20 border-b border-cyan-400/40 p-2 text-white font-black uppercase outline-none focus:border-cyan-400 transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Ciclo de Idade:</label>
              <input type="number" value={age} onChange={e => setAge(parseInt(e.target.value) || 0)} className="w-full bg-black/20 border-b border-cyan-400/40 p-2 text-white font-black outline-none focus:border-cyan-400 transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Objetivo Direcionador:</label>
              <textarea value={goal} onChange={e => setGoal(e.target.value)} className="w-full bg-black/20 border border-cyan-400/40 p-3 text-white font-black uppercase text-[10px] outline-none h-20 resize-none focus:border-cyan-400 transition-colors" />
            </div>
          </div>

          <button onClick={handleSave} className="w-full bg-cyan-400 text-black font-black py-4 system-font text-xs uppercase italic tracking-widest mt-4 shadow-lg hover:bg-white transition-all flex items-center justify-center gap-3 active:scale-95">
            <Save size={18} /> [ SINCRONIZAR PERFIL ]
          </button>
        </div>
      </div>
    </div>
    // ADICIONE este bloco após o campo de idade:
<div className="space-y-1">
  <label className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Modo do Sistema:</label>
  <div className="flex gap-2">
    <button 
      type="button"
      onClick={() => setMode('architect')}
      className={`flex-1 py-3 cut-corners border text-[10px] font-black uppercase italic ${mode === 'architect' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10' : 'border-gray-700 text-gray-500 bg-black/20'}`}
    >
      ARQUITETO (IA)
    </button>
    <button 
      type="button"
      onClick={() => setMode('custom')}
      className={`flex-1 py-3 cut-corners border text-[10px] font-black uppercase italic ${mode === 'custom' ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10' : 'border-gray-700 text-gray-500 bg-black/20'}`}
    >
      LIVRE (MANUAL)
    </button>
  </div>
</div>
  );
};

export default ProfileWindow;
