
import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  ScrollText, 
  Backpack, 
  Swords, 
  ShoppingBag, 
  Coins, 
  Zap, 
  Sparkles, 
  Trophy, 
  Activity,
  Plus,
  ShieldAlert,
  Share2,
  Settings
} from 'lucide-react';
import StatusWindow from './components/StatusWindow';
import QuestWindow from './components/QuestWindow';
import InventoryWindow from './components/InventoryWindow';
import ShopWindow from './components/ShopWindow';
import SystemDialog from './components/SystemDialog';
import TrainingModal from './components/TrainingModal';
import { Stats, Quest, Item, Skill, SystemTab, calculateRank, calculateCombatPower, INITIAL_STATS } from './types';
import { getArchitectMessage, generateSecretQuest } from './services/geminiService';

const App: React.FC = () => {
  const [isAwakened, setIsAwakened] = useState(false);
  const [activeTab, setActiveTab] = useState<SystemTab>('STATUS');
  const [notification, setNotification] = useState<{msg: string, type: 'default' | 'urgent' | 'level-up'} | null>(null);
  const [trainingStat, setTrainingStat] = useState<keyof Stats | null>(null);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);

  // Carregar dados
  useEffect(() => {
    const data = localStorage.getItem('sl_immersion_v1');
    if (data) {
      const parsed = JSON.parse(data);
      setStats(parsed.stats);
      setInventory(parsed.inventory || []);
      setQuests(parsed.quests || []);
      if (parsed.stats.playerName) setIsAwakened(true);
    }
  }, []);

  // Salvar dados
  useEffect(() => {
    if (isAwakened) {
      localStorage.setItem('sl_immersion_v1', JSON.stringify({ stats, inventory, quests }));
    }
  }, [stats, inventory, quests, isAwakened]);

  const generateDailyQuests = useCallback((level: number) => {
    const m = level * 0.2 + 1;
    return [
      {
        id: 'daily-phys',
        title: 'Preparação do Corpo',
        description: 'Execute flexões e agachamentos para manter a densidade muscular.',
        progress: 0,
        target: Math.floor(30 * m),
        type: 'daily' as const,
        category: 'physical' as const,
        completed: false,
        reward: 'Ponto de Força',
        goldReward: 500,
        expReward: 100
      },
      {
        id: 'daily-rec',
        title: 'Sincronização de Energia',
        description: 'Hidratação e repouso. O sistema exige equilíbrio biótico.',
        progress: 0,
        target: 2, 
        type: 'daily' as const,
        category: 'recovery' as const,
        completed: false,
        reward: 'Recuperação HP',
        goldReward: 300,
        expReward: 50
      },
      {
        id: 'daily-focus',
        title: 'Foco do Monarca',
        description: 'Realize uma sessão de Deep Work (trabalho focado) sem distrações.',
        progress: 0,
        target: Math.floor(25 * m), 
        type: 'daily' as const,
        category: 'focus' as const,
        completed: false,
        reward: 'Ponto de INT',
        goldReward: 800,
        expReward: 200
      }
    ];
  }, []);

  const handleAwakening = async (name: string) => {
    if (!name.trim()) return;
    const nameUpper = name.toUpperCase();
    const newStats = { ...INITIAL_STATS, playerName: nameUpper };
    setStats(newStats);
    setQuests([...generateDailyQuests(1), {
      id: 'norm-1',
      title: 'A Ascensão Solitária',
      description: 'Chegue ao Nível 10 para provar que você não é apenas um lixo Rank E.',
      progress: 0,
      target: 10,
      type: 'normal',
      completed: false,
      reward: 'Baú de Rank D',
      goldReward: 5000,
      expReward: 1000
    }]);
    setIsAwakened(true);
    const msg = await getArchitectMessage(`O portador ${nameUpper} despertou.`);
    setNotification({ msg: `SISTEMA: BEM-VINDO, ${nameUpper}. SUA JORNADA COMEÇA AGORA. ${msg}`, type: 'default' });
  };

  const handleLevelUp = useCallback(async (level: number) => {
    setStats(prev => ({
      ...prev,
      level: prev.level + 1,
      maxExp: Math.floor(prev.maxExp * 1.7),
      unallocatedPoints: prev.unallocatedPoints + 5,
      hp: prev.maxHp + 30,
      maxHp: prev.maxHp + 30,
      mp: prev.maxMp + 15,
      maxMp: prev.maxMp + 15,
      gold: prev.gold + (level * 1500)
    }));
    setNotification({ msg: `[EVOLUÇÃO] NÍVEL ${level + 1} ALCANÇADO. VOCÊ ESTÁ SE TORNANDO ALGO MAIS.`, type: 'level-up' });
    
    setQuests(prev => {
      const existingIds = prev.map(q => q.id);
      const newDailies = generateDailyQuests(level + 1).filter(d => !existingIds.includes(d.id));
      return [...prev, ...newDailies];
    });
  }, [generateDailyQuests]);

  const addExp = useCallback((amount: number) => {
    setStats(prev => {
      const newExp = prev.exp + amount;
      if (newExp >= prev.maxExp) {
        setTimeout(() => handleLevelUp(prev.level), 100);
        return { ...prev, exp: 0 };
      }
      return { ...prev, exp: newExp };
    });
  }, [handleLevelUp]);

  const completeQuest = async (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.completed) return;

    addExp(quest.expReward);
    setStats(prev => ({ ...prev, gold: prev.gold + quest.goldReward }));
    setQuests(prev => prev.map(q => q.id === id ? { ...q, completed: true } : q));

    if (Math.random() > 0.85) {
      const secret = await generateSecretQuest();
      setQuests(prev => [{
        id: `secret-${Date.now()}`,
        ...secret,
        progress: 0,
        type: 'secret',
        completed: false,
        reward: 'Habilidade Rara',
        goldReward: 8000,
        expReward: 2000
      }, ...prev]);
      setNotification({ msg: "!!! ALERTA !!! UMA MISSÃO SECRETA FOI DESCOBERTA PELO SISTEMA.", type: 'urgent' });
    }
  };

  const handleShare = async () => {
    const cp = calculateCombatPower(stats);
    const rank = calculateRank(stats.level);
    const text = `[SISTEMA SOLO LEVELING]\n\nJogador: ${stats.playerName}\nRank: ${rank} | Nível: ${stats.level}\nPoder de Combate: ${cp.toLocaleString()} CP\n\nDesperte seu poder também: ${window.location.href}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Status de Monarca',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Erro ao compartilhar:", err);
      }
    } else {
      navigator.clipboard.writeText(text);
      setNotification({ msg: "STATUS COPIADO PARA A ÁREA DE TRANSFERÊNCIA!", type: 'default' });
    }
  };

  const finalizeTraining = useCallback(() => {
    if (!trainingStat) return;
    setStats(prev => {
      if (prev.unallocatedPoints > 0) {
        return {
          ...prev,
          [trainingStat]: (prev as any)[trainingStat] + 1,
          unallocatedPoints: prev.unallocatedPoints - 1
        };
      }
      return prev;
    });
    setTrainingStat(null);
    setNotification({ msg: `SISTEMA: ATRIBUTO ${trainingStat.toUpperCase()} ELEVADO.`, type: 'level-up' });
  }, [trainingStat]);

  if (!isAwakened) {
    return (
      <div className="min-h-screen bg-[#010409] flex items-center justify-center p-6 overflow-hidden">
        <div className="w-full max-w-sm system-bg border-2 border-[#00e5ff] p-10 rounded-sm animate-in fade-in slide-in-from-bottom-10 duration-1000 shadow-[0_0_50px_rgba(0,229,255,0.2)]">
          <div className="flex flex-col items-center mb-10">
            <Sparkles className="text-[#00e5ff] animate-pulse mb-6" size={56} />
            <h1 className="system-font text-2xl text-[#00e5ff] tracking-[0.3em] text-center font-black">AWAKENING</h1>
            <p className="text-[10px] text-gray-500 tracking-[0.4em] font-bold mt-2">SINCRO-PROTOCOL V1.0</p>
          </div>
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#00e5ff] tracking-[0.4em] uppercase opacity-60">Nome do Jogador</label>
              <input 
                id="name-input"
                type="text" 
                placeholder="DIGITE SUA IDENTIDADE..."
                className="w-full bg-black/60 border-2 border-[#00e5ff]/20 p-5 text-white font-black text-xl focus:outline-none focus:border-[#00e5ff] transition-all uppercase tracking-widest placeholder:text-gray-800"
                onKeyDown={(e) => { if(e.key === 'Enter') handleAwakening(e.currentTarget.value) }}
              />
            </div>
            <button 
              onClick={() => handleAwakening((document.getElementById('name-input') as HTMLInputElement).value)}
              className="w-full bg-[#00e5ff] text-black font-black py-6 tracking-[0.6em] text-sm uppercase shadow-[0_0_30_rgba(0,229,255,0.4)] hover:brightness-125 transition-all"
            >
              INICIAR
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010409] text-white flex flex-col font-['Rajdhani']">
      
      {/* Header Fixo */}
      <header className="sticky top-0 z-50 system-bg border-b border-[#00e5ff]/20 px-4 py-4 flex items-center justify-between shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#00e5ff]/40 rounded-xl flex items-center justify-center bg-black/60">
            <User className="text-[#00e5ff]" size={20} />
          </div>
          <div>
            <h2 className="system-font text-[10px] text-[#00e5ff] tracking-[0.2em] font-black leading-none mb-1 uppercase truncate max-w-[80px]">{stats.playerName}</h2>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-gray-500 font-black">LV.{stats.level}</span>
              <span className="text-[9px] text-[#00e5ff] font-bold uppercase">RANK {calculateRank(stats.level)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-[#00e5ff] hover:border-[#00e5ff]/40 transition-all active:scale-90"
          >
            <Share2 size={18} />
          </button>
          <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
            <Coins size={14} className="text-yellow-500" />
            <span className="text-yellow-500 font-black system-font text-sm">{stats.gold.toLocaleString()}G</span>
          </div>
        </div>
      </header>

      {/* Área Central */}
      <main className="flex-1 overflow-y-auto px-6 pt-8 pb-32 no-scrollbar">
        {activeTab === 'STATUS' && <StatusWindow stats={stats} onAllocate={(k) => setTrainingStat(k as keyof Stats)} />}
        {activeTab === 'QUEST' && (
          <QuestWindow 
            quests={quests} 
            onComplete={completeQuest} 
            onProgress={(id) => setQuests(prev => prev.map(q => q.id === id ? {...q, progress: Math.min(q.progress + Math.ceil(q.target/10), q.target)} : q))} 
          />
        )}
        {activeTab === 'INVENTORY' && <InventoryWindow items={inventory} />}
        {activeTab === 'SHOP' && <ShopWindow gold={stats.gold} onBuy={(it) => {
          if (stats.gold >= (it.price || 0)) {
            setStats(prev => ({...prev, gold: prev.gold - (it.price || 0)}));
            setInventory(prev => [...prev, it]);
            setNotification({msg: `SISTEMA: VOCÊ ADQUIRIU ${it.name.toUpperCase()}.`, type: 'default'});
          }
        }} />}
        {activeTab === 'SKILLS' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-8 w-1 bg-[#00e5ff]"></div>
              <h2 className="system-font text-xl tracking-[0.2em] text-[#00e5ff] font-black uppercase">HABILIDADES</h2>
            </div>
            {[
              { name: 'Sprint Sombrio', type: 'Ativa', cost: '25 MP', desc: 'Acelera suas funções motoras através de foco extremo.' },
              { name: 'Sede de Sangue', type: 'Passiva', cost: '0 MP', desc: 'Emana uma aura de terror que enfraquece oponentes inferiores.' },
              { name: 'Mãos do Dominador', type: 'Ativa', cost: '60 MP', desc: 'Influência telecinética em objetos próximos.' }
            ].map((s, i) => (
              <div key={i} className="system-bg border border-white/5 p-6 rounded-sm relative overflow-hidden group hover:border-[#00e5ff]/40 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="system-font text-white font-black text-lg tracking-tight uppercase">{s.name}</h3>
                  <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-sm border ${s.type === 'Ativa' ? 'border-[#00e5ff] text-[#00e5ff] bg-[#00e5ff]/10' : 'border-gray-700 text-gray-500'}`}>
                    {s.type}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed font-bold italic">"{s.desc}"</p>
                <div className="flex items-center gap-2">
                   <Zap size={12} className="text-[#00e5ff]" />
                   <span className="text-[10px] text-[#00e5ff] font-black uppercase tracking-widest">Custo: {s.cost}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Nav Inferior Fixa */}
      <nav className="fixed bottom-0 left-0 w-full system-bg border-t border-[#00e5ff]/20 px-6 py-4 flex items-center justify-around z-50 shadow-[0_-15px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        {[
          { id: 'STATUS', icon: Trophy, label: 'Status' },
          { id: 'QUEST', icon: ScrollText, label: 'Missão' },
          { id: 'SKILLS', icon: Zap, label: 'Skills' },
          { id: 'INVENTORY', icon: Backpack, label: 'Inv' },
          { id: 'SHOP', icon: ShoppingBag, label: 'Loja' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as SystemTab)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${activeTab === t.id ? 'text-[#00e5ff] scale-110' : 'text-gray-600'}`}
          >
            <t.icon size={26} className={activeTab === t.id ? 'animate-pulse' : ''} />
            <span className="text-[9px] font-black system-font tracking-widest uppercase">{t.label}</span>
            {activeTab === t.id && <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] mt-1 shadow-[0_0_10px_#00e5ff]"></div>}
          </button>
        ))}
      </nav>

      {/* Modais */}
      {notification && <SystemDialog message={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}
      {trainingStat && (
        <TrainingModal 
          statKey={trainingStat} 
          currentValue={(stats as any)[trainingStat]} 
          onSuccess={finalizeTraining} 
          onCancel={() => setTrainingStat(null)} 
        />
      )}
    </div>
  );
};

export default App;
