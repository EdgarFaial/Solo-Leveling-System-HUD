
import React from 'react';
import { Stats, calculateCombatPower } from '../types';
import { Shield, Zap, Eye, Brain, Dumbbell, Activity, Plus, Trophy } from 'lucide-react';

interface StatusWindowProps {
  stats: Stats;
  onAllocate: (stat: string) => void;
}

const StatusWindow: React.FC<StatusWindowProps> = ({ stats, onAllocate }) => {
  const combatPower = calculateCombatPower(stats);
  
  const attributes = [
    { key: 'strength', label: 'FORÇA', icon: Dumbbell, color: 'text-red-400' },
    { key: 'agility', label: 'AGILIDADE', icon: Zap, color: 'text-yellow-400' },
    { key: 'vitality', label: 'VITALIDADE', icon: Shield, color: 'text-blue-400' },
    { key: 'intelligence', label: 'INTELIGÊNCIA', icon: Brain, color: 'text-purple-400' },
    { key: 'sense', label: 'PERCEPÇÃO', icon: Eye, color: 'text-green-400' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      
      {/* Combat Power HUD */}
      <div className="system-bg p-8 border-2 border-[#00e5ff]/40 rounded-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
          <Trophy size={100} className="text-[#00e5ff]" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center py-4">
          <h3 className="system-font text-[11px] text-[#00e5ff] tracking-[0.5em] font-black mb-4 uppercase opacity-60">Poder de Combate Atual</h3>
          <div className="flex items-baseline gap-4">
            <span className="text-6xl font-black system-font text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              {combatPower.toLocaleString()}
            </span>
            <span className="text-lg text-[#00e5ff] font-black tracking-widest uppercase">CP</span>
          </div>
          <div className="w-full max-w-[200px] h-[1px] bg-gradient-to-r from-transparent via-[#00e5ff]/30 to-transparent mt-6"></div>
        </div>
      </div>

      {/* Vital Indicators */}
      <div className="space-y-6 system-bg p-6 border border-white/5 rounded-sm shadow-xl">
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-black tracking-[0.3em] uppercase">
            <span className="text-red-500">Vitalidade (HP)</span>
            <span className="text-white">{stats.hp} / {stats.maxHp}</span>
          </div>
          <div className="h-3 bg-black/60 rounded-sm overflow-hidden border border-white/5 p-[1px]">
            <div 
              className="h-full bg-gradient-to-r from-red-800 to-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all duration-1000" 
              style={{width: `${(stats.hp/stats.maxHp)*100}%`}}
            ></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-black tracking-[0.3em] uppercase">
            <span className="text-blue-500">Energia (MP)</span>
            <span className="text-white">{stats.mp} / {stats.maxMp}</span>
          </div>
          <div className="h-3 bg-black/60 rounded-sm overflow-hidden border border-white/5 p-[1px]">
            <div 
              className="h-full bg-gradient-to-r from-blue-800 to-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-1000" 
              style={{width: `${(stats.mp/stats.maxMp)*100}%`}}
            ></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-black tracking-[0.3em] uppercase text-cyan-400">
            <span>Experiência (EXP)</span>
            <span>{Math.round((stats.exp/stats.maxExp)*100)}%</span>
          </div>
          <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] transition-all duration-500" 
              style={{width: `${(stats.exp/stats.maxExp)*100}%`}}
            ></div>
          </div>
        </div>
      </div>

      {/* Atributos Matriz */}
      <div className="system-bg p-6 border border-white/5 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="system-font text-xs text-gray-500 tracking-[0.4em] font-black uppercase">Atributos de Portador</h3>
          {stats.unallocatedPoints > 0 && (
            <div className="bg-[#00e5ff]/10 text-[#00e5ff] px-4 py-2 font-black animate-pulse rounded-sm border border-[#00e5ff]/30 text-[10px] tracking-widest">
              {stats.unallocatedPoints} PONTOS DISPONÍVEIS
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4">
          {attributes.map((attr) => (
            <div key={attr.key} className="flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-sm group hover:border-[#00e5ff]/20 transition-all">
              <div className="flex items-center gap-5">
                <div className={`p-3 rounded-lg bg-white/5 ${attr.color}`}>
                  <attr.icon size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase block mb-1">{attr.label}</span>
                  <div className="text-[8px] text-gray-700 font-bold uppercase tracking-widest">Nível de Sincro</div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <span className="system-font text-3xl font-black text-white group-hover:text-[#00e5ff] transition-colors">{(stats as any)[attr.key]}</span>
                {stats.unallocatedPoints > 0 && (
                  <button 
                    onClick={() => onAllocate(attr.key)}
                    className="w-10 h-10 flex items-center justify-center border-2 border-[#00e5ff]/50 text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black hover:scale-110 active:scale-90 transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                  >
                    <Plus size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusWindow;
