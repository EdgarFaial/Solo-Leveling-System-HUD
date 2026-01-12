
import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, ScrollText, Backpack, ShoppingBag, Coins, Shield, Brain, Target, Info, Zap, AlertTriangle
} from 'lucide-react';
import StatusWindow from './components/StatusWindow';
import QuestWindow from './components/QuestWindow';
import InventoryWindow from './components/InventoryWindow';
import ShopWindow from './components/ShopWindow';
import SystemDialog from './components/SystemDialog';
import TrainingModal from './components/TrainingModal';
import { Stats, Quest, Item, Skill, SystemTab, calculateRank, INITIAL_STATS } from './types';
import { getArchitectAnalysis } from './services/geminiService';

const App: React.FC = () => {
  const [isAwakened, setIsAwakened] = useState(false);
  const [awakeningStep, setAwakeningStep] = useState(0); 
  const [activeTab, setActiveTab] = useState<SystemTab>('STATUS');
  const [notification, setNotification] = useState<{msg: string, type: 'default' | 'urgent' | 'level-up'} | null>(null);
  const [trainingStat, setTrainingStat] = useState<keyof Stats | null>(null);
  const [skillToTest, setSkillToTest] = useState<Skill | null>(null);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [skills, setSkills] = useState<Skill[]>([
    { id: 'sk-1', name: 'Estado de Fluxo', level: 1, type: 'COGNITIVA', description: 'Imersão absoluta sem distrações.', requirement: 'INT 15', efficiencyBonus: '+10% EXP Focus', isUnlocked: false, testTask: 'Foco em Leitura Técnica', testTarget: 45 },
    { id: 'sk-2', name: 'Controle de Cortisol', level: 1, type: 'ESTRATÉGICA', description: 'Manter calma sob pressão.', requirement: 'WILL 15', efficiencyBonus: '-20% Fadiga', isUnlocked: false, testTask: 'Banho Gelado (Resiliência)', testTarget: 3 },
    { id: 'sk-3', name: 'Persuasão Técnica', level: 1, type: 'SOCIAL', description: 'Capacidade de explicar conceitos complexos.', requirement: 'SEN 15', efficiencyBonus: '+20% Gold em Sociais', isUnlocked: false, testTask: 'Apresentar Pitch de Ideia', testTarget: 1 }
  ]);

  useEffect(() => {
    const data = localStorage.getItem('sl_system_v7_final');
    if (data) {
      const parsed = JSON.parse(data);
      setStats(parsed.stats);
      setInventory(parsed.inventory || []);
      setQuests(parsed.quests || []);
      setSkills(parsed.skills || []);
      if (parsed.stats.playerName) setIsAwakened(true);
    }
  }, []);

  useEffect(() => {
    if (isAwakened) {
      localStorage.setItem('sl_system_v7_final', JSON.stringify({ stats, inventory, quests, skills }));
    }
  }, [stats, inventory, quests, skills, isAwakened]);

  const handleAwakening = async (name: string, age: number, goal: string) => {
    if (!name || !age || !goal) return;
    const finalStats = { ...INITIAL_STATS, playerName: name.toUpperCase(), age, goal, unallocatedPoints: 5 };
    setStats(finalStats);
    setQuests([
      { id: 'd1', title: 'Protocolo Físico 50/50', description: 'Execute 50 flexões e 50 agachamentos imediatamente.', progress: 0, target: 1, type: 'daily', category: 'FÍSICO', completed: false, reward: 'VIT +1', goldReward: 200, expReward: 50 },
      { id: 'd2', title: 'Deep Work 60m', description: '60 minutos de trabalho focado sem smartphone.', progress: 0, target: 60, type: 'daily', category: 'COGNITIVO', completed: false, reward: 'INT +1', goldReward: 300, expReward: 100 }
    ]);
    setIsAwakened(true);
    const analysis = await getArchitectAnalysis(`Novo jogador vinculado: ${name}. Objetivo: ${goal}.`);
    setNotification({ msg: analysis, type: 'default' });
  };

  const completeQuest = (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.completed) return;
    setStats(prev => {
      const newExp = prev.exp + quest.expReward;
      const willLevelUp = newExp >= prev.maxExp;
      return {
        ...prev,
        exp: willLevelUp ? 0 : newExp,
        level: willLevelUp ? prev.level + 1 : prev.level,
        maxExp: willLevelUp ? Math.floor(prev.maxExp * 1.5) : prev.maxExp,
        unallocatedPoints: willLevelUp ? prev.unallocatedPoints + 3 : prev.unallocatedPoints,
        gold: prev.gold + quest.goldReward
      };
    });
    setQuests(prev => prev.map(q => q.id === id ? { ...q, completed: true } : q));
  };

  const handleSkillVerification = (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (skill) setSkillToTest(skill);
  };

  const certifySkill = (skillId: string) => {
    setSkills(prev => prev.map(s => s.id === skillId ? { ...s, isUnlocked: true } : s));
    setNotification({ msg: `HABILIDADE CERTIFICADA: ${skills.find(s=>s.id===skillId)?.name.toUpperCase()}. EFICIÊNCIA BIOLÓGICA AUMENTADA.`, type: 'level-up' });
    setSkillToTest(null);
  };

  if (!isAwakened) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-cyan-400 overflow-y-auto">
        {awakeningStep === 0 ? (
          <div className="w-full max-w-lg system-panel border-cyan-400 cut-corners bg-cyan-950/20 p-10 space-y-8 animate-in zoom-in duration-500">
             <h1 className="text-3xl font-black system-font leading-tight italic uppercase glow-text">VOCÊ DESEJA ACEITAR O PROTOCOLO DE OTIMIZAÇÃO?</h1>
             <p className="text-xs text-gray-500 italic uppercase font-bold">O sistema irá monitorar cada falha e forçar a evolução.</p>
             <button onClick={() => setAwakeningStep(1)} className="w-full py-5 border border-cyan-400 system-font font-black italic tracking-widest text-xs hover:bg-cyan-400 hover:text-black transition-all">
               [ ACEITAR CONTRATO ]
             </button>
          </div>
        ) : (
          <div className="w-full max-w-md system-panel border-cyan-400 cut-corners p-8 bg-cyan-950/10 space-y-6">
            <h2 className="system-font text-[10px] font-black tracking-widest uppercase mb-4 italic">Perfil de Unidade</h2>
            <input id="name" type="text" placeholder="NOME..." className="w-full bg-transparent border-b border-cyan-400 p-2 text-white font-black uppercase" />
            <input id="age" type="number" placeholder="IDADE..." className="w-full bg-transparent border-b border-cyan-400 p-2 text-white font-black" />
            <select id="goal" className="w-full bg-transparent border-b border-cyan-400 p-2 text-white font-black text-xs uppercase">
               <option value="LIDERANÇA">LIDERANÇA</option>
               <option value="TÉCNICO">TÉCNICO / ESTUDO</option>
               <option value="ATLETA">PERFORMANCE FÍSICA</option>
            </select>
            <button 
              onClick={() => {
                const n = (document.getElementById('name') as HTMLInputElement).value;
                const a = parseInt((document.getElementById('age') as HTMLInputElement).value);
                const g = (document.getElementById('goal') as HTMLSelectElement).value;
                handleAwakening(n, a, g);
              }}
              className="w-full bg-cyan-400 text-black font-black py-4 system-font text-xs uppercase"
            >
              SINCRONIZAR
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02060a] text-white flex flex-col font-['Rajdhani'] relative">
      <header className="sticky top-0 z-50 system-panel border-b border-cyan-400/20 px-6 py-4 flex items-center justify-between backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-cyan-400/40 cut-corners flex items-center justify-center bg-cyan-400/5">
             <User size={14} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="system-font text-[10px] text-cyan-400 tracking-widest font-black uppercase italic leading-none">{stats.playerName}</h2>
            <span className="text-[7px] text-gray-500 font-bold uppercase italic">NÍVEL {stats.level} | RANK {calculateRank(stats.level)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-yellow-500 italic font-black system-font text-xs">
           <Coins size={12} /> {stats.gold}G
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pt-6 pb-24 no-scrollbar">
        {activeTab === 'STATUS' && <StatusWindow stats={stats} onAllocate={(k) => setTrainingStat(k as keyof Stats)} />}
        {activeTab === 'PROTOCOLS' && <QuestWindow quests={quests} onComplete={completeQuest} onProgress={(id) => setQuests(prev => prev.map(q => q.id === id ? {...q, progress: Math.min(q.progress + 1, q.target)} : q))} />}
        {activeTab === 'INVENTORY' && <InventoryWindow items={inventory} />}
        {activeTab === 'SHOP' && <ShopWindow gold={stats.gold} onBuy={(it) => {
           if (stats.gold >= (it.price || 0)) {
             setStats(prev => ({...prev, gold: prev.gold - (it.price || 0)}));
             setInventory(prev => [...prev, it]);
             setNotification({msg: `RECURSO ADQUIRIDO: ${it.name.toUpperCase()}`, type: 'default'});
           }
        }} />}
        {activeTab === 'SKILLS' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-5">
            <h2 className="system-font text-xl font-black text-white italic uppercase tracking-tighter glow-text">Certificações de Competência</h2>
            {skills.map((s) => (
              <div key={s.id} className={`system-panel cut-corners p-5 border-l-4 ${s.isUnlocked ? 'border-green-500 bg-green-950/5' : 'border-gray-700 bg-white/5 opacity-80'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="system-font text-white font-black text-sm uppercase italic tracking-wider">{s.name}</h3>
                    <span className="text-[8px] text-cyan-500 font-black uppercase tracking-widest">{s.type}</span>
                  </div>
                  {s.isUnlocked ? (
                    <span className="text-[7px] bg-green-500 text-black font-black px-1.5 py-0.5 rounded-sm uppercase italic">CERTIFICADO</span>
                  ) : (
                    <button 
                      onClick={() => handleSkillVerification(s.id)}
                      className="text-[8px] bg-cyan-400 text-black font-black px-2 py-1 cut-corners uppercase hover:bg-white"
                    >
                      REIVINDICAR
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 italic leading-tight uppercase font-bold mb-3">{s.description}</p>
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                  <span className="text-gray-700">REQUISITO: {s.requirement}</span>
                  <span className="text-cyan-500">BÔNUS: {s.efficiencyBonus}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 w-full system-panel border-t border-cyan-400/20 px-2 py-4 flex items-center justify-around backdrop-blur-3xl z-50">
        {[
          { id: 'STATUS', icon: Shield, label: 'STATUS' },
          { id: 'PROTOCOLS', icon: ScrollText, label: 'MISSÃO' },
          { id: 'SKILLS', icon: Brain, label: 'SKILLS' },
          { id: 'INVENTORY', icon: Backpack, label: 'INV' },
          { id: 'SHOP', icon: ShoppingBag, label: 'LOJA' }
        ].map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id as SystemTab)} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === t.id ? 'text-cyan-400' : 'text-gray-600'}`}>
            <t.icon size={18} />
            <span className="text-[8px] font-black system-font tracking-widest uppercase italic">{t.label}</span>
          </button>
        ))}
      </nav>

      {notification && <SystemDialog message={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}
      
      {trainingStat && (
        <TrainingModal 
          statKey={trainingStat} 
          currentValue={(stats as any)[trainingStat]} 
          onSuccess={() => {
            setStats(prev => ({ ...prev, [trainingStat]: (prev as any)[trainingStat] + 1, unallocatedPoints: prev.unallocatedPoints - 1 }));
            setTrainingStat(null);
            setNotification({ msg: "OTIMIZAÇÃO CONCLUÍDA.", type: 'level-up' });
          }} 
          onCancel={() => setTrainingStat(null)} 
        />
      )}

      {skillToTest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6 backdrop-blur-xl">
          <div className="w-full max-w-sm system-panel border-cyan-400 cut-corners p-8 text-center space-y-6 shadow-[0_0_100px_rgba(0,229,255,0.2)]">
            <AlertTriangle className="mx-auto text-cyan-400 animate-pulse" size={40} />
            <h2 className="system-font text-cyan-400 text-lg uppercase font-black italic">PROTOCOLO DE CERTIFICAÇÃO</h2>
            <p className="text-xs text-gray-500 uppercase font-bold italic">O sistema irá auditar sua competência em:</p>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter glow-text">{skillToTest.name}</h3>
            
            <div className="bg-white/5 p-5 border border-white/10 cut-corners">
               <p className="text-[10px] text-cyan-400 font-black uppercase mb-2">Teste Requerido:</p>
               <p className="text-sm font-black text-white italic uppercase">{skillToTest.testTask}</p>
               <div className="mt-4 text-3xl font-black text-cyan-400">{skillToTest.testTarget} <span className="text-[10px] text-gray-600">UNIDADES</span></div>
            </div>

            <p className="text-[9px] text-gray-500 italic uppercase">"O SISTEMA NÃO RECOMPENSA INTENÇÃO. APENAS EXECUÇÃO."</p>

            <div className="flex gap-4">
              <button onClick={() => certifySkill(skillToTest.id)} className="flex-1 bg-cyan-400 text-black font-black py-4 system-font text-[10px] uppercase hover:bg-white">
                VERIFICADO
              </button>
              <button onClick={() => setSkillToTest(null)} className="flex-1 border border-white/10 text-gray-500 font-black py-4 system-font text-[10px] uppercase">
                ABORTAR
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 opacity-[0.05] pointer-events-none z-0">
        <p className="system-font text-[10px] font-black italic tracking-[0.5em] uppercase text-white">O sistema não recompensa intenção. Apenas execução.</p>
      </div>
    </div>
  );
};

export default App;
