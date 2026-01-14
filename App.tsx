
import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, ScrollText, Brain, ShieldCheck, MessageSquare, Coins, Plus
} from 'lucide-react';
import CustomModePanel from './components/CustomModePanel';
import { CustomQuestData, CustomSkillData } from './types';
import StatusWindow from './components/StatusWindow';
import QuestWindow from './components/QuestWindow';
import InventoryWindow from './components/InventoryWindow';
import ItemsRegistryWindow from './components/ItemsRegistryWindow';
import ArchitectChat from './components/ArchitectChat';
import ProfileWindow from './components/ProfileWindow';
import SystemDialog from './components/SystemDialog';
import TrainingModal from './components/TrainingModal';
import { Stats, Quest, Skill, SystemTab, calculateRank, INITIAL_STATS, Item, AvailableItem } from './types';
import { generateDailyQuests, generateObjectiveBatch, fillSkillPool } from './services/geminiService';

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
  
  const initializingRef = useRef(false);
  const processingLock = useRef(false); // Bloqueio para evitar chamadas de API concorrentes
  const storageKey = 'sl_system_v29';

  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([
    { id: 'item-1', name: 'DIÁRIO FÍSICO', category: 'diário', description: 'Registro de falhas.', owned: false, missionBonus: 'Foco Mental', statBonus: { stat: 'will', value: 2 }, icon: '📔' },
    { id: 'item-2', name: 'ACADEMIA', category: 'academia', description: 'Treino de carga.', owned: false, missionBonus: 'Força Bruta', statBonus: { stat: 'strength', value: 1 }, icon: '🏋️' }
  ]);

  const [quests, setQuests] = useState<Quest[]>([]);


// ADICIONE estas funções dentro do componente App, após os outros estados:

const handleAddCustomQuest = (questData: CustomQuestData) => {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + questData.deadlineDays);
  
  const newQuest: Quest = {
    id: `custom-quest-${Date.now()}`,
    title: questData.title,
    description: questData.description,
    protocol: "CUSTOM",
    progress: 0,
    target: questData.target,
    type: 'daily',
    category: questData.category as any,
    completed: false,
    deadline: deadline.toISOString(),
    reward: questData.reward,
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
};

const handleAddCustomSkill = (skillData: CustomSkillData) => {
  const newSkill: Skill = {
    id: `custom-skill-${Date.now()}`,
    name: skillData.name,
    level: 1,
    type: skillData.type,
    description: skillData.description,
    requirement: "Nível 1+",
    efficiencyBonus: "+5% em tarefas relacionadas",
    isUnlocked: false,
    testTask: skillData.testTask,
    testTarget: skillData.testTarget,
    testUnit: skillData.testUnit,
    isDynamic: true
  };
  
  setSkills(prev => [...prev, newSkill]);
};

const handleDeleteQuest = (id: string) => {
  setQuests(prev => prev.filter(q => q.id !== id));
};

const handleDeleteSkill = (id: string) => {
  setSkills(prev => prev.filter(s => s.id !== id));
};


  // 1. Carregamento de Estado Inicial
  useEffect(() => {
    const data = localStorage.getItem(storageKey);
    if (data) {
      const parsed = JSON.parse(data);
      setStats(parsed.stats);
      setQuests(parsed.quests || []);
      setInventory(parsed.inventory || []);
      setAvailableItems(parsed.availableItems || availableItems);
      setSkills(parsed.skills || []);
      if (parsed.stats.playerName) setIsAwakened(true);
    }
  }, []);

  // 2. Persistência de Estado (Somente mudanças de UI)
  useEffect(() => {
    if (isAwakened) {
      localStorage.setItem(storageKey, JSON.stringify({ stats, quests, inventory, availableItems, skills }));
    }
  }, [stats, quests, inventory, availableItems, skills, isAwakened]);

  // 3. Rotina de Sincronização e Manutenção
  useEffect(() => {
    if (isAwakened && !initializingRef.current) {
      const runMaintenance = async () => {
        if (processingLock.current) return;
        initializingRef.current = true;
        
        await checkDeadlines();
        await ensureSkillPool();
        
        initializingRef.current = false;
      };
      runMaintenance();
    }
  }, [isAwakened, stats.lastDailyUpdate]);

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
        setStats(s => ({ ...s, failedMissionsCount: s.failedMissionsCount + 1 }));
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
      
      const questObjs: Quest[] = newDailies.map((q: any, i: number) => ({
        ...q, id: `daily-${Date.now()}-${i}`, progress: 0, type: 'daily', completed: false, 
        goldReward: 100, expReward: 50, deadline: midnight.toISOString()
      }));

      setQuests(prev => [...prev.filter(q => q.type !== 'daily'), ...questObjs]);
      setStats(prev => ({ ...prev, lastDailyUpdate: todayLabel }));
    } catch(e) { 
      console.error(e); 
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
      
      const questObjs: Quest[] = response.quests.map((q: any, i: number) => ({
        ...q, id: `order-${Date.now()}-${i}`, progress: 0, type: 'intervention', completed: false, 
        goldReward: 500, expReward: 300, deadline: deadline.toISOString()
      }));
      
      setQuests(prev => [...prev.filter(q => q.type !== 'intervention'), ...questObjs]);
    } catch(e) { 
      console.error(e); 
    } finally { 
      setIsProcessing(false); 
      processingLock.current = false;
    }
  };

  const handleAwakening = (name: string, age: number, goal: string) => {
    if(!name || !age || !goal) return;
    const finalStats: Stats = { ...INITIAL_STATS, playerName: name.toUpperCase(), age, customGoal: goal, systemMode: 'architect' };
    setStats(finalStats);
    triggerInitialBatch(finalStats);
    setIsAwakened(true);
  };

  if (!isAwakened) {
    return (
      <div className="h-[100dvh] w-full bg-[#010a12] flex items-center justify-center p-6 text-cyan-400 overflow-hidden">
        <div className="w-full max-w-sm system-panel border-cyan-400 cut-corners p-8 bg-cyan-950/20 space-y-6">
          <h1 className="text-4xl font-black system-font text-center glow-text italic tracking-wider">ERGA-SE</h1>
          <div className="space-y-4">
            <input id="n" placeholder="NOME..." className="w-full bg-black/40 border-b border-cyan-400/40 p-3 text-white uppercase outline-none focus:border-cyan-400" />
            <input id="a" type="number" placeholder="IDADE..." className="w-full bg-black/40 border-b border-cyan-400/40 p-3 text-white outline-none focus:border-cyan-400" />
            <textarea id="g" placeholder="OBJETIVO PRINCIPAL..." className="w-full bg-black/40 border border-cyan-400/40 p-3 text-white text-[11px] h-24 outline-none resize-none focus:border-cyan-400" />
          </div>
          <button onClick={() => handleAwakening((document.getElementById('n') as any).value, parseInt((document.getElementById('a') as any).value), (document.getElementById('g') as any).value)} className="w-full bg-cyan-400 text-black font-black py-4 uppercase italic tracking-widest active:scale-95 transition-all">ATIVAR SISTEMA</button>
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

      {/* Cabeçalho Fixo - Ajustado para Safe Area e visibilidade mobile */}
      <header className="shrink-0 z-[100] system-panel border-b border-cyan-400/20 px-6 py-4 flex items-center justify-between backdrop-blur-3xl pt-[calc(env(safe-area-inset-top)+0.5rem)]">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setShowProfile(true)}>
          <div className="w-9 h-9 border border-cyan-400/40 flex items-center justify-center bg-cyan-400/5 cut-corners group-active:scale-90 transition-transform">
             <img src={stats.avatar || '👤'} alt="Avatar" className="w-full h-full object-cover p-1" />
          </div>
          <div>
            <h2 className="system-font text-[10px] text-cyan-400 font-black glow-text leading-none">{stats.playerName}</h2>
            <span className="text-[7px] text-gray-500 uppercase italic">RANK {calculateRank(stats.level)}</span>
          </div>
        </div>
        <div className="text-yellow-500 font-black flex items-center gap-1 text-[10px] italic">
          <Coins size={12} /> {stats.gold.toLocaleString()}
        </div>
      </header>

      {/* Área de Scroll - Centralizada */}
      <main className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar relative z-10" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-xl mx-auto space-y-6 pb-24">
          {activeTab === 'STATUS' && <StatusWindow stats={stats} onAllocate={(k) => setTrainingStat(k as any)} />}
          {activeTab === 'PROTOCOLS' && <QuestWindow quests={quests} onComplete={(id) => setQuests(prev => prev.map(q => q.id === id ? {...q, completed: true} : q))} onProgress={(id) => setQuests(prev => prev.map(q => q.id === id ? {...q, progress: Math.min(q.progress + 1, q.target)} : q))} />}
          {activeTab === 'SKILLS' && (
            <div className="space-y-4">
              <h2 className="system-font text-cyan-400 text-sm font-black mb-4 italic flex items-center gap-2"><Brain size={16}/> HABILIDADES (ATIVAS: {skills.filter(s => !s.isUnlocked).length})</h2>
              {skills.map(s => (
                <div key={s.id} className={`system-panel cut-corners p-5 border-l-4 ${s.isUnlocked ? 'border-green-500 bg-green-500/5' : 'border-cyan-400 bg-cyan-950/10'} transition-all`}>
                  <h3 className="system-font text-xs font-black uppercase text-white">{s.name}</h3>
                  <p className="text-[10px] text-gray-500 mt-2 uppercase italic leading-tight">{s.description}</p>
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
                  const n = prompt("NOME DO ITEM:"); const d = prompt("DESCRIÇÃO:");
                  if(n && d) setAvailableItems([...availableItems, { id: Date.now().toString(), name: n.toUpperCase(), description: d, category: 'custom', owned: true, missionBonus: 'Custom', icon: '📦' }]);
              }} className="w-full py-4 border border-cyan-400/40 text-cyan-400 text-[10px] font-black uppercase italic cut-corners hover:bg-cyan-400/5"><Plus size={16} className="inline mr-2" /> REGISTRAR HARDWARE</button>
              <ItemsRegistryWindow items={availableItems} onToggle={(id) => setAvailableItems(prev => prev.map(it => it.id === id ? {...it, owned: !it.owned} : it))} />
            </div>
          )}
          {activeTab === 'INVENTORY' && <InventoryWindow items={inventory} />}
        </div>
      </main>

      {/* Menu Inferior Fixo - Garantindo que nunca suma em mobile */}
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

      {showProfile && <ProfileWindow stats={stats} onSave={(u) => setStats(s => ({...s, ...u}))} onClose={() => setShowProfile(false)} />}
      {notification && <SystemDialog message={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}
      {trainingStat && <TrainingModal statKey={trainingStat} currentValue={(stats as any)[trainingStat]} onSuccess={() => { setStats(s => ({...s, [trainingStat]: (s as any)[trainingStat]+1, unallocatedPoints: s.unallocatedPoints-1})); setTrainingStat(null); }} onCancel={() => setTrainingStat(null)} />}
      
      {skillToTest && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/98 p-6 backdrop-blur-3xl">
          <div className="w-full max-sm system-panel border-cyan-400 cut-corners p-10 text-center space-y-8">
            <h2 className="system-font text-cyan-400 uppercase font-black text-xl italic">{skillToTest.name}</h2>
            <div className="py-4 border-y border-white/5">
               <p className="text-sm font-black text-white italic uppercase leading-relaxed">"{skillToTest.testTask}"</p>
            </div>
            <div className="space-y-3">
              <button onClick={() => { setSkills(prev => prev.map(s => s.id === skillToTest.id ? {...s, isUnlocked: true} : s)); setSkillToTest(null); }} className="w-full bg-cyan-400 text-black font-black py-4 uppercase italic shadow-lg active:scale-95">CONFIRMAR SUCESSO</button>
              <button onClick={() => setSkillToTest(null)} className="w-full text-gray-600 text-[10px] font-black uppercase tracking-widest">CANCELAR TESTE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
