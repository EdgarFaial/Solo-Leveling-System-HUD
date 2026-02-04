export interface Stats {
  playerName: string;
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
}

export const INITIAL_STATS: Stats = {
  playerName: "UNIDADE",
  level: 1,
  exp: 0,
  maxExp: 100,
  hp: 100,
  maxHp: 100
};