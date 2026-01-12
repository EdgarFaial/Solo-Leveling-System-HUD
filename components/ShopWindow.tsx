
import React from 'react';
import { Item } from '../types';
import { Coins, ShoppingBag, ArrowUpRight, Cpu, FlaskConical, Watch, PenTool } from 'lucide-react';

interface ShopWindowProps {
  gold: number;
  onBuy: (item: Item) => void;
}

const shopItems: Item[] = [
  { id: 'item-1', name: 'Nootrópico de Foco (Sintético)', rank: 'E', type: 'suplemento', description: 'Otimiza neurotransmissores para 4h de Deep Work intenso. +50 MP Temporário.', icon: '🧪', price: 200 },
  { id: 'item-2', name: 'Smartwatch de Telemetria', rank: 'D', type: 'hardware', description: 'Monitoramento de HRV e sono. +10% de ganho de EXP em Vitalidade.', icon: '⌚', price: 1500 },
  { id: 'item-3', name: 'Diário de Auditoria Diária', rank: 'E', type: 'ferramenta', description: 'Sistema de registro físico de falhas. Aumenta Ganho de Vontade em 5%.', icon: '📔', price: 300 },
  { id: 'item-4', name: 'Anel Oura (Emulado)', rank: 'B', type: 'hardware', description: 'Análise profunda de prontidão biológica. Reduz fadiga residual em 20%.', icon: '💍', price: 8000 },
  { id: 'item-5', name: 'Assinatura de Ferramenta AI (PRO)', rank: 'A', type: 'especial', description: 'Acesso a processamento avançado. +5 pontos em Inteligência após uso.', icon: '🧠', price: 15000 },
];

const ShopWindow: React.FC<ShopWindowProps> = ({ gold, onBuy }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500 pb-24">
      <div className="flex items-center justify-between border-b border-cyan-400/20 pb-4">
        <h2 className="system-font text-cyan-400 text-xl flex items-center gap-3 italic">
          <ShoppingBag className="text-cyan-400" size={24} />
          RECURSOS DE OTIMIZAÇÃO
        </h2>
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-4 py-1.5 rounded-full">
          <Coins className="text-yellow-500" size={16} />
          <span className="text-yellow-500 font-black system-font text-sm">{gold.toLocaleString()}G</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {shopItems.map((item) => (
          <div key={item.id} className="system-panel cut-corners p-5 border border-white/5 hover:border-cyan-400/50 transition-all flex items-center gap-6 group">
            <div className="w-16 h-16 bg-cyan-950/20 rounded-lg flex items-center justify-center text-3xl border border-white/5 shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-white uppercase tracking-wider text-sm">{item.name}</h3>
                  <span className="text-[8px] text-cyan-500 font-black uppercase tracking-widest">{item.type}</span>
                </div>
                <span className={`text-[8px] px-2 py-0.5 rounded-sm border font-black ${
                  item.rank === 'S' ? 'border-red-500 text-red-500' : 'border-cyan-400 text-cyan-400'
                }`}>RANK {item.rank}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 mb-3 leading-tight uppercase italic">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-yellow-500 font-black system-font text-xs italic">{item.price?.toLocaleString()}G</span>
                <button 
                  onClick={() => onBuy(item)}
                  disabled={gold < (item.price || 0)}
                  className={`flex items-center gap-2 text-[9px] px-4 py-2 font-black transition-all tracking-widest cut-corners ${
                    gold >= (item.price || 0) 
                      ? 'bg-cyan-400 text-black hover:bg-white' 
                      : 'bg-white/5 text-gray-700 cursor-not-allowed'
                  }`}
                >
                  INTEGRAR <ArrowUpRight size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopWindow;
