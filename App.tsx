
import React, { useState, useEffect } from 'react';
import { 
  User, ScrollText, Backpack, Coins, Shield, Brain, ShieldCheck, Cpu, Plus, MessageSquare
} from 'lucide-react';
import StatusWindow from './components/StatusWindow';
import QuestWindow from './components/QuestWindow';
import InventoryWindow from './components/InventoryWindow';
import ItemsRegistryWindow from './components/ItemsRegistryWindow';
import ArchitectChat from './components/ArchitectChat';
import ProfileWindow from './components/ProfileWindow';
import SystemDialog from './components/SystemDialog';
import TrainingModal from './components/TrainingModal';
import { Stats, Quest, Skill, SystemTab, calculateRank, getJobTitle, INITIAL_STATS, Item, AvailableItem } from './types';
import { generateDailyQuests, generateObjectiveBatch, suggestCustomMission, generateDynamicSkill } from './services/geminiService';
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
  const [showCustomQuestForm, setShowCustomQuestForm] = useState(false);
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
      const today = new Date().toLocaleDateString();
      if (stats.lastDailyUpdate !== today) updateDailyQuests();
    }
  }, [stats, quests, inventory, availableItems, skills, isAwakened]);

  const updateDailyQuests = async () => {
    if (stats.systemMode === 'custom') return;
    setIsProcessing(true);
    try {
      const owned = availableItems.filter(i => i.owned);
      const newDailies = await generateDailyQuests(stats, owned);
      const questObjs: Quest[] = newDailies.map((q: any, i: number) => ({
        ...q, id: `daily-${Date.now()}-${i}`, progress: 0, type: 'daily', completed: false, goldReward: 100, expReward: 50
      }));
      setQuests(prev => [...prev.filter(q => q.type !== 'daily'), ...questObjs]);
      setStats(prev => ({ ...prev, lastDailyUpdate: new Date().toLocaleDateString() }));
    } catch (e) { console.error(e); } finally { setIsProcessing(false); }
  };

  const handleAwakening = (name: string, age: number, goal: string, mode: 'architect' | 'custom') => {
    const finalStats: Stats = { 
      ...INITIAL_STATS, playerName: name.toUpperCase(), age, customGoal: goal, goal: "CUSTOMIZADO", systemMode: mode, unallocatedPoints: 5, avatar: '👤'
    };
    setStats(finalStats);
    if (mode === 'architect') triggerInitialBatch(finalStats);
    setIsAwakened(true);
    setNotification({ msg: `SISTEMA VINCULADO EM MODO ${mode.toUpperCase()}.`, type: 'default' });
  };

  const triggerInitialBatch = async (s: Stats) => {
    setIsProcessing(true);
    try {
      const batch = await generateObjectiveBatch(s, availableItems.filter(i => i.owned));
      const questObjs: Quest[] = batch.map((q: any, i: number) => ({
        ...q, id: `batch-${Date.now()}-${i}`, progress: 0, type: 'intervention', completed: false, goldReward: 300, expReward: 150
      }));
      setQuests(prev => [...prev.filter(q => q.type !== 'intervention'), ...questObjs]);
    } catch (e) { console.error(e); } finally { setIsProcessing(false); }
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
    if (stats.systemMode === 'architect' && quest.type === 'intervention') {
      triggerInitialBatch(stats);
      setNotification({ msg: "PROGRESSÃO RECALIBRADA. 5 NOVAS MISSÕES NORMIAIS GERADAS.", type: 'default' });
    }
  };

  const handleLevelUpSkill = async () => {
    setIsProcessing(true);
    try {
      const skillData = await generateDynamicSkill(stats);
      const skillObj: Skill = { ...skillData, id: `sk-${Date.now()}`, level: 1, isUnlocked: false, isDynamic: true };
      setSkills(prev => [...prev, skillObj]);
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
          <div className="w-10 h-10 border border-cyan-400/40 cut-corners flex items-center justify-center bg-cyan-400/5 text-xl">
             {stats.avatar || '👤'}
          </div>
          <div className="flex flex-col">
            <h2 className="system-font text-[13px] text-cyan-400 font-black uppercase italic leading-none glow-text">{stats.playerName}</h2>
            <span className="text-[8px] text-gray-500 font-bold uppercase italic mt-1 truncate max-w-[120px]">{stats.customGoal}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[8px] text-cyan-500 font-black uppercase tracking-[0.3em] italic">RANK {calculateRank(stats.level)} | {stats.systemMode.toUpperCase()}</span>
           <div className="flex items-center gap-1.5 text-yellow-500 italic font-black system-font text-xs mt-1">
              <Coins size={12} /> {stats.gold.toLocaleString()}G
           </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
        {activeTab === 'STATUS' && <StatusWindow stats={stats} onAllocate={(k) => setTrainingStat(k as keyof Stats)} />}
        
        {activeTab === 'PROTOCOLS' && (
          <div className="space-y-6">
            <div className="flex gap-2">
              {stats.systemMode === 'custom' && (
                <button onClick={() => setShowCustomQuestForm(true)} className="flex-1 py-4 border border-cyan-400/40 system-panel cut-corners bg-cyan-400/5 text-cyan-400 system-font text-[10px] font-black tracking-widest uppercase italic flex items-center justify-center gap-2">
                  <Plus size={14} /> [ CRIAR MISSÃO ]
                </button>
              )}
              {stats.systemMode === 'custom' && (
                <button onClick={async () => {
                  setIsProcessing(true);
                  const s = await suggestCustomMission(stats.customGoal || "", availableItems.filter(i => i.owned));
                  setQuests(prev => [{...s, id: `sug-${Date.now()}`, progress: 0, type: 'intervention', completed: false, goldReward: 500, expReward: 250}, ...prev]);
                  setIsProcessing(false);
                }} className="px-4 border border-purple-500/40 text-purple-400 system-font text-[10px] font-black uppercase italic cut-corners">SUGERIR</button>
              )}
            </div>
            {showCustomQuestForm && (
              <div className="system-panel cut-corners p-6 border-cyan-400 bg-cyan-950/20 animate-in slide-in-from-top duration-300">
                <form onSubmit={(e: any) => {
                  e.preventDefault();
                  const q: Quest = {
                    id: `c-${Date.now()}`, title: e.target.title.value, description: e.target.desc.value, progress: 0, target: 1, type: e.target.type.value, completed: false,
                    reward: 'Própria', goldReward: 50, expReward: 25, measurableAction: 'Execução', timeCommitment: 'Variável', biologicalBenefit: 'Foco', adaptationLogic: 'Manual', estimatedTime: 'Manual', patternCorrection: 'Inércia', competenceDeveloped: 'Disciplina', protocol: 'Custom', category: 'FÍSICO', isUserCreated: true
                  };
                  setQuests(prev => [q, ...prev]);
                  setShowCustomQuestForm(false);
                }} className="space-y-4">
                  <input name="title" placeholder="TÍTULO..." required className="w-full bg-transparent border-b border-cyan-400/40 p-2 text-white font-black uppercase text-xs outline-none" />
                  <textarea name="desc" placeholder="OBJETIVO..." required className="w-full bg-transparent border-b border-cyan-400/40 p-2 text-white font-black uppercase text-[10px] outline-none h-16 resize-none" />
                  <select name="type" className="w-full bg-black border-b border-cyan-400/40 p-2 text-white font-black text-[10px] uppercase outline-none">
                    <option value="daily">Missão Diária</option>
                    <option value="intervention">Missão Normal</option>
                  </select>
                  <button type="submit" className="w-full bg-cyan-400 text-black font-black py-3 text-[10px] uppercase italic">VINCULAR PROTOCOLO</button>
                </form>
              </div>
            )}
            <QuestWindow quests={quests} onComplete={completeQuest} onProgress={(id) => setQuests(prev => prev.map(q => q.id === id ? {...q, progress: Math.min(q.progress + 1, q.target)} : q))} />
          </div>
        )}

        {activeTab === 'SKILLS' && (
          <div className="space-y-6 pb-24">
            <div className="flex justify-between items-center">
              <h2 className="system-font text-xl font-black text-white italic uppercase glow-text flex items-center gap-3"><Brain className="text-cyan-400" size={24} /> Despertar</h2>
              {stats.systemMode === 'custom' && <button onClick={handleCreateCustomSkill} className="text-[9px] font-black text-cyan-400 border border-cyan-400/40 px-3 py-1 cut-corners">CRIAR SKILL</button>}
            </div>
            {skills.map(s => (
              <div key={s.id} className={`system-panel cut-corners p-5 border-l-4 ${s.isUnlocked ? 'border-green-500' : 'border-cyan-400'}`}>
                <h3 className="system-font text-white font-black text-sm uppercase italic">{s.name}</h3>
                <p className="text-[10px] text-gray-400 my-2 uppercase italic leading-tight">{s.description}</p>
                {!s.isUnlocked && <button onClick={() => setSkillToTest(s)} className="w-full bg-cyan-400 text-black font-black py-2 text-[9px] system-font uppercase italic cut-corners">INICIAR TESTE</button>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'CHAT' && <ArchitectChat stats={stats} />}
        {activeTab === 'REGISTRY' && <ItemsRegistryWindow items={availableItems} onToggle={(id) => {
          setAvailableItems(prev => prev.map(it => {
            if (it.id === id) {
              const newState = !it.owned;
              if (it.statBonus) setStats(s => ({ ...s, [it.statBonus!.stat]: (s as any)[it.statBonus!.stat] + (newState ? it.statBonus!.value : -it.statBonus!.value) }));
              return { ...it, owned: newState };
            }
            return it;
          }));
        }} />}
        {activeTab === 'INVENTORY' && <InventoryWindow items={inventory} />}
        <div className="h-24"></div>
      </main>

      <nav className="shrink-0 system-panel border-t border-cyan-400/20 px-2 py-6 flex items-center justify-around backdrop-blur-3xl z-50">
        {[ { id: 'STATUS', icon: Shield, label: 'STATUS' }, { id: 'PROTOCOLS', icon: ScrollText, label: 'MISSÃO' }, { id: 'SKILLS', icon: Brain, label: 'SKILLS' }, { id: 'REGISTRY', icon: ShieldCheck, label: 'ITENS' }, { id: 'CHAT', icon: MessageSquare, label: 'CHAT' } ].map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id as SystemTab)} className={`flex flex-col items-center gap-2 flex-1 transition-all ${activeTab === t.id ? 'text-cyan-400 scale-110' : 'text-gray-600'}`}>
            <t.icon size={22} className={activeTab === t.id ? 'glow-text' : ''} />
            <span className="text-[9px] font-black system-font tracking-widest uppercase italic">{t.label}</span>
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
          <div className="w-full max-w-sm system-panel border-cyan-400 cut-corners p-10 text-center space-y-8 animate-in zoom-in-95 duration-500">
            <h2 className="system-font text-cyan-400 text-lg uppercase font-black italic">{skillToTest.name}</h2>
            <p className="text-sm font-black text-white italic uppercase leading-relaxed mb-6">"{skillToTest.testTask}"</p>
            <button onClick={() => { setSkills(prev => prev.map(s => s.id === skillToTest.id ? {...s, isUnlocked: true} : s)); setSkillToTest(null); }} className="w-full bg-cyan-400 text-black font-black py-5 system-font uppercase hover:bg-white transition-all italic shadow-lg">CONFIRMAR EXECUÇÃO</button>
            <button onClick={() => setSkillToTest(null)} className="w-full text-gray-600 font-black py-2 system-font text-[9px] uppercase">ABORTAR</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
