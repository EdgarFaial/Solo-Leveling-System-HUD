
export interface Stats {
  playerName: string;
  age: number;
  goal: string;
  customGoal?: string;
  job: string; 
  title: string; 
  level: number;
  exp: number;
  maxExp: number;
  hp: number; 
  maxHp: number;
  focusCapacity: number; 
  maxFocusCapacity: number;
  fatigue: number; 
  strength: number; 
  agility: number; 
  sense: number; 
  vitality: number; 
  intelligence: number; 
  will: number; 
  unallocatedPoints: number;
  gold: number; 
}

export type QuestCategory = 'FÍSICO' | 'RECUPERAÇÃO' | 'COGNITIVO' | 'CONTROLE' | 'BIOHACKING' | 'SOCIAL';

export interface Quest {
  id: string;
  title: string;
  description: string;
  protocol: string;
  progress: number;
  target: number;
  type: 'daily' | 'intervention' | 'secret' | 'penalty';
  category: QuestCategory;
  completed: boolean;
  reward: string;
  goldReward: number;
  expReward: number;
  measurableAction: string;
  timeCommitment: string;
  biologicalBenefit: string;
  adaptationLogic: string;
  estimatedTime?: string;
  patternCorrection?: string;
  competenceDeveloped?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  type: 'COGNITIVA' | 'MOTORA' | 'SOCIAL' | 'ESTRATÉGICA';
  description: string;
  requirement: string;
  efficiencyBonus: string;
  isUnlocked: boolean;
  testTask: string;
  testTarget: number;
  testUnit: string;
}

export interface ResourceItem {
  id: string;
  name: string;
  category: 'infraestrutura' | 'ferramenta' | 'biológico';
  description: string;
  icon: string;
  isIntegrated: boolean;
  bonus: string;
}

export interface Item {
  id: string;
  name: string;
  rank: string;
  type: string;
  description: string;
  icon: string;
  price?: number;
  effect?: (stats: Stats) => Stats;
}

export type SystemTab = 'STATUS' | 'PROTOCOLS' | 'RESOURCES' | 'SKILLS' | 'INVENTORY' | 'SHOP';

export function calculateRank(level: number): string {
  if (level >= 95) return 'S';
  if (level >= 80) return 'A';
  if (level >= 60) return 'B';
  if (level >= 35) return 'C';
  if (level >= 15) return 'D';
  return 'E';
}

export function getJobTitle(level: number): string {
  if (level >= 50) return 'Monarca da Ordem';
  if (level >= 30) return 'Otimizador de Elite';
  if (level >= 15) return 'Desperto do Fluxo';
  if (level >= 5) return 'Unidade Vinculada';
  return 'Humano em Avaliação';
}

export const INITIAL_STATS: Stats = {
  playerName: "",
  age: 0,
  goal: "PERFORMANCE FÍSICA",
  job: "Humano em Avaliação",
  title: "Aspirante",
  level: 1,
  exp: 0,
  maxExp: 100,
  hp: 100,
  maxHp: 100,
  focusCapacity: 100,
  maxFocusCapacity: 100,
  fatigue: 0,
  strength: 1,
  agility: 1,
  sense: 1,
  vitality: 1,
  intelligence: 1,
  will: 1,
  unallocatedPoints: 0,
  gold: 0
};
