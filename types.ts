
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
  profile: 'INTROVERTIDO' | 'FOCO_BAIXO' | 'PROCRASTINADOR' | 'RESISTENCIA_LIMITADA' | 'GERAL';
  preferredTrainingTime: 'morning' | 'afternoon' | 'evening';
  availableHoursPerDay: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  systemMode: 'architect' | 'custom';
  lastDailyUpdate?: string;
  lastWeeklyUpdate?: string;
  failedMissionsCount: number;
  avatar?: string;
}

export interface Item {
  id: string;
  name: string;
  icon: string;
  rank: string;
  type: string;
}

export interface AvailableItem {
  id: string;
  name: string;
  category: 'diário' | 'academia' | 'instrumento' | 'smartwatch' | 'app' | 'espaço' | 'custom';
  description: string;
  owned: boolean;
  missionBonus: string;
  statBonus?: { stat: keyof Stats; value: number };
  icon: string;
}

export interface ResourceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  isIntegrated: boolean;
  icon: string;
  bonus: string;
}

export type QuestCategory = 'FÍSICO' | 'RECUPERAÇÃO' | 'COGNITIVO' | 'CONTROLE' | 'BIOHACKING' | 'SOCIAL';

export interface Quest {
  id: string;
  title: string;
  description: string;
  protocol: string;
  progress: number;
  target: number;
  type: 'daily' | 'intervention' | 'secret' | 'penalty' | 'emergency';
  category: QuestCategory;
  completed: boolean;
  deadline: string; // ISO string
  reward: string;
  goldReward: number;
  expReward: number;
  measurableAction: string;
  timeCommitment: string;
  biologicalBenefit: string;
  adaptationLogic: string;
  estimatedTime: string;
  patternCorrection: string;
  competenceDeveloped: string;
  isUserCreated?: boolean;
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
  isDynamic?: boolean; 
}

export type SystemTab = 'STATUS' | 'PROTOCOLS' | 'SKILLS' | 'INVENTORY' | 'REGISTRY' | 'CHAT';

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
  goal: "EVOLUÇÃO TOTAL",
  profile: 'GERAL',
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
  gold: 0,
  failedMissionsCount: 0,
  preferredTrainingTime: 'morning',
  availableHoursPerDay: 1,
  fitnessLevel: 'beginner',
  systemMode: 'architect',
  avatar: '👤'
};
export interface CustomQuestData {
  title: string;
  description: string;
  category: QuestCategory;
  target: number;
  reward: string;
  deadlineDays: number;
}

export interface CustomSkillData {
  name: string;
  description: string;
  type: 'COGNITIVA' | 'MOTORA' | 'SOCIAL' | 'ESTRATÉGICA';
  testTask: string;
  testTarget: number;
  testUnit: string;
}
// ADICIONE ESTAS INTERFACES no final do arquivo types.ts (antes do último }):

export interface CustomQuestData {
  title: string;
  description: string;
  category: QuestCategory;
  target: number;
  reward: string;
  deadlineDays: number;
}

export interface CustomSkillData {
  name: string;
  description: string;
  type: 'COGNITIVA' | 'MOTORA' | 'SOCIAL' | 'ESTRATÉGICA';
  testTask: string;
  testTarget: number;
  testUnit: string;
}




