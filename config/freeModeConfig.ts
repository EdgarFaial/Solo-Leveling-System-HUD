export const FREE_MODE_CONFIG = {
  defaultQuests: [
    {
      title: "CRIE SUA PRIMEIRA MISSÃO",
      description: "No modo livre, você define seus próprios objetivos. Clique em 'NOVA MISSÃO' para começar.",
      category: "CUSTOM" as const,
      target: 1,
      reward: "Auto-realização"
    }
  ],
  defaultSkills: [
    {
      name: "AUTO-DISCIPLINA",
      type: "COGNITIVA" as const,
      description: "Capacidade de cumprir compromissos auto-estabelecidos.",
      testTask: "Completar uma meta pessoal",
      testTarget: 1,
      testUnit: "vez"
    }
  ],
  rewards: {
    questComplete: {
      gold: 25,
      exp: 15
    },
    skillUnlock: {
      exp: 30,
      statPoints: 1
    }
  }
};