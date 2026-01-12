
import React, { useState, useEffect } from 'react';
import { 
  User, ScrollText, Backpack, Coins, Shield, Brain, Box, Edit3, ShoppingBag
} from 'lucide-react';
import StatusWindow from './components/StatusWindow';
import QuestWindow from './components/QuestWindow';
import InventoryWindow from './components/InventoryWindow';
import ShopWindow from './components/ShopWindow';
import ResourcesWindow from './components/ResourcesWindow';
import SystemDialog from './components/SystemDialog';
import TrainingModal from './components/TrainingModal';
import { Stats, Quest, Skill, ResourceItem, SystemTab, calculateRank, getJobTitle, INITIAL_STATS, Item } from './types';

const App: React.FC = () => {
  const [isAwakened, setIsAwakened] = useState(false);
  const [awakeningStep, setAwakeningStep] = useState(0); 
  const [activeTab, setActiveTab] = useState<SystemTab>('STATUS');
  const [notification, setNotification] = useState<{msg: string, type: 'default' | 'urgent' | 'level-up'} | null>(null);
  const [trainingStat, setTrainingStat] = useState<keyof Stats | null>(null);
  const [skillToTest, setSkillToTest] = useState<Skill | null>(null);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [inventory, setInventory] = useState<Item[]>([]);
  
  const [resources, setResources] = useState<ResourceItem[]>([
    { id: 'res-1', name: 'Centro de Treinamento (Academia)', category: 'infraestrutura', description: 'Acesso a pesos livres e máquinas.', icon: '🏋️', isIntegrated: false, bonus: '+25% Ganho de Força' },
    { id: 'res-2', name: 'Telemetria Biológica (Smartwatch)', category: 'ferramenta', description: 'Monitoramento de sono e HRV.', icon: '⌚', isIntegrated: false, bonus: '+15% Recuperação' },
    { id: 'res-3', name: 'Log de Auditoria (Diário)', category: 'ferramenta', description: 'Registro de falhas e metas.', icon: '📔', isIntegrated: false, bonus: '+10% Willpower EXP' },
  ]);
  
  const [quests, setQuests] = useState<Quest[]>([]);

  const [skills, setSkills] = useState<Skill[]>([
    { id: 'sk-1', name: 'Estado de Fluxo', level: 1, type: 'COGNITIVA', description: 'Imersão absoluta sem distrações.', requirement: 'INT 5', efficiencyBonus: '+10% Focus', isUnlocked: false, testTask: 'Focar em uma tarefa complexa sem interrupções.', testTarget: 45, testUnit: 'Minutos' },
    { id: 'sk-2', name: 'Controle de Cortisol', level: 1, type: 'ESTRATÉGICA', description: 'Calma sob estresse extremo.', requirement: 'WILL 5', efficiencyBonus: '-20% Fadiga', isUnlocked: false, testTask: 'Exposição controlada ao frio (banho gelado).', testTarget: 3, testUnit: 'Minutos' },
    { id: 'sk-3', name: 'Presença Social', level: 1, type: 'SOCIAL', description: 'Carisma e influência natural.', requirement: 'SEN 5', efficiencyBonus: '+15% Persuasão', isUnlocked: false, testTask: 'Conversar com 3 pessoas desconhecidas hoje.', testTarget: 3, testUnit: 'Pessoas' }
  ]);

  useEffect(() => {
    const data = localStorage.getItem('sl_system_v14_complete');
    if (data) {
      const parsed = JSON.parse(data);
      setStats(parsed.stats);
      setQuests(parsed.quests || []);
      setSkills(parsed.skills || []);
      setResources(parsed.resources || resources);
      setInventory(parsed.inventory || []);
      if (parsed.stats.playerName) setIsAwakened(true);
    }
  }, []);

  useEffect(() => {
    if (isAwakened) {
      localStorage.setItem('sl_system_v14_complete', JSON.stringify({ stats, quests, skills, resources, inventory }));
    }
  }, [stats, quests, skills, resources, inventory, isAwakened]);

  const getInterventions = (goal: string): Quest[] => {
    const interventions: Record<string, Quest[]> = {
      'DOMÍNIO SOCIAL': [
        { id: 'i-s1', title: 'Quebra de Anonimato', description: 'Desafiar a barreira do silêncio social.', protocol: 'Pedir informação ou puxar assunto com desconhecidos.', progress: 0, target: 5, type: 'intervention', category: 'SOCIAL', completed: false, reward: 'SEN +2', goldReward: 300, expReward: 200, measurableAction: '5 Interações sociais iniciadas', timeCommitment: '1 Dia', biologicalBenefit: 'Dessensibilização da amígdala ao contato social.', adaptationLogic: 'Target aumenta +2 a cada intervenção.', estimatedTime: '24h', patternCorrection: 'Ansiedade Social / Introversão', competenceDeveloped: 'Iniciativa Social' },
        { id: 'i-s2', title: 'Ouvvinte Ativo', description: 'Desenvolver escuta empática profunda.', protocol: 'Ouvir alguém por 10min sem interromper ou julgar.', progress: 0, target: 1, type: 'intervention', category: 'SOCIAL', completed: false, reward: 'WILL +2', goldReward: 400, expReward: 300, measurableAction: '1 Sessão de escuta profunda', timeCommitment: '10 Minutos', biologicalBenefit: 'Fortalecimento de neurônios espelho.', adaptationLogic: 'Duração aumenta 5min por nível.', estimatedTime: '1 Dia', patternCorrection: 'Egocentrismo / Distração', competenceDeveloped: 'Empatia e Foco Social' }
      ],
      'EXCELÊNCIA COGNITIVA': [
        { id: 'i-c1', title: 'Muralha Mental', description: 'Resistir ao bombardeio de notificações.', protocol: 'Trabalhar em modo avião por 2h contínuas.', progress: 0, target: 2, type: 'intervention', category: 'COGNITIVO', completed: false, reward: 'INT +2', goldReward: 300, expReward: 250, measurableAction: '2 Horas de isolamento digital', timeCommitment: '2 Horas', biologicalBenefit: 'Redução da fragmentação sináptica.', adaptationLogic: 'Tempo aumenta 30min por iteração.', estimatedTime: '1 Dia', patternCorrection: 'Foco Baixo / Dispersão', competenceDeveloped: 'Deep Work' }
      ],
      'RESILIÊNCIA MENTAL (ESTOICISMO)': [
        { id: 'i-p1', title: 'O Carrasco do "Amanhã"', description: 'Aniquilar a voz da procrastinação imediata.', protocol: 'Executar a tarefa mais difícil do dia nos primeiros 30min.', progress: 0, target: 1, type: 'intervention', category: 'CONTROLE', completed: false, reward: 'WILL +3', goldReward: 500, expReward: 400, measurableAction: 'Conclusão da tarefa crítica matinal', timeCommitment: '30 Minutos', biologicalBenefit: 'Treino do córtex cingulado anterior.', adaptationLogic: 'Dificuldade da tarefa deve ser maior a cada vez.', estimatedTime: 'Diário', patternCorrection: 'Procrastinação Crônica', competenceDeveloped: 'Disciplina Executiva' }
      ],
      'PERFORMANCE FÍSICA': [
        { id: 'i-f1', title: 'Limite de Resistência', description: 'Expandir a capacidade volumétrica do corpo.', protocol: 'Caminhada ou corrida contínua por 40 minutos.', progress: 0, target: 40, type: 'intervention', category: 'FÍSICO', completed: false, reward: 'VIT +3', goldReward: 400, expReward: 350, measurableAction: '40 Minutos de atividade constante', timeCommitment: '40 Minutos', biologicalBenefit: 'Otimização cardiovascular e densidade capilar.', adaptationLogic: 'Aumenta 5min por nível físico.', estimatedTime: '1 Dia', patternCorrection: 'Sedentarismo / Baixa Estamina', competenceDeveloped: 'Resistência Aeróbica' }
      ]
    };
    return interventions[goal] || interventions['RESILIÊNCIA MENTAL (ESTOICISMO)'];
  };

  const generateInitialQuests = (currentStats: Stats): Quest[] => {
    const level = currentStats.level;
    const physT = 20 + (level * 5);
    const cogT = 15 + (level * 5);

    const dailies: Quest[] = [
      { id: 'd1', title: 'Fortalecimento Base', description: 'Treino básico de resistência.', protocol: `Realizar ${physT} repetições de exercícios.`, progress: 0, target: 1, type: 'daily', category: 'FÍSICO', completed: false, reward: 'VIT +1', goldReward: 100, expReward: 50, measurableAction: `${physT} Reps`, timeCommitment: '15min', biologicalBenefit: 'Tônus muscular.', adaptationLogic: '+5 rep/level.' },
      { id: 'd2', title: 'Foco Primário', description: 'Treino básico de atenção.', protocol: `Focar por ${cogT} min em uma tarefa.`, progress: 0, target: 1, type: 'daily', category: 'COGNITIVO', completed: false, reward: 'INT +1', goldReward: 100, expReward: 50, measurableAction: `${cogT} Minutos`, timeCommitment: `${cogT}min`, biologicalBenefit: 'Foco neural.', adaptationLogic: '+5 min/level.' }
    ];

    const profileInterventions = getInterventions(currentStats.goal);
    return [...dailies, ...profileInterventions];
  };

  const handleAwakening = (name: string, age: number, goal: string, customGoal?: string) => {
    if (!name || !age || !goal) return;
    const finalStats = { ...INITIAL_STATS, playerName: name.toUpperCase(), age, goal, customGoal, unallocatedPoints: 5 };
    setStats(finalStats);
    setQuests(generateInitialQuests(finalStats));
    setIsAwakened(true);
    setNotification({ msg: `SISTEMA VINCULADO. DIRETRIZ: ${goal}.`, type: 'default' });
  };

  const buyItem = (item: Item) => {
    if (stats.gold < (item.price || 0)) return;
    setStats(prev => ({ ...prev, gold: prev.gold - (item.price || 0) }));
    setInventory(prev => [...prev, item]);
    setNotification({ msg: `ITEM ${item.name.toUpperCase()} ADQUIRIDO COM SUCESSO.`, type: 'default' });
  };

  const completeQuest = (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.completed) return;
    setStats(prev => {
      const newExp = prev.exp + quest.expReward;
      const willLevelUp = newExp >= prev.maxExp;
      const nextLevel = willLevelUp ? prev.level + 1 : prev.level;
      if (willLevelUp) setNotification({ msg: `NÍVEL ${nextLevel} ATINGIDO!`, type: 'level-up' });
      return { ...prev, exp: willLevelUp ? 0 : newExp, level: nextLevel, job: getJobTitle(nextLevel), maxExp: willLevelUp ? Math.floor(prev.maxExp * 1.6) : prev.maxExp, unallocatedPoints: willLevelUp ? prev.unallocatedPoints + 3 : prev.unallocatedPoints, gold: prev.gold + quest.goldReward };
    });
    setQuests(prev => prev.map(q => q.id === id ? { ...q, completed: true } : q));
  };

  if (!isAwakened) {
    return (
      <div className="h-screen bg-[#010a12] flex items-center justify-center p-6 text-cyan-400">
        {awakeningStep === 0 ? (
          <div className="w-full max-w-lg system-panel border-cyan-400 cut-corners bg-cyan-950/20 p-10 text-center animate-in zoom-in duration-500">
             <h1 className="text-4xl font-black system-font leading-none italic uppercase glow-text mb-4 tracking-tighter">ERGA-SE</h1>
             <p className="text-[10px] text-gray-500 italic uppercase font-bold tracking-[0.3em] mb-8">Deseja iniciar o processo de vinculação ao Arquiteto?</p>
             <button onClick={() => setAwakeningStep(1)} className="w-full py-6 border border-cyan-400 system-font font-black italic tracking-widest text-xs hover:bg-cyan-400 hover:text-black transition-all">
               [ VINCULAR UNIDADE ]
             </button>
          </div>
        ) : (
          <div className="w-full max-w-md system-panel border-cyan-400 cut-corners p-10 bg-cyan-950/10 space-y-6">
            <h2 className="system-font text-[10px] font-black uppercase italic text-cyan-400/60 mb-8 border-b border-cyan-400/20 pb-2">Seleção de Diretriz</h2>
            <div className="space-y-4">
              <input id="name" type="text" placeholder="NOME DO DESPERTO..." className="w-full bg-transparent border-b border-cyan-400/40 p-3 text-white font-black uppercase outline-none" />
              <input id="age" type="number" placeholder="IDADE..." className="w-full bg-transparent border-b border-cyan-400/40 p-3 text-white font-black outline-none" />
              <select id="goal" className="w-full bg-transparent border-b border-cyan-400/40 p-3 text-white font-black text-[10px] uppercase outline-none cursor-pointer">
                 <option value="PERFORMANCE FÍSICA" className="bg-black">PERFORMANCE FÍSICA</option>
                 <option value="EXCELÊNCIA COGNITIVA" className="bg-black">EXCELÊNCIA COGNITIVA</option>
                 <option value="RESILIÊNCIA MENTAL (ESTOICISMO)" className="bg-black">RESILIÊNCIA MENTAL</option>
                 <option value="DOMÍNIO SOCIAL" className="bg-black">DOMÍNIO SOCIAL</option>
                 <option value="OTIMIZAÇÃO BIOLÓGICA (BIOHACKING)" className="bg-black">OTIMIZAÇÃO BIOLÓGICA</option>
              </select>
            </div>
            <button 
              onClick={() => handleAwakening((document.getElementById('name') as HTMLInputElement).value, parseInt((document.getElementById('age') as HTMLInputElement).value), (document.getElementById('goal') as HTMLSelectElement).value)}
              className="w-full bg-cyan-400 text-black font-black py-5 system-font text-[10px] uppercase tracking-widest mt-8"
            >
              ATIVAR SISTEMA
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#02060a] text-white flex flex-col font-['Rajdhani'] relative overflow-hidden">
      <header className="shrink-0 z-50 system-panel border-b border-cyan-400/20 px-6 py-5 flex items-center justify-between backdrop-blur-3xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-cyan-400/40 cut-corners flex items-center justify-center bg-cyan-400/5">
             <User size={18} className="text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="system-font text-[13px] text-cyan-400 tracking-[0.2em] font-black uppercase italic leading-none glow-text">{stats.playerName}</h2>
            <span className="text-[8px] text-gray-500 font-bold uppercase italic mt-1">{stats.job}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[8px] text-cyan-500 font-black uppercase tracking-[0.3em] italic">RANK {calculateRank(stats.level)}</span>
           <div className="flex items-center gap-1.5 text-yellow-500 italic font-black system-font text-xs mt-1">
              <Coins size={12} /> {stats.gold.toLocaleString()}G
           </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 no-scrollbar">
        {activeTab === 'STATUS' && <StatusWindow stats={stats} onAllocate={(k) => setTrainingStat(k as keyof Stats)} />}
        {activeTab === 'PROTOCOLS' && <QuestWindow quests={quests} onComplete={completeQuest} onProgress={(id) => setQuests(prev => prev.map(q => q.id === id ? {...q, progress: Math.min(q.progress + 1, q.target)} : q))} />}
        {activeTab === 'RESOURCES' && <ResourcesWindow resources={resources} onToggle={(id) => setResources(prev => prev.map(r => r.id === id ? {...r, isIntegrated: !r.isIntegrated} : r))} />}
        {activeTab === 'SKILLS' && (
          <div className="space-y-6">
            <h2 className="system-font text-xl font-black text-white italic uppercase glow-text flex items-center gap-3">
              <Brain className="text-cyan-400" size={24} /> Árvore de Skills
            </h2>
            {skills.map(s => (
              <div key={s.id} className={`system-panel cut-corners p-5 border-l-4 ${s.isUnlocked ? 'border-green-500' : 'border-gray-700 opacity-80'}`}>
                <div className="flex justify-between">
                  <h3 className="system-font text-white font-black text-sm uppercase italic">{s.name}</h3>
                  {!s.isUnlocked && <button onClick={() => setSkillToTest(s)} className="text-[9px] bg-cyan-400 text-black font-black px-5 py-2 cut-corners uppercase italic">TESTAR</button>}
                </div>
                <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold italic">{s.description}</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'INVENTORY' && <InventoryWindow items={inventory} />}
        {activeTab === 'SHOP' && <ShopWindow gold={stats.gold} onBuy={buyItem} />}
        <div className="h-24"></div>
      </main>

      <nav className="shrink-0 system-panel border-t border-cyan-400/20 px-2 py-6 flex items-center justify-around backdrop-blur-3xl z-50 overflow-x-auto no-scrollbar">
        {[
          { id: 'STATUS', icon: Shield, label: 'STATUS' },
          { id: 'PROTOCOLS', icon: ScrollText, label: 'MISSÃO' },
          { id: 'RESOURCES', icon: Box, label: 'RECURSO' },
          { id: 'SKILLS', icon: Brain, label: 'SKILLS' },
          { id: 'INVENTORY', icon: Backpack, label: 'BAG' },
          { id: 'SHOP', icon: ShoppingBag, label: 'LOJA' },
        ].map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id as SystemTab)} className={`flex flex-col items-center gap-2 flex-1 transition-all min-w-[60px] ${activeTab === t.id ? 'text-cyan-400 scale-110' : 'text-gray-600'}`}>
            <t.icon size={22} />
            <span className="text-[9px] font-black system-font tracking-widest uppercase italic">{t.label}</span>
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
            setNotification({ msg: `ATRIBUTO ${(trainingStat as string).toUpperCase()} OTIMIZADO.`, type: 'default' });
          }} 
          onCancel={() => setTrainingStat(null)} 
        />
      )}

      {skillToTest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 p-6 backdrop-blur-3xl">
          <div className="w-full max-w-sm system-panel border-cyan-400 cut-corners p-10 text-center space-y-8">
            <h2 className="system-font text-cyan-400 text-lg uppercase font-black italic">PROVA DE COMPETÊNCIA</h2>
            <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter glow-text leading-none">{skillToTest.name}</h3>
            <div className="bg-white/5 p-6 border border-white/10 cut-corners">
              <p className="text-sm font-black text-white italic uppercase leading-relaxed mb-6">"{skillToTest.testTask}"</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-black text-cyan-400 italic">{skillToTest.testTarget}</span>
                <span className="text-[10px] text-gray-600 font-black uppercase">{skillToTest.testUnit}</span>
              </div>
            </div>
            <button 
              onClick={() => { 
                setSkills(prev => prev.map(s => s.id === skillToTest.id ? {...s, isUnlocked: true} : s)); 
                setSkillToTest(null);
                setNotification({ msg: `HABILIDADE ${skillToTest.name.toUpperCase()} ADQUIRIDA.`, type: 'level-up' });
              }} 
              className="w-full bg-cyan-400 text-black font-black py-5 system-font text-[11px] tracking-[0.3em] uppercase hover:bg-white transition-all cut-corners italic shadow-lg"
            >
              CONFIRMAR EXECUÇÃO
            </button>
            <button onClick={() => setSkillToTest(null)} className="w-full text-gray-600 font-black py-2 system-font text-[9px] uppercase tracking-widest">ABORTAR</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
