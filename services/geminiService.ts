
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function getArchitectAnalysis(context: string, stats: any): Promise<string> {
  try {
    const ai = getAIClient();
    const goalInfo = stats.goal === 'CUSTOMIZADO' ? stats.customGoal : stats.goal;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `VOCÊ É 'O ARQUITETO'. Um sistema de otimização biológica frio e técnico.
      OBJETIVO DA UNIDADE: ${goalInfo}.
      AÇÃO REALIZADA: ${context}.
      DIRETRIZ: Analise se isso contribui para a diretriz acima ou se é um desperdício de potencial humano.
      TOM: Autoritário, objetivo, sem emoção. Máximo 100 caracteres.
      PREFIXO OBRIGATÓRIO: [ANÁLISE DE SISTEMA].`,
      config: {
        temperature: 0.1,
      }
    });
    return response.text || "[SISTEMA] Eficiência nominal detectada.";
  } catch (error) {
    return "[SISTEMA] Falha na telemetria crítica.";
  }
}

export async function generateAdaptiveQuest(stats: any): Promise<any> {
  try {
    const ai = getAIClient();
    const goalInfo = stats.goal === 'CUSTOMIZADO' ? stats.customGoal : stats.goal;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Com base nos status: ${JSON.stringify(stats)} e no OBJETIVO: ${goalInfo}, gere uma INTERVENÇÃO DE EMERGÊNCIA.
      A missão deve ser específica, mensurável e alinhada ao objetivo da unidade.
      Retorne JSON estrito.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
            adaptationLogic: { type: Type.STRING }
          },
          required: ["title", "description", "category", "target", "reward", "measurableAction", "timeCommitment", "biologicalBenefit", "adaptationLogic"],
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return {
      title: "Recalibração Muscular",
      description: "Realize 20 repetições de esforço físico imediato.",
      category: "FÍSICO",
      target: 20,
      reward: "Correção de Atrofia",
      measurableAction: "20 Flexões",
      timeCommitment: "5 Minutos",
      biologicalBenefit: "Ativação de fibras tipo II",
      adaptationLogic: "Protocolo de emergência estático."
    };
  }
}
