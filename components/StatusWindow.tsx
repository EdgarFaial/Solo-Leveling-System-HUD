import React from 'react';
import { Stats } from '../types';
import { Zap, Dumbbell, Eye, Brain, Shield, BarChart3, Heart, Target, Battery } from 'lucide-react';

interface StatusWindowProps {
  stats: Stats;
  onAllocate: (statKey: keyof Stats) => void;
}

type StatKey = 'strength' | 'agility' | 'vitality' | 'sense' | 'intelligence' | 'will';

const StatusWindow: React.FC<StatusWindowProps> = ({ stats, onAllocate }) => {
  // Verificação de segurança
  if (!stats) {
    console.error("❌ StatusWindow: stats é undefined!");
    return (
      <div className="system-panel cut-corners p-8 text-center">
        <p className="text-red-500 font-black uppercase">ERRO: Dados do status não disponíveis</p>
      </div>
    );
  }

  const statItems: Array<{
    key: StatKey;
    label: string;
    icon: any;
    color: string;
    description: string;
  }> = [
    { 
      key: 'strength', 
      label: 'FORÇA', 
      icon: Dumbbell, 
      color: 'text-red-500',
      description: 'Potência muscular e integridade física'
    },
    { 
      key: 'agility', 
      label: 'AGILIDADE', 
      icon: Zap, 
      color: 'text-yellow-400',
      description: 'Coordenação motora e tempo de reação'
    },
    { 
      key: 'vitality', 
      label: 'VITALIDADE', 
      icon: Shield, 
      color: 'text-blue-500',
      description: 'Capacidade de recuperação e resiliência'
    },
    { 
      key: 'sense', 
      label: 'SENTIDOS', 
      icon: Eye, 
      color: 'text-green-400',
      description: 'Consciência situacional e redução de ruído'
    },
    { 
      key: 'intelligence', 
      label: 'INTELIGÊNCIA', 
      icon: Brain, 
      color: 'text-purple-500',
      description: 'Processamento de informação e foco'
    },
    { 
      key: 'will', 
      label: 'VONTADE', 
      icon: BarChart3, 
      color: 'text-orange-500',
      description: 'Resiliência mental e inibição de impulsos'
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between border-b border-cyan-400/20 pb-4">
        <h2 className="system-font text-cyan-400 text-xl flex items-center gap-3 italic">
          <Zap className="text-cyan-400" size={24} />
          STATUS DA UNIDADE
        </h2>
        <div className="text-right">
          <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Pontos Livres</span>
          <div className="text-[10px] text-cyan-500 font-black">{stats.unallocatedPoints || 0}</div>
        </div>
      </div>

      {/* Barra de HP/Fadiga */}
      <div className="space-y-4">
        <div className="system-panel cut-corners p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Heart size={14} className="text-red-500" />
              <span className="text-[10px] font-black uppercase text-white">SAÚDE</span>
            </div>
            <span className="text-sm font-black text-white">{(stats.hp || 0)}/{(stats.maxHp || 100)}</span>
          </div>
          <div className="h-2 bg-white/5 cut-corners overflow-hidden">
            <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${((stats.hp || 0) / (stats.maxHp || 100)) * 100}%` }} />
          </div>
        </div>

        <div className="system-panel cut-corners p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Battery size={14} className="text-cyan-400" />
              <span className="text-[10px] font-black uppercase text-white">FOCO</span>
            </div>
            <span className="text-sm font-black text-white">{(stats.focusCapacity || 0)}/{(stats.maxFocusCapacity || 100)}</span>
          </div>
          <div className="h-2 bg-white/5 cut-corners overflow-hidden">
            <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${((stats.focusCapacity || 0) / (stats.maxFocusCapacity || 100)) * 100}%` }} />
          </div>
        </div>

        <div className="system-panel cut-corners p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-yellow-500" />
              <span className="text-[10px] font-black uppercase text-white">FADIGA</span>
            </div>
            <span className="text-sm font-black text-white">{(stats.fatigue || 0)}%</span>
          </div>
          <div className="h-2 bg-white/5 cut-corners overflow-hidden">
            <div className={`h-full transition-all duration-500 ${(stats.fatigue || 0) < 50 ? 'bg-green-500' : (stats.fatigue || 0) < 80 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${stats.fatigue || 0}%` }} />
          </div>
        </div>
      </div>

      {/* Atributos */}
      <div className="grid grid-cols-2 gap-4">
        {statItems.map(({ key, label, icon: Icon, color, description }) => (
          <div key={key} className="system-panel cut-corners p-4 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon size={16} className={color} />
                <div>
                  <div className={`text-[10px] font-black uppercase tracking-wider ${color}`}>{label}</div>
                  <div className="text-[7px] text-gray-500 uppercase italic">{description}</div>
                </div>
              </div>
              <span className="text-2xl font-black text-white glow-text">{stats[key] || 0}</span>
            </div>
            
            {(stats.unallocatedPoints || 0) > 0 && (
              <button
                onClick={() => onAllocate(key)}
                className="w-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-[9px] font-black uppercase italic py-2 cut-corners hover:bg-cyan-400/20 transition-all active:scale-95"
              >
                EVOLUIR ATRIBUTO
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Nível e EXP */}
      <div className="system-panel cut-corners p-4 border-cyan-400/20 bg-cyan-400/5">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-yellow-500" />
            <span className="text-[9px] text-yellow-500 font-black uppercase">NÍVEL</span>
          </div>
          <span className="text-lg font-black text-white">{stats.level || 1}</span>
        </div>
        <div className="h-2 bg-white/5 cut-corners overflow-hidden">
          <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: `${((stats.exp || 0) / (stats.maxExp || 100)) * 100}%` }} />
        </div>
        <div className="flex justify-between text-[8px] text-gray-500 font-black uppercase mt-1">
          <span>EXP: {stats.exp || 0}</span>
          <span>PRÓXIMO: {stats.maxExp || 100}</span>
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="grid grid-cols-2 gap-3">
        <div className="system-panel cut-corners p-3 text-center">
          <div className="text-[8px] text-gray-600 font-black uppercase">GOLD</div>
          <div className="text-lg font-black text-yellow-500">{(stats.gold || 0).toLocaleString()}</div>
        </div>
        <div className="system-panel cut-corners p-3 text-center">
          <div className="text-[8px] text-gray-600 font-black uppercase">MISSÕES FALHADAS</div>
          <div className="text-lg font-black text-red-500">{stats.failedMissionsCount || 0}</div>
        </div>
      </div>

      {/* Nota do sistema */}
      <div className="system-panel cut-corners p-4 border-cyan-500/20 bg-cyan-500/5">
        <p className="text-[10px] text-gray-500 font-bold uppercase italic leading-tight">
          [SISTEMA] Atributos aumentam através de treinamento real. Clique em "EVOLUIR ATRIBUTO" para iniciar protocolo de teste.
        </p>
      </div>
    </div>
  );
};

export default StatusWindow;