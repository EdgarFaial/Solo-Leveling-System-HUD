
import { GoogleGenAI, Type } from "@google/genai";
import { Stats, AvailableItem, Quest } from "../types";

const getAIClient = () => {
  // Chave de API inserida diretamente para funcionamento em ambiente de produção/browser
  return new GoogleGenAI({ apiKey: 'AIzaSyBG8lcJlk0zS1719in_0x9P6b5iYDH-evM' });
};

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
    competenceDeveloped: { type: Type.STRING }
  },
  required: ["title", "description", "category", "target", "reward", "measurableAction", "timeCommitment", "biologicalBenefit", "adaptationLogic", "estimatedTime", "patternCorrection", "competenceDeveloped"],
};

export async function chatWithArchitect(stats: Stats, message: string, history: {role: string, text: string}[]): Promise<string> {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `VOCÊ É O ARQUITETO do sistema Solo Leveling. Sua personalidade é fria, técnica, autoritária e direta. Você não usa emojis. Você só responde o estritamente necessário para guiar a unidade ${stats.playerName}.
      CONTEXTO: Objetivo da unidade: ${stats.customGoal || stats.goal}. Nível: ${stats.level}.
      Historico recente: ${JSON.stringify(history.slice(-3))}
      MENSAGEM DA UNIDADE: ${message}`,
      config: {
        temperature: 0.5,
        systemInstruction: "Seja o Arquiteto. Aja como um mestre de obras galáctico. Responda apenas se for extremamente necessário para a evolução da unidade."
      }
    });
    return response.text || "PROCESSAMENTO FALHOU. REINICIE O PROTOCOLO.";
  } catch (e) {
    return "CONEXÃO COM O NÚCLEO PERDIDA.";
  }
}

export async function generateDailyQuests(stats: Stats, ownedItems: AvailableItem[]): Promise<any[]> {
  try {
    const ai = getAIClient();
    const itemsStr = ownedItems.map(i => i.name).join(', ');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `VOCÊ É O ARQUITETO. Gere 3 MISSÕES DIÁRIAS para a unidade ${stats.playerName}.
      BASE DE PERFORMANCE: Atributos STR:${stats.strength}, INT:${stats.intelligence}, WILL:${stats.will}.
      Hardware: ${itemsStr}. Objetivo: ${stats.customGoal || stats.goal}.
      As missões diárias devem ser rotineiras e focadas em disciplina constante.
      Retorne um ARRAY de JSON estrito.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: QUEST_SCHEMA
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function generateObjectiveBatch(stats: Stats, ownedItems: AvailableItem[]): Promise<any[]> {
  try {
    const ai = getAIClient();
    const goalInfo = stats.customGoal || stats.goal;
    const itemsStr = ownedItems.map(i => i.name).join(', ');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `VOCÊ É O ARQUITETO. A unidade completou um protocolo. Gere um BATCH de 5 NOVAS MISSÕES NORMIAIS que formem um caminho progressivo para atingir o objetivo: ${goalInfo}.
      Hardware: ${itemsStr}.
      REGRAS: 5 missões sequenciais lógicas. Retorne um ARRAY de 5 objetos JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: QUEST_SCHEMA,
          minItems: 5,
          maxItems: 5
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function suggestCustomMission(goal: string, ownedItems: AvailableItem[]): Promise<any> {
  try {
    const ai = getAIClient();
    const itemsStr = ownedItems.map(i => i.name).join(', ');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `VOCÊ É O ARQUITETO. O usuário está no MODO LIVRE. Sugira UMA missão que ajude no objetivo: ${goal}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: QUEST_SCHEMA
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    throw error;
  }
}

export async function generateDynamicSkill(stats: Stats): Promise<any> {
  try {
    const ai = getAIClient();
    const goalInfo = stats.customGoal || stats.goal;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `VOCÊ É O ARQUITETO. Gere uma HABILIDADE ÚNICA para o objetivo: ${goalInfo}.`,
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
          required: ["name", "type", "description", "requirement", "efficiencyBonus", "testTask", "testTarget", "testUnit"],
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    throw error;
  }
}
