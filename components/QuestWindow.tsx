
import React, { useState, useEffect } from 'react';
import { Quest } from '../types';
import { Plus, Clock, ShieldAlert } from 'lucide-react';
import ImmersiveAd from './ImmersiveAd';  // ou '../components/ImmersiveAd' dependendo da estrutura

const QuestTimer: React.FC<{ deadline: string }> = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(deadline).getTime() - new Date().getTime();
      if (diff < 0) {
        setTimeLeft("EXPIRADO");
        return;
      }
      const h = Math.floor(diff / (1000 * 3600));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return <span className="font-mono">{timeLeft}</span>;
};

interface QuestWindowProps {
  quests: Quest[];
  onComplete: (id: string) => void;
  onProgress: (id: string) => void;
}

const QuestWindow: React.FC<QuestWindowProps> = ({ quests, onComplete, onProgress }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'intervention'>('daily');

  const filtered = quests.filter(q => q.type === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('daily')} className={`flex-1 py-3 cut-corners border text-[10px] font-black uppercase italic ${activeTab === 'daily' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10' : 'border-white/5 opacity-50'}`}>DIÁRIOS</button>
        <button onClick={() => setActiveTab('intervention')} className={`flex-1 py-3 cut-corners border text-[10px] font-black uppercase italic ${activeTab === 'intervention' ? 'border-purple-500 text-purple-400 bg-purple-500/10' : 'border-white/5 opacity-50'}`}>ORDEM ESTRATÉGICA</button>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-20 text-center opacity-20">
            <ShieldAlert className="mx-auto mb-4" />
            <p className="text-[10px] uppercase font-black italic">AGUARDANDO ATUALIZAÇÃO DO ARQUITETO...</p>
          </div>
        ) : (
          filtered.map(q => (
            <div key={q.id} className={`system-panel cut-corners p-6 border-l-4 ${q.completed ? 'opacity-30 border-green-500' : q.type === 'intervention' ? 'border-purple-500' : 'border-cyan-400'}`}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="system-font text-xs font-black uppercase italic glow-text">{q.title}</h3>
                <div className="text-[9px] font-black text-cyan-500 flex items-center gap-1 bg-black/40 px-2 py-1 cut-corners">
                  <Clock size={10} /> <QuestTimer deadline={q.deadline} />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 uppercase italic leading-tight mb-4">{q.description}</p>
              
              <div className="space-y-1.5 mb-4">
                 <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase italic">
                   <span>PROGRESSO</span>
                   <span>{q.progress} / {q.target}</span>
                 </div>
                 <div className="h-1 bg-white/5 cut-corners overflow-hidden">
                   <div className={`h-full transition-all duration-500 ${q.type === 'intervention' ? 'bg-purple-500' : 'bg-cyan-400'}`} style={{ width: `${(q.progress / q.target) * 100}%` }} />
                 </div>
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-3">
                <div className="flex gap-4 text-[9px] font-black italic opacity-60">
                  <div className="text-yellow-500">{q.goldReward}G</div>
                  <div className="text-cyan-400">+{q.expReward} EXP</div>
                </div>
                {!q.completed && (
                  q.progress >= q.target ? 
                  <button onClick={() => onComplete(q.id)} className="bg-cyan-400 text-black px-4 py-2 text-[9px] font-black uppercase italic animate-pulse">COMPLETAR</button> :
                  <button onClick={() => onProgress(q.id)} className="border border-cyan-400 text-cyan-400 p-2 rounded-full active:scale-90"><Plus size={14} /></button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    // ADICIONE esta linha em algum lugar apropriado (sugiro após o conteúdo principal):
<div className="mt-8">
  <ImmersiveAd section="QuestWindow.tsx" />
</div>

// Por exemplo, em StatusWindow.tsx, adicione APÓS o último bloco de <div className="flex items-center gap-4 p-5...">
  );
};

export default QuestWindow;
