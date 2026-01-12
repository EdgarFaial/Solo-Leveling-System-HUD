
import React from 'react';
import { Item } from '../types';
import { Backpack, Info, Lock } from 'lucide-react';

interface InventoryWindowProps {
  items: Item[];
}

const InventoryWindow: React.FC<InventoryWindowProps> = ({ items }) => {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h2 className="system-font text-gray-400 text-xl flex items-center gap-3">
          <Backpack size={26} />
          ARMAZÉM DIMENSIONAL
        </h2>
        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">{items.length} / 50 ESPAÇOS</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-700">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-800/30 flex items-center justify-center mb-6">
            <Backpack size={48} className="opacity-10" />
          </div>
          <p className="italic text-sm tracking-widest uppercase font-bold opacity-30">Vazio. Complete missões para obter espólios.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {items.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="aspect-square system-bg border border-white/5 rounded-2xl p-3 group relative cursor-pointer hover:border-[#00e5ff]/40 transition-all flex items-center justify-center shadow-lg">
              <div className="text-4xl transform group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div className={`absolute top-2 right-2 text-[8px] font-black px-1.5 rounded-sm border shadow-sm ${
                item.rank === 'S' ? 'border-red-500 text-red-500 bg-red-500/10' :
                item.rank === 'A' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' :
                'border-[#00e5ff] text-[#00e5ff] bg-[#00e5ff]/10'
              }`}>
                {item.rank}
              </div>
              
              {/* Tooltip Detalhado no Hover */}
              <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center pointer-events-none z-20 rounded-2xl border border-[#00e5ff]/30">
                <span className="text-[10px] font-black text-[#00e5ff] mb-1 uppercase tracking-tighter">{item.name}</span>
                <span className="text-[8px] text-gray-500 line-clamp-2 leading-tight uppercase font-bold">{item.type}</span>
                <div className="mt-2 w-full h-px bg-white/10"></div>
                <span className="text-[8px] text-gray-400 mt-2 leading-tight">{item.description}</span>
              </div>
            </div>
          ))}
          {/* Slots vazios visuais */}
          {Array.from({ length: Math.max(0, 12 - items.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square bg-black/20 border border-white/5 rounded-2xl opacity-20 flex items-center justify-center">
               <Lock size={12} className="text-gray-800" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 bg-[#00e5ff]/5 border border-[#00e5ff]/10 p-5 rounded-2xl flex gap-4 items-start">
        <Info className="text-[#00e5ff]/60 shrink-0 mt-0.5" size={20} />
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[#00e5ff] uppercase tracking-widest">Aviso de Armazenamento</p>
          <p className="text-[11px] text-gray-500 leading-relaxed uppercase font-bold opacity-80">
            A capacidade de armazenamento é vinculada à sua Inteligência. Itens de Rank A ou superior são selados automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InventoryWindow;
