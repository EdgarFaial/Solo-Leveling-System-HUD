import React from 'react';
import { AvailableItem } from '../types';
import { ShieldCheck, Check, Zap, Info, Box } from 'lucide-react';
import ImmersiveAd from './ImmersiveAd';

interface ItemsRegistryWindowProps {
  items: AvailableItem[];
  onToggle: (id: string) => void;
}

const ItemsRegistryWindow: React.FC<ItemsRegistryWindowProps> = ({ items, onToggle }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500 pb-24">
      <div className="flex items-center justify-between border-b border-cyan-400/20 pb-4">
        <h2 className="system-font text-cyan-400 text-xl flex items-center gap-3 italic">
          <ShieldCheck className="text-cyan-400" size={24} />
          REGISTRO DE HARDWARE REAL
        </h2>
      </div>

      <div className="p-4 bg-cyan-400/5 border border-cyan-400/20 cut-corners">
        <div className="flex gap-3">
          <Info size={16} className="text-cyan-400 shrink-0" />
          <p className="text-[10px] text-gray-400 font-bold uppercase italic leading-tight">
            [SISTEMA] Indique seus recursos disponíveis no mundo físico. O Arquiteto desbloqueará bônus de status e protocolos de missão específicos para seu arsenal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onToggle(item.id)}
            className={`system-panel cut-corners p-5 border transition-all flex items-center gap-6 cursor-pointer group ${
              item.owned ? 'border-cyan-400 bg-cyan-950/30' : 'border-white/5 bg-white/5 opacity-60 hover:opacity-100'
            }`}
          >
            <div className={`w-14 h-14 flex items-center justify-center text-3xl cut-corners border transition-all ${
              item.owned ? 'bg-cyan-400 text-black border-cyan-400' : 'bg-white/5 border-white/10 text-gray-600'
            }`}>
              {item.owned ? <Check size={28} /> : <span>{item.icon}</span>}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-black uppercase tracking-wider text-sm transition-colors ${item.owned ? 'text-white' : 'text-gray-500'}`}>
                    {item.name}
                  </h3>
                  <span className="text-[8px] text-cyan-500 font-black uppercase tracking-widest">{item.category}</span>
                </div>
              </div>
              
              <p className="text-[10px] text-gray-500 mt-1 mb-2 leading-tight uppercase italic">{item.description}</p>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Box size={10} className={item.owned ? 'text-cyan-400' : 'text-gray-800'} />
                  <span className={`text-[8px] font-black uppercase italic ${item.owned ? 'text-cyan-400' : 'text-gray-800'}`}>
                    MISSÃO: {item.missionBonus}
                  </span>
                </div>
                {item.statBonus && (
                  <div className="flex items-center gap-2">
                    <Zap size={10} className={item.owned ? 'text-yellow-500' : 'text-gray-800'} />
                    <span className={`text-[8px] font-black uppercase italic ${item.owned ? 'text-yellow-500' : 'text-gray-800'}`}>
                      BÔNUS: +{item.statBonus.value} {item.statBonus.stat.toUpperCase()} PERMANENTE
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 pr-2">
              <div className={`w-6 h-6 border-2 cut-corners flex items-center justify-center transition-all ${
                item.owned ? 'border-cyan-400' : 'border-gray-800'
              }`}>
                {item.owned && <div className="w-2.5 h-2.5 bg-cyan-400"></div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <ImmersiveAd section="registry" />
      </div>
    </div>
  );
};

export default ItemsRegistryWindow;