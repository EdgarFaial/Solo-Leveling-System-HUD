
import React, { useState, useEffect } from 'react';
import { 
  Shield, ScrollText, Brain, ShieldCheck, MessageSquare, Coins, Info, Plus, Backpack
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

const App: React.FC = () => {
  const [isAwakened, setIsAwakened] = useState(false);
  const [awakeningStep, setAwakeningStep] = useState(0); 
  const [activeTab, setActiveTab] = useState<SystemTab>('STATUS');
  const [notification, setNotification] = useState<{msg: string, type: 'default' | 'urgent' | 'level-up'} | null>(null);
  const [trainingStat, setTrainingStat] = useState<keyof Stats | null>(null);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillToTest, setSkillToTest] = useState<Skill | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([
    { id: 'item-1', name: 'DIÁRIO FÍSICO', category: 'diário', description: 'Registro de falhas.', owned: false, missionBonus: 'Foco Mental', statBonus: { stat: 'will', value: 2 }, icon: '📔' },
    { id: 'item-2', name: 'ACADEMIA', category: 'academia', description: 'Treino de carga.', owned: false, missionBonus: 'Força Bruta', statBonus: { stat: 'strength', value: 1 }, icon: '🏋️' }
  ]);

  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('sl_system_v23');
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

  useEffect(() => {
    if (isAwakened) {
      localStorage.setItem('sl_system_v23', JSON.stringify({ stats, quests, inventory, availableItems, skills }));
      checkDeadlines();
    }
  }, [stats, quests, inventory, availableItems, skills, isAwakened]);

  const checkDeadlines = () => {
    const now = new Date();
    const today = now.toLocaleDateString();
    if (stats.lastDailyUpdate !== today) updateDailyQuests();
    
    setQuests(prev => prev.filter(q => {
      if (!q.completed && new Date(q.deadline) < now) {
        setStats(s => ({ ...s, failedMissionsCount: s.failedMissionsCount + 1 }));
        return false;
      }
      return true;
    }));
  };

  const updateDailyQuests = async () => {
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
      setStats(prev => ({ ...prev, lastDailyUpdate: new Date().toLocaleDateString() }));
    } finally { setIsProcessing(false); }
  };

  const triggerInitialBatch = async (s: Stats) => {
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
      
      if (response.skill) {
        // Se as 5 skills sugeridas foram aprendidas, renovar a lista
        const suggestedCount = skills.filter(sk => sk.isDynamic && sk.isUnlocked).length;
        let currentSkills = [...skills];
        if (suggestedCount >= 5) {
          currentSkills = skills.filter(sk => !sk.isDynamic);
        }
        const skillObj: Skill = { ...response.skill, id: `sk-${Date.now()}`, level: 1, isUnlocked: false, isDynamic: true };
        setSkills([...currentSkills, skillObj]);
      }
    } finally { setIsProcessing(false); }
  };

  const handleAwakening = (name: string, age: number, goal: string) => {
    const finalStats: Stats = { ...INITIAL_STATS, playerName: name.toUpperCase(), age, customGoal: goal, systemMode: 'architect' };
    setStats(finalStats);
    triggerInitialBatch(finalStats);
    setIsAwakened(true);
  };

  if (!isAwakened) {
    return (
      <div className="h-screen bg-[#010a12] flex items-center justify-center p-6 text-cyan-400">
        <div className="w-full max-w-md system-panel border-cyan-400 cut-corners p-8 bg-cyan-950/10 space-y-4">
          <h1 className="text-3xl font-black system-font text-center mb-6 glow-text">ERGA-SE</h1>
          <input id="n" placeholder="NOME..." className="w-full bg-transparent border-b border-cyan-400/40 p-3 text-white uppercase outline-none" />
          <input id="a" type="number" placeholder="IDADE..." className="w-full bg-transparent border-b border-cyan-400/40 p-3 text-white outline-none" />
          <textarea id="g" placeholder="OBJETIVO..." className="w-full bg-transparent border border-cyan-400/40 p-3 text-white text-[10px] h-20 outline-none" />
          <button onClick={() => handleAwakening((document.getElementById('n') as any).value, parseInt((document.getElementById('a') as any).value), (document.getElementById('g') as any).value)} className="w-full bg-cyan-400 text-black font-black py-4 uppercase">ATIVAR</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#02060a] text-white flex flex-col font-['Rajdhani'] overflow-hidden">
      {isProcessing && (
        <div className="fixed inset-0 z-[2000] bg-black/80 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="system-font text-cyan-400 text-[10px] mt-4">SINCRONIZANDO...</p>
        </div>
      )}

      <header className="shrink-0 z-50 system-panel border-b border-cyan-400/20 px-6 py-4 flex items-center justify-between backdrop-blur-3xl pt-[env(safe-area-inset-top,1rem)]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowProfile(true)}>
          <div className="w-10 h-10 border border-cyan-400/40 flex items-center justify-center bg-cyan-400/5 cut-corners">
             <img src={stats.avatar} alt="Avatar" className="w-full h-full object-cover p-1" />
          </div>
          <div>
            <h2 className="system-font text-xs text-cyan-400 font-black glow-text">{stats.playerName}</h2>
            <span className="text-[8px] text-gray-500 uppercase">RANK {calculateRank(stats.level)}</span>
          </div>
        </div>
        <div className="text-yellow-500 font-black flex items-center gap-1 text-xs">
          <Coins size={12} /> {stats.gold}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
        {activeTab === 'STATUS' && <StatusWindow stats={stats} onAllocate={(k) => setTrainingStat(k as any)} />}
        {activeTab === 'PROTOCOLS' && <QuestWindow quests={quests} onComplete={(id) => setQuests(prev => prev.map(q => q.id === id ? {...q, completed: true} : q))} onProgress={(id) => setQuests(prev => prev.map(q => q.id === id ? {...q, progress: Math.min(q.progress + 1, q.target)} : q))} />}
        {activeTab === 'SKILLS' && (
          <div className="space-y-4">
            <h2 className="system-font text-cyan-400 text-sm font-black mb-4">SKILLS SUGERIDAS</h2>
            {skills.map(s => (
              <div key={s.id} className={`system-panel cut-corners p-4 border-l-4 ${s.isUnlocked ? 'border-green-500 bg-green-500/5' : 'border-cyan-400 bg-cyan-950/10'}`}>
                <h3 className="system-font text-xs font-black">{s.name}</h3>
                <p className="text-[9px] text-gray-500 mt-1 uppercase italic leading-tight">{s.description}</p>
                {!s.isUnlocked && <button onClick={() => setSkillToTest(s)} className="w-full mt-3 bg-cyan-400 text-black font-black py-2 text-[9px] uppercase">TESTAR</button>}
              </div>
            ))}
          </div>
        )}
        {activeTab === 'CHAT' && <ArchitectChat stats={stats} />}
        {activeTab === 'REGISTRY' && (
           <div className="space-y-4">
             <button onClick={() => {
                const n = prompt("NOME:"); const d = prompt("DESC:");
                if(n && d) setAvailableItems([...availableItems, { id: Date.now().toString(), name: n, description: d, category: 'custom', owned: true, missionBonus: 'Custom', icon: '📦' }]);
             }} className="w-full py-3 border border-cyan-400/40 text-cyan-400 text-[10px] font-black uppercase"><Plus size={14} className="inline mr-2" /> ITEM</button>
             <ItemsRegistryWindow items={availableItems} onToggle={(id) => setAvailableItems(prev => prev.map(it => it.id === id ? {...it, owned: !it.owned} : it))} />
           </div>
        )}
        {activeTab === 'INVENTORY' && <InventoryWindow items={inventory} />}
        
        <div className="mt-12 opacity-50 border-t border-cyan-400/10 pt-4">
           <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client="ca-pub-6403370988033052" data-ad-slot="1234567890" data-ad-format="auto" data-full-width-responsive="true"></ins>
        </div>
      </main>

      <nav className="shrink-0 system-panel border-t border-cyan-400/20 flex items-center justify-between backdrop-blur-3xl pb-[env(safe-area-inset-bottom,1rem)]">
        {[ 
          { id: 'STATUS', icon: Shield, label: 'STATS' }, 
          { id: 'PROTOCOLS', icon: ScrollText, label: 'MISSÃO' }, 
          { id: 'SKILLS', icon: Brain, label: 'SKILLS' }, 
          { id: 'REGISTRY', icon: ShieldCheck, label: 'ITENS' }, 
          { id: 'CHAT', icon: MessageSquare, label: 'CHAT' } 
        ].map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id as SystemTab)} className={`flex-1 py-4 flex flex-col items-center gap-1 min-w-0 transition-all ${activeTab === t.id ? 'text-cyan-400' : 'text-gray-600'}`}>
            <t.icon size={18} />
            <span className="text-[7px] font-black uppercase truncate w-full text-center px-1">{t.label}</span>
          </button>
        ))}
      </nav>

      {showProfile && <ProfileWindow stats={stats} onSave={(u) => setStats(s => ({...s, ...u}))} onClose={() => setShowProfile(false)} />}
      {notification && <SystemDialog message={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}
      {trainingStat && <TrainingModal statKey={trainingStat} currentValue={(stats as any)[trainingStat]} onSuccess={() => { setStats(s => ({...s, [trainingStat]: (s as any)[trainingStat]+1, unallocatedPoints: s.unallocatedPoints-1})); setTrainingStat(null); }} onCancel={() => setTrainingStat(null)} />}
      
      {skillToTest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 p-6 backdrop-blur-3xl">
          <div className="w-full max-w-sm system-panel border-cyan-400 cut-corners p-10 text-center space-y-6">
            <h2 className="system-font text-cyan-400 uppercase font-black">{skillToTest.name}</h2>
            <p className="text-sm font-black italic">"{skillToTest.testTask}"</p>
            <button onClick={() => { setSkills(prev => prev.map(s => s.id === skillToTest.id ? {...s, isUnlocked: true} : s)); setSkillToTest(null); }} className="w-full bg-cyan-400 text-black font-black py-5">VALIDAR</button>
            <button onClick={() => setSkillToTest(null)} className="w-full text-gray-600 text-[10px] uppercase">CANCELAR</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
