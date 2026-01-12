
import React, { useState } from 'react';
import { Stats } from '../types';
import { CheckCircle2, X, Timer, Dumbbell, Zap, Shield, Eye, Brain } from 'lucide-react';

interface TrainingModalProps {
  statKey: keyof Stats;
  currentValue: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const TrainingModal: React.FC<TrainingModalProps> = ({ statKey, currentValue, onSuccess, onCancel }) => {
  const [isTraining, setIsTraining] = useState(false);
  
  const getTaskDetails = (key: keyof Stats) => {
    const difficultyScale = Math.floor(currentValue / 5) + 1;
    switch(key) {
      case 'strength': return { task: 'Flexões (Push-ups)', target: 10 + (difficultyScale * 5), unit: 'repetições', icon: Dumbbell, color: 'text-red-400' };
      case 'agility': return { task: 'Sprints de 50m', target: 2 + Math.floor(difficultyScale / 2), unit: 'sprints', icon: Zap, color: 'text-yellow-400' };
      case 'vitality': return { task: 'Prancha (Plank)', target: 30 + (difficultyScale * 15), unit: 'segundos', icon: Shield, color: 'text-blue-400' };
      case 'sense': return { task: 'Meditação Profunda', target: 2 + (difficultyScale * 1), unit: 'minutos', icon: Eye, color: 'text-green-400' };
      case 'intelligence': return { task: 'Leitura Técnica/Estudo', target: 5 + (difficultyScale * 2), unit: 'páginas', icon: Brain, color: 'text-purple-400' };
      default: return { task: 'Exercício', target: 10, unit: 'unidades', icon: Dumbbell, color: 'text-gray-400' };
    }
  };

  const { task, target, unit, icon: Icon, color } = getTaskDetails(statKey);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-lg p-4">
      <div className="system-bg border-2 border-[#00e5ff] shadow-[0_0_50px_rgba(0,229,255,0.4)] rounded-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-[#00e5ff]/10 p-4 flex justify-between items-center border-b border-[#00e5ff]/30">
          <h2 className="system-font text-[#00e5ff] text-lg uppercase tracking-[0.2em]">Avaliação de Atributo</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
        </div>
        
        <div className="p-8 text-center">
          <div className={`mx-auto w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 ${color}`}>
            <Icon size={40} />
          </div>
          
          <p className="text-gray-400 mb-2 uppercase text-[10px] font-bold tracking-widest">Teste Necessário para evoluir {statKey}</p>
          <h3 className="text-3xl font-black mb-6 system-font text-white">{task}</h3>
          
          <div className="flex justify-center items-center gap-6 mb-10">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl min-w-[140px]">
              <div className="text-4xl font-black text-[#00e5ff]">{target}</div>
              <div className="text-[10px] text-gray-500 uppercase font-bold mt-1">{unit}</div>
            </div>
          </div>

          <p className="text-sm text-gray-400 italic mb-8 leading-relaxed max-w-[300px] mx-auto">
            "O Sistema não aceita fraqueza. Prove que sua vontade superou suas limitações atuais."
          </p>

          {!isTraining ? (
            <button 
              onClick={() => setIsTraining(true)}
              className="w-full bg-[#00e5ff] text-black font-black py-4 rounded-lg shadow-[0_0_25px_rgba(0,229,255,0.5)] hover:scale-[1.03] active:scale-95 transition-all text-sm tracking-widest"
            >
              INICIAR DESAFIO
            </button>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#00e5ff] animate-[shimmer_2s_infinite] shadow-[0_0_10px_#00e5ff]" style={{width: '100%'}}></div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-[#00e5ff] animate-pulse font-bold text-xs tracking-[0.2em]">MONITORANDO DADOS BIOMÉTRICOS...</p>
                <p className="text-[10px] text-gray-500 italic">O Sistema está assistindo.</p>
              </div>
              <button 
                onClick={onSuccess}
                className="w-full flex items-center justify-center gap-3 border-2 border-green-500 text-green-500 font-black py-4 rounded-lg hover:bg-green-500 hover:text-white transition-all text-sm tracking-widest"
              >
                <CheckCircle2 size={20} /> TESTE CONCLUÍDO
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingModal;
