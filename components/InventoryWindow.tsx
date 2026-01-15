import React from 'react';
import { Item } from '../types';
import { Backpack, Info, Lock, Zap, Package } from 'lucide-react';
import ImmersiveAd from './ImmersiveAd';

interface InventoryWindowProps {
  items: Item[];
}

const InventoryWindow: React.FC<InventoryWindowProps> = ({ items }) => {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h2 className="system-font text-gray-400 text-xl flex items-center gap-3 italic">
          <Backpack size={24} className="text-cyan-500" />
          Armazém Dimensional
        </h2>
        <div className="text-right">
          <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Capacidade</span>
          <div className="text-[10px] text-cyan-500 font-black">{items.length} / 50</div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-20">
          <Package size={64} strokeWidth={1} />
          <p className="mt-4 text-[10px] font-black tracking-widest uppercase italic">Nenhum objeto detectado no plano dimensional.</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {items.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="aspect-square system-panel cut-corners group relative cursor-pointer hover:border-cyan-400 transition-all flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
              <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              
              <div className={`absolute top-1 right-1 text-[7px] font-black px-1 rounded-sm border ${
                item.rank === 'S' ? 'border-red-500 text-red-500' : 'border-cyan-500 text-cyan-400'
              }`}>
                {item.rank}
              </div>

              {/* Tooltip HUD no Hover */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-32 system-panel cut-corners p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border-cyan-500">
                <div className="text-[8px] font-black text-cyan-400 uppercase tracking-tighter mb-1 truncate">{item.name}</div>
                <div className="text-[7px] text-gray-500 uppercase leading-none truncate">{item.type}</div>
              </div>
            </div>
          ))}
          {/* Slots Vazios */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square system-panel cut-corners opacity-10 flex items-center justify-center">
              <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
            </div>
          ))}
        </div>
      )}

      <div className="system-panel cut-corners p-4 border-cyan-500/20 bg-cyan-500/5 flex gap-4 items-start">
        <Zap className="text-cyan-500/60 mt-1" size={16} />
        <div>
          <span className="text-[9px] font-black text-cyan-500 tracking-widest uppercase">Nota de Operação</span>
          <p className="text-[10px] text-gray-500 font-bold uppercase italic leading-tight mt-1">
            Objetos retirados do inventário serão materializados instantaneamente no plano físico.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <ImmersiveAd section="inventory" />
      </div>
    </div>
  );
};

export default InventoryWindow;