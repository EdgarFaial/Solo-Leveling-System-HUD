
import { GoogleGenAI, Type } from "@google/genai";
import { Stats, AvailableItem, Quest, Skill } from "../types";

// Chaves de API em ordem de prioridade
const API_KEYS = [
  process.env.API_KEY,
  "AIzaSyBG8lcJlk0zS1719in_0x9P6b5iYDH-evM",
  "AIzaSyA_KuBX8TxN-ZpSSr_Q30gB9TmDchkV9L8",
  "AIzaSyA1u1yTFWTi1PF5FIw5cf1AFzPlX58-l1A",
  "AIzaSyA_JMzqfmPDmLVhagttKfFhgU9LYrbOl4Q",
  "AIzaSyDIkoO-nNj_3ttpR9HLwVZ134CCOOSV78g"
].filter(Boolean) as string[];

// Recupera o último índice funcional ou começa do 0
let currentKeyIndex = parseInt(localStorage.getItem('sl_api_index') || '0');

async function getGenerativeModelResponse(config: any) {
  let lastError = null;
  const totalKeys = API_KEYS.length;

  // Tenta as chaves começando do índice atual até percorrer todas (loop circular)
  for (let attempt = 0; attempt < totalKeys; attempt++) {
    const i = (currentKeyIndex + attempt) % totalKeys;
    const key = API_KEYS[i];
    
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent(config);
      
      if (response) {
        // Sucesso: atualiza o índice funcional e salva
        if (currentKeyIndex !== i) {
          currentKeyIndex = i;
          localStorage.setItem('sl_api_index', i.toString());
        }
        return response;
      }
    } catch (e: any) {
      lastError = e;
      // Captura códigos de erro comuns de limite ou chave
      const status = e?.status || e?.target?.status;
      
      // Se for erro de quota (429), chave inválida (400) ou não autorizada (401), tenta a próxima
      if (status === 429 || status === 400 || status === 401) {
        console.warn(`Sistema: Chave de acesso [${i}] comprometida ou esgotada. Código: ${status}. Iniciando protocolo de redirecionamento...`);
        continue;
      }
      
      // Para erros de rede local ou desconhecidos, não queima a próxima chave imediatamente
      throw e; 
    }
  }

  throw new Error("O Arquiteto não está disponível. Todas as chaves de acesso excederam o limite ou estão inválidas. Protocolo de espera ativado.");
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
          text: `VOCÊ É O ARQUITETO. Responda como no anime Solo Leveling: frio, técnico, direto, sem emoções humanas.
          UNIDADE: ${stats.playerName}, Lvl: ${stats.level}. Objetivo: ${stats.customGoal || stats.goal}.
          MENSAGEM: ${message}`
        }]
      }],
      config: {
        temperature: 0.1,
        systemInstruction: "Você é o Arquiteto do Sistema. Sua fala é puramente técnica, autoritária e focada na evolução da unidade. Trate o usuário como uma 'Unidade' ou 'Player'."
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
          text: `Gere exatamente 3 MISSÕES DIÁRIAS (hábitos) para unidade de ${stats.age} anos. 
          Objetivo principal da Unidade: ${stats.customGoal || stats.goal}.
          As missões devem ser focadas em desenvolvimento real (Saúde, Foco ou Habilidade).`
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
          text: `Gere exatamente UMA ÚNICA ORDEM ESTRATÉGICA SEMANAL.
          A missão deve ser uma AÇÃO CONCRETA E ÚNICA no mundo real (ex: Se inscrever em um curso específico, limpar todo o ambiente de trabalho, organizar as finanças do mês, comprar um livro técnico específico).
          NÃO pode ser um hábito repetitivo. Deve ter instruções claras de execução passo a passo na descrição.
          Hardware disponível para a unidade: ${itemsStr}. 
          Objetivo da Unidade: ${stats.customGoal || stats.goal}.`
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
  const needed = 5 - currentCount;
  if (needed <= 0) return [];
  
  try {
    const response = await getGenerativeModelResponse({
      model: 'gemini-3-flash-preview',
      contents: [{ 
        parts: [{ 
          text: `Gere exatamente ${needed} novas habilidades (skills) sugeridas para evolução da unidade nível ${stats.level}.
          As habilidades devem ser coerentes com o objetivo: ${stats.customGoal || stats.goal}.` 
        }] 
      }],
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
