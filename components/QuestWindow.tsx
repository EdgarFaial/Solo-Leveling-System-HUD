
import React, { useState } from 'react';
import { Quest } from '../types';
import { Plus, Coins, TrendingUp, ShieldAlert, Target, Clock, Zap, Activity, Microscope, Info } from 'lucide-react';

interface QuestWindowProps {
  quests: Quest[];
  onComplete: (id: string) => void;
  onProgress: (id: string) => void;
}

const QuestWindow: React.FC<QuestWindowProps> = ({ quests, onComplete, onProgress }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'intervention'>('daily');

  const filteredQuests = quests.filter(q => q.type === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-700">
      <div className="flex gap-2 mb-8">
        <button 
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-4 system-panel cut-corners text-[10px] font-black tracking-[0.3em] uppercase transition-all italic ${
            activeTab === 'daily' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(0,229,255,0.1)]' : 'border-white/5 text-gray-600 opacity-50 hover:opacity-100'
          }`}
        >
          Protocolos Diários
        </button>
        <button 
          onClick={() => setActiveTab('intervention')}
          className={`flex-1 py-4 system-panel cut-corners text-[10px] font-black tracking-[0.3em] uppercase transition-all italic ${
            activeTab === 'intervention' ? 'border-purple-500 text-purple-400 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'border-white/5 text-gray-600 opacity-50 hover:opacity-100'
          }`}
        >
          Intervenções de Crescimento
        </button>
      </div>

      <div className="space-y-6">
        {filteredQuests.length === 0 ? (
          <div className="py-24 text-center opacity-10">
            <ShieldAlert size={64} strokeWidth={1} className="mx-auto mb-6" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">Nenhum protocolo ativo detectado no setor.</p>
          </div>
        ) : (
          filteredQuests.map((quest) => (
            <div 
              key={quest.id} 
              className={`system-panel cut-corners p-7 border-l-4 transition-all relative overflow-hidden group ${
                quest.completed ? 'opacity-30 grayscale border-green-500 pointer-events-none' : 
                quest.type === 'intervention' ? 'border-purple-500 hover:bg-purple-500/5' : 'border-cyan-400 hover:bg-cyan-400/5'
              }`}
            >
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-white/5 text-[7px] font-black tracking-[0.4em] uppercase text-gray-500 italic rounded-bl-xl border-l border-b border-white/5">
                {quest.category}
              </div>

              <div className="flex justify-between items-start mb-6">
                <div className="space-y-4 flex-1 pr-6">
                  <div className="flex items-center gap-3">
                     <Activity size={14} className={quest.type === 'intervention' ? 'text-purple-500' : 'text-cyan-400'} />
                     <h3 className="font-black text-white uppercase tracking-[0.1em] text-base italic leading-none glow-text">{quest.title}</h3>
                  </div>
                  
                  <p className="text-[11px] text-gray-400 italic font-bold leading-relaxed uppercase pr-4">
                    {quest.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-black/40 p-4 border border-white/5 cut-corners">
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={12} className="text-cyan-500" />
                        <span className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.3em] italic">Ação Mensurável:</span>
                      </div>
                      <p className="text-[10px] text-white font-bold italic uppercase">{quest.measurableAction}</p>
                    </div>
                    <div className="bg-black/40 p-4 border border-white/5 cut-corners">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={12} className="text-cyan-500" />
                        <span className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.3em] italic">Comprometimento:</span>
                      </div>
                      <p className="text-[10px] text-white font-bold italic uppercase">{quest.timeCommitment}</p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-cyan-400/5 p-4 cut-corners border border-cyan-400/10">
                    <div className="flex items-start gap-3">
                      <Microscope size={14} className="text-cyan-400 mt-0.5" />
                      <div>
                        <span className="text-[8px] font-black text-cyan-400 uppercase tracking-[0.3em] italic block mb-1">Benefício Sistêmico:</span>
                        <p className="text-[10px] text-gray-300 italic font-medium leading-relaxed">{quest.biologicalBenefit}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 border-t border-cyan-400/10 pt-2">
                      <Info size={14} className="text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] italic block mb-1">Lógica de Adaptação:</span>
                        <p className="text-[9px] text-gray-500 italic font-medium leading-relaxed">{quest.adaptationLogic}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {!quest.completed && (
                  <button 
                    onClick={() => onProgress(quest.id)}
                    className={`w-14 h-14 border cut-corners flex items-center justify-center transition-all group shrink-0 active:scale-90 ${
                      quest.type === 'intervention' ? 'border-purple-500/40 hover:bg-purple-500 shadow-purple-500/20' : 'border-cyan-400/40 hover:bg-cyan-400 shadow-cyan-400/20'
                    } hover:text-black hover:shadow-lg`}
                  >
                    <Plus size={24} strokeWidth={3} />
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between text-[10px] font-black text-gray-600 uppercase italic tracking-widest">
                  <span>Sincronização de Execução</span>
                  <span className="text-white group-hover:text-cyan-400 transition-colors">{quest.progress} / {quest.target}</span>
                </div>
                <div className="h-2 bg-black/60 cut-corners overflow-hidden p-[1px] border border-white/5">
                  <div 
                    className={`h-full progress-fill transition-all duration-700 ease-out ${quest.completed ? 'bg-green-500' : quest.type === 'intervention' ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]' : 'bg-cyan-400 shadow-[0_0_10px_#00e5ff]'}`}
                    style={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center border-t border-white/5 pt-4">
                <div className="flex items-center gap-6 opacity-60">
                   <div className="flex items-center gap-2">
                     <Coins size={14} className="text-yellow-500" />
                     <span className="text-[11px] font-black text-white italic">{quest.goldReward}G</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <TrendingUp size={14} className="text-cyan-500" />
                     <span className="text-[11px] font-black text-white italic">+{quest.expReward} EXP</span>
                   </div>
                </div>
                
                {!quest.completed && quest.progress >= quest.target && (
                  <button 
                    onClick={() => onComplete(quest.id)}
                    className={`text-black font-black px-8 py-3 text-[11px] system-font tracking-[0.3em] italic animate-pulse shadow-xl transition-transform active:scale-95 ${
                      quest.type === 'intervention' ? 'bg-purple-500 shadow-purple-500/40' : 'bg-cyan-400 shadow-cyan-400/40'
                    }`}
                  >
                    FINALIZAR PROTOCOLO
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuestWindow;
