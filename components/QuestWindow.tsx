
import React, { useState } from 'react';
import { Quest } from '../types';
import { CheckCircle2, Target, Plus, Coins, TrendingUp, AlertTriangle } from 'lucide-react';

interface QuestWindowProps {
  quests: Quest[];
  onComplete: (id: string) => void;
  onProgress: (id: string) => void;
}

const QuestWindow: React.FC<QuestWindowProps> = ({ quests, onComplete, onProgress }) => {
  const [filter, setFilter] = useState<'daily' | 'intervention'>('daily');

  const filteredQuests = quests.filter(q => 
    filter === 'daily' ? q.type === 'daily' : (q.type === 'intervention' || q.type === 'secret')
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-700 pb-32">
      <div className="flex gap-2">
        {['daily', 'intervention'].map((f) => (
          <button 
            key={f}
            onClick={() => setFilter(f as any)}
            className={`flex-1 py-3 system-panel cut-corners text-[10px] font-black system-font tracking-widest uppercase transition-all ${
              filter === f ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400' : 'text-gray-600 border-white/5 opacity-50'
            }`}
          >
            {f === 'daily' ? 'Protocolos Diários' : 'Intervenções da IA'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredQuests.map((quest) => (
          <div 
            key={quest.id} 
            className={`system-panel cut-corners p-5 border-l-4 transition-all relative overflow-hidden ${
              quest.completed ? 'opacity-40 grayscale border-green-500' : 
              quest.type === 'intervention' ? 'border-purple-500' : 'border-cyan-400'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <span className="text-[7px] font-black px-1.5 py-0.5 rounded-sm uppercase bg-white/10 text-gray-400">
                     {quest.category}
                   </span>
                   <h3 className="font-black text-white uppercase tracking-wider text-sm italic">{quest.title}</h3>
                </div>
                <p className="text-[10px] text-gray-400 italic font-bold leading-tight uppercase">
                  {quest.description}
                </p>
              </div>
              
              {!quest.completed && (
                <button 
                  onClick={() => onProgress(quest.id)}
                  className="w-10 h-10 border border-cyan-400/40 cut-corners flex items-center justify-center hover:bg-cyan-400 hover:text-black transition-all"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase italic">
                <span>Progresso Técnico</span>
                <span className="text-white">{quest.progress} / {quest.target}</span>
              </div>
              <div className="h-1 bg-black/50 cut-corners overflow-hidden">
                <div 
                  className={`h-full progress-fill ${quest.completed ? 'bg-green-500' : 'bg-cyan-400 shadow-[0_0_10px_#00e5ff]'}`}
                  style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center gap-4 opacity-50">
                 <div className="flex items-center gap-1">
                   <Coins size={10} className="text-yellow-500" />
                   <span className="text-[9px] font-black text-white">{quest.goldReward}G</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <TrendingUp size={10} className="text-cyan-500" />
                   <span className="text-[9px] font-black text-white">+{quest.expReward} EXP</span>
                 </div>
              </div>
              
              {!quest.completed && quest.progress >= quest.target && (
                <button 
                  onClick={() => onComplete(quest.id)}
                  className="bg-cyan-400 text-black font-black px-5 py-2 text-[9px] system-font tracking-widest italic animate-pulse"
                >
                  CONFIRMAR EXECUÇÃO
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestWindow;
