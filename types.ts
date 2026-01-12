
export interface Stats {
  playerName: string;
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  strength: number;
  agility: number;
  sense: number;
  vitality: number;
  intelligence: number;
  will: number;
  unallocatedPoints: number;
  gold: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  type: 'daily' | 'normal' | 'secret' | 'urgent';
  category?: 'physical' | 'recovery' | 'focus' | 'control' | 'system';
  completed: boolean;
  reward: string;
  goldReward: number;
  expReward: number;
}

export interface Item {
  id: string;
  name: string;
  rank: 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
  type: 'weapon' | 'armor' | 'consumable' | 'material';
  description: string;
  icon: string;
  price?: number;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  manaCost: number;
  type: 'active' | 'passive';
  description: string;
  requirements: string;
}

export type SystemTab = 'STATUS' | 'QUEST' | 'INVENTORY' | 'SKILLS' | 'SHOP';

export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export function calculateRank(level: number): Rank {
  if (level >= 95) return 'S';
  if (level >= 80) return 'A';
  if (level >= 60) return 'B';
  if (level >= 35) return 'C';
  if (level >= 15) return 'D';
  return 'E';
}

export function calculateCombatPower(stats: Stats): number {
  return (
    stats.strength * 20 +
    stats.agility * 15 +
    stats.vitality * 12 +
    stats.intelligence * 25 +
    stats.sense * 10 +
    stats.will * 30 +
    stats.level * 150
  );
}

export const INITIAL_STATS: Stats = {
  playerName: "",
  level: 1,
  exp: 0,
  maxExp: 100,
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  strength: 1,
  agility: 1,
  sense: 1,
  vitality: 1,
  intelligence: 1,
  will: 1,
  unallocatedPoints: 5,
  gold: 0
};
