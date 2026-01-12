
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Info, Cpu, ChevronRight } from 'lucide-react';

interface SystemDialogProps {
  message: string;
  onClose: () => void;
  type?: 'default' | 'urgent' | 'level-up';
}

const SystemDialog: React.FC<SystemDialogProps> = ({ message, onClose, type = 'default' }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 400);
  };

  const getStyle = () => {
    switch(type) {
      case 'urgent': return {
        border: 'border-red-500',
        text: 'text-red-500',
        bg: 'bg-red-950/90',
        label: 'PROTOCOLO DE PENALIDADE',
        icon: AlertTriangle
      };
      case 'level-up': return {
        border: 'border-cyan-400',
        text: 'text-cyan-400',
        bg: 'bg-cyan-950/90',
        label: 'NOTIFICAÇÃO DE EVOLUÇÃO',
        icon: Cpu
      };
      default: return {
        border: 'border-cyan-400',
        text: 'text-cyan-400',
        bg: 'rgba(6, 26, 35, 0.95)',
        label: 'MENSAGEM DO SISTEMA',
        icon: Info
      };
    }
  };

  const s = getStyle();

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`relative w-full max-w-lg ${s.bg} border ${s.border} cut-corners animate-in zoom-in-95 duration-300 shadow-[0_0_50px_rgba(0,0,0,0.8)]`}>
        
        {/* Header da Janela Estilo Anime */}
        <div className={`flex items-center justify-between px-6 py-3 border-b ${s.border} bg-white/5`}>
          <div className="flex items-center gap-3">
            <s.icon size={16} className={`${s.text} animate-pulse`} />
            <span className={`system-font text-[10px] font-black tracking-[0.4em] ${s.text} uppercase italic`}>
              {s.label}
            </span>
          </div>
          <div className="flex gap-1">
            <div className={`w-1 h-1 rounded-full ${s.text} opacity-40`}></div>
            <div className={`w-1 h-1 rounded-full ${s.text} opacity-20`}></div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <p className="text-white text-lg md:text-xl font-black system-font tracking-tight leading-relaxed uppercase italic glow-text">
              {message}
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/5">
            <button 
              onClick={handleClose}
              className={`flex items-center gap-2 px-8 py-2 bg-transparent border ${s.border} ${s.text} font-black system-font text-[11px] tracking-[0.3em] uppercase italic hover:bg-white hover:text-black transition-all group`}
            >
              [ CONFIRMAR ]
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Scanline interno */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
          <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,white_2px,white_4px)]"></div>
        </div>
      </div>
    </div>
  );
};

export default SystemDialog;
