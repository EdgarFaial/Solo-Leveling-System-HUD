
import { GoogleGenAI, Type } from "@google/genai";
import { Stats, AvailableItem, Quest, Skill } from "../types";

const QUEST_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    category: { type: Type.STRING },
    target: { type: Type.NUMBER },
    reward: { type: Type.STRING },
    measurableAction: { type: Type.STRING },
    timeCommitment: { type: Type.STRING },
    biologicalBenefit: { type: Type.STRING },
    adaptationLogic: { type: Type.STRING },
    estimatedTime: { type: Type.STRING },
    patternCorrection: { type: Type.STRING },
    competenceDeveloped: { type: Type.STRING },
    deadlineDays: { type: Type.NUMBER, description: "Número de dias para completar. Use 0 para diárias." }
  },
  required: ["title", "description", "category", "target", "reward", "measurableAction", "timeCommitment", "biologicalBenefit", "adaptationLogic", "estimatedTime", "patternCorrection", "competenceDeveloped", "deadlineDays"],
};

const SKILL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    type: { type: Type.STRING },
    description: { type: Type.STRING },
    requirement: { type: Type.STRING },
    efficiencyBonus: { type: Type.STRING },
    testTask: { type: Type.STRING },
    testTarget: { type: Type.NUMBER },
    testUnit: { type: Type.STRING }
  },
  required: ["name", "type", "description", "requirement", "efficiencyBonus", "testTask", "testTarget", "testUnit"],
};

export async function chatWithArchitect(stats: Stats, message: string, history: {role: string, text: string}[]): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{
          text: `VOCÊ É O ARQUITETO do sistema Solo Leveling. Sua personalidade é fria, técnica, autoritária e direta. Você não usa emojis. Você só responde o estritamente necessário para guiar a unidade ${stats.playerName}.
          OBJETIVO ATUAL: ${stats.customGoal || stats.goal}. 
          DADOS DA UNIDADE: Idade ${stats.age}, Nível ${stats.level}, Falhas recentes ${stats.failedMissionsCount}.
          MENSAGEM: ${message}`
        }]
      }],
      config: {
        temperature: 0.2,
        systemInstruction: "Aja como o Arquiteto. Respostas curtas, sem emoção, focadas em otimização biológica e progresso."
      }
    });
    return response.text || "PROTOCOL_FAILURE.";
  } catch (e) {
    return "CONEXÃO COM O NÚCLEO INSTÁVEL.";
  }
}

export async function generateDailyQuests(stats: Stats, ownedItems: AvailableItem[], history: Quest[]): Promise<any[]> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const itemsStr = ownedItems.map(i => i.name).join(', ');
    const pastMissions = history.slice(-5).map(q => q.title).join(', ');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{
          text: `Gere 3 MISSÕES DIÁRIAS para a unidade ${stats.playerName} (Idade: ${stats.age}).
          Hardware: ${itemsStr}. 
          Histórico recente: ${pastMissions}.
          O Arquiteto deve decidir se repete ou remove missões baseado no objetivo: ${stats.customGoal || stats.goal}.
          Considere a idade para intensidade física.`
        }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: QUEST_SCHEMA }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
}

export async function generateObjectiveBatch(stats: Stats, ownedItems: AvailableItem[], learnedSkills: Skill[], isEmergency: boolean = false): Promise<{quests: any[], skill?: any}> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const itemsStr = ownedItems.map(i => i.name).join(', ');
    const skillNames = learnedSkills.map(s => s.name).join(', ');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{
          text: `Gere um lote de 5 MISSÕES SEMANAIS (deadline 7 dias) e 1 HABILIDADE SUGERIDA.
          ${isEmergency ? 'ESTA É UMA MISSÃO DE EMERGÊNCIA devido a falhas frequentes.' : ''}
          Unidade: ${stats.playerName}, Idade: ${stats.age}. 
          Hardware: ${itemsStr}.
          Objetivo final: ${stats.customGoal || stats.goal}.
          Habilidades já aprendidas: ${skillNames}.
          Se a unidade já aprendeu habilidades iniciais, a nova deve ser uma progressão coerente.`
        }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quests: { type: Type.ARRAY, items: QUEST_SCHEMA },
            skill: SKILL_SCHEMA
          },
          required: ["quests", "skill"]
        }
      }
    });
    return JSON.parse(response.text || '{"quests": [], "skill": null}');
  } catch (error) {
    return { quests: [] };
  }
}

export async function generateDynamicSkill(stats: Stats, learnedSkills: Skill[]): Promise<any> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const skillNames = learnedSkills.map(s => s.name).join(', ');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: `Gere uma nova HABILIDADE sugerida pelo Arquiteto. 
      Unidade idade: ${stats.age}. Objetivo: ${stats.customGoal || stats.goal}. 
      Histórico de skills: ${skillNames}.` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: SKILL_SCHEMA
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return null;
  }
}
