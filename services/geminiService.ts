
import { GoogleGenAI, Type } from "@google/genai";

// Inicialização segura
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export async function getArchitectMessage(context: string): Promise<string> {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are 'The Architect', the cold, authoritative entity behind the System in Solo Leveling. 
      The User is a 'Player' who just did the following: ${context}.
      Respond with a short, cryptic, and motivating system message (max 2 sentences). 
      Use a tone that implies they are just a pawn but have potential. Start with [SYSTEM MESSAGE].`,
      config: {
        temperature: 0.8,
        maxOutputTokens: 100,
      }
    });
    return response.text || "[SYSTEM] Connection established. Continue your growth.";
  } catch (error) {
    console.error("Architect failed to respond:", error);
    return "[SYSTEM] Data sync error. Proceed with caution.";
  }
}

export async function generateSecretQuest(): Promise<{ title: string; description: string; target: number }> {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a 'Secret Quest' for a leveling system. 
      It should be something real-world achievable but presented in fantasy RPG terms.
      Example: 'Shadow Step' (Walk 5000 steps).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'The title of the secret quest.',
            },
            description: {
              type: Type.STRING,
              description: 'The description of the secret quest.',
            },
            target: {
              type: Type.NUMBER,
              description: 'The numeric target for completion.',
            }
          },
          required: ["title", "description", "target"],
        }
      }
    });
    const jsonStr = response.text?.trim();
    if (!jsonStr) throw new Error("Empty response from AI");
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to generate secret quest:", error);
    return {
      title: "Shadow Training",
      description: "Push your limits in the dark.",
      target: 100
    };
  }
}
