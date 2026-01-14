import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Target, Award, Dumbbell, Brain, Users, Chess } from 'lucide-react';
import { Quest, Skill, CustomQuestData, CustomSkillData, QuestCategory } from '../types';

interface CustomModePanelProps {
  quests: Quest[];
  skills: Skill[];
  onAddQuest: (questData: CustomQuestData) => void;
  onAddSkill: (skillData: CustomSkillData) => void;
  onDeleteQuest: (id: string) => void;
  onDeleteSkill: (id: string) => void;
  onEditQuest: (id: string, updated: Partial<Quest>) => void;
  onEditSkill: (id: string, updated: Partial<Skill>) => void;
}

const CustomModePanel: React.FC<CustomModePanelProps> = ({
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

  const skillTypeIcons = {
    'COGNITIVA': Brain,
    'MOTORA': Dumbbell,
    'SOCIAL': Users,
    'ESTRATÉGICA': Chess
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Banner do Modo Livre */}
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

      {/* Seção de Missões Personalizadas */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="system-font text-cyan-400 text-sm font-black uppercase italic flex items-center gap-2">
            <Award size={16} /> MISSÕES PERSONALIZADAS ({quests.filter(q => q.isUserCreated).length})
          </h3>
          <button
            onClick={() => setShowQuestForm(true)}
            className="bg-cyan-400 text-black px-4 py-2 text-[10px] font-black uppercase italic cut-corners hover:bg-white transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={14} /> NOVA MISSÃO
          </button>
        </div>

        {showQuestForm && (
          <div className="system-panel cut-corners p-6 border-cyan-400/30 mb-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[12px] font-black text-white uppercase">CRIAR MISSÃO PERSONALIZADA</h4>
              <button onClick={() => setShowQuestForm(false)} className="text-gray-600 hover:text-white">
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
                <Save size={14} /> SALVAR MISSÃO
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {quests.filter(q => q.isUserCreated).length === 0 ? (
            <div className="system-panel cut-corners p-8 text-center opacity-40">
              <Award className="mx-auto mb-3" size={32} />
              <p className="text-[11px] text-gray-500 uppercase italic">Nenhuma missão personalizada criada.</p>
              <p className="text-[10px] text-gray-600 uppercase mt-1">Clique em "NOVA MISSÃO" para começar.</p>
            </div>
          ) : (
            quests.filter(q => q.isUserCreated).map((quest) => (
              <div key={quest.id} className="system-panel cut-corners p-5 border-l-4 border-green-500 bg-green-500/5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-[13px] font-black text-white uppercase">{quest.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] text-cyan-500 font-black uppercase bg-cyan-500/10 px-2 py-1 cut-corners">
                        {quest.category}
                      </span>
                      <span className="text-[8px] text-gray-500">Alvo: {quest.target}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setQuestForm({
                          title: quest.title,
                          description: quest.description,
                          category: quest.category,
                          target: quest.target,
                          reward: quest.reward,
                          deadlineDays: Math.ceil((new Date(quest.deadline).getTime() - Date.now()) / (1000 * 3600 * 24))
                        });
                        setEditingQuest(quest.id);
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
                <p className="text-[11px] text-gray-400 uppercase italic mb-3">{quest.description}</p>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <div className="text-[10px] text-gray-600 uppercase">
                    <span className="text-yellow-500 font-black">{quest.goldReward}G</span> • 
                    <span className="text-cyan-400 font-black ml-2">+{quest.expReward} EXP</span>
                  </div>
                  <div className="text-[9px] text-gray-500">
                    Progresso: {quest.progress}/{quest.target}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Seção de Habilidades Personalizadas */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="system-font text-purple-400 text-sm font-black uppercase italic flex items-center gap-2">
            <Brain size={16} /> HABILIDADES PERSONALIZADAS ({skills.filter(s => s.isDynamic && s.id.includes('custom')).length})
          </h3>
          <button
            onClick={() => setShowSkillForm(true)}
            className="bg-purple-500 text-black px-4 py-2 text-[10px] font-black uppercase italic cut-corners hover:bg-purple-400 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={14} /> NOVA HABILIDADE
          </button>
        </div>

        {showSkillForm && (
          <div className="system-panel cut-corners p-6 border-purple-500/30 mb-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[12px] font-black text-white uppercase">CRIAR HABILIDADE PERSONALIZADA</h4>
              <button onClick={() => setShowSkillForm(false)} className="text-gray-600 hover:text-white">
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
              
              <div>
                <label className="text-[9px] text-gray-500 uppercase mb-2 block">TIPO DE HABILIDADE</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(skillTypeIcons).map(([type, Icon]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSkillForm({...skillForm, type: type as any})}
                      className={`px-3 py-2 text-[10px] font-black uppercase cut-corners flex items-center gap-2 ${
                        skillForm.type === type 
                          ? 'bg-purple-500 text-black' 
                          : 'bg-black/30 text-gray-400 border border-gray-700'
                      }`}
                    >
                      <Icon size={12} />
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              
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
                <Save size={14} /> SALVAR HABILIDADE
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {skills.filter(s => s.isDynamic && s.id.includes('custom')).length === 0 ? (
            <div className="system-panel cut-corners p-8 text-center opacity-40">
              <Brain className="mx-auto mb-3" size={32} />
              <p className="text-[11px] text-gray-500 uppercase italic">Nenhuma habilidade personalizada criada.</p>
              <p className="text-[10px] text-gray-600 uppercase mt-1">Clique em "NOVA HABILIDADE" para começar.</p>
            </div>
          ) : (
            skills.filter(s => s.isDynamic && s.id.includes('custom')).map((skill) => (
              <div key={skill.id} className="system-panel cut-corners p-5 border-l-4 border-purple-500 bg-purple-500/5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-[13px] font-black text-white uppercase">{skill.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] text-purple-500 font-black uppercase bg-purple-500/10 px-2 py-1 cut-corners">
                        {skill.type}
                      </span>
                      <span className="text-[8px] text-gray-500">Nível {skill.level}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSkillForm({
                          name: skill.name,
                          description: skill.description,
                          type: skill.type,
                          testTask: skill.testTask,
                          testTarget: skill.testTarget,
                          testUnit: skill.testUnit
                        });
                        setEditingSkill(skill.id);
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
                <p className="text-[11px] text-gray-400 uppercase italic mb-3">{skill.description}</p>
                <div className="pt-3 border-t border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase">
                    <span className="font-black">TESTE:</span> {skill.testTask} ({skill.testTarget} {skill.testUnit})
                  </div>
                  <div className="text-[9px] text-cyan-400 uppercase mt-1">
                    {skill.efficiencyBonus}
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

export default CustomModePanel;