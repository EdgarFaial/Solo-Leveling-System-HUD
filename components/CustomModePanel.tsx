import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Target, Award } from 'lucide-react';
import { Quest, Skill, CustomQuestData, CustomSkillData } from '../types';

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="system-font text-cyan-400 text-sm font-black uppercase italic flex items-center gap-2">
            <Award size={16} /> MISSÕES PERSONALIZADAS
          </h3>
          <button
            onClick={() => setShowQuestForm(true)}
            className="bg-cyan-400 text-black px-4 py-2 text-[10px] font-black uppercase italic cut-corners hover:bg-white transition-all flex items-center gap-2"
          >
            <Plus size={14} /> NOVA MISSÃO
          </button>
        </div>

        {showQuestForm && (
          <div className="system-panel cut-corners p-6 border-cyan-400/30 mb-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[12px] font-black text-white uppercase">CRIAR MISSÃO</h4>
              <button onClick={() => setShowQuestForm(false)} className="text-gray-600 hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                value={questForm.title}
                onChange={(e) => setQuestForm({...questForm, title: e.target.value})}
                placeholder="TÍTULO DA MISSÃO"
                className="w-full bg-black/30 border border-cyan-400/30 p-3 text-white text-[11px] uppercase outline-none cut-corners"
              />
              
              <textarea
                value={questForm.description}
                onChange={(e) => setQuestForm({...questForm, description: e.target.value})}
                placeholder="DESCRIÇÃO DETALHADA"
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
                  />
                </div>
                
                <div>
                  <label className="text-[9px] text-gray-500 uppercase mb-1 block">PRAZO (DIAS)</label>
                  <input
                    type="number"
                    value={questForm.deadlineDays}
                    onChange={(e) => setQuestForm({...questForm, deadlineDays: parseInt(e.target.value) || 1})}
                    className="w-full bg-black/30 border border-cyan-400/30 p-3 text-white text-[11px] outline-none cut-corners"
                  />
                </div>
              </div>
              
              <button
                onClick={handleAddQuest}
                className="w-full bg-green-500 text-black font-black py-3 text-[11px] uppercase italic cut-corners hover:bg-green-400 transition-all"
              >
                <Save size={14} className="inline mr-2" /> SALVAR MISSÃO
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {quests.filter(q => q.isUserCreated).map((quest) => (
            <div key={quest.id} className="system-panel cut-corners p-5 border-l-4 border-green-500 bg-green-500/5">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-[12px] font-black text-white uppercase">{quest.title}</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingQuest(quest.id)}
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
              <div className="flex justify-between text-[10px] text-gray-600 uppercase">
                <span>Progresso: {quest.progress}/{quest.target}</span>
                <span className="text-yellow-500">{quest.goldReward}G</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seção de Habilidades Personalizadas */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="system-font text-purple-400 text-sm font-black uppercase italic">HABILIDADES PERSONALIZADAS</h3>
          <button
            onClick={() => setShowSkillForm(true)}
            className="bg-purple-500 text-black px-4 py-2 text-[10px] font-black uppercase italic cut-corners hover:bg-purple-400 transition-all flex items-center gap-2"
          >
            <Plus size={14} /> NOVA HABILIDADE
          </button>
        </div>

        {showSkillForm && (
          <div className="system-panel cut-corners p-6 border-purple-500/30 mb-6 animate-in fade-in">
            {/* Form similar ao de missões */}
          </div>
        )}

        <div className="space-y-4">
          {skills.filter(s => s.isDynamic && s.id.includes('custom')).map((skill) => (
            <div key={skill.id} className="system-panel cut-corners p-5 border-l-4 border-purple-500 bg-purple-500/5">
              {/* Card de habilidade similar */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomModePanel;