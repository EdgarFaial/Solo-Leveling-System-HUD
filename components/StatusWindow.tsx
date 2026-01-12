
import React from 'react';
import { Stats, calculateRank } from '../types';
import { Shield, Zap, Eye, Brain, Dumbbell, Plus, BarChart3, Info, Target } from 'lucide-react';

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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
      
      {/* Header Estilo Solo Leveling com Classe e Rank */}
      <div className="relative p-6 system-panel cut-corners border-l-4 border-cyan-400 bg-cyan-950/10">
        <div className="absolute top-2 right-4 text-[8px] font-black text-cyan-500 tracking-[0.4em] uppercase opacity-50 italic">
          Telemetria Biológica Ativa
        </div>
        
        <div className="flex items-end justify-between mb-4">
          <div className="space-y-1">
            <h2 className="system-font text-3xl font-black text-white glow-text italic tracking-tighter uppercase">{stats.playerName}</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{stats.job}</span>
              <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">{stats.title}</span>
            </div>
          </div>
          <div className="text-right">
             <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Nível Atual</div>
             <div className="system-font text-5xl font-black text-white glow-text italic leading-none">{stats.level}</div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="space-y-1 mt-6">
          <div className="flex justify-between text-[8px] font-black text-gray-500 uppercase italic tracking-widest">
            <span>Progressão para Nível {stats.level + 1}</span>
            <span>{Math.floor((stats.exp / stats.maxExp) * 100)}%</span>
          </div>
          <div className="h-1 bg-white/5 overflow-hidden cut-corners">
            <div className="h-full bg-cyan-400 progress-fill" style={{ width: `${(stats.exp / stats.maxExp) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Barras de Recurso */}
      <div className="grid grid-cols-1 gap-4">
        <div className="system-panel cut-corners p-5 space-y-5 bg-black/20">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase italic">
              <span className="text-red-500">Integridade Biológica (HP)</span>
              <span className="text-white">{stats.hp} / {stats.maxHp}</span>
            </div>
            <div className="h-4 bg-black/60 border border-white/5 p-0.5 cut-corners">
              <div className="h-full bg-red-600 progress-fill shadow-[0_0_15px_#dc2626]" style={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}></div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase italic">
              <span className="text-cyan-400">Capacidade Cognitiva (MP)</span>
              <span className="text-white">{stats.focusCapacity} / {stats.maxFocusCapacity}</span>
            </div>
            <div className="h-4 bg-black/60 border border-white/5 p-0.5 cut-corners">
              <div className="h-full bg-cyan-500 progress-fill shadow-[0_0_15px_#00e5ff]" style={{ width: `${(stats.focusCapacity / stats.maxFocusCapacity) * 100}%` }}></div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase italic">
              <span className="text-gray-500">Acúmulo de Fadiga</span>
              <span className={stats.fatigue > 70 ? 'text-red-500 animate-pulse' : 'text-white'}>{stats.fatigue}%</span>
            </div>
            <div className="h-2 bg-black/60 border border-white/5 p-0.5 cut-corners">
              <div className={`h-full progress-fill ${stats.fatigue > 70 ? 'bg-red-500' : 'bg-cyan-400'}`} style={{ width: `${stats.fatigue}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Atributos */}
      <div className="system-panel cut-corners p-6 bg-cyan-950/5 border border-white/5">
        <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-2">
          <Target size={14} className="text-cyan-400" />
          <span className="text-[10px] font-black text-gray-400 tracking-[0.3em] uppercase italic">Parâmetros de Performance</span>
        </div>
        
        <div className="grid grid-cols-1 gap-1">
          {attributes.map((attr) => (
            <div key={attr.key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-cyan-400/5 transition-all group px-2 rounded-lg">
              <div className="flex items-center gap-4">
                <attr.icon size={18} className="text-cyan-400/40 group-hover:text-cyan-400 transition-colors" />
                <span className="text-[11px] font-black text-gray-500 group-hover:text-white transition-colors tracking-widest uppercase">{attr.label}</span>
              </div>
              <div className="flex items-center gap-5">
                <span className="system-font text-2xl font-black text-white italic group-hover:glow-text">{(stats as any)[attr.key]}</span>
                {stats.unallocatedPoints > 0 && (
                  <button 
                    onClick={() => onAllocate(attr.key)}
                    className="w-8 h-8 flex items-center justify-center bg-cyan-400 text-black cut-corners hover:bg-white active:scale-90 transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                  >
                    <Plus size={16} strokeWidth={4} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {stats.unallocatedPoints > 0 && (
          <div className="mt-8 p-4 bg-cyan-400/5 border border-cyan-400/30 text-center cut-corners animate-pulse">
            <span className="text-[11px] font-black text-cyan-400 tracking-[0.4em] uppercase">
              {stats.unallocatedPoints} Pontos Disponíveis para Otimização
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 p-5 system-panel cut-corners bg-black/40 border-white/5">
        <Info size={18} className="text-cyan-400 shrink-0" />
        <p className="text-[10px] font-bold text-gray-600 uppercase italic leading-snug">
          O sistema recompensa apenas a execução perfeita. A estagnação em qualquer atributo resultará em protocolos de correção forçada.
        </p>
      </div>
    </div>
  );
};

export default StatusWindow;
