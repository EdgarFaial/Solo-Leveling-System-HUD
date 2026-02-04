import React, { useState, useRef, useEffect } from 'react';
import { Send, Cpu, User } from 'lucide-react';
import { Stats } from '../types';
import { chatWithArchitect } from '../services/geminiService';

interface ArchitectChatProps {
  stats: Stats;
}

const ArchitectChat: React.FC<ArchitectChatProps> = ({ stats }) => {
  // Verificação de segurança
  if (!stats) {
    return (
      <div className="system-panel cut-corners p-8 text-center">
        <p className="text-red-500 font-black uppercase">ERRO: Dados do status não disponíveis</p>
      </div>
    );
  }

  const [messages, setMessages] = useState<{role: 'architect' | 'user', text: string}[]>([
    { role: 'architect', text: "UNIDADE VINCULADA. AGUARDANDO COMANDOS DE PROTOCOLO." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await chatWithArchitect(stats, userMsg, history);
      
      setMessages(prev => [...prev, { role: 'architect', text: response }]);
    } catch (error) {
      console.error("Erro no chat:", error);
      setMessages(prev => [...prev, { 
        role: 'architect', 
        text: "ERRO: Não foi possível conectar ao Arquiteto. Verifique sua conexão ou chave API." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] animate-in fade-in duration-500">
      <div className="flex items-center gap-3 border-b border-cyan-400/20 pb-4 mb-4">
        <Cpu className="text-cyan-400 animate-pulse" size={20} />
        <h2 className="system-font text-cyan-400 text-sm font-black uppercase italic tracking-widest">Canal do Arquiteto</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 cut-corners border ${
              m.role === 'user' 
                ? 'bg-white/5 border-white/10 text-white' 
                : 'bg-cyan-950/20 border-cyan-400/30 text-cyan-400 italic font-medium'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {m.role === 'architect' ? <Cpu size={10} /> : <User size={10} />}
                <span className="text-[7px] font-black uppercase tracking-widest opacity-60">
                  {m.role === 'architect' ? 'ARQUITETO' : 'UNIDADE'}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed uppercase">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="p-4 cut-corners bg-cyan-950/20 border border-cyan-400/30 animate-pulse">
               <div className="flex gap-1">
                 <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></div>
                 <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-75"></div>
                 <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-150"></div>
               </div>
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      <div className="flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="SOLICITAR ORIENTAÇÃO..."
          className="flex-1 bg-transparent border border-cyan-400/20 cut-corners p-4 text-[10px] text-white font-black uppercase outline-none focus:border-cyan-400 transition-all"
        />
        <button onClick={handleSend} className="px-6 bg-cyan-400 text-black cut-corners flex items-center justify-center active:scale-95 transition-all">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ArchitectChat;