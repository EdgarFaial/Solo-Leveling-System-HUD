
import { GoogleGenAI, Type } from "@google/genai";
import { Stats, AvailableItem, Quest, Skill } from "../types";

const API_KEYS = [
  process.env.API_KEY,
  "AIzaSyBG8lcJlk0zS1719in_0x9P6b5iYDH-evM",
  "AIzaSyA_KuBX8TxN-ZpSSr_Q30gB9TmDchkV9L8",
  "AIzaSyA1u1yTFWTi1PF5FIw5cf1AFzPlX58-l1A",
  "AIzaSyA_JMzqfmPDmLVhagttKfFhgU9LYrbOl4Q",
  "AIzaSyDIkoO-nNj_3ttpR9HLwVZ134CCOOSV78g"
].filter(Boolean) as string[];

async function getGenerativeModelResponse(config: any) {
  let lastError = null;
  for (const key of API_KEYS) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent(config);
      if (response) return response;
    } catch (e) {
      lastError = e;
      console.warn("Chave atual indisponível ou limite excedido. Tentando próxima...");
      continue;
    }
  }
  throw new Error("O Arquiteto não está disponível no momento. Todas as chaves de acesso excederam o limite ou estão inválidas.");
}

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
    deadlineDays: { type: Type.NUMBER }
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
  required: ["name", "type", "description", "requirement", "efficiencyBonus", "testTask", "testTarget", "testUnit"]
};

export async function chatWithArchitect(stats: Stats, message: string, history: {role: string, text: string}[]): Promise<string> {
  try {
    const response = await getGenerativeModelResponse({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{
          text: `VOCÊ É O ARQUITETO. Responda como no anime Solo Leveling: frio, técnico, direto.
          UNIDADE: ${stats.playerName}, Lvl: ${stats.level}. Objetivo: ${stats.customGoal || stats.goal}.
          MENSAGEM: ${message}`
        }]
      }],
      config: {
        temperature: 0.1,
        systemInstruction: "Aja como o Arquiteto. Técnico, curto, autoritário."
      }
    });
    return response.text || "PROTOCOL_FAILURE.";
  } catch (e: any) {
    return e.message;
  }
}

export async function generateDailyQuests(stats: Stats, ownedItems: AvailableItem[], history: Quest[]): Promise<any[]> {
  try {
    const response = await getGenerativeModelResponse({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{
          text: `Gere exatamente 3 MISSÕES DIÁRIAS (hábitos) para unidade de ${stats.age} anos. Objetivo: ${stats.customGoal || stats.goal}.`
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

export async function generateObjectiveBatch(stats: Stats, ownedItems: AvailableItem[], learnedSkills: Skill[]): Promise<{quests: any[]}> {
  try {
    const itemsStr = ownedItems.map(i => i.name).join(', ');
    const response = await getGenerativeModelResponse({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{
          text: `Gere UMA ÚNICA ORDEM ESTRATÉGICA SEMANAL.
          A missão deve ser uma ORDEM clara e pragmática no mundo real (Ex: 'Procure por um curso de X', 'Inscreva-se em Y', 'Peça um aumento/feedback em Z', 'Venda o item parado W').
          Não pode ser um hábito repetitivo. Deve ter instruções claras.
          Hardware: ${itemsStr}. Objetivo: ${stats.customGoal || stats.goal}.`
        }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quests: { type: Type.ARRAY, items: QUEST_SCHEMA, minItems: 1, maxItems: 1 }
          },
          required: ["quests"]
        }
      }
    });
    return JSON.parse(response.text || '{"quests": []}');
  } catch (error) {
    return { quests: [] };
  }
}

export async function fillSkillPool(stats: Stats, currentCount: number): Promise<Skill[]> {
  if (currentCount >= 5) return [];
  const needed = 5 - currentCount;
  try {
    const response = await getGenerativeModelResponse({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: `Gere exatamente ${needed} novas habilidades (skills) sugeridas para evolução. Objetivo: ${stats.customGoal || stats.goal}.` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: SKILL_SCHEMA }
      }
    });
    const result = JSON.parse(response.text || '[]');
    return result.map((s: any) => ({ ...s, id: `sk-gen-${Date.now()}-${Math.random()}`, level: 1, isUnlocked: false, isDynamic: true }));
  } catch (error) {
    return [];
  }
}
