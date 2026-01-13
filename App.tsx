
import React, { useState, useEffect } from 'react';
import { 
  User, ScrollText, Backpack, Coins, Shield, Brain, ShieldCheck, Cpu, Plus, MessageSquare, Info
} from 'lucide-react';
import StatusWindow from './components/StatusWindow';
import QuestWindow from './components/QuestWindow';
import InventoryWindow from './components/InventoryWindow';
import ItemsRegistryWindow from './components/ItemsRegistryWindow';
import ArchitectChat from './components/ArchitectChat';
import ProfileWindow from './components/ProfileWindow';
import SystemDialog from './components/SystemDialog';
import TrainingModal from './components/TrainingModal';
import { Stats, Quest, Skill, SystemTab, calculateRank, INITIAL_STATS, Item, AvailableItem } from './types';
import { generateDailyQuests, generateObjectiveBatch, generateDynamicSkill } from './services/geminiService';
import { getCurrentWeather, WeatherData } from './services/weatherService';

const App: React.FC = () => {
  const [isAwakened, setIsAwakened] = useState(false);
  const [awakeningStep, setAwakeningStep] = useState(0); 
  const [activeTab, setActiveTab] = useState<SystemTab>('STATUS');
  const [notification, setNotification] = useState<{msg: string, type: 'default' | 'urgent' | 'level-up'} | null>(null);
  const [trainingStat, setTrainingStat] = useState<keyof Stats | null>(null);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillToTest, setSkillToTest] = useState<Skill | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([
    { id: 'item-1', name: 'DIÁRIO FÍSICO', category: 'diário', description: 'Caderno para registro diário de falhas e vitórias.', owned: false, missionBonus: 'Gera protocolos de escrita e reflexão', statBonus: { stat: 'will', value: 2 }, icon: '📔' },
    { id: 'item-2', name: 'ACADEMIA / CENTRO DE TREINO', category: 'academia', description: 'Acesso a pesos livres e máquinas de sobrecarga.', owned: false, missionBonus: 'Desbloqueia protocolos de força avançada', statBonus: { stat: 'strength', value: 1 }, icon: '🏋️' },
    { id: 'item-3', name: 'SMARTWATCH / TRACKER', category: 'smartwatch', description: 'Dispositivo de monitoramento biométrico contínuo.', owned: false, missionBonus: 'Otimiza missões de cardio e recuperação', statBonus: { stat: 'vitality', value: 1 }, icon: '⌚' }
  ]);

  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('sl_system_v21_final_prime');
    if (data) {
      const parsed = JSON.parse(data);
      setStats(parsed.stats);
      setQuests(parsed.quests || []);
      setInventory(parsed.inventory || []);
      setAvailableItems(parsed.availableItems || availableItems);
      setSkills(parsed.skills || []);
      if (parsed.stats.playerName) setIsAwakened(true);
    }
    getCurrentWeather().then(setWeather);
  }, []);

  useEffect(() => {
    if (isAwakened) {
      localStorage.setItem('sl_system_v21_final_prime', JSON.stringify({ stats, quests, inventory, availableItems, skills }));
      checkDeadlines();
      checkWeeklyUpdate();
    }
  }, [stats, quests, inventory, availableItems, skills, isAwakened]);

  useEffect(() => {
    if (isAwakened) {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      } catch (e) {}
    }
  }, [isAwakened, activeTab]);

  const checkDeadlines = () => {
    const now = new Date();
    const today = now.toLocaleDateString();
    
    // Reset diário (Meia noite)
    if (stats.lastDailyUpdate !== today) {
      updateDailyQuests();
    }

    // Verificar missões expiradas
    const expiredCount = quests.filter(q => !q.completed && q.deadline !== "0" && new Date(q.deadline) < now).length;
    if (expiredCount > 0) {
      setStats(prev => ({ ...prev, failedMissionsCount: prev.failedMissionsCount + expiredCount }));
      setQuests(prev => prev.filter(q => q.completed || q.deadline === "0" || new Date(q.deadline) >= now));
      
      // Se falhar muito, gera emergência
      if (stats.failedMissionsCount > 3) {
        triggerEmergencyBatch();
      }
    }
  };

  const checkWeeklyUpdate = () => {
    const now = new Date();
    const lastUpdate = stats.lastWeeklyUpdate ? new Date(stats.lastWeeklyUpdate) : new Date(0);
    const diffDays = (now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24);

    if (diffDays >= 7 && stats.systemMode === 'architect') {
      triggerInitialBatch(stats);
      setStats(prev => ({ ...prev, lastWeeklyUpdate: now.toISOString() }));
    }
  };

  const updateDailyQuests = async () => {
    if (stats.systemMode === 'custom') return;
    setIsProcessing(true);
    try {
      const owned = availableItems.filter(i => i.owned);
      const newDailies = await generateDailyQuests(stats, owned, quests);
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);

      const questObjs: Quest[] = newDailies.map((q: any, i: number) => ({
        ...q, id: `daily-${Date.now()}-${i}`, progress: 0, type: 'daily', completed: false, 
        goldReward: 100, expReward: 50, deadline: midnight.toISOString()
      }));
      setQuests(prev => [...prev.filter(q => q.type !== 'daily'), ...questObjs]);
      setStats(prev => ({ ...prev, lastDailyUpdate: new Date().toLocaleDateString() }));
    } catch (e) { console.error(e); } finally { setIsProcessing(false); }
  };

  const triggerInitialBatch = async (s: Stats) => {
    setIsProcessing(true);
    try {
      const learned = skills.filter(sk => sk.isUnlocked);
      const response = await generateObjectiveBatch(s, availableItems.filter(i => i.owned), learned);
      
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 7);

      const questObjs: Quest[] = response.quests.map((q: any, i: number) => ({
        ...q, id: `batch-${Date.now()}-${i}`, progress: 0, type: 'intervention', completed: false, 
        goldReward: 300, expReward: 150, deadline: deadline.toISOString()
      }));
      setQuests(prev => [...prev.filter(q => q.type !== 'intervention'), ...questObjs]);
      
      if (response.skill) {
        // Renovação de skills: se já tem 5, limpa e adiciona novas progressivamente
        const dynamicCount = skills.filter(sk => sk.isDynamic && sk.isUnlocked).length;
        if (dynamicCount >= 5) {
          setSkills(prev => prev.filter(sk => !sk.isDynamic));
        }

        const skillObj: Skill = { ...response.skill, id: `sk-${Date.now()}`, level: 1, isUnlocked: false, isDynamic: true };
        setSkills(prev => [...prev, skillObj]);
      }
    } catch (e) { console.error(e); } finally { setIsProcessing(false); }
  };

  const triggerEmergencyBatch = async () => {
    setIsProcessing(true);
    try {
      const learned = skills.filter(sk => sk.isUnlocked);
      const response = await generateObjectiveBatch(stats, availableItems.filter(i => i.owned), learned, true);
      
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 2); // Emergência é curta

      const questObjs: Quest[] = response.quests.map((q: any, i: number) => ({
        ...q, id: `emergency-${Date.now()}-${i}`, progress: 0, type: 'emergency', completed: false, 
        goldReward: 500, expReward: 250, deadline: deadline.toISOString()
      }));
      setQuests(prev => [...prev, ...questObjs]);
      setStats(prev => ({ ...prev, failedMissionsCount: 0 }));
      setNotification({ msg: "MISSÃO DE EMERGÊNCIA ATIVADA PELO ARQUITETO.", type: 'urgent' });
    } catch (e) { console.error(e); } finally { setIsProcessing(false); }
  };

  const handleAwakening = (name: string, age: number, goal: string, mode: 'architect' | 'custom') => {
    const finalStats: Stats = { 
      ...INITIAL_STATS, playerName: name.toUpperCase(), age, customGoal: goal, goal: "CUSTOMIZADO", systemMode: mode, unallocatedPoints: 5, 
      lastWeeklyUpdate: new Date().toISOString(),
      avatar: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="%2300e5ff" stroke-width="4"><path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z"/><path d="M50 30 L70 50 L50 70 L30 50 Z"/></svg>'
    };
    setStats(finalStats);
    if (mode === 'architect') triggerInitialBatch(finalStats);
    setIsAwakened(true);
    setNotification({ msg: `SISTEMA VINCULADO EM MODO ${mode.toUpperCase()}.`, type: 'default' });
  };

  const completeQuest = async (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.completed) return;
    setStats(prev => {
      const newExp = prev.exp + quest.expReward;
      const willLevelUp = newExp >= prev.maxExp;
      if (willLevelUp) handleLevelUpSkill();
      return { ...prev, exp: willLevelUp ? 0 : newExp, level: willLevelUp ? prev.level + 1 : prev.level, maxExp: willLevelUp ? Math.floor(prev.maxExp * 1.5) : prev.maxExp, gold: prev.gold + quest.goldReward };
    });
    setQuests(prev => prev.map(q => q.id === id ? { ...q, completed: true } : q));
  };

  const handleLevelUpSkill = async () => {
    if (stats.systemMode === 'custom') return;
    setIsProcessing(true);
    try {
      const learned = skills.filter(sk => sk.isUnlocked);
      const skillData = await generateDynamicSkill(stats, learned);
      if (skillData) {
        const skillObj: Skill = { ...skillData, id: `sk-${Date.now()}`, level: 1, isUnlocked: false, isDynamic: true };
        setSkills(prev => [...prev, skillObj]);
        setNotification({ msg: "NOVA HABILIDADE SUGERIDA PELO ARQUITETO.", type: 'level-up' });
      }
    } catch (e) { console.error(e); } finally { setIsProcessing(false); }
  };

  const handleCreateCustomSkill = () => {
    const name = prompt("NOME DA SKILL:");
    const task = prompt("TESTE DE DESPERTAR (O que deve fazer?):");
    if (!name || !task) return;
    const newSkill: Skill = {
      id: `custom-sk-${Date.now()}`, name, level: 1, type: 'ESTRATÉGICA', description: 'Habilidade definida pela unidade.',
      requirement: 'Vontade Própria', efficiencyBonus: 'Incalculável', isUnlocked: false, testTask: task, testTarget: 1, testUnit: 'Execução', isDynamic: false
    };
    setSkills(prev => [...prev, newSkill]);
  };

  const handleAddNewItem = () => {
    const name = prompt("NOME DO ITEM:");
    const desc = prompt("DESCRIÇÃO:");
    if (!name || !desc) return;
    const newItem: AvailableItem = {
      id: `custom-item-${Date.now()}`,
      name: name.toUpperCase(),
      category: 'custom',
      description: desc,
      owned: true,
      missionBonus: 'Customizado pela Unidade',
      icon: '📦'
    };
    setAvailableItems(prev => [...prev, newItem]);
  };

  if (!isAwakened) {
    return (
      <div className="h-screen bg-[#010a12] flex items-center justify-center p-6 text-cyan-400 overflow-hidden">
        {awakeningStep === 0 ? (
          <div className="w-full max-w-lg system-panel border-cyan-400 cut-corners bg-cyan-950/20 p-10 text-center animate-in zoom-in duration-500">
             <h1 className="text-4xl font-black system-font leading-none italic uppercase glow-text mb-4 tracking-tighter">ERGA-SE</h1>
             <p className="text-[10px] text-gray-500 italic uppercase font-bold tracking-[0.3em] mb-8">Deseja sincronizar seu hardware biológico?</p>
             <button onClick={() => setAwakeningStep(1)} className="w-full py-6 border border-cyan-400 system-font font-black italic tracking-widest text-xs hover:bg-cyan-400 hover:text-black transition-all"> [ VINCULAR UNIDADE ] </button>
          </div>
        ) : (
          <div className="w-full max-w-md system-panel border-cyan-400 cut-corners p-10 bg-cyan-950/10 space-y-6 overflow-y-auto max-h-[90vh] no-scrollbar">
            <h2 className="system-font text-[10px] font-black uppercase italic text-cyan-400/60 mb-4 border-b border-cyan-400/20 pb-2">Configuração do Desperto</h2>
            <div className="space-y-4">
              <input id="name" type="text" placeholder="NOME..." className="w-full bg-transparent border-b border-cyan-400/40 p-3 text-white font-black uppercase outline-none" />
              <input id="age" type="number" placeholder="IDADE..." className="w-full bg-transparent border-b border-cyan-400/40 p-3 text-white font-black outline-none" />
              <textarea id="customGoal" placeholder="OBJETIVO (EX: PASSAR EM CONCURSO...)" className="w-full bg-transparent border border-cyan-400/40 p-3 text-white font-black uppercase outline-none text-[10px] h-20 resize-none" />
              <div className="grid grid-cols-1 gap-2">
                <button onClick={() => (window as any)._sysMode = 'architect'} className="p-3 border border-cyan-400/40 text-[9px] font-black uppercase italic hover:bg-cyan-400/10 focus:bg-cyan-400 focus:text-black transition-all">Modo Arquiteto</button>
                <button onClick={() => (window as any)._sysMode = 'custom'} className="p-3 border border-cyan-400/40 text-[9px] font-black uppercase italic hover:bg-cyan-400/10 focus:bg-cyan-400 focus:text-black transition-all">Modo Personalizado</button>
              </div>
            </div>
            <button onClick={() => {
                const n = (document.getElementById('name') as HTMLInputElement).value;
                const a = parseInt((document.getElementById('age') as HTMLInputElement).value);
                const g = (document.getElementById('customGoal') as HTMLTextAreaElement).value;
                const m = (window as any)._sysMode || 'architect';
                if (n && a && g) handleAwakening(n, a, g, m);
            }} className="w-full bg-cyan-400 text-black font-black py-5 system-font text-[10px] uppercase tracking-widest mt-4"> ATIVAR SISTEMA </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#02060a] text-white flex flex-col font-['Rajdhani'] relative overflow-hidden">
      {isProcessing && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-24 h-24 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_30px_#00e5ff]"></div>
          <p className="system-font text-cyan-400 text-xs font-black uppercase tracking-[0.4em] animate-pulse italic">PROCESSANDO FLUXO...</p>
        </div>
      )}

      <header className="shrink-0 z-50 system-panel border-b border-cyan-400/20 px-6 py-4 flex items-center justify-between backdrop-blur-3xl">
        <div className="flex items-center gap-4 cursor-pointer active:scale-95 transition-all" onClick={() => setShowProfile(true)}>
          <div className="w-10 h-10 border border-cyan-400/40 cut-corners overflow-hidden flex items-center justify-center bg-cyan-400/5 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
             <img src={stats.avatar} alt="Avatar" className="w-full h-full object-cover p-1.5" />
          </div>
          <div className="flex flex-col">
            <h2 className="system-font text-[13px] text-cyan-400 font-black uppercase italic leading-none glow-text">{stats.playerName}</h2>
            <span className="text-[8px] text-gray-500 font-bold uppercase italic mt-1 truncate max-w-[120px]">{stats.age} ANOS | {stats.customGoal}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[8px] text-cyan-500 font-black uppercase tracking-[0.3em] italic">RANK {calculateRank(stats.level)}</span>
           <div className="flex items-center gap-1.5 text-yellow-500 italic font-black system-font text-xs mt-1">
              <Coins size={12} /> {stats.gold.toLocaleString()}G
           </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar pb-32 overscroll-contain touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
        {activeTab === 'STATUS' && <StatusWindow stats={stats} onAllocate={(k) => setTrainingStat(k as keyof Stats)} />}
        
        {activeTab === 'PROTOCOLS' && (
          <div className="space-y-6">
            <QuestWindow quests={quests} onComplete={completeQuest} onProgress={(id) => setQuests(prev => prev.map(q => q.id === id ? {...q, progress: Math.min(q.progress + 1, q.target)} : q))} />
          </div>
        )}

        {activeTab === 'SKILLS' && (
          <div className="space-y-6 pb-24">
            <div className="flex justify-between items-center px-2">
              <h2 className="system-font text-lg font-black text-white italic uppercase glow-text flex items-center gap-3"><Brain className="text-cyan-400" size={20} /> Despertares Sugeridos</h2>
              {stats.systemMode === 'custom' && <button onClick={handleCreateCustomSkill} className="text-[8px] font-black text-cyan-400 border border-cyan-400/40 px-3 py-1 cut-corners uppercase italic">CRIAR SKILL</button>}
            </div>
            {skills.map(s => (
              <div key={s.id} className={`system-panel cut-corners p-5 border-l-4 transition-all ${s.isUnlocked ? 'border-green-500 bg-green-500/5' : 'border-cyan-400 bg-cyan-950/10'}`}>
                <div className="flex justify-between items-start mb-2">
                   <h3 className="system-font text-white font-black text-sm uppercase italic">{s.name}</h3>
                   <span className="text-[7px] font-black bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-400/20">{s.type}</span>
                </div>
                <p className="text-[10px] text-gray-400 my-2 uppercase italic leading-tight">{s.description}</p>
                <div className="mt-3 flex gap-4 text-[8px] font-black uppercase italic text-gray-500">
                   <span>Bônus: <span className="text-cyan-400">{s.efficiencyBonus}</span></span>
                   <span>Nível: <span className="text-white">{s.level}</span></span>
                </div>
                {!s.isUnlocked && (
                  <button onClick={() => setSkillToTest(s)} className="w-full mt-4 bg-cyan-400 text-black font-black py-2.5 text-[9px] system-font uppercase italic cut-corners shadow-lg hover:bg-white transition-all active:scale-95">
                    [ INICIAR TESTE DE DESPERTAR ]
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'CHAT' && <ArchitectChat stats={stats} />}
        {activeTab === 'REGISTRY' && (
          <div className="space-y-6">
            <button onClick={handleAddNewItem} className="w-full py-4 border border-cyan-400/40 cut-corners bg-cyan-400/5 text-cyan-400 system-font text-[10px] font-black uppercase italic flex items-center justify-center gap-2">
              <Plus size={14} /> [ REGISTRAR NOVO HARDWARE ]
            </button>
            <ItemsRegistryWindow items={availableItems} onToggle={(id) => {
              setAvailableItems(prev => prev.map(it => {
                if (it.id === id) {
                  const newState = !it.owned;
                  if (it.statBonus) setStats(s => ({ ...s, [it.statBonus!.stat]: (s as any)[it.statBonus!.stat] + (newState ? it.statBonus!.value : -it.statBonus!.value) }));
                  return { ...it, owned: newState };
                }
                return it;
              }));
            }} />
          </div>
        )}
        {activeTab === 'INVENTORY' && <InventoryWindow items={inventory} />}

        {/* Anúncios Imersivos */}
        <div className="mt-12 mb-8 system-panel border-cyan-400/30 cut-corners p-4 bg-cyan-950/20">
          <div className="flex items-center gap-2 mb-2 border-b border-cyan-400/10 pb-2">
            <Info size={12} className="text-cyan-400 animate-pulse" />
            <span className="system-font text-[9px] font-black text-cyan-400 tracking-[0.2em] uppercase italic">PROTOCOL: EXTERNAL_REVENUE</span>
          </div>
          <div className="min-h-[100px] flex items-center justify-center overflow-hidden">
             <ins className="adsbygoogle"
                  style={{ display: 'block', width: '100%' }}
                  data-ad-client="ca-pub-6403370988033052"
                  data-ad-slot="1234567890" 
                  data-ad-format="auto"
                  data-full-width-responsive="true"></ins>
          </div>
        </div>
      </main>

      <nav className="shrink-0 system-panel border-t border-cyan-400/20 px-1 safe-bottom flex items-center justify-around backdrop-blur-3xl z-50 overflow-x-auto no-scrollbar">
        {[ 
          { id: 'STATUS', icon: Shield, label: 'STATUS' }, 
          { id: 'PROTOCOLS', icon: ScrollText, label: 'MISSÃO' }, 
          { id: 'SKILLS', icon: Brain, label: 'SKILLS' }, 
          { id: 'REGISTRY', icon: ShieldCheck, label: 'ITENS' }, 
          { id: 'CHAT', icon: MessageSquare, label: 'CHAT' } 
        ].map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id as SystemTab)} className={`flex flex-col items-center justify-center gap-1.5 py-4 min-w-[70px] flex-1 transition-all ${activeTab === t.id ? 'text-cyan-400 scale-105' : 'text-gray-600'}`}>
            <t.icon size={18} className={activeTab === t.id ? 'glow-text' : ''} />
            <span className="text-[7px] font-black system-font tracking-widest uppercase italic truncate w-full text-center px-1">{t.label}</span>
          </button>
        ))}
      </nav>

      {showProfile && <ProfileWindow stats={stats} onSave={(upd) => setStats(s => ({ ...s, ...upd }))} onClose={() => setShowProfile(false)} />}
      {notification && <SystemDialog message={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}
      
      {trainingStat && <TrainingModal statKey={trainingStat} currentValue={(stats as any)[trainingStat]} onSuccess={() => {
        setStats(prev => ({ ...prev, [trainingStat]: (prev as any)[trainingStat] + 1, unallocatedPoints: prev.unallocatedPoints - 1 }));
        setTrainingStat(null);
      }} onCancel={() => setTrainingStat(null)} />}

      {skillToTest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 p-6 backdrop-blur-3xl">
          <div className="w-full max-sm system-panel border-cyan-400 cut-corners p-10 text-center space-y-8 animate-in zoom-in-95 duration-500">
            <h2 className="system-font text-cyan-400 text-lg uppercase font-black italic">{skillToTest.name}</h2>
            <div className="py-4 border-y border-cyan-400/20">
               <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest block mb-4">Protocolo de Validação:</span>
               <p className="text-sm font-black text-white italic uppercase leading-relaxed">"{skillToTest.testTask}"</p>
               <p className="text-[10px] text-cyan-400 font-bold mt-4 uppercase">Meta: {skillToTest.testTarget} {skillToTest.testUnit}</p>
            </div>
            <button onClick={() => { setSkills(prev => prev.map(s => s.id === skillToTest.id ? {...s, isUnlocked: true} : s)); setSkillToTest(null); setNotification({msg: `HABILIDADE ${skillToTest.name.toUpperCase()} VALIDADA!`, type: 'level-up'}); }} className="w-full bg-cyan-400 text-black font-black py-5 system-font uppercase hover:bg-white transition-all italic shadow-lg active:scale-95">CONFIRMAR EXECUÇÃO</button>
            <button onClick={() => setSkillToTest(null)} className="w-full text-gray-600 font-black py-2 system-font text-[9px] uppercase tracking-widest">CANCELAR TESTE</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
