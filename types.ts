
export interface Stats {
  playerName: string;
  age: number;
  goal: string;
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

export type QuestCategory = 'FÍSICO' | 'RECUPERAÇÃO' | 'COGNITIVO' | 'CONTROLE' | 'BIOHACKING';

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  type: 'daily' | 'intervention' | 'secret' | 'penalty';
  category: QuestCategory;
  completed: boolean;
  reward: string;
  goldReward: number;
  expReward: number;
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
}

export interface Item {
  id: string;
  name: string;
  rank: string;
  type: 'suplemento' | 'hardware' | 'ferramenta' | 'especial';
  description: string;
  icon: string;
  price?: number;
}

export type SystemTab = 'STATUS' | 'PROTOCOLS' | 'INVENTORY' | 'SKILLS' | 'SHOP';

export function calculateRank(level: number): string {
  if (level >= 95) return 'S';
  if (level >= 80) return 'A';
  if (level >= 60) return 'B';
  if (level >= 35) return 'C';
  if (level >= 15) return 'D';
  return 'E';
}

export const INITIAL_STATS: Stats = {
  playerName: "",
  age: 0,
  goal: "",
  job: "Unidade em Avaliação",
  title: "Aspirante",
  level: 1,
  exp: 0,
  maxExp: 100,
  hp: 100,
  maxHp: 100,
  focusCapacity: 100,
  maxFocusCapacity: 100,
  fatigue: 0,
  strength: 10,
  agility: 10,
  sense: 10,
  vitality: 10,
  intelligence: 10,
  will: 10,
  unallocatedPoints: 0,
  gold: 500
};
