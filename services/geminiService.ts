
import { GoogleGenAI, Type } from "@google/genai";
import { Stats, AvailableItem, Quest, Skill } from "../types";

// Chaves fornecidas pelo usuário para fallback em caso de quota excedida
const PRIMARY_KEYS = [
  process.env.API_KEY,
  "AIzaSyBG8lcJlk0zS1719in_0x9P6b5iYDH-evM",
  "AIzaSyA_KuBX8TxN-ZpSSr_Q30gB9TmDchkV9L8",
  "AIzaSyA1u1yTFWTi1PF5FIw5cf1AFzPlX58-l1A",
  "AIzaSyA_JMzqfmPDmLVhagttKfFhgU9LYrbOl4Q",
  "AIzaSyDIkoO-nNj_3ttpR9HLwVZ134CCOOSV78g"
].filter(Boolean) as string[];

async function getGenerativeModelResponse(config: any) {
  let lastError = null;
  for (const key of PRIMARY_KEYS) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      // CRITICAL: Await the response to catch potential errors (like 429 quota exceeded)
      const response = await ai.models.generateContent(config);
      if (response) return response;
    } catch (e) {
      console.warn(`Chave de API falhou ou cota excedida. Tentando próxima...`, e);
      lastError = e;
      continue;
    }
  }
  // Mensagem solicitada caso todas as chaves falhem
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

export async function chatWithArchitect(stats: Stats, message: string, history: {role: string, text: string}[]): Promise<string> {
  try {
    const response = await getGenerativeModelResponse({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{
          text: `VOCÊ É O ARQUITETO. Responda como no anime Solo Leveling: frio, técnico, direto, sem emojis.
          UNIDADE: ${stats.playerName}, Idade: ${stats.age}, Nível: ${stats.level}.
          OBJETIVO ATUAL: ${stats.customGoal || stats.goal}.
          MENSAGEM DA UNIDADE: ${message}`
        }]
      }],
      config: {
        temperature: 0.1,
        systemInstruction: "Aja como o Arquiteto. Técnico, curto, autoritário."
      }
    });
    return response.text || "PROTOCOL_FAILURE.";
  } catch (e: any) {
    return e.message || "NÚCLEO INSTÁVEL. VERIFIQUE CONEXÃO.";
  }
}

export async function generateDailyQuests(stats: Stats, ownedItems: AvailableItem[], history: Quest[]): Promise<any[]> {
  try {
    const itemsStr = ownedItems.map(i => i.name).join(', ');
    const response = await getGenerativeModelResponse({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{
          text: `Gere exatamente 3 MISSÕES DIÁRIAS (hábitos) coerentes com a idade de ${stats.age} anos e o objetivo: ${stats.customGoal || stats.goal}. 
          Hardware disponível: ${itemsStr}.`
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
    const itemsStr = ownedItems.map(i => i.name).join(', ');
    const response = await getGenerativeModelResponse({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{
          text: `Gere UMA ÚNICA ORDEM ESTRATÉGICA (Missão Semanal) obrigatória. 
          Não é um hábito, é um comando específico (Ex: Se inscrever em curso, pedir aumento, procurar item X).
          Unidade: ${stats.playerName}, Idade: ${stats.age}. Objetivo: ${stats.customGoal || stats.goal}.
          Hardware: ${itemsStr}. ${isEmergency ? 'URGENTE: Falhas recorrentes detectadas.' : ''}`
        }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quests: { type: Type.ARRAY, items: QUEST_SCHEMA },
            skill: {
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
            }
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
    const response = await getGenerativeModelResponse({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: `Gere uma nova HABILIDADE sugerida coerente com o nível ${stats.level} e objetivo da unidade.` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return null;
  }
}
