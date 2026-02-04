import { Stats, AvailableItem, Quest, Skill } from "../types";

// Chave do OpenRouter - usando a que você forneceu
const OPENROUTER_API_KEY = "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";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Modelo do OpenRouter (corrigido - modelo válido)
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
      },
      {
        title: "LEITURA TÉCNICA",
        description: "Ler 10 páginas de material técnico/educacional.",
        category: "COGNITIVO",
        target: 10,
        reward: "+3 INTELIGÊNCIA temporária",
        measurableAction: "Páginas lidas com compreensão",
        timeCommitment: "30 minutos",
        biologicalBenefit: "Fortalece conexões neurais",
        adaptationLogic: "Expande vocabulário técnico",
        estimatedTime: "30 minutos",
        patternCorrection: "Substitui consumo passivo por ativo",
        competenceDeveloped: "Foco sustentado",
        deadlineDays: 1
      }
    ];
  }
  
  if (prompt.includes('ORDEM ESTRATÉGICA SEMANAL')) {
    return {
      quests: [
        {
          title: "ORGANIZAÇÃO DO AMBIENTE DIGITAL",
          description: "1. Criar pastas organizadas para documentos. 2. Limpar desktop. 3. Configurar atalhos úteis. 4. Backup de arquivos importantes.",
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
  
  if (prompt.includes('habilidades')) {
    return [
      {
        name: "CONTROLE RESPIRATÓRIO",
        type: "COGNITIVA",
        description: "Técnica de respiração para controle de estresse.",
        requirement: "Nível 1+",
        efficiencyBonus: "+5% em testes de VONTADE",
        testTask: "Exercício de respiração 4-7-8",
        testTarget: 5,
        testUnit: "ciclos"
      }
    ];
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

    // Se há um schema para resposta estruturada
    if (schema) {
      requestBody.response_format = { type: "json_object" };
    }

    console.log("Enviando requisição para OpenRouter...");
    
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

    console.log("Resposta da API:", response.status, response.statusText);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn("Modelo não encontrado (404). Usando dados mock.");
        return getMockResponse(prompt, isArray);
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API Error:", errorData);
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
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
    // Retorna dados mock em caso de erro
    return getMockResponse(prompt, isArray);
  }
}

export async function chatWithArchitect(stats: Stats, message: string, history: {role: string, text: string}[]): Promise<string> {
  if (stats.systemMode === 'custom') {
    return "MODO LIVRE ATIVADO. Sem respostas automáticas do Arquiteto. Use o modo manual.";
  }
  
  try {
    const historyText = history.map(h => `${h.role === 'architect' ? 'ARQUITETO' : 'UNIDADE'}: ${h.text}`).join('\n');
    
    const prompt = `UNIDADE: ${stats.playerName}, Nível: ${stats.level}, Idade: ${stats.age}
Objetivo Principal: ${stats.customGoal || stats.goal}
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
    const itemsStr = ownedItems.filter(i => i.owned).map(i => i.name).join(', ');
    
    const prompt = `Gere exatamente 3 MISSÕES DIÁRIAS (hábitos) para uma unidade de ${stats.age} anos.
Objetivo principal da Unidade: ${stats.customGoal || stats.goal}
Nível atual: ${stats.level}
Recursos disponíveis: ${itemsStr || 'Nenhum'}

As missões devem ser:
1. Focadas em desenvolvimento real (Saúde, Foco ou Habilidade)
2. Mensuráveis e específicas
3. Com tempo de execução claro
4. Com benefício biológico explicado

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
- Nome: ${stats.playerName}
- Idade: ${stats.age}
- Nível: ${stats.level}
- Objetivo: ${stats.customGoal || stats.goal}
- Hardware disponível: ${itemsStr || 'Nenhum'}
- Habilidades aprendidas: ${skillsStr || 'Nenhuma'}

REQUISITOS DA MISSÃO:
1. Deve ser uma AÇÃO CONCRETA E ÚNICA no mundo real
2. NÃO pode ser um hábito repetitivo
3. Deve ter instruções claras de execução passo a passo
4. Focar em progresso real e mensurável
5. Alinhada com o objetivo da unidade

EXEMPLOS VÁLIDOS:
- "Se inscrever no curso de React Avançado na Udemy"
- "Organizar e digitalizar todos os documentos fiscais do último ano"
- "Comprar e ler o livro 'Deep Work' de Cal Newport"
- "Configurar ambiente de desenvolvimento com Docker"

EXEMPLOS INVÁLIDOS (NÃO USAR):
- "Fazer exercícios diários" (muito genérico)
- "Estudar programação" (não específico)
- "Melhorar alimentação" (não mensurável)

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
    // Habilidades básicas para modo livre
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
      },
      {
        name: "RESISTÊNCIA ISOMÉTRICA",
        type: "MOTORA",
        description: "Manutenção de posições estáticas por tempo prolongado.",
        requirement: "Nível 1+",
        efficiencyBonus: "+5 em VITALIDADE",
        testTask: "Manter prancha abdominal",
        testTarget: 60,
        testUnit: "segundos"
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
- Nível da unidade: ${stats.level}
- Idade: ${stats.age}
- Objetivo: ${stats.customGoal || stats.goal}

REQUISITOS DAS HABILIDADES:
1. Devem ser realistas e alcançáveis
2. Cada habilidade deve ter um teste específico
3. Focar em desenvolvimento pessoal real
4. Incluir bônus de eficiência realista

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