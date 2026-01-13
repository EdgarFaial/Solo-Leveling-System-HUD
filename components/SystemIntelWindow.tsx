
import React from 'react';
import { Cpu, Zap, Database, Globe, BrainCircuit } from 'lucide-react';

const SystemIntelWindow: React.FC = () => {
  const logSteps = [
    { icon: Globe, label: "CAPTURA DE AMBIENTE", desc: "Sincronização com OpenWeather API e Geolocalização." },
    { icon: Database, label: "ANÁLISE DE HARDWARE", desc: "Mapeamento de recursos físicos registrados (Diário, Academia, etc)." },
    { icon: BrainCircuit, label: "PROCESSAMENTO GEMINI", desc: "Envio de telemetria para o Arquiteto via Google GenAI SDK." },
    { icon: Zap, label: "MANIFESTAÇÃO DE MISSÃO", desc: "Conversão de dados brutos em protocolos de intervenção biológica." }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500 pb-24">
      <div className="flex items-center justify-between border-b border-cyan-400/20 pb-4">
        <h2 className="system-font text-cyan-400 text-xl flex items-center gap-3 italic">
          <Cpu className="text-cyan-400" size={24} />
          LÓGICA DO ARQUITETO
        </h2>
      </div>

      <div className="system-panel cut-corners p-6 bg-cyan-950/20 border-cyan-400/30">
        <p className="text-xs text-gray-400 leading-relaxed uppercase italic font-bold mb-6">
          "O Sistema não é um jogo. É um espelho da sua eficiência. A IA não cria desafios aleatórios; ela identifica falhas na sua biografia e propõe correções táticas."
        </p>

        <div className="space-y-4">
          {logSteps.map((step, i) => (
            <div key={i} className="flex gap-4 items-center p-3 border border-white/5 bg-white/5 cut-corners">
              <div className="w-10 h-10 shrink-0 bg-cyan-400 flex items-center justify-center text-black">
                <step.icon size={20} />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-cyan-400 tracking-widest uppercase italic">{step.label}</h4>
                <p className="text-[9px] text-gray-500 uppercase font-bold">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border border-yellow-500/20 bg-yellow-500/5 cut-corners">
        <h5 className="text-[9px] font-black text-yellow-500 uppercase tracking-widest mb-1 italic">Nota de Segurança</h5>
        <p className="text-[8px] text-gray-500 uppercase leading-tight font-bold">
          Todos os dados de telemetria são processados em tempo real. A anulação de uma missão gerada por IA pode resultar em estagnação permanente de atributos.
        </p>
      </div>
    </div>
  );
};

export default SystemIntelWindow;
