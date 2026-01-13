import React, { useState, useRef } from 'react';
import { Stats } from '../types';
import { User, Save, X, Camera, Upload } from 'lucide-react';

interface ProfileWindowProps {
  stats: Stats;
  onSave: (updated: Partial<Stats>) => void;
  onClose: () => void;
}

const HUD_ICONS = [
  'https://api.dicebear.com/7.x/identicon/svg?seed=rank-s&backgroundColor=061a23&color=00e5ff',
  'https://api.dicebear.com/7.x/identicon/svg?seed=monarch&backgroundColor=061a23&color=00e5ff',
  'https://api.dicebear.com/7.x/identicon/svg?seed=shadow&backgroundColor=061a23&color=00e5ff',
  'https://api.dicebear.com/7.x/identicon/svg?seed=system&backgroundColor=061a23&color=00e5ff',
  'https://api.dicebear.com/7.x/identicon/svg?seed=hunter&backgroundColor=061a23&color=00e5ff',
  'https://api.dicebear.com/7.x/identicon/svg?seed=void&backgroundColor=061a23&color=00e5ff',
  'https://api.dicebear.com/7.x/identicon/svg?seed=core&backgroundColor=061a23&color=00e5ff',
  'https://api.dicebear.com/7.x/identicon/svg?seed=awakened&backgroundColor=061a23&color=00e5ff'
];

const ProfileWindow: React.FC<ProfileWindowProps> = ({ stats, onSave, onClose }) => {
  const [name, setName] = useState(stats.playerName);
  const [age, setAge] = useState(stats.age);
  const [goal, setGoal] = useState(stats.customGoal || "");
  const [avatar, setAvatar] = useState(stats.avatar || HUD_ICONS[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave({ playerName: name.toUpperCase(), age, customGoal: goal, avatar });
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
    <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-6 backdrop-blur-3xl animate-in zoom-in-95 duration-300">
      <div className="w-full max-w-md system-panel border-cyan-400 cut-corners p-8 bg-cyan-950/10">
        <div className="flex justify-between items-center mb-8 border-b border-cyan-400/20 pb-4">
          <h2 className="system-font text-cyan-400 text-lg uppercase font-black italic flex items-center gap-3">
            <User size={20} /> Perfil da Unidade
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={24} /></button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="relative group">
              <div className="w-28 h-28 border-2 border-cyan-400 cut-corners overflow-hidden flex items-center justify-center bg-cyan-400/5 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
                {avatar.length > 2 ? (
                   <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                   <div className="text-4xl text-cyan-400 font-black italic">{avatar}</div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-cyan-400 text-black cut-corners flex items-center justify-center shadow-lg hover:bg-white transition-all"
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
              <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest block text-center">Assinaturas de Rede:</span>
              <div className="flex flex-wrap justify-center gap-2">
                {HUD_ICONS.map((url, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setAvatar(url)}
                    className={`w-10 h-10 border cut-corners overflow-hidden transition-all ${avatar === url ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-white/10 hover:border-cyan-400/50'}`}
                  >
                    <img src={url} alt={`Icon ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
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