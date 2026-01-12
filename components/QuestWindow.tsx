
import React, { useState } from 'react';
import { Quest } from '../types';
// Added Coins to the import list
import { CheckCircle2, Circle, AlertCircle, Sparkles, ChevronRight, ScrollText, Swords, Zap, Activity, Coins } from 'lucide-react';

interface QuestWindowProps {
  quests: Quest[];
  onComplete: (id: string) => void;
  onProgress: (id: string) => void;
}

const QuestWindow: React.FC<QuestWindowProps> = ({ quests, onComplete, onProgress }) => {
  const [filter, setFilter] = useState<'daily' | 'normal'>('daily');

  const filteredQuests = quests.filter(q => q.type === filter || (filter === 'normal' && (q.type === 'secret' || q.type === 'urgent')));

  const getCategoryIcon = (cat?: string) => {
    switch(cat) {
      case 'physical': return <Activity size={16} />;
      case 'focus': return <Zap size={16} />;
      case 'recovery': return <Activity size={16} />;
      default: return <Swords size={16} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      
      {/* Abas Estilizadas */}
      <div className="flex gap-4 p-1 bg-black/40 rounded-xl border border-white/5">
        <button 
          onClick={() => setFilter('daily')}
          className={`flex-1 py-4 text-[11px] font-black system-font tracking-[0.2em] transition-all rounded-lg flex items-center justify-center gap-3 ${filter === 'daily' ? 'bg-[#00e5ff]/10 text-[#00e5ff] shadow-[inset_0_0_15px_rgba(0,229,255,0.1)]' : 'text-gray-600 hover:text-gray-400'}`}
        >
          <Activity size={14} /> DIÁRIAS
        </button>
        <button 
          onClick={() => setFilter('normal')}
          className={`flex-1 py-4 text-[11px] font-black system-font tracking-[0.2em] transition-all rounded-lg flex items-center justify-center gap-3 ${filter === 'normal' ? 'bg-[#00e5ff]/10 text-[#00e5ff] shadow-[inset_0_0_15px_rgba(0,229,255,0.1)]' : 'text-gray-600 hover:text-gray-400'}`}
        >
          <Swords size={14} /> CAMPANHA
        </button>
      </div>

      <div className="space-y-6">
        {filteredQuests.length === 0 && (
          <div className="py-24 text-center opacity-20 flex flex-col items-center">
            <ScrollText size={64} className="mb-6" />
            <p className="text-sm font-black tracking-[0.4em] uppercase italic">Dados Indisponíveis</p>
          </div>
        )}

        {filteredQuests.map((quest) => (
          <div 
            key={quest.id} 
            className={`system-bg p-6 border-l-4 transition-all relative overflow-hidden ${
              quest.completed ? 'border-green-500 opacity-40 scale-[0.98]' : 
              quest.type === 'secret' ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-[#00e5ff] hover:bg-[#00e5ff]/5'
            }`}
          >
            {quest.type === 'secret' && <Sparkles size={100} className="absolute -right-6 -bottom-6 text-purple-500/5 rotate-12" />}
            
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-black px-2 py-1 rounded-sm uppercase tracking-widest flex items-center gap-1.5 ${
                    quest.type === 'daily' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 
                    quest.type === 'secret' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30'
                  }`}>
                    {getCategoryIcon(quest.category)} {quest.type}
                  </span>
                  <h3 className="font-black text-base text-white uppercase tracking-widest">{quest.title}</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-bold italic max-w-[80%]">"{quest.description}"</p>
              </div>
              
              {!quest.completed && (
                <button 
                  onClick={() => onProgress(quest.id)}
                  className="w-12 h-12 border-2 border-[#00e5ff]/30 rounded-full flex items-center justify-center hover:bg-[#00e5ff]/20 hover:border-[#00e5ff] active:scale-90 transition-all shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                >
                  <ChevronRight size={24} className="text-[#00e5ff]" />
                </button>
              )}
              {quest.completed && <CheckCircle2 className="text-green-500" size={32} />}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black text-gray-600 tracking-[0.3em] uppercase">
                <span>Progresso de Evolução</span>
                <span className="text-white">{quest.progress} / {quest.target}</span>
              </div>
              <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full transition-all duration-700 shadow-[0_0_10px_current] ${quest.completed ? 'bg-green-500' : 'bg-[#00e5ff]'}`}
                  style={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <Coins size={14} className="text-yellow-500/60" />
                 <span className="text-[10px] font-black text-yellow-500/80 uppercase tracking-widest">Recompensa: {quest.reward}</span>
              </div>
              {!quest.completed && quest.progress >= quest.target && (
                <button 
                  onClick={() => onComplete(quest.id)}
                  className="bg-[#00e5ff] text-black font-black px-6 py-2.5 text-[10px] system-font tracking-[0.2em] shadow-[0_0_20px_rgba(0,229,255,0.5)] active:scale-95 transition-all"
                >
                  RESGATAR
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filter === 'daily' && (
        <div className="bg-red-500/5 border border-red-500/20 p-6 flex gap-4 items-start animate-pulse">
          <AlertCircle className="text-red-500 shrink-0" size={24} />
          <div className="text-[11px] text-red-200/60 leading-relaxed font-bold uppercase tracking-widest">
            <span className="text-red-500 block mb-2 font-black tracking-[0.4em]">PROTOCOLO DE PUNIÇÃO</span>
            O descumprimento das missões diárias resultará em penalidades imediatas no seu HP e supressão de atributos.
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestWindow;
