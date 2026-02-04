import { Stats, AvailableItem, Quest, Skill } from "./types";

// Chave do OpenRouter
const OPENROUTER_API_KEY = "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";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "google/gemini-2.0-flash-lite:free";

// Função de fallback para dados mock
function getMockResponse(prompt: string, isArray: boolean = false) {
  console.log("Usando dados mock para:", prompt.substring(0, 50) + "...");
  
  if (prompt.includes('MISSÕES DIÁRIAS')) {
    return [
      {
        title: "ROTINA MATINAL DE FOCO",
        description: "Acordar e executar rotina de 20 minutos sem checar celular.",
        category: "CONTROLE",
        target: 1,
        reward: "+5 EXP em missões matinais",
        measurableAction: "Evitar telas por 20min após acordar",
        timeCommitment: "20 minutos",
        biologicalBenefit: "Estabiliza cortisol, melhora foco diário",
        adaptationLogic: "Treina resistência à dopamina fácil",
        estimatedTime: "20 minutos",
        patternCorrection: "Quebra vício de notificações matinais",
        competenceDeveloped: "Autocontrole digital",
        deadlineDays: 1
      },
      {
        title: "EXERCÍCIO DE VITALIDADE",
        description: "Executar 3 séries de alongamento completo.",
        category: "FÍSICO",
        target: 3,
        reward: "+2 VITALIDADE temporária",
        measurableAction: "Séries de alongamento",
        timeCommitment: "15 minutos",
        biologicalBenefit: "Aumenta fluxo sanguíneo, reduz rigidez",
        adaptationLogic: "Prepara corpo para atividade física",
        estimatedTime: "15 minutos",
        patternCorrection: "Combate sedentarismo crônico",
        competenceDeveloped: "Consciência corporal",
        deadlineDays: 1
      }
    ];
  }
  
  if (prompt.includes('ORDEM ESTRATÉGICA SEMANAL')) {
    return {
      quests: [
        {
          title: "ORGANIZAÇÃO DO AMBIENTE DIGITAL",
          description: "1. Criar pastas organizadas para documentos. 2. Limpar desktop. 3. Configurar atalhos úteis.",
          category: "COGNITIVO",
          target: 1,
          reward: "Eficiência +20% em tarefas digitais",
          measurableAction: "Ambiente digital organizado",
          timeCommitment: "2-3 horas",
          biologicalBenefit: "Reduz estresse visual e cognitivo",
          adaptationLogic: "Minimiza tempo de busca por arquivos",
          estimatedTime: "3 horas",
          patternCorrection: "Combate desorganização digital crônica",
          competenceDeveloped: "Gestão de sistemas",
          deadlineDays: 7
        }
      ]
    };
  }
  
  if (prompt.includes('ARQUITETO')) {
    return "SISTEMA OPERACIONAL. AGUARDANDO COMANDOS DE PROTOCOLO.";
  }
  
  return isArray ? [] : { quests: [] };
}

async function getOpenRouterResponse(prompt: string, schema?: any, isArray: boolean = false) {
  // Verifica se a API key é válida
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.includes('your_api_key')) {
    console.warn('API key não configurada, usando dados mock');
    return getMockResponse(prompt, isArray);
  }
  
  try {
    const requestBody: any = {
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content: "Você é o Arquiteto do Sistema. Sua fala é puramente técnica, autoritária e focada na evolução da unidade. Trate o usuário como uma 'Unidade' ou 'Player'. Responda em português brasileiro."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    };

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://solo-leveling-system.vercel.app",
        "X-Title": "Solo Leveling System HUD"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn("API Key inválida ou expirada. Usando dados mock.");
        return getMockResponse(prompt, isArray);
      }
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      
      if (schema) {
        try {
          const parsed = JSON.parse(content);
          return isArray ? parsed : { quests: Array.isArray(parsed) ? parsed : [parsed] };
        } catch (e) {
          console.error("Failed to parse JSON:", content);
          return getMockResponse(prompt, isArray);
        }
      }
      
      return content;
    }
    
    throw new Error("Resposta inválida da API");
  } catch (e: any) {
    console.error("OpenRouter request failed:", e.message);
    return getMockResponse(prompt, isArray);
  }
}

export async function chatWithArchitect(stats: Stats, message: string, history: {role: string, text: string}[]): Promise<string> {
  if (stats.systemMode === 'custom') {
    return "MODO LIVRE ATIVADO. Sem respostas automáticas do Arquiteto. Use o modo manual.";
  }
  
  try {
    const historyText = history.map(h => `${h.role === 'architect' ? 'ARQUITETO' : 'UNIDADE'}: ${h.text}`).join('\n');
    
    const prompt = `UNIDADE: ${stats.playerName || 'UNIDADE'}, Nível: ${stats.level || 1}, Idade: ${stats.age || 0}
Objetivo Principal: ${stats.customGoal || stats.goal || 'EVOLUÇÃO TOTAL'}
Histórico:
${historyText}

Mensagem atual da UNIDADE: ${message}

Responda como o Arquiteto do Sistema (estilo Solo Leveling): frio, técnico, direto, sem emoções humanas, focado na evolução da unidade.`;

    const response = await getOpenRouterResponse(prompt);
    return response || "PROTOCOLO FALHOU. Tente novamente.";
  } catch (e: any) {
    console.error("Chat error:", e);
    return `ERRO DO SISTEMA: ${e.message}. Use o modo livre para continuar.`;
  }
}

export async function generateDailyQuests(stats: Stats, ownedItems: AvailableItem[], history: Quest[]): Promise<any[]> {
  if (stats.systemMode === 'custom') {
    return [
      {
        title: "ADICIONE SUA PRÓPRIA MISSÃO",
        description: "No modo livre, você cria suas próprias missões.",
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
    const itemsStr = ownedItems.filter(i => i.owned).map(i => i.name).join(', ');
    
    const prompt = `Gere exatamente 2 MISSÕES DIÁRIAS (hábitos) para uma unidade de ${stats.age || 0} anos.
Objetivo principal da Unidade: ${stats.customGoal || stats.goal || 'EVOLUÇÃO TOTAL'}
Nível atual: ${stats.level || 1}
Recursos disponíveis: ${itemsStr || 'Nenhum'}

FORMATO DE RESPOSTA JSON (array de objetos com estas propriedades):
- title: string (título curto em CAIXA ALTA)
- description: string (descrição detalhada)
- category: string (FÍSICO, COGNITIVO, SOCIAL, CONTROLE, BIOHACKING ou RECUPERAÇÃO)
- target: number (quantidade necessária)
- reward: string (recompensa descritiva)
- measurableAction: string (ação mensurável)
- timeCommitment: string (tempo estimado)
- biologicalBenefit: string (benefício biológico)
- adaptationLogic: string (lógica de adaptação)
- estimatedTime: string (tempo estimado em minutos/horas)
- patternCorrection: string (correção de padrão)
- competenceDeveloped: string (competência desenvolvida)
- deadlineDays: number (dias para conclusão, use 1 para diárias)`;

    const response = await getOpenRouterResponse(prompt, null, true);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("Daily quests error:", error);
    return [];
  }
}

export async function generateObjectiveBatch(stats: Stats, ownedItems: AvailableItem[], learnedSkills: Skill[]): Promise<{quests: any[]}> {
  if (stats.systemMode === 'custom') {
    return { quests: [] };
  }
  
  try {
    const itemsStr = ownedItems.filter(i => i.owned).map(i => i.name).join(', ');
    const skillsStr = learnedSkills.filter(s => s.isUnlocked).map(s => s.name).join(', ');
    
    const prompt = `Gere exatamente UMA ÚNICA ORDEM ESTRATÉGICA SEMANAL para a unidade.
DADOS DA UNIDADE:
- Nome: ${stats.playerName || 'UNIDADE'}
- Idade: ${stats.age || 0}
- Nível: ${stats.level || 1}
- Objetivo: ${stats.customGoal || stats.goal || 'EVOLUÇÃO TOTAL'}
- Hardware disponível: ${itemsStr || 'Nenhum'}
- Habilidades aprendidas: ${skillsStr || 'Nenhuma'}

FORMATO JSON (um único objeto dentro de um array "quests"):
{
  "quests": [
    {
      "title": "string",
      "description": "string (instruções passo a passo)",
      "category": "string",
      "target": 1,
      "reward": "string",
      "measurableAction": "string",
      "timeCommitment": "string",
      "biologicalBenefit": "string",
      "adaptationLogic": "string",
      "estimatedTime": "string",
      "patternCorrection": "string",
      "competenceDeveloped": "string",
      "deadlineDays": 7
    }
  ]
}`;

    const response = await getOpenRouterResponse(prompt);
    return response || { quests: [] };
  } catch (error) {
    console.error("Objective batch error:", error);
    return { quests: [] };
  }
}

export async function fillSkillPool(stats: Stats, currentCount: number): Promise<Skill[]> {
  if (stats.systemMode === 'custom') {
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
    const prompt = `Gere exatamente ${needed} novas habilidades (skills) para evolução da unidade.
DADOS:
- Nível da unidade: ${stats.level || 1}
- Idade: ${stats.age || 0}
- Objetivo: ${stats.customGoal || stats.goal || 'EVOLUÇÃO TOTAL'}

FORMATO JSON (array de objetos):
[
  {
    "name": "string (nome em CAIXA ALTA)",
    "type": "string (COGNITIVA, MOTORA, SOCIAL ou ESTRATÉGICA)",
    "description": "string",
    "requirement": "string",
    "efficiencyBonus": "string",
    "testTask": "string",
    "testTarget": number,
    "testUnit": "string"
  }
]`;

    const response = await getOpenRouterResponse(prompt, null, true);
    const result = Array.isArray(response) ? response : [];
    
    return result.map((s: any) => ({ 
      ...s, 
      id: `sk-gen-${Date.now()}-${Math.random()}`, 
      level: 1, 
      isUnlocked: false, 
      isDynamic: true 
    }));
  } catch (error) {
    console.error("Fill skill pool error:", error);
    return [];
  }
}