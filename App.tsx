import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, ScrollText, Brain, ShieldCheck, MessageSquare, Coins, Plus,
  User, Check, Zap, Info, Box, Target, Award, Dumbbell, Users, Trophy,
  ShieldAlert, Clock, Heart, Battery, Eye, BarChart3, Lock, AlertTriangle,
  Cpu, ChevronRight, Send, Backpack, Package, Camera, Save, X, Trash2,
  Edit2, CheckCircle2
} from 'lucide-react';
import { Stats, Quest, Skill, SystemTab, calculateRank, INITIAL_STATS, Item, AvailableItem, CustomQuestData, CustomSkillData, QuestCategory } from './types';
import { generateDailyQuests, generateObjectiveBatch, fillSkillPool, chatWithArchitect } from './services/geminiService';



// Componentes básicos inline para simplificar
const StatusWindow: React.FC<{ stats: Stats; onAllocate: (statKey: keyof Stats) => void }> = ({ stats, onAllocate }) => {
  if (!stats) return <div className="p-4 text-red-500">Status não disponível</div>;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-cyan-400/20 pb-4">
        <h2 className="system-font text-cyan-400 text-xl flex items-center gap-3 italic">
          <Zap className="text-cyan-400" size={24} />
          STATUS DA UNIDADE
        </h2>
        <div className="text-right">
          <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Pontos Livres</span>
          <div className="text-[10px] text-cyan-500 font-black">{stats.unallocatedPoints || 0}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="system-panel cut-corners p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Heart size={14} className="text-red-500" />
              <span className="text-[10px] font-black uppercase text-white">SAÚDE</span>
            </div>
            <span className="text-sm font-black text-white">{(stats.hp || 0)}/{(stats.maxHp || 100)}</span>
          </div>
          <div className="h-2 bg-white/5 cut-corners overflow-hidden">
            <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${((stats.hp || 0) / (stats.maxHp || 100)) * 100}%` }} />
          </div>
        </div>

        <div className="system-panel cut-corners p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Battery size={14} className="text-cyan-400" />
              <span className="text-[10px] font-black uppercase text-white">FOCO</span>
            </div>
            <span className="text-sm font-black text-white">{(stats.focusCapacity || 0)}/{(stats.maxFocusCapacity || 100)}</span>
          </div>
          <div className="h-2 bg-white/5 cut-corners overflow-hidden">
            <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${((stats.focusCapacity || 0) / (stats.maxFocusCapacity || 100)) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="system-panel cut-corners p-4 border-cyan-400/20 bg-cyan-400/5">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-yellow-500" />
            <span className="text-[9px] text-yellow-500 font-black uppercase">NÍVEL</span>
          </div>
          <span className="text-lg font-black text-white">{stats.level || 1}</span>
        </div>
        <div className="h-2 bg-white/5 cut-corners overflow-hidden">
          <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: `${((stats.exp || 0) / (stats.maxExp || 100)) * 100}%` }} />
        </div>
        <div className="flex justify-between text-[8px] text-gray-500 font-black uppercase mt-1">
          <span>EXP: {stats.exp || 0}</span>
          <span>PRÓXIMO: {stats.maxExp || 100}</span>
        </div>
      </div>
    </div>
  );
};

const QuestWindow: React.FC<{ quests: Quest[]; onComplete: (id: string) => void; onProgress: (id: string) => void }> = ({ quests, onComplete, onProgress }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'intervention'>('daily');
  
  const QuestTimer: React.FC<{ deadline: string }> = ({ deadline }) => {
    const [timeLeft, setTimeLeft] = useState("");
    useEffect(() => {
      const update = () => {
        const diff = new Date(deadline).getTime() - new Date().getTime();
        if (diff < 0) {
          setTimeLeft("EXPIRADO");
          return;
        }
        const h = Math.floor(diff / (1000 * 3600));
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      };
      update();
      const timer = setInterval(update, 1000);
      return () => clearInterval(timer);
    }, [deadline]);
    
    return <span className="font-mono">{timeLeft}</span>;
  };

  const filtered = quests.filter(q => q.type === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button 
          onClick={() => setActiveTab('daily')} 
          className={`flex-1 py-3 cut-corners border text-[10px] font-black uppercase italic ${activeTab === 'daily' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10' : 'border-white/5 opacity-50'}`}
        >
          DIÁRIOS
        </button>
        <button 
          onClick={() => setActiveTab('intervention')} 
          className={`flex-1 py-3 cut-corners border text-[10px] font-black uppercase italic ${activeTab === 'intervention' ? 'border-purple-500 text-purple-400 bg-purple-500/10' : 'border-white/5 opacity-50'}`}
        >
          ORDEM ESTRATÉGICA
        </button>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-20 text-center opacity-20">
            <ShieldAlert className="mx-auto mb-4" />
            <p className="text-[10px] uppercase font-black italic">AGUARDANDO ATUALIZAÇÃO DO ARQUITETO...</p>
          </div>
        ) : (
          filtered.map(q => (
            <div key={q.id} className={`system-panel cut-corners p-6 border-l-4 ${q.completed ? 'opacity-30 border-green-500' : q.type === 'intervention' ? 'border-purple-500' : 'border-cyan-400'}`}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="system-font text-xs font-black uppercase italic glow-text">{q.title || 'Missão sem título'}</h3>
                <div className="text-[9px] font-black text-cyan-500 flex items-center gap-1 bg-black/40 px-2 py-1 cut-corners">
                  <Clock size={10} /> <QuestTimer deadline={q.deadline} />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 uppercase italic leading-tight mb-4">{q.description || 'Sem descrição'}</p>
              
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase italic">
                  <span>PROGRESSO</span>
                  <span>{q.progress || 0} / {q.target || 1}</span>
                </div>
                <div className="h-1 bg-white/5 cut-corners overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${q.type === 'intervention' ? 'bg-purple-500' : 'bg-cyan-400'}`} style={{ width: `${((q.progress || 0) / (q.target || 1)) * 100}%` }} />
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-3">
                <div className="flex gap-4 text-[9px] font-black italic opacity-60">
                  <div className="text-yellow-500">{q.goldReward || 0}G</div>
                  <div className="text-cyan-400">+{q.expReward || 0} EXP</div>
                </div>
                {!q.completed && (
                  (q.progress || 0) >= (q.target || 1) ? 
                  <button onClick={() => onComplete(q.id)} className="bg-cyan-400 text-black px-4 py-2 text-[9px] font-black uppercase italic animate-pulse">COMPLETAR</button> :
                  <button onClick={() => onProgress(q.id)} className="border border-cyan-400 text-cyan-400 p-2 rounded-full active:scale-90"><Plus size={14} /></button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const InventoryWindow: React.FC<{ items: Item[] }> = ({ items }) => {
  return (
    <div className="space-y-6">
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
                {item.icon || '📦'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ItemsRegistryWindow: React.FC<{ items: AvailableItem[]; onToggle: (id: string) => void }> = ({ items, onToggle }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-cyan-400/20 pb-4">
        <h2 className="system-font text-cyan-400 text-xl flex items-center gap-3 italic">
          <ShieldCheck className="text-cyan-400" size={24} />
          REGISTRO DE HARDWARE REAL
        </h2>
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
              {item.owned ? <Check size={28} /> : <span>{item.icon || '📦'}</span>}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-black uppercase tracking-wider text-sm transition-colors ${item.owned ? 'text-white' : 'text-gray-500'}`}>
                    {item.name || 'Item sem nome'}
                  </h3>
                  <span className="text-[8px] text-cyan-500 font-black uppercase tracking-widest">{item.category || 'geral'}</span>
                </div>
              </div>
              
              <p className="text-[10px] text-gray-500 mt-1 mb-2 leading-tight uppercase italic">{item.description || 'Sem descrição'}</p>
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
    </div>
  );
};

const ArchitectChat: React.FC<{ stats: Stats }> = ({ stats }) => {
  const [messages, setMessages] = useState<{role: 'architect' | 'user', text: string}[]>([
    { role: 'architect', text: "UNIDADE VINCULADA. AGUARDANDO COMANDOS DE PROTOCOLO." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="flex flex-col h-[70vh]">
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

const ProfileWindow: React.FC<{ stats: Stats; onSave: (updated: Partial<Stats>) => void; onClose: () => void }> = ({ stats, onSave, onClose }) => {
  const [name, setName] = useState(stats.playerName || '');
  const [age, setAge] = useState(stats.age || 0);
  const [goal, setGoal] = useState(stats.customGoal || "");
  const [avatar, setAvatar] = useState(stats.avatar || '👤');

  const handleSave = () => {
    onSave({ 
      playerName: name.toUpperCase(), 
      age, 
      customGoal: goal, 
      avatar
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-3xl">
      <div className="w-full max-w-md system-panel border-cyan-400 cut-corners p-6 md:p-8 bg-cyan-950/10 max-h-[95vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-8 border-b border-cyan-400/20 pb-4">
          <h2 className="system-font text-cyan-400 text-base md:text-lg uppercase font-black italic flex items-center gap-3">
            <User size={20} /> Perfil da Unidade
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="relative group">
              <div className="w-24 h-24 md:w-28 md:h-28 border-2 border-cyan-400 cut-corners overflow-hidden flex items-center justify-center bg-cyan-400/5 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
                <div className="w-full h-full flex items-center justify-center text-5xl p-2">
                  {avatar}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Identificador Nominal:</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/20 border-b border-cyan-400/40 p-2 text-white font-black uppercase outline-none focus:border-cyan-400 transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Ciclo de Idade:</label>
              <input type="number" value={age} onChange={e => setAge(parseInt(e.target.value) || 0)} className="w-full bg-black/20 border-b border-cyan-400/40 p-2 text-white font-black outline-none focus:border-cyan-400 transition-colors" />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Objetivo Direcionador:</label>
              <textarea value={goal} onChange={e => setGoal(e.target.value)} className="w-full bg-black/20 border border-cyan-400/40 p-3 text-white font-black uppercase text-[10px] outline-none h-20 resize-none focus:border-cyan-400 transition-colors" />
            </div>
          </div>

          <button onClick={handleSave} className="w-full bg-cyan-400 text-black font-black py-4 system-font text-xs uppercase italic tracking-widest mt-4 shadow-lg hover:bg-white transition-all flex items-center justify-center gap-3 active:scale-95">
            <Save size={18} /> [ SINCRONIZAR PERFIL ]
          </button>
        </div>
      </div>
    </div>
  );
};

const SystemDialog: React.FC<{ message: string; onClose: () => void; type?: 'default' | 'urgent' | 'level-up' }> = ({ message, onClose, type = 'default' }) => {
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
      <div className={`relative w-full max-w-lg ${s.bg} border ${s.border} cut-corners shadow-[0_0_50px_rgba(0,0,0,0.8)]`}>
        <div className={`flex items-center justify-between px-6 py-3 border-b ${s.border} bg-white/5`}>
          <div className="flex items-center gap-3">
            <s.icon size={16} className={`${s.text} animate-pulse`} />
            <span className={`system-font text-[10px] font-black tracking-[0.4em] ${s.text} uppercase italic`}>
              {s.label}
            </span>
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
      </div>
    </div>
  );
};

const TrainingModal: React.FC<{ statKey: keyof Stats; currentValue: number; onSuccess: () => void; onCancel: () => void }> = ({ statKey, currentValue, onSuccess, onCancel }) => {
  const [isTraining, setIsTraining] = useState(false);
  
  const getTaskDetails = (key: keyof Stats) => {
    const val = currentValue || 0;
    
    switch(key) {
      case 'strength': 
        return { 
          task: 'Exaustão Muscular (Flexões)', 
          target: 10 + (val * 3), 
          unit: 'repetições', 
          icon: Dumbbell, 
          color: 'text-red-500',
          desc: 'Recrute fibras musculares dormentes.'
        };
      case 'agility': 
        return { 
          task: 'Coordenação Explosiva (Polichinelos)', 
          target: 20 + (val * 5), 
          unit: 'repetições', 
          icon: Zap, 
          color: 'text-yellow-400',
          desc: 'Otimize a velocidade de condução nervosa.'
        };
      case 'vitality': 
        return { 
          task: 'Resistência Isométrica (Prancha)', 
          target: 45 + (val * 15), 
          unit: 'segundos', 
          icon: Shield, 
          color: 'text-blue-500',
          desc: 'Fortaleça o núcleo biológico.'
        };
      case 'sense': 
        return { 
          task: 'Vigilância Atenta (Observação Silenciosa)', 
          target: 5 + (val * 2), 
          unit: 'minutos', 
          icon: Eye, 
          color: 'text-green-400',
          desc: 'Observe o ambiente sem estímulos digitais.'
        };
      case 'intelligence': 
        return { 
          task: 'Carga Cognitiva (Foco Ininterrupto)', 
          target: 20 + (val * 10), 
          unit: 'minutos', 
          icon: Brain, 
          color: 'text-purple-500',
          desc: 'Mergulhe em estudo ou trabalho técnico.'
        };
      case 'will': 
        return { 
          task: 'Jejum de Dopamina (Restrição Digital)', 
          target: 1 + (val * 0.5), 
          unit: 'horas', 
          icon: BarChart3, 
          color: 'text-orange-500',
          desc: 'Abstinência total de redes sociais, jogos e entretenimento.'
        };
      default: 
        return { 
          task: 'Teste Geral', 
          target: 10, 
          unit: 'unidades', 
          icon: Dumbbell, 
          color: 'text-gray-400',
          desc: 'O Sistema exige prova de competência.'
        };
    }
  };

  const { task, target, unit, icon: Icon, color, desc } = getTaskDetails(statKey);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6">
      <div className="system-panel border-cyan-400 cut-corners max-w-md w-full overflow-hidden shadow-[0_0_100px_rgba(0,229,255,0.2)]">
        <div className="bg-cyan-400/10 p-5 flex justify-between items-center border-b border-cyan-400/30">
          <div className="flex items-center gap-3">
            <Lock size={16} className="text-cyan-400" />
            <h2 className="system-font text-cyan-400 text-xs font-black uppercase tracking-[0.3em] italic">Prova de Evolução de Atributo</h2>
          </div>
          <button onClick={onCancel} className="text-gray-600 hover:text-white transition-colors p-1"><X size={20} /></button>
        </div>
        
        <div className="p-10 text-center">
          <div className={`mx-auto w-24 h-24 cut-corners bg-white/5 border border-white/10 flex items-center justify-center mb-8 ${color}`}>
            <Icon size={48} strokeWidth={1.5} />
          </div>
          
          <div className="space-y-2 mb-8">
            <h3 className="text-3xl font-black system-font text-white italic uppercase tracking-tighter leading-tight">{task}</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic leading-relaxed px-4">
              {desc}
            </p>
          </div>
          
          <div className="flex justify-center items-center gap-6 mb-12">
            <div className="bg-white/5 border border-white/10 p-6 cut-corners min-w-[160px] relative overflow-hidden">
              <div className="text-5xl font-black text-cyan-400 italic">{Math.round(target)}</div>
              <div className="text-[9px] text-gray-600 uppercase font-black mt-2 tracking-[0.2em]">{unit}</div>
            </div>
          </div>

          {!isTraining ? (
            <div className="space-y-4">
              <button 
                onClick={() => setIsTraining(true)}
                className="w-full bg-cyan-400 text-black font-black py-5 system-font text-xs tracking-[0.4em] uppercase italic hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] active:scale-[0.98]"
              >
                [ INICIAR PROTOCOLO ]
              </button>
              <p className="text-[8px] text-gray-700 font-black uppercase tracking-[0.3em]">O Arquiteto monitora sua resposta galvânica.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-1">
                  <div className="w-1.5 h-6 bg-cyan-400 animate-pulse delay-75"></div>
                  <div className="w-1.5 h-6 bg-cyan-400 animate-pulse delay-150"></div>
                  <div className="w-1.5 h-6 bg-cyan-400 animate-pulse delay-300"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-cyan-400 font-black text-[9px] tracking-[0.4em] uppercase animate-pulse italic">SINCRONIZANDO DADOS BIOMÉTRICOS...</p>
                  <p className="text-[8px] text-gray-600 italic uppercase">Qualquer desvio resultará em anulação da evolução.</p>
                </div>
              </div>
              <button 
                onClick={onSuccess}
                className="w-full flex items-center justify-center gap-3 border border-green-500 text-green-500 font-black py-5 system-font text-[10px] tracking-[0.3em] uppercase italic hover:bg-green-500 hover:text-black transition-all active:scale-[0.98]"
              >
                <CheckCircle2 size={18} /> CONFIRMAR EXECUÇÃO
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CustomModePanel: React.FC<{
  quests: Quest[];
  skills: Skill[];
  onAddQuest: (questData: CustomQuestData) => void;
  onAddSkill: (skillData: CustomSkillData) => void;
  onDeleteQuest: (id: string) => void;
  onDeleteSkill: (id: string) => void;
  onEditQuest: (id: string, updated: Partial<Quest>) => void;
  onEditSkill: (id: string, updated: Partial<Skill>) => void;
}> = ({
  quests,
  skills,
  onAddQuest,
  onAddSkill,
  onDeleteQuest,
  onDeleteSkill,
  onEditQuest,
  onEditSkill
}) => {
  const [showQuestForm, setShowQuestForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingQuest, setEditingQuest] = useState<string | null>(null);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);

  const [questForm, setQuestForm] = useState<CustomQuestData>({
    title: '',
    description: '',
    category: 'COGNITIVO',
    target: 1,
    reward: 'Auto-satisfação',
    deadlineDays: 1
  });

  const [skillForm, setSkillForm] = useState<CustomSkillData>({
    name: '',
    description: '',
    type: 'COGNITIVA',
    testTask: '',
    testTarget: 1,
    testUnit: 'repetições'
  });

  const handleAddQuest = () => {
    if (questForm.title && questForm.description) {
      onAddQuest(questForm);
      setQuestForm({
        title: '',
        description: '',
        category: 'COGNITIVO',
        target: 1,
        reward: 'Auto-satisfação',
        deadlineDays: 1
      });
      setShowQuestForm(false);
      setEditingQuest(null);
    }
  };

  const handleAddSkill = () => {
    if (skillForm.name && skillForm.description) {
      onAddSkill(skillForm);
      setSkillForm({
        name: '',
        description: '',
        type: 'COGNITIVA',
        testTask: '',
        testTarget: 1,
        testUnit: 'repetições'
      });
      setShowSkillForm(false);
      setEditingSkill(null);
    }
  };

  const categoryIcons: Record<QuestCategory, any> = {
    'FÍSICO': Dumbbell,
    'COGNITIVO': Brain,
    'SOCIAL': Users,
    'CONTROLE': Target,
    'BIOHACKING': Award,
    'RECUPERAÇÃO': Save
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="system-panel cut-corners p-6 border-yellow-500/30 bg-yellow-500/5">
        <div className="flex items-center gap-3 mb-4">
          <Target className="text-yellow-500" size={24} />
          <h2 className="system-font text-yellow-500 text-lg font-black uppercase italic">MODO LIVRE ATIVADO</h2>
        </div>
        <p className="text-[11px] text-gray-400 uppercase italic leading-relaxed">
          Você está no controle total. Crie suas próprias missões, habilidades e regras.
          O Sistema agora é sua ferramenta de auto-otimização pessoal.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="system-font text-cyan-400 text-sm font-black uppercase italic flex items-center gap-2">
            <Award size={16} /> MISSÕES PERSONALIZADAS ({quests.length})
          </h3>
          <button
            onClick={() => {
              setShowQuestForm(true);
              setEditingQuest(null);
              setQuestForm({
                title: '',
                description: '',
                category: 'COGNITIVO',
                target: 1,
                reward: 'Auto-satisfação',
                deadlineDays: 1
              });
            }}
            className="bg-cyan-400 text-black px-4 py-2 text-[10px] font-black uppercase italic cut-corners hover:bg-white transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={14} /> NOVA MISSÃO
          </button>
        </div>

        {showQuestForm && (
          <div className="system-panel cut-corners p-6 border-cyan-400/30 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[12px] font-black text-white uppercase">
                {editingQuest ? 'EDITAR MISSÃO' : 'CRIAR MISSÃO PERSONALIZADA'}
              </h4>
              <button onClick={() => {
                setShowQuestForm(false);
                setEditingQuest(null);
              }} className="text-gray-600 hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                value={questForm.title}
                onChange={(e) => setQuestForm({...questForm, title: e.target.value.toUpperCase()})}
                placeholder="TÍTULO DA MISSÃO"
                className="w-full bg-black/30 border border-cyan-400/30 p-3 text-white text-[11px] uppercase outline-none cut-corners"
              />
              
              <textarea
                value={questForm.description}
                onChange={(e) => setQuestForm({...questForm, description: e.target.value})}
                placeholder="DESCRIÇÃO DETALHADA (O que precisa fazer?)"
                className="w-full bg-black/30 border border-cyan-400/30 p-3 text-white text-[11px] uppercase outline-none cut-corners h-24 resize-none"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-gray-500 uppercase mb-1 block">ALVO</label>
                  <input
                    type="number"
                    value={questForm.target}
                    onChange={(e) => setQuestForm({...questForm, target: parseInt(e.target.value) || 1})}
                    className="w-full bg-black/30 border border-cyan-400/30 p-3 text-white text-[11px] outline-none cut-corners"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="text-[9px] text-gray-500 uppercase mb-1 block">PRAZO (DIAS)</label>
                  <input
                    type="number"
                    value={questForm.deadlineDays}
                    onChange={(e) => setQuestForm({...questForm, deadlineDays: parseInt(e.target.value) || 1})}
                    className="w-full bg-black/30 border border-cyan-400/30 p-3 text-white text-[11px] outline-none cut-corners"
                    min="1"
                    max="30"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[9px] text-gray-500 uppercase mb-2 block">CATEGORIA</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(categoryIcons) as QuestCategory[]).map((cat) => {
                    const Icon = categoryIcons[cat];
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setQuestForm({...questForm, category: cat})}
                        className={`px-3 py-2 text-[10px] font-black uppercase cut-corners flex items-center gap-2 ${
                          questForm.category === cat 
                            ? 'bg-cyan-400 text-black' 
                            : 'bg-black/30 text-gray-400 border border-gray-700'
                        }`}
                      >
                        <Icon size={12} />
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <button
                onClick={handleAddQuest}
                className="w-full bg-green-500 text-black font-black py-3 text-[11px] uppercase italic cut-corners hover:bg-green-400 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save size={14} /> {editingQuest ? 'ATUALIZAR MISSÃO' : 'SALVAR MISSÃO'}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {quests.length === 0 ? (
            <div className="system-panel cut-corners p-8 text-center opacity-40">
              <Award className="mx-auto mb-3" size={32} />
              <p className="text-[11px] text-gray-500 uppercase italic">Nenhuma missão personalizada criada.</p>
              <p className="text-[10px] text-gray-600 uppercase mt-1">Clique em "NOVA MISSÃO" para começar.</p>
            </div>
          ) : (
            quests.map((quest) => (
              <div key={quest.id} className="system-panel cut-corners p-5 border-l-4 border-green-500 bg-green-500/5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-[13px] font-black text-white uppercase">{quest.title || 'Missão sem título'}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] text-cyan-500 font-black uppercase bg-cyan-500/10 px-2 py-1 cut-corners">
                        {quest.category || 'GERAL'}
                      </span>
                      <span className="text-[8px] text-gray-500">Alvo: {quest.target || 1}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setQuestForm({
                          title: quest.title || '',
                          description: quest.description || '',
                          category: quest.category || 'COGNITIVO',
                          target: quest.target || 1,
                          reward: quest.reward || 'Auto-satisfação',
                          deadlineDays: Math.max(1, Math.ceil((new Date(quest.deadline).getTime() - Date.now()) / (1000 * 3600 * 24)))
                        });
                        setEditingQuest(quest.id);
                        setShowQuestForm(true);
                      }}
                      className="text-cyan-400 hover:text-white p-1"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteQuest(quest.id)}
                      className="text-red-500 hover:text-red-300 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 uppercase italic mb-3">{quest.description || 'Sem descrição'}</p>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <div className="text-[10px] text-gray-600 uppercase">
                    <span className="text-yellow-500 font-black">{quest.goldReward || 0}G</span> • 
                    <span className="text-cyan-400 font-black ml-2">+{quest.expReward || 0} EXP</span>
                  </div>
                  <div className="text-[9px] text-gray-500">
                    Progresso: {quest.progress || 0}/{quest.target || 1}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="system-font text-purple-400 text-sm font-black uppercase italic flex items-center gap-2">
            <Brain size={16} /> HABILIDADES PERSONALIZADAS ({skills.length})
          </h3>
          <button
            onClick={() => {
              setShowSkillForm(true);
              setEditingSkill(null);
              setSkillForm({
                name: '',
                description: '',
                type: 'COGNITIVA',
                testTask: '',
                testTarget: 1,
                testUnit: 'repetições'
              });
            }}
            className="bg-purple-500 text-black px-4 py-2 text-[10px] font-black uppercase italic cut-corners hover:bg-purple-400 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={14} /> NOVA HABILIDADE
          </button>
        </div>

        {showSkillForm && (
          <div className="system-panel cut-corners p-6 border-purple-500/30 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[12px] font-black text-white uppercase">
                {editingSkill ? 'EDITAR HABILIDADE' : 'CRIAR HABILIDADE PERSONALIZADA'}
              </h4>
              <button onClick={() => {
                setShowSkillForm(false);
                setEditingSkill(null);
              }} className="text-gray-600 hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                value={skillForm.name}
                onChange={(e) => setSkillForm({...skillForm, name: e.target.value.toUpperCase()})}
                placeholder="NOME DA HABILIDADE"
                className="w-full bg-black/30 border border-purple-500/30 p-3 text-white text-[11px] uppercase outline-none cut-corners"
              />
              
              <textarea
                value={skillForm.description}
                onChange={(e) => setSkillForm({...skillForm, description: e.target.value})}
                placeholder="DESCRIÇÃO (O que esta habilidade faz?)"
                className="w-full bg-black/30 border border-purple-500/30 p-3 text-white text-[11px] uppercase outline-none cut-corners h-20 resize-none"
              />
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[9px] text-gray-500 uppercase mb-1 block">TESTE</label>
                  <input
                    value={skillForm.testTask}
                    onChange={(e) => setSkillForm({...skillForm, testTask: e.target.value})}
                    placeholder="Ex: 30 flexões"
                    className="w-full bg-black/30 border border-purple-500/30 p-2 text-white text-[10px] outline-none cut-corners"
                  />
                </div>
                
                <div>
                  <label className="text-[9px] text-gray-500 uppercase mb-1 block">ALVO</label>
                  <input
                    type="number"
                    value={skillForm.testTarget}
                    onChange={(e) => setSkillForm({...skillForm, testTarget: parseInt(e.target.value) || 1})}
                    className="w-full bg-black/30 border border-purple-500/30 p-2 text-white text-[10px] outline-none cut-corners"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="text-[9px] text-gray-500 uppercase mb-1 block">UNIDADE</label>
                  <select
                    value={skillForm.testUnit}
                    onChange={(e) => setSkillForm({...skillForm, testUnit: e.target.value})}
                    className="w-full bg-black/30 border border-purple-500/30 p-2 text-white text-[10px] outline-none cut-corners"
                  >
                    <option value="repetições">repetições</option>
                    <option value="minutos">minutos</option>
                    <option value="horas">horas</option>
                    <option value="dias">dias</option>
                    <option value="séries">séries</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleAddSkill}
                className="w-full bg-green-500 text-black font-black py-3 text-[11px] uppercase italic cut-corners hover:bg-green-400 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save size={14} /> {editingSkill ? 'ATUALIZAR HABILIDADE' : 'SALVAR HABILIDADE'}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {skills.length === 0 ? (
            <div className="system-panel cut-corners p-8 text-center opacity-40">
              <Brain className="mx-auto mb-3" size={32} />
              <p className="text-[11px] text-gray-500 uppercase italic">Nenhuma habilidade personalizada criada.</p>
              <p className="text-[10px] text-gray-600 uppercase mt-1">Clique em "NOVA HABILIDADE" para começar.</p>
            </div>
          ) : (
            skills.map((skill) => (
              <div key={skill.id} className="system-panel cut-corners p-5 border-l-4 border-purple-500 bg-purple-500/5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-[13px] font-black text-white uppercase">{skill.name || 'Habilidade sem nome'}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] text-purple-500 font-black uppercase bg-purple-500/10 px-2 py-1 cut-corners">
                        {skill.type || 'COGNITIVA'}
                      </span>
                      <span className="text-[8px] text-gray-500">Nível {skill.level || 1}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSkillForm({
                          name: skill.name || '',
                          description: skill.description || '',
                          type: skill.type || 'COGNITIVA',
                          testTask: skill.testTask || '',
                          testTarget: skill.testTarget || 1,
                          testUnit: skill.testUnit || 'repetições'
                        });
                        setEditingSkill(skill.id);
                        setShowSkillForm(true);
                      }}
                      className="text-purple-400 hover:text-white p-1"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteSkill(skill.id)}
                      className="text-red-500 hover:text-red-300 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 uppercase italic mb-3">{skill.description || 'Sem descrição'}</p>
                <div className="pt-3 border-t border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase">
                    <span className="font-black">TESTE:</span> {skill.testTask || 'Não especificado'} ({skill.testTarget || 1} {skill.testUnit || 'repetições'})
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// App principal
const App: React.FC = () => {
  const [isAwakened, setIsAwakened] = useState(false);
  const [activeTab, setActiveTab] = useState<SystemTab>('STATUS');
  const [notification, setNotification] = useState<{msg: string, type: 'default' | 'urgent' | 'level-up'} | null>(null);
  const [trainingStat, setTrainingStat] = useState<keyof Stats | null>(null);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillToTest, setSkillToTest] = useState<Skill | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const initializingRef = useRef(false);
  const processingLock = useRef(false);
  const storageKey = 'sl_system_v30';

  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([
    { id: 'item-1', name: 'DIÁRIO FÍSICO', category: 'diário', description: 'Registro de falhas.', owned: false, missionBonus: 'Foco Mental', statBonus: { stat: 'will', value: 2 }, icon: '📔' },
    { id: 'item-2', name: 'ACADEMIA', category: 'academia', description: 'Treino de carga.', owned: false, missionBonus: 'Força Bruta', statBonus: { stat: 'strength', value: 1 }, icon: '🏋️' }
  ]);

  const [quests, setQuests] = useState<Quest[]>([]);

  // Captura de erros globais
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      setError(`Erro: ${event.error?.message || 'Desconhecido'}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setError(`Promessa rejeitada: ${event.reason?.message || 'Unknown'}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleAddCustomQuest = (questData: CustomQuestData) => {
    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + (questData.deadlineDays || 1));
      
      const newQuest: Quest = {
        id: `custom-quest-${Date.now()}`,
        title: questData.title || 'Missão sem título',
        description: questData.description || 'Sem descrição',
        protocol: "CUSTOM",
        progress: 0,
        target: questData.target || 1,
        type: 'daily',
        category: questData.category || 'COGNITIVO',
        completed: false,
        deadline: deadline.toISOString(),
        reward: questData.reward || 'Auto-satisfação',
        goldReward: 50,
        expReward: 25,
        measurableAction: "Personalizado",
        timeCommitment: "Flexível",
        biologicalBenefit: "Auto-desenvolvimento",
        adaptationLogic: "Customizado",
        estimatedTime: "Variável",
        patternCorrection: "Personalizado",
        competenceDeveloped: "Auto-gestão",
        isUserCreated: true
      };
      
      setQuests(prev => [...prev, newQuest]);
    } catch (e: any) {
      console.error('Erro ao adicionar missão:', e);
      setError(`Erro ao criar missão: ${e.message}`);
    }
  };

  const handleAddCustomSkill = (skillData: CustomSkillData) => {
    try {
      const newSkill: Skill = {
        id: `custom-skill-${Date.now()}`,
        name: skillData.name || 'Habilidade sem nome',
        level: 1,
        type: skillData.type || 'COGNITIVA',
        description: skillData.description || 'Sem descrição',
        requirement: "Nível 1+",
        efficiencyBonus: "+5% em tarefas relacionadas",
        isUnlocked: false,
        testTask: skillData.testTask || 'Teste não especificado',
        testTarget: skillData.testTarget || 1,
        testUnit: skillData.testUnit || 'repetições',
        isDynamic: true
      };
      
      setSkills(prev => [...prev, newSkill]);
    } catch (e: any) {
      console.error('Erro ao adicionar habilidade:', e);
      setError(`Erro ao criar habilidade: ${e.message}`);
    }
  };

  const handleDeleteQuest = (id: string) => {
    setQuests(prev => prev.filter(q => q.id !== id));
  };

  const handleDeleteSkill = (id: string) => {
    setSkills(prev => prev.filter(s => s.id !== id));
  };

  // 1. Carregamento de Estado Inicial
  useEffect(() => {
    try {
      const data = localStorage.getItem(storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        
        // Validação segura dos dados
        const safeStats = { ...INITIAL_STATS, ...parsed.stats };
        Object.keys(INITIAL_STATS).forEach(key => {
          const statKey = key as keyof Stats;
          if (safeStats[statKey] === undefined) {
            // @ts-ignore
            safeStats[statKey] = INITIAL_STATS[statKey];
          }
        });
        
        setStats(safeStats);
        setQuests(Array.isArray(parsed.quests) ? parsed.quests : []);
        setInventory(Array.isArray(parsed.inventory) ? parsed.inventory : []);
        setAvailableItems(Array.isArray(parsed.availableItems) ? parsed.availableItems : availableItems);
        setSkills(Array.isArray(parsed.skills) ? parsed.skills : []);
        if (safeStats.playerName) setIsAwakened(true);
      }
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
      localStorage.removeItem(storageKey);
    }
  }, []);

  // 2. Persistência de Estado
  useEffect(() => {
    if (isAwakened) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ 
          stats, 
          quests: Array.isArray(quests) ? quests : [],
          inventory: Array.isArray(inventory) ? inventory : [],
          availableItems: Array.isArray(availableItems) ? availableItems : [],
          skills: Array.isArray(skills) ? skills : []
        }));
      } catch (e) {
        console.error("Erro ao salvar dados:", e);
      }
    }
  }, [stats, quests, inventory, availableItems, skills, isAwakened]);

  const ensureSkillPool = async () => {
    const unlearnedCount = skills.filter(s => !s.isUnlocked).length;
    if (unlearnedCount < 5 && !isProcessing && !processingLock.current) {
      processingLock.current = true;
      setIsProcessing(true);
      try {
        const newSkills = await fillSkillPool(stats, unlearnedCount);
        if (newSkills.length > 0) {
          setSkills(prev => {
            const currentUnlearned = prev.filter(s => !s.isUnlocked).length;
            if (currentUnlearned >= 5) return prev;
            return [...prev, ...newSkills];
          });
        }
      } catch (e) {
        console.error("Erro pool skills:", e);
      } finally {
        setIsProcessing(false);
        processingLock.current = false;
      }
    }
  };

  const checkDeadlines = async () => {
    const now = new Date();
    const today = now.toLocaleDateString();
    
    // Processamento de missões expiradas
    setQuests(prev => prev.filter(q => {
      if (!q.completed && new Date(q.deadline) < now) {
        setStats(s => ({ ...s, failedMissionsCount: (s.failedMissionsCount || 0) + 1 }));
        return false;
      }
      return true;
    }));

    if (stats.lastDailyUpdate !== today && !isProcessing && !processingLock.current) {
      await updateDailyQuests(today);
    }
  };

  const updateDailyQuests = async (todayLabel: string) => {
    processingLock.current = true;
    setIsProcessing(true);
    try {
      const newDailies = await generateDailyQuests(stats, availableItems.filter(i => i.owned), quests);
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      
      const questObjs: Quest[] = Array.isArray(newDailies) ? newDailies.map((q: any, i: number) => ({
        ...q, 
        id: `daily-${Date.now()}-${i}`, 
        progress: 0, 
        type: 'daily', 
        completed: false, 
        goldReward: 100, 
        expReward: 50, 
        deadline: midnight.toISOString()
      })) : [];

      setQuests(prev => [...prev.filter(q => q.type !== 'daily'), ...questObjs]);
      setStats(prev => ({ ...prev, lastDailyUpdate: todayLabel }));
    } catch(e) { 
      console.error("Erro ao atualizar missões diárias:", e); 
    } finally { 
      setIsProcessing(false); 
      processingLock.current = false;
    }
  };

  const triggerInitialBatch = async (s: Stats) => {
    processingLock.current = true;
    setIsProcessing(true);
    try {
      const response = await generateObjectiveBatch(s, availableItems.filter(i => i.owned), skills.filter(sk => sk.isUnlocked));
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 7);
      
      const questObjs: Quest[] = Array.isArray(response.quests) ? response.quests.map((q: any, i: number) => ({
        ...q, 
        id: `order-${Date.now()}-${i}`, 
        progress: 0, 
        type: 'intervention', 
        completed: false, 
        goldReward: 500, 
        expReward: 300, 
        deadline: deadline.toISOString()
      })) : [];
      
      setQuests(prev => [...prev.filter(q => q.type !== 'intervention'), ...questObjs]);
    } catch(e) { 
      console.error("Erro ao gerar lote inicial:", e); 
    } finally { 
      setIsProcessing(false); 
      processingLock.current = false;
    }
  };

  // Tela de erro
  if (error) {
    return (
      <div className="h-[100dvh] w-full bg-[#010a12] flex items-center justify-center p-6">
        <div className="w-full max-w-sm system-panel border-red-500 cut-corners p-8 bg-red-950/20 space-y-6">
          <h1 className="text-2xl font-black system-font text-center text-red-500 glow-text italic">ERRO DO SISTEMA</h1>
          <p className="text-sm text-gray-300 font-mono text-center">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-500 text-white font-black py-4 uppercase italic tracking-widest hover:bg-red-600 transition-colors"
            >
              REINICIAR SISTEMA
            </button>
            <button 
              onClick={() => setError(null)}
              className="w-full bg-gray-800 text-gray-400 font-black py-4 uppercase italic tracking-widest hover:bg-gray-700 transition-colors"
            >
              TENTAR CONTINUAR
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAwakened) {
    const [selectedMode, setSelectedMode] = useState<'architect' | 'custom'>('architect');
    const [step, setStep] = useState<'mode' | 'info'>('mode');

    const handleModeSelect = (mode: 'architect' | 'custom') => {
      setSelectedMode(mode);
      setStep('info');
    };

    const handleAwakening = (name: string, age: number, goal: string) => {
      if(!name || !age || !goal) return;
      const finalStats: Stats = { 
        ...INITIAL_STATS, 
        playerName: name.toUpperCase(), 
        age, 
        customGoal: goal, 
        systemMode: selectedMode
      };
      setStats(finalStats);
      if (selectedMode === 'architect') {
        triggerInitialBatch(finalStats);
      }
      setIsAwakened(true);
    };

    return (
      <div className="h-[100dvh] w-full bg-[#010a12] flex items-center justify-center p-6 text-cyan-400 overflow-hidden">
        <div className="w-full max-w-sm system-panel border-cyan-400 cut-corners p-8 bg-cyan-950/20 space-y-6">
          {step === 'mode' ? (
            <>
              <h1 className="text-4xl font-black system-font text-center glow-text italic tracking-wider">ERGA-SE</h1>
              <p className="text-[11px] text-gray-400 text-center uppercase italic font-bold">
                Selecione o modo de operação do Sistema:
              </p>
              
              <div className="space-y-4">
                <button 
                  onClick={() => handleModeSelect('architect')}
                  className={`w-full p-5 cut-corners border-2 text-left transition-all ${selectedMode === 'architect' ? 'border-cyan-400 bg-cyan-400/10' : 'border-gray-700 hover:border-cyan-400/50'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${selectedMode === 'architect' ? 'bg-cyan-400' : 'bg-gray-700'}`}></div>
                    <h3 className="system-font text-cyan-400 text-sm font-black uppercase">MODO ARQUITETO</h3>
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase italic">
                    IA Gemini personaliza missões baseadas em seus dados. Evolução guiada pelo Arquiteto.
                  </p>
                </button>
                
                <button 
                  onClick={() => handleModeSelect('custom')}
                  className={`w-full p-5 cut-corners border-2 text-left transition-all ${selectedMode === 'custom' ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-700 hover:border-yellow-500/50'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${selectedMode === 'custom' ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
                    <h3 className="system-font text-yellow-500 text-sm font-black uppercase">MODO LIVRE</h3>
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase italic">
                    Crie suas próprias missões e habilidades. Controle total sobre sua evolução.
                  </p>
                </button>
              </div>
              
              <button 
                onClick={() => setStep('info')}
                className="w-full bg-cyan-400 text-black font-black py-4 uppercase italic tracking-widest active:scale-95 transition-all mt-4"
              >
                CONTINUAR
              </button>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-black system-font text-center glow-text italic tracking-wider">
                {selectedMode === 'architect' ? 'VINCULAR AO ARQUITETO' : 'MODO LIVRE ATIVADO'}
              </h1>
              <div className="space-y-4">
                <input 
                  id="nameInput" 
                  placeholder="NOME..." 
                  className="w-full bg-black/40 border-b border-cyan-400/40 p-3 text-white uppercase outline-none focus:border-cyan-400" 
                  defaultValue=""
                />
                <input 
                  id="ageInput" 
                  type="number" 
                  placeholder="IDADE..." 
                  className="w-full bg-black/40 border-b border-cyan-400/40 p-3 text-white outline-none focus:border-cyan-400" 
                  defaultValue=""
                />
                <textarea 
                  id="goalInput" 
                  placeholder="OBJETIVO PRINCIPAL..." 
                  className="w-full bg-black/40 border border-cyan-400/40 p-3 text-white text-[11px] h-24 outline-none resize-none focus:border-cyan-400" 
                  defaultValue=""
                />
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setStep('mode')}
                  className="flex-1 bg-gray-800 text-gray-400 font-black py-4 uppercase italic tracking-widest active:scale-95 transition-all"
                >
                  VOLTAR
                </button>
                <button 
                  onClick={() => {
                    const nameInput = document.getElementById('nameInput') as HTMLInputElement;
                    const ageInput = document.getElementById('ageInput') as HTMLInputElement;
                    const goalInput = document.getElementById('goalInput') as HTMLTextAreaElement;
                    
                    handleAwakening(
                      nameInput?.value || 'UNIDADE', 
                      parseInt(ageInput?.value) || 25, 
                      goalInput?.value || 'EVOLUÇÃO TOTAL'
                    );
                  }} 
                  className="flex-1 bg-cyan-400 text-black font-black py-4 uppercase italic tracking-widest active:scale-95 transition-all"
                >
                  {selectedMode === 'architect' ? 'ATIVAR SISTEMA' : 'INICIAR MODO LIVRE'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-screen bg-[#02060a] text-white flex flex-col font-['Rajdhani'] overflow-hidden relative">
      {isProcessing && (
        <div className="fixed inset-0 z-[5000] bg-black/95 flex flex-col items-center justify-center backdrop-blur-md">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_#00e5ff]"></div>
          <p className="system-font text-cyan-400 text-[10px] mt-6 tracking-[0.4em] animate-pulse italic text-center px-4">SINCRONIZANDO COM O ARQUITETO...</p>
        </div>
      )}

      <SafeComponent>
        {/* Cabeçalho Fixo */}
        <header className="shrink-0 z-[100] system-panel border-b border-cyan-400/20 px-6 py-4 flex items-center justify-between backdrop-blur-3xl pt-[calc(env(safe-area-inset-top)+0.5rem)]">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setShowProfile(true)}>
            <div className="w-9 h-9 border border-cyan-400/40 flex items-center justify-center bg-cyan-400/5 cut-corners group-active:scale-90 transition-transform">
               <div className="w-full h-full flex items-center justify-center text-2xl p-1">
                 {stats?.avatar || '👤'}
               </div>
            </div>
            <div>
              <h2 className="system-font text-[10px] text-cyan-400 font-black glow-text leading-none">
                {stats?.playerName || 'UNIDADE'}
              </h2>
              <span className="text-[7px] text-gray-500 uppercase italic">
                RANK {calculateRank(stats?.level || 1)}
              </span>
            </div>
          </div>
          <div className="text-yellow-500 font-black flex items-center gap-1 text-[10px] italic">
            <Coins size={12} /> {stats?.gold?.toLocaleString() || '0'}
          </div>
        </header>

        {/* Área de Scroll */}
        <main className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar relative z-10" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="max-w-xl mx-auto space-y-6 pb-24">
            {stats?.systemMode === 'custom' ? (
              <CustomModePanel
                quests={quests.filter(q => q.isUserCreated)}
                skills={skills.filter(s => s.isDynamic)}
                onAddQuest={handleAddCustomQuest}
                onAddSkill={handleAddCustomSkill}
                onDeleteQuest={handleDeleteQuest}
                onDeleteSkill={handleDeleteSkill}
                onEditQuest={(id, updated) => {
                  setQuests(prev => prev.map(q => q.id === id ? {...q, ...updated} : q));
                }}
                onEditSkill={(id, updated) => {
                  setSkills(prev => prev.map(s => s.id === id ? {...s, ...updated} : s));
                }}
              />
            ) : (
              <>
                {activeTab === 'STATUS' && <StatusWindow stats={stats} onAllocate={(k) => setTrainingStat(k as any)} />}
                {activeTab === 'PROTOCOLS' && <QuestWindow quests={quests} onComplete={(id) => setQuests(prev => prev.map(q => q.id === id ? {...q, completed: true} : q))} onProgress={(id) => setQuests(prev => prev.map(q => q.id === id ? {...q, progress: Math.min((q.progress || 0) + 1, q.target || 1)} : q))} />}
                {activeTab === 'SKILLS' && (
                  <div className="space-y-4">
                    <h2 className="system-font text-cyan-400 text-sm font-black mb-4 italic flex items-center gap-2"><Brain size={16}/> HABILIDADES</h2>
                    {skills.map(s => (
                      <div key={s.id} className={`system-panel cut-corners p-5 border-l-4 ${s.isUnlocked ? 'border-green-500 bg-green-500/5' : 'border-cyan-400 bg-cyan-950/10'} transition-all`}>
                        <h3 className="system-font text-xs font-black uppercase text-white">{s.name || 'Habilidade sem nome'}</h3>
                        <p className="text-[10px] text-gray-500 mt-2 uppercase italic leading-tight">{s.description || 'Sem descrição'}</p>
                        {!s.isUnlocked && (
                          <button onClick={() => setSkillToTest(s)} className="w-full mt-4 bg-cyan-400 text-black font-black py-3 text-[10px] uppercase italic cut-corners active:scale-95">
                            [ TESTAR COMPATIBILIDADE ]
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'CHAT' && <ArchitectChat stats={stats} />}
                {activeTab === 'REGISTRY' && (
                  <div className="space-y-6">
                    <button onClick={() => {
                        const n = prompt("NOME DO ITEM:"); 
                        const d = prompt("DESCRIÇÃO:");
                        if(n && d) setAvailableItems([...availableItems, { 
                          id: Date.now().toString(), 
                          name: n.toUpperCase(), 
                          description: d, 
                          category: 'custom', 
                          owned: true, 
                          missionBonus: 'Custom', 
                          icon: '📦' 
                        }]);
                    }} className="w-full py-4 border border-cyan-400/40 text-cyan-400 text-[10px] font-black uppercase italic cut-corners hover:bg-cyan-400/5">
                      <Plus size={16} className="inline mr-2" /> REGISTRAR HARDWARE
                    </button>
                    <ItemsRegistryWindow items={availableItems} onToggle={(id) => setAvailableItems(prev => prev.map(it => it.id === id ? {...it, owned: !it.owned} : it))} />
                  </div>
                )}
                {activeTab === 'INVENTORY' && <InventoryWindow items={inventory} />}
              </>
            )}
          </div>
        </main>

        {/* Menu Inferior Fixo */}
        {stats?.systemMode !== 'custom' && (
          <nav className="shrink-0 z-[100] system-panel border-t border-cyan-400/20 flex items-center justify-around backdrop-blur-3xl pb-[calc(env(safe-area-inset-bottom)+0.75rem)] px-1">
            {[ 
              { id: 'STATUS', icon: Shield, label: 'STATUS' }, 
              { id: 'PROTOCOLS', icon: ScrollText, label: 'MISSÃO' }, 
              { id: 'SKILLS', icon: Brain, label: 'SKILLS' }, 
              { id: 'REGISTRY', icon: ShieldCheck, label: 'ITENS' }, 
              { id: 'CHAT', icon: MessageSquare, label: 'CHAT' } 
            ].map((t) => (
              <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id as SystemTab)} 
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 min-w-0 transition-all ${activeTab === t.id ? 'text-cyan-400' : 'text-gray-600'}`}
              >
                <t.icon size={18} className={activeTab === t.id ? 'glow-text' : ''} />
                <span className="text-[7px] font-black uppercase tracking-tighter truncate w-full text-center px-1 italic">
                  {t.label}
                </span>
              </button>
            ))}
          </nav>
        )}
      </SafeComponent>

      {/* Modals */}
           {trainingStat && <TrainingModal 
        statKey={trainingStat} 
        currentValue={Number(stats[trainingStat]) || 0} // LINHA 1594 CORRIGIDA
        onSuccess={() => { 
          setStats(s => ({
            ...s, 
            [trainingStat]: (Number(s[trainingStat]) || 0) + 1, // LINHA 1598 CORRIGIDA
            unallocatedPoints: (s.unallocatedPoints || 0) - 1
          })); 
          setTrainingStat(null); 
        }} 
        onCancel={() => setTrainingStat(null)} 
      />}
      
      {skillToTest && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/98 p-6 backdrop-blur-3xl">
          <div className="w-full max-sm system-panel border-cyan-400 cut-corners p-10 text-center space-y-8">
            <h2 className="system-font text-cyan-400 uppercase font-black text-xl italic">{skillToTest.name || 'Habilidade'}</h2>
            <div className="py-4 border-y border-white/5">
               <p className="text-sm font-black text-white italic uppercase leading-relaxed">"{skillToTest.testTask || 'Teste não especificado'}"</p>
            </div>
            <div className="space-y-3">
              <button onClick={() => { 
                setSkills(prev => prev.map(s => s.id === skillToTest.id ? {...s, isUnlocked: true} : s)); 
                setSkillToTest(null); 
              }} className="w-full bg-cyan-400 text-black font-black py-4 uppercase italic shadow-lg active:scale-95">
                CONFIRMAR SUCESSO
              </button>
              <button onClick={() => setSkillToTest(null)} className="w-full text-gray-600 text-[10px] font-black uppercase tracking-widest">
                CANCELAR TESTE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
