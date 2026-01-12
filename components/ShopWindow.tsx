
import React from 'react';
import { Item } from '../types';
import { Coins, ShoppingBag, ArrowUpRight, Zap, Shield, Sword, Package } from 'lucide-react';

interface ShopWindowProps {
  gold: number;
  onBuy: (item: Item) => void;
}

const shopItems: Item[] = [
  { id: 'item-1', name: 'Poção de Mana (Baixa)', rank: 'E', type: 'consumable', description: 'Restaura 50 MP instantaneamente através de foco.', icon: '🧪', price: 150 },
  { id: 'item-2', name: 'Bandagem de Treino Especial', rank: 'D', type: 'material', description: 'Aumenta o ganho de EXP em 5% nos testes de Força.', icon: '🎗️', price: 800 },
  { id: 'item-3', name: 'Adaga de Ferro Negro', rank: 'D', type: 'weapon', description: 'Uma arma básica mas confiável para novos jogadores.', icon: '🗡️', price: 2500 },
  { id: 'item-4', name: 'Essência da Sombra', rank: 'A', type: 'material', description: 'Material extremamente raro. Usado para evoluções avançadas.', icon: '🌑', price: 45000 },
  { id: 'item-5', name: 'Anel do Viajante Solitário', rank: 'B', type: 'armor', description: 'Reduz a fadiga mental durante o estudo.', icon: '💍', price: 12000 },
];

const ShopWindow: React.FC<ShopWindowProps> = ({ gold, onBuy }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between border-b border-[#00e5ff]/20 pb-4">
        <h2 className="system-font text-[#00e5ff] text-xl flex items-center gap-3">
          <ShoppingBag className="text-[#00e5ff]" size={28} />
          LOJA DO SISTEMA
        </h2>
        <div className="flex items-center gap-3 bg-[#eab308]/10 border border-[#eab308]/30 px-5 py-2 rounded-full">
          <Coins className="text-[#eab308]" size={20} />
          <span className="text-[#eab308] font-black system-font text-lg tracking-tighter">{gold.toLocaleString()}G</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shopItems.map((item) => (
          <div key={item.id} className="system-bg border border-white/5 p-5 rounded-2xl group hover:border-[#00e5ff]/50 transition-all flex items-center gap-5 relative overflow-hidden">
            <div className="w-20 h-20 bg-black/40 rounded-xl flex items-center justify-center text-4xl border border-white/5 group-hover:border-[#00e5ff]/30 transition-colors shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-lg text-white truncate">{item.name}</h3>
                <span className={`text-[9px] px-2 py-0.5 rounded-sm border font-black ${
                  item.rank === 'S' ? 'border-red-500 text-red-500 bg-red-500/10' :
                  item.rank === 'A' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' :
                  'border-[#00e5ff] text-[#00e5ff] bg-[#00e5ff]/10'
                }`}>RANK {item.rank}</span>
              </div>
              <p className="text-[11px] text-gray-500 mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                   <Coins size={14} className="text-yellow-500/60" />
                   <span className="text-yellow-500 font-bold system-font">{item.price?.toLocaleString()}G</span>
                </div>
                <button 
                  onClick={() => onBuy(item)}
                  disabled={gold < (item.price || 0)}
                  className={`flex items-center gap-2 text-[10px] px-4 py-2 rounded-lg font-black transition-all tracking-widest ${
                    gold >= (item.price || 0) 
                      ? 'bg-[#00e5ff] text-black hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.3)]' 
                      : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                  }`}
                >
                  COMPRAR <ArrowUpRight size={14} />
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
