import React from 'react';
import { CheckCircle, Shield, Zap, Box, Circle } from 'lucide-react';

// Interface local se ResourceItem não existe em types.ts
interface ResourceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  isIntegrated: boolean;
  icon: string;
  bonus: string;
}

interface ResourcesWindowProps {
  resources: ResourceItem[];
  onToggle: (id: string) => void;
}

const ResourcesWindow: React.FC<ResourcesWindowProps> = ({ resources, onToggle }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500 pb-24">
      <div className="flex items-center justify-between border-b border-cyan-400/20 pb-4">
        <h2 className="system-font text-cyan-400 text-xl flex items-center gap-3 italic">
          <Box className="text-cyan-400" size={24} />
          RECURSOS TÉCNICOS
        </h2>
      </div>

      <div className="p-4 bg-cyan-400/5 border border-cyan-400/20 cut-corners mb-6">
        <p className="text-[10px] text-gray-400 font-bold uppercase italic leading-tight">
          Indique quais infraestruturas e ferramentas você possui no mundo físico. O Arquiteto adaptará os protocolos de treinamento com base no seu hardware disponível.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {resources.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onToggle(item.id)}
            className={`system-panel cut-corners p-5 border transition-all flex items-center gap-6 cursor-pointer group ${
              item.isIntegrated ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_15px_rgba(0,229,255,0.1)]' : 'border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
            }`}
          >
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl shrink-0 transition-transform group-active:scale-95 ${
              item.isIntegrated ? 'bg-cyan-400 text-black' : 'bg-white/5 text-gray-600'
            }`}>
              {item.isIntegrated ? <CheckCircle size={28} /> : <span>{item.icon}</span>}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-black uppercase tracking-wider text-sm transition-colors ${item.isIntegrated ? 'text-white' : 'text-gray-500'}`}>
                    {item.name}
                  </h3>
                  <span className="text-[7px] text-cyan-500 font-black uppercase tracking-[0.2em]">{item.category}</span>
                </div>
              </div>
              <p className="text-[9px] text-gray-500 mt-2 mb-2 leading-tight uppercase italic">{item.description}</p>
              <div className="flex items-center gap-2">
                <Zap size={10} className={item.isIntegrated ? 'text-cyan-400' : 'text-gray-800'} />
                <span className={`text-[8px] font-black uppercase italic ${item.isIntegrated ? 'text-cyan-400' : 'text-gray-800'}`}>
                  Bônus: {item.bonus}
                </span>
              </div>
            </div>

            <div className="shrink-0">
               {item.isIntegrated ? 
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                </div> : 
                <Circle size={16} className="text-gray-800" />
               }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourcesWindow;