
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function getArchitectAnalysis(context: string): Promise<string> {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `VOCÊ É 'O ARQUITETO'. Um sistema de otimização biológica frio e técnico.
      CONTEXTO: A unidade biológica realizou a seguinte ação: ${context}.
      DIRETRIZ: Analise se isso contribui para a remoção de ineficiência ou se é um desperdício de potencial humano.
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
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Com base nos status: ${JSON.stringify(stats)}, gere uma INTERVENÇÃO DE EMERGÊNCIA para corrigir a maior fraqueza.
      Se INT é baixo: Missão de leitura técnica.
      Se VIT é baixo: Missão de higiene do sono/hidratação.
      Se STR é baixo: Missão de resistência física.
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
            reward: { type: Type.STRING }
          },
          required: ["title", "description", "category", "target", "reward"],
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return {
      title: "Recalibração Muscular",
      description: "Realize 20 repetições de esforço físico imediato.",
      category: "physical",
      target: 20,
      reward: "Correção de Atrofia"
    };
  }
}
