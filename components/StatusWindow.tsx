
import React from 'react';
import { Stats, calculateRank } from '../types';
import { Shield, Zap, Eye, Brain, Dumbbell, Plus, BarChart3, Info } from 'lucide-react';

interface StatusWindowProps {
  stats: Stats;
  onAllocate: (stat: string) => void;
}

const StatusWindow: React.FC<StatusWindowProps> = ({ stats, onAllocate }) => {
  const attributes = [
    { key: 'strength', label: 'FORÇA', icon: Dumbbell },
    { key: 'agility', label: 'AGILIDADE', icon: Zap },
    { key: 'vitality', label: 'VITALIDADE', icon: Shield },
    { key: 'intelligence', label: 'INTELIGÊNCIA', icon: Brain },
    { key: 'sense', label: 'SENTIDOS', icon: Eye },
    { key: 'will', label: 'VONTADE', icon: BarChart3 },
  ];

  const getFatigueColor = (val: number) => {
    if (val > 80) return 'bg-red-500 shadow-[0_0_10px_#ef4444]';
    if (val > 50) return 'bg-yellow-500 shadow-[0_0_10px_#f59e0b]';
    return 'bg-cyan-400 shadow-[0_0_10px_#00e5ff]';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
      
      {/* Anime Status Header */}
      <div className="relative p-6 system-panel cut-corners border-l-4 border-cyan-400">
        <div className="absolute top-2 left-4 text-[10px] font-black text-cyan-400 tracking-[0.5em] uppercase opacity-70 italic">
          [ STATUS ]
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-3">
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Nome:</div>
              <div className="system-font text-2xl font-black text-white glow-text italic tracking-tighter">{stats.playerName}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Classe:</div>
              <div className="text-sm font-black text-cyan-400 uppercase tracking-widest">{stats.job}</div>
            </div>
          </div>
          <div className="space-y-3 text-right">
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Nível:</div>
              <div className="system-font text-3xl font-black text-white glow-text italic">{stats.level}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Título:</div>
              <div className="text-sm font-black text-cyan-400 uppercase tracking-widest">{stats.title}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Bars Section */}
      <div className="grid grid-cols-1 gap-4">
        <div className="system-panel cut-corners p-4 space-y-4">
          {/* HP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
              <span className="text-red-500">HP (Integridade)</span>
              <span className="text-white">{stats.hp} / {stats.maxHp}</span>
            </div>
            <div className="h-4 bg-black/60 border border-white/5 p-0.5 cut-corners">
              <div className="h-full bg-red-600 progress-fill shadow-[0_0_10px_#dc2626]" style={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}></div>
            </div>
          </div>
          
          {/* MP Bar (Focus) */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
              <span className="text-cyan-400">MP (Foco)</span>
              <span className="text-white">{stats.focusCapacity} / {stats.maxFocusCapacity}</span>
            </div>
            <div className="h-4 bg-black/60 border border-white/5 p-0.5 cut-corners">
              <div className="h-full bg-cyan-500 progress-fill shadow-[0_0_10px_#00e5ff]" style={{ width: `${(stats.focusCapacity / stats.maxFocusCapacity) * 100}%` }}></div>
            </div>
          </div>

          {/* Fatigue Meter */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
              <span className="text-gray-400">Fadiga</span>
              <span className={stats.fatigue > 70 ? 'text-red-500 animate-pulse' : 'text-white'}>{stats.fatigue}%</span>
            </div>
            <div className="h-2 bg-black/60 border border-white/5 p-0.5 cut-corners">
              <div className={`h-full progress-fill ${getFatigueColor(stats.fatigue)}`} style={{ width: `${stats.fatigue}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Table - High Density */}
      <div className="system-panel cut-corners p-6 relative">
         <div className="absolute top-2 right-4 text-[8px] font-black text-gray-600 tracking-widest uppercase italic">
          Atributos Biométricos
        </div>
        
        <div className="grid grid-cols-1 gap-2 mt-4">
          {attributes.map((attr) => (
            <div key={attr.key} className="flex items-center justify-between p-3 border-b border-white/5 last:border-0 hover:bg-cyan-400/5 transition-colors group">
              <div className="flex items-center gap-4">
                <attr.icon size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-gray-400 group-hover:text-white transition-colors tracking-widest">{attr.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="system-font text-2xl font-black text-white italic">{(stats as any)[attr.key]}</span>
                {stats.unallocatedPoints > 0 && (
                  <button 
                    onClick={() => onAllocate(attr.key)}
                    className="w-7 h-7 flex items-center justify-center bg-cyan-400 text-black cut-corners hover:bg-white active:scale-90 transition-all shadow-[0_0_10px_rgba(0,229,255,0.4)]"
                  >
                    <Plus size={16} strokeWidth={4} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {stats.unallocatedPoints > 0 && (
          <div className="mt-6 p-3 bg-cyan-400/10 border border-cyan-400/30 text-center cut-corners animate-pulse">
            <span className="text-[10px] font-black text-cyan-400 tracking-[0.3em] uppercase">
              {stats.unallocatedPoints} Pontos para Distribuição
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 p-4 system-panel cut-corners opacity-40 bg-black/40">
        <Info size={16} className="text-cyan-400 shrink-0" />
        <p className="text-[9px] font-bold text-gray-500 uppercase italic leading-tight">
          O sistema monitora constantemente a integridade da unidade. O excesso de fadiga ativará protocolos de repressão.
        </p>
      </div>
    </div>
  );
};

export default StatusWindow;
