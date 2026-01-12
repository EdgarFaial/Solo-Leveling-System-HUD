
import React, { useState } from 'react';
import { Stats } from '../types';
import { CheckCircle2, X, Dumbbell, Zap, Shield, Eye, Brain, BarChart3, Lock } from 'lucide-react';

interface TrainingModalProps {
  statKey: keyof Stats;
  currentValue: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const TrainingModal: React.FC<TrainingModalProps> = ({ statKey, currentValue, onSuccess, onCancel }) => {
  const [isTraining, setIsTraining] = useState(false);
  
  const getTaskDetails = (key: keyof Stats) => {
    // A dificuldade escala baseada no valor atual do atributo. 
    // Quanto maior o atributo, mais "pesado" fica o teste.
    const val = currentValue;
    
    switch(key) {
      case 'strength': 
        return { 
          task: 'Exaustão Muscular (Flexões)', 
          target: 10 + (val * 3), 
          unit: 'repetições', 
          icon: Dumbbell, 
          color: 'text-red-500',
          desc: 'Recrute fibras musculares dormentes. O sistema exige o rompimento de fibras para nova síntese.'
        };
      case 'agility': 
        return { 
          task: 'Coordenação Explosiva (Polichinelos)', 
          target: 20 + (val * 5), 
          unit: 'repetições', 
          icon: Zap, 
          color: 'text-yellow-400',
          desc: 'Otimize a velocidade de condução nervosa. Reação é a diferença entre a vida e o esquecimento.'
        };
      case 'vitality': 
        return { 
          task: 'Resistência Isométrica (Prancha)', 
          target: 45 + (val * 15), 
          unit: 'segundos', 
          icon: Shield, 
          color: 'text-blue-500',
          desc: 'Fortaleça o núcleo biológico. A durabilidade é a base de qualquer unidade de combate.'
        };
      case 'sense': 
        return { 
          task: 'Vigilância Atenta (Observação Silenciosa)', 
          target: 5 + (val * 2), 
          unit: 'minutos', 
          icon: Eye, 
          color: 'text-green-400',
          desc: 'Observe o ambiente sem estímulos digitais. Recupere a consciência espacial perdida.'
        };
      case 'intelligence': 
        return { 
          task: 'Carga Cognitiva (Foco Ininterrupto)', 
          target: 20 + (val * 10), 
          unit: 'minutos', 
          icon: Brain, 
          color: 'text-purple-500',
          desc: 'Mergulhe em estudo ou trabalho técnico. Expanda os limites do processamento pré-frontal.'
        };
      case 'will': 
        return { 
          task: 'Jejum de Dopamina (Restrição Digital)', 
          target: 1 + (val * 0.5), 
          unit: 'horas', 
          icon: BarChart3, 
          color: 'text-orange-500',
          desc: 'Abstinência total de redes sociais, jogos e entretenimento. Mate o impulso para dominar o ego.'
        };
      default: 
        return { 
          task: 'Teste Geral', 
          target: 10, 
          unit: 'unidades', 
          icon: Dumbbell, 
          color: 'text-gray-400',
          desc: 'O Sistema exige prova de competência.'
        };
    }
  };

  const { task, target, unit, icon: Icon, color, desc } = getTaskDetails(statKey);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6">
      <div className="system-panel border-cyan-400 cut-corners max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-500 shadow-[0_0_100px_rgba(0,229,255,0.2)]">
        <div className="bg-cyan-400/10 p-5 flex justify-between items-center border-b border-cyan-400/30">
          <div className="flex items-center gap-3">
            <Lock size={16} className="text-cyan-400" />
            <h2 className="system-font text-cyan-400 text-xs font-black uppercase tracking-[0.3em] italic">Prova de Evolução de Atributo</h2>
          </div>
          <button onClick={onCancel} className="text-gray-600 hover:text-white transition-colors p-1"><X size={20} /></button>
        </div>
        
        <div className="p-10 text-center">
          <div className={`mx-auto w-24 h-24 cut-corners bg-white/5 border border-white/10 flex items-center justify-center mb-8 ${color} shadow-lg`}>
            <Icon size={48} strokeWidth={1.5} className="glow-text" />
          </div>
          
          <div className="space-y-2 mb-8">
            <h3 className="text-3xl font-black system-font text-white italic uppercase tracking-tighter leading-tight">{task}</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic leading-relaxed px-4">
              {desc}
            </p>
          </div>
          
          <div className="flex justify-center items-center gap-6 mb-12">
            <div className="bg-white/5 border border-white/10 p-6 cut-corners min-w-[160px] relative overflow-hidden">
              <div className="text-5xl font-black text-cyan-400 italic glow-text">{target}</div>
              <div className="text-[9px] text-gray-600 uppercase font-black mt-2 tracking-[0.2em]">{unit}</div>
              {/* Scanline background */}
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,white_2px,white_4px)]"></div>
            </div>
          </div>

          {!isTraining ? (
            <div className="space-y-4">
              <button 
                onClick={() => setIsTraining(true)}
                className="w-full bg-cyan-400 text-black font-black py-5 system-font text-xs tracking-[0.4em] uppercase italic hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] active:scale-[0.98]"
              >
                [ INICIAR PROTOCOLO ]
              </button>
              <p className="text-[8px] text-gray-700 font-black uppercase tracking-[0.3em]">O Arquiteto monitora sua resposta galvânica.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-1">
                  <div className="w-1.5 h-6 bg-cyan-400 animate-pulse delay-75"></div>
                  <div className="w-1.5 h-6 bg-cyan-400 animate-pulse delay-150"></div>
                  <div className="w-1.5 h-6 bg-cyan-400 animate-pulse delay-300"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-cyan-400 font-black text-[9px] tracking-[0.4em] uppercase animate-pulse italic">SICRONIZANDO DADOS BIOMÉTRICOS...</p>
                  <p className="text-[8px] text-gray-600 italic uppercase">Qualquer desvio resultará em anulação da evolução.</p>
                </div>
              </div>
              <button 
                onClick={onSuccess}
                className="w-full flex items-center justify-center gap-3 border border-green-500 text-green-500 font-black py-5 system-font text-[10px] tracking-[0.3em] uppercase italic hover:bg-green-500 hover:text-black transition-all active:scale-[0.98]"
              >
                <CheckCircle2 size={18} /> CONFIRMAR EXECUÇÃO
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingModal;
