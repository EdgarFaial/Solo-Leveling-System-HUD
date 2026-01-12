
import React, { useEffect, useState } from 'react';

interface SystemDialogProps {
  message: string;
  onClose: () => void;
  type?: 'default' | 'urgent' | 'level-up';
}

const SystemDialog: React.FC<SystemDialogProps> = ({ message, onClose, type = 'default' }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500);
    }, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyle = () => {
    switch(type) {
      case 'urgent': return {
        border: 'border-red-600',
        text: 'text-red-500',
        bg: 'bg-red-950/40',
        shadow: 'shadow-[0_0_40px_rgba(220,38,38,0.6)]',
        label: '!!! ALERTA DE EMERGÊNCIA !!!'
      };
      case 'level-up': return {
        border: 'border-yellow-500',
        text: 'text-yellow-400',
        bg: 'bg-yellow-950/40',
        shadow: 'shadow-[0_0_40px_rgba(234,179,8,0.5)]',
        label: 'EVOLUÇÃO DE NÍVEL'
      };
      default: return {
        border: 'border-[#00e5ff]',
        text: 'text-[#00e5ff]',
        bg: 'bg-[#00151a]/90',
        shadow: 'shadow-[0_0_30px_rgba(0,229,255,0.4)]',
        label: 'MENSAGEM DO SISTEMA'
      };
    }
  };

  const s = getStyle();

  return (
    <div className={`fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`relative w-full max-w-lg system-bg border-2 ${s.border} ${s.shadow} animate-in zoom-in duration-300`}>
        {/* Decorative HUD corners */}
        <div className={`absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 ${s.border}`}></div>
        <div className={`absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 ${s.border}`}></div>
        <div className={`absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 ${s.border}`}></div>
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 ${s.border}`}></div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className={`system-font text-xs font-black tracking-[0.4em] ${s.text}`}>{s.label}</h4>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => <div key={i} className={`w-1 h-1 rounded-full ${s.text} bg-current opacity-40 animate-pulse`} style={{animationDelay: `${i*200}ms`}}></div>)}
            </div>
          </div>

          <p className="text-white text-xl md:text-2xl font-bold system-font tracking-tight leading-relaxed uppercase italic">
            {message}
          </p>

          <div className="mt-8 flex justify-between items-center opacity-40">
            <div className="text-[9px] font-black tracking-widest text-gray-500">AUTH: LEVEL_ALPHA_7</div>
            <button onClick={() => setVisible(false)} className="text-[10px] font-black text-white hover:text-[#00e5ff] transition-colors tracking-widest uppercase">
              [ FECHAR ]
            </button>
          </div>
        </div>

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <div className="w-full h-[1px] bg-white absolute top-0 animate-[scanline_3s_linear_infinite]"></div>
        </div>
      </div>
    </div>
  );
};

export default SystemDialog;
