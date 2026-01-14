import { GoogleGenAI, Type } from "@google/genai";
import { Stats, AvailableItem, Quest, Skill } from "../types";

// Chave única customizada (não é do Gemini)
const CUSTOM_API_KEY = "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";

async function getGenerativeModelResponse(config: any) {
  try {
    const ai = new GoogleGenAI({ apiKey: CUSTOM_API_KEY });
    const response = await ai.models.generateContent(config);
    
    if (response) {
      return response;
    }
    throw new Error("Resposta vazia do modelo");
  } catch (e: any) {
    const status = e?.status || e?.target?.status;
    if (status === 429 || status === 400 || status === 401) {
      throw new Error("Chave de acesso comprometida ou esgotada");
    }
    throw e;
  }
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
  if (stats.systemMode === 'custom') {
    return "MODO LIVRE ATIVADO. Sem respostas automáticas do Arquiteto. Use o modo manual.";
  }
  
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
  if (stats.systemMode === 'custom') {
    // Retorna missões padrão para modo livre
    return [
      {
        title: "ADICIONE SUA PRÓPRIA MISSÃO",
        description: "No modo livre, você cria suas próprias missões. Clique no botão + para adicionar.",
        category: "CUSTOM",
        target: 1,
        reward: "Auto-Progresso",
        measurableAction: "Criar objetivo pessoal",
        timeCommitment: "Flexível",
        biologicalBenefit: "Desenvolvimento de autonomia",
        adaptationLogic: "Auto-gestão",
        estimatedTime: "Variável",
        patternCorrection: "Customizável",
        competenceDeveloped: "Auto-disciplina",
        deadlineDays: 1
      }
    ];
  }
  
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
  if (stats.systemMode === 'custom') {
    return { quests: [] };
  }
  
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
  if (stats.systemMode === 'custom') {
    // No modo livre, retorna habilidades básicas sugeridas
    const basicSkills = [
      {
        name: "FOCO CONCENTRADO",
        type: "COGNITIVA",
        description: "Capacidade de manter atenção prolongada em uma única tarefa.",
        requirement: "Nível 1+",
        efficiencyBonus: "+10% EXP em missões cognitivas",
        testTask: "Estudar/trabalhar sem interrupções",
        testTarget: 25,
        testUnit: "minutos"
      },
      {
        name: "DISCIPLINA MATINAL",
        type: "MOTORA",
        description: "Execução consistente de rotina matinal.",
        requirement: "Nível 2+",
        efficiencyBonus: "+5 em VONTADE",
        testTask: "Acordar no horário planejado",
        testTarget: 5,
        testUnit: "dias consecutivos"
      }
    ];
    
    const needed = Math.max(0, 5 - currentCount);
    return basicSkills.slice(0, needed).map((s: any) => ({ 
      ...s, 
      id: `sk-custom-${Date.now()}-${Math.random()}`, 
      level: 1, 
      isUnlocked: false, 
      isDynamic: true 
    }));
  }
  
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