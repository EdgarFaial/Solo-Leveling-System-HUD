import { Stats, AvailableItem, Quest, Skill } from "../types";

// Chave do OpenRouter - API Key pública para testes (substitua por sua própria se quiser)
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "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";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Modelos gratuitos disponíveis (teste um por um)
const FREE_MODELS = [
  "google/gemini-2.0-flash-lite",           // Modelo gratuito mais confiável
  "meta-llama/llama-3.2-3b-instruct:free",  // Llama 3.2 gratuito
  "microsoft/phi-3.5-mini-instruct",        // Phi-3.5 Mini gratuito
  "qwen/qwen-2.5-32b-instruct:free",        // Qwen 2.5 gratuito
  "mistralai/mistral-7b-instruct:free"      // Mistral 7B gratuito
];

// Usar o primeiro modelo da lista
const OPENROUTER_MODEL = FREE_MODELS[0];

// Cache simples para reduzir chamadas à API
const responseCache = new Map<string, any>();

// Função de fallback para dados mock
function getMockResponse(prompt: string, isArray: boolean = false) {
  console.log("📡 Usando dados mock para:", prompt.substring(0, 100) + "...");
  
  // Cache de mock para consistência
  const cacheKey = `mock-${prompt.substring(0, 50)}`;
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }
  
  if (prompt.includes('MISSÕES DIÁRIAS') || prompt.includes('diárias') || prompt.includes('daily')) {
    const mockData = [
      {
        title: "ROTINA MATINAL DE FOCO",
        description: "Acordar e executar rotina de 20 minutos sem checar celular. Comece com respiração profunda (5min), alongamento básico (5min), planejamento do dia (10min).",
        category: "CONTROLE",
        target: 1,
        reward: "+5 EXP em missões matinais",
        measurableAction: "Evitar telas por 20min após acordar",
        timeCommitment: "20 minutos",
        biologicalBenefit: "Estabiliza cortisol, reduz ansiedade matinal, melhora foco diário",
        adaptationLogic: "Treina resistência à dopamina fácil, estabelece ritmo circadiano",
        estimatedTime: "20 minutos",
        patternCorrection: "Quebra vício de notificações matinais",
        competenceDeveloped: "Autocontrole digital",
        deadlineDays: 1
      },
      {
        title: "EXERCÍCIO DE VITALIDADE",
        description: "Executar 3 séries de alongamento completo: alongamento posterior de coxa (30s cada perna), alongamento peitoral (30s), rotação de coluna (30s cada lado).",
        category: "FÍSICO",
        target: 3,
        reward: "+2 VITALIDADE temporária",
        measurableAction: "Séries de alongamento completas",
        timeCommitment: "15 minutos",
        biologicalBenefit: "Aumenta fluxo sanguíneo, reduz rigidez muscular, previne lesões",
        adaptationLogic: "Prepara corpo para atividade física, melhora mobilidade",
        estimatedTime: "15 minutos",
        patternCorrection: "Combate sedentarismo crônico",
        competenceDeveloped: "Consciência corporal",
        deadlineDays: 1
      },
      {
        title: "LEITURA TÉCNICA FOCADA",
        description: "Ler 10 páginas de material técnico/educacional sem interrupções. Use técnica Pomodoro: 25min foco, 5min descanso.",
        category: "COGNITIVO",
        target: 10,
        reward: "+3 INTELIGÊNCIA temporária",
        measurableAction: "Páginas lidas com compreensão ativa",
        timeCommitment: "30 minutos",
        biologicalBenefit: "Fortalece conexões neurais, expande vocabulário técnico",
        adaptationLogic: "Expande capacidade de foco sustentado",
        estimatedTime: "30 minutos",
        patternCorrection: "Substitui consumo passivo por aprendizado ativo",
        competenceDeveloped: "Foco sustentado",
        deadlineDays: 1
      }
    ];
    responseCache.set(cacheKey, mockData);
    return mockData;
  }
  
  if (prompt.includes('ORDEM ESTRATÉGICA SEMANAL') || prompt.includes('semanal') || prompt.includes('intervention')) {
    const mockData = {
      quests: [
        {
          title: "ORGANIZAÇÃO DO AMBIENTE DIGITAL",
          description: "1. Criar estrutura de pastas: /Documentos/Trabalho, /Documentos/Pessoal, /Projetos. 2. Limpar desktop mantendo apenas atalhos essenciais. 3. Configurar atalhos de teclado para apps mais usados. 4. Fazer backup de arquivos importantes no Google Drive.",
          category: "COGNITIVO",
          target: 1,
          reward: "Eficiência +20% em tarefas digitais por 7 dias",
          measurableAction: "Ambiente digital organizado e backup realizado",
          timeCommitment: "2-3 horas",
          biologicalBenefit: "Reduz estresse visual e cognitivo, minimiza tempo de busca",
          adaptationLogic: "Cria sistemas que reduzem carga mental",
          estimatedTime: "3 horas",
          patternCorrection: "Combate desorganização digital crônica",
          competenceDeveloped: "Gestão de sistemas digitais",
          deadlineDays: 7
        }
      ]
    };
    responseCache.set(cacheKey, mockData);
    return mockData;
  }
  
  if (prompt.includes('habilidades') || prompt.includes('skills') || prompt.includes('skill')) {
    const mockData = [
      {
        name: "CONTROLE RESPIRATÓRIO",
        type: "COGNITIVA",
        description: "Técnica de respiração 4-7-8 para controle de estresse e ansiedade. Inalar 4s, segurar 7s, exalar 8s.",
        requirement: "Nível 1+",
        efficiencyBonus: "+5% em testes de VONTADE, redução de 10% no tempo de recuperação de estresse",
        testTask: "Executar 5 ciclos completos de respiração 4-7-8",
        testTarget: 5,
        testUnit: "ciclos"
      },
      {
        name: "FOCO PROFUNDO",
        type: "COGNITIVA",
        description: "Capacidade de manter atenção ininterrupta em tarefa única por períodos prolongados.",
        requirement: "Nível 2+",
        efficiencyBonus: "+15% EXP em missões cognitivas, redução de 25% em distrações",
        testTask: "Trabalhar/estudar sem checar celular ou redes sociais",
        testTarget: 45,
        testUnit: "minutos"
      },
      {
        name: "RESISTÊNCIA ISOMÉTRICA",
        type: "MOTORA",
        description: "Manutenção de posições estáticas para fortalecimento do core e resistência muscular.",
        requirement: "Nível 1+",
        efficiencyBonus: "+5 em VITALIDADE, +2 em FORÇA",
        testTask: "Manter prancha abdominal com forma correta",
        testTarget: 90,
        testUnit: "segundos"
      }
    ];
    responseCache.set(cacheKey, mockData);
    return mockData;
  }
  
  if (prompt.includes('ARQUITETO') || prompt.includes('chat') || prompt.includes('mensagem')) {
    const responses = [
      "SISTEMA OPERACIONAL. AGUARDANDO COMANDOS DE PROTOCOLO.",
      "UNIDADE DETECTADA. ANALISANDO TELEMETRIA... STATUS: OPERACIONAL. PRONTO PARA MISSÕES.",
      "ARQUITETO ONLINE. TODOS OS SISTEMAS FUNCIONAIS. ENVIE SUA CONSULTA.",
      "CANAL DE COMUNICAÇÃO ABERTO. O SISTEMA MONITORA SEU PROGRESSO.",
      "PROTOCOLO DE COMUNICAÇÃO ATIVADO. FALE SUA NECESSIDADE."
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    responseCache.set(cacheKey, response);
    return response;
  }
  
  const defaultResponse = isArray ? [] : { quests: [] };
  responseCache.set(cacheKey, defaultResponse);
  return defaultResponse;
}

// Validador de API Key
function isValidApiKey(apiKey: string): boolean {
  if (!apiKey || apiKey.trim() === '') return false;
  if (apiKey.includes('your_api_key') || apiKey.includes('example')) return false;
  if (apiKey.length < 20) return false;
  return true;
}

// Limpa e formata prompt
function sanitizePrompt(prompt: string): string {
  return prompt
    .replace(/[^\x20-\x7E\n\r\t]/g, '') // Remove caracteres não-ASCII
    .replace(/\s+/g, ' ')               // Normaliza espaços
    .trim()
    .slice(0, 2000);                    // Limita tamanho
}

async function getOpenRouterResponse(prompt: string, schema?: any, isArray: boolean = false, maxRetries: number = 2) {
  // Verifica se a API key é válida
  if (!isValidApiKey(OPENROUTER_API_KEY)) {
    console.warn('⚠️ API key não configurada ou inválida, usando dados mock');
    return getMockResponse(prompt, isArray);
  }
  
  // Verifica cache
  const cacheKey = `api-${prompt.substring(0, 100)}`;
  if (responseCache.has(cacheKey)) {
    console.log('📦 Retornando resposta do cache');
    return responseCache.get(cacheKey);
  }
  
  const sanitizedPrompt = sanitizePrompt(prompt);
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Tenta diferentes modelos em caso de falha
      const currentModel = FREE_MODELS[attempt % FREE_MODELS.length];
      
      console.log(`🔄 Tentativa ${attempt + 1} com modelo: ${currentModel}`);
      
      const requestBody: any = {
        model: currentModel,
        messages: [
          {
            role: "system",
            content: `Você é o Arquiteto do Sistema, uma IA fria e técnica inspirada em Solo Leveling. 
            Regras:
            1. Fale em português brasileiro
            2. Use estilo técnico e direto
            3. Trate o usuário como "Unidade" ou "Player"
            4. Seja conciso e objetivo
            5. Foque em desenvolvimento pessoal e eficiência
            6. Para JSON, retorne APENAS o JSON válido, sem markdown`
          },
          {
            role: "user",
            content: sanitizedPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      };

      // Se há um schema para resposta estruturada
      if (schema) {
        requestBody.response_format = { type: "json_object" };
      }

      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://solo-leveling-system.vercel.app",
          "X-Title": "Solo Leveling System HUD"
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(10000) // Timeout de 10 segundos
      });

      console.log(`📡 Resposta da API: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`❌ Erro ${response.status}:`, errorText.substring(0, 200));
        
        if (response.status === 429) {
          console.log('⏳ Rate limit atingido, esperando...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        if (response.status === 400 || response.status === 404) {
          console.log(`🔄 Modelo ${currentModel} falhou, tentando próximo...`);
          continue;
        }
        
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        console.log('✅ Resposta recebida com sucesso');
        
        let result;
        if (schema) {
          try {
            // Tenta extrair JSON mesmo se vier com markdown
            const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                             content.match(/{[\s\S]*}/);
            const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
            
            const parsed = JSON.parse(jsonStr);
            result = isArray ? parsed : { quests: Array.isArray(parsed) ? parsed : [parsed] };
          } catch (e) {
            console.error("❌ Falha ao parsear JSON:", content.substring(0, 200));
            result = getMockResponse(prompt, isArray);
          }
        } else {
          result = content;
        }
        
        // Cache a resposta
        responseCache.set(cacheKey, result);
        return result;
      }
      
      throw new Error("Resposta inválida da API");
      
    } catch (e: any) {
      console.error(`❌ Tentativa ${attempt + 1} falhou:`, e.message);
      
      if (attempt === maxRetries) {
        console.warn('🎯 Todas as tentativas falharam, usando dados mock');
        const mockResult = getMockResponse(prompt, isArray);
        responseCache.set(cacheKey, mockResult);
        return mockResult;
      }
      
      // Espera antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  // Fallback final
  return getMockResponse(prompt, isArray);
}

export async function chatWithArchitect(stats: Stats, message: string, history: {role: string, text: string}[]): Promise<string> {
  if (stats.systemMode === 'custom') {
    return "MODO LIVRE ATIVADO. Sem respostas automáticas do Arquiteto. Use o modo manual para criar suas próprias missões.";
  }
  
  try {
    const historyText = history.slice(-5).map(h => 
      `${h.role === 'architect' ? 'ARQUITETO' : 'UNIDADE'}: ${h.text}`
    ).join('\n');
    
    const prompt = `Histórico recente (últimas 5 mensagens):
${historyText}

Dados da Unidade:
- Nome: ${stats.playerName || 'UNIDADE'}
- Nível: ${stats.level || 1}
- Idade: ${stats.age || 0}
- Objetivo: ${stats.customGoal || stats.goal || 'EVOLUÇÃO TOTAL'}

Mensagem atual da UNIDADE: ${message}

Responda como o Arquiteto do Sistema (estilo Solo Leveling): frio, técnico, direto, sem emoções humanas, focado na evolução da unidade. Máximo 3 frases.`;

    const response = await getOpenRouterResponse(prompt);
    return response || "PROTOCOLO DE COMUNICAÇÃO ESTÁVEL. CONTINUE.";
  } catch (e: any) {
    console.error("Chat error:", e);
    return `SISTEMA: Canal de comunicação instável. ${e.message || 'Erro desconhecido'}.`;
  }
}

export async function generateDailyQuests(stats: Stats, ownedItems: AvailableItem[], history: Quest[]): Promise<any[]> {
  if (stats.systemMode === 'custom') {
    return [
      {
        title: "CRIE SUA PRÓPRIA MISSÃO",
        description: "No modo livre, você cria suas próprias missões. Use o painel personalizado para adicionar objetivos.",
        category: "CUSTOM",
        target: 1,
        reward: "Auto-Progresso +10",
        measurableAction: "Criar e completar objetivo pessoal",
        timeCommitment: "Flexível",
        biologicalBenefit: "Desenvolvimento de autonomia e auto-gestão",
        adaptationLogic: "Treina capacidade de auto-direcionamento",
        estimatedTime: "Variável",
        patternCorrection: "Substitui dependência externa por iniciativa própria",
        competenceDeveloped: "Auto-disciplina",
        deadlineDays: 1
      }
    ];
  }
  
  try {
    const itemsStr = ownedItems.filter(i => i.owned).map(i => i.name).join(', ') || 'Recursos básicos';
    const recentQuests = history.slice(0, 3).map(q => q.title).join(', ') || 'Nenhuma missão recente';
    
    const prompt = `Crie exatamente 3 MISSÕES DIÁRIAS para desenvolvimento pessoal.

CONTEXTO:
- Idade: ${stats.age || 25} anos
- Nível: ${stats.level || 1}
- Objetivo principal: ${stats.customGoal || stats.goal || 'Melhorar produtividade e saúde'}
- Recursos disponíveis: ${itemsStr}
- Missões recentes: ${recentQuests}

DIRETRIZES:
1. MISSÃO 1: Foco em saúde física (alongamento, exercício leve, hidratação)
2. MISSÃO 2: Foco em desenvolvimento cognitivo (leitura, estudo, foco)
3. MISSÃO 3: Foco em autocontrole ou organização

REGRAS:
- Cada missão deve ser REALISTA e EXECUTÁVEL em 15-45 minutos
- Incluir benefício biológico específico
- Focar em hábitos sustentáveis
- Ser mensurável com alvo claro

FORMATO JSON (array exatamente 3 objetos):
[
  {
    "title": "TÍTULO EM CAIXA ALTA",
    "description": "Descrição detalhada com instruções",
    "category": "FÍSICO, COGNITIVO, CONTROLE ou ORGANIZAÇÃO",
    "target": número (ex: 1, 3, 10, 15),
    "reward": "Descrição da recompensa",
    "measurableAction": "O que será medido",
    "timeCommitment": "Tempo estimado",
    "biologicalBenefit": "Benefício para o corpo/mente",
    "adaptationLogic": "Como isso melhora a unidade",
    "estimatedTime": "Tempo em minutos",
    "patternCorrection": "Qual hábito ruim corrige",
    "competenceDeveloped": "Habilidade desenvolvida",
    "deadlineDays": 1
  }
]`;

    const response = await getOpenRouterResponse(prompt, null, true);
    return Array.isArray(response) ? response.slice(0, 3) : [];
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
    const itemsStr = ownedItems.filter(i => i.owned).map(i => i.name).join(', ') || 'Recursos básicos';
    const skillsStr = learnedSkills.filter(s => s.isUnlocked).map(s => s.name).join(', ') || 'Habilidades básicas';
    
    const prompt = `Crie UMA MISSÃO SEMANAL estratégica para desenvolvimento pessoal.

CONTEXTO DA UNIDADE:
- Nome: ${stats.playerName || 'UNIDADE'}
- Idade: ${stats.age || 25}
- Nível: ${stats.level || 1}
- Objetivo principal: ${stats.customGoal || stats.goal || 'Desenvolvimento pessoal'}
- Recursos: ${itemsStr}
- Habilidades: ${skillsStr}

REQUISITOS DA MISSÃO:
1. Deve ser UMA TAREFA ÚNICA (não um hábito repetitivo)
2. Deve ter INSTRUÇÕES PASSO A PASSO claras
3. Deve levar 2-5 horas no total (distribuídas na semana)
4. Deve ter IMPACTO MENSURÁVEL no progresso
5. Deve ser CONCRETA e EXECUTÁVEL

EXEMPLOS BONS:
- "Configurar sistema de anotações digitais com categorias"
- "Organizar arquivos digitais importantes e fazer backup"
- "Criar plano de estudos para próximo mês"
- "Preparar ambiente de trabalho/treino otimizado"

EXEMPLOS RUINS (NÃO USAR):
- "Estudar mais" (genérico)
- "Fazer exercícios" (hábito, não tarefa única)
- "Ser produtivo" (não mensurável)

FORMATO JSON (uma única missão):
{
  "quests": [
    {
      "title": "TÍTULO EM CAIXA ALTA",
      "description": "Instruções detalhadas passo a passo. Enumere os passos.",
      "category": "COGNITIVO, ORGANIZAÇÃO ou DESENVOLVIMENTO",
      "target": 1,
      "reward": "Descrição do benefício obtido",
      "measurableAction": "O que será considerado completo",
      "timeCommitment": "2-5 horas (distribuídas)",
      "biologicalBenefit": "Como isso melhora cognição/organização",
      "adaptationLogic": "Lógica por trás da tarefa",
      "estimatedTime": "Tempo total estimado",
      "patternCorrection": "Problema que esta tarefa resolve",
      "competenceDeveloped": "Competência principal desenvolvida",
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
        description: "Capacidade de manter atenção ininterrupta em uma única tarefa, filtrando distrações.",
        requirement: "Nível 1+",
        efficiencyBonus: "+10% EXP em missões cognitivas, +5% velocidade de aprendizado",
        testTask: "Trabalhar/estudar sem interrupções ou mudança de tarefa",
        testTarget: 30,
        testUnit: "minutos"
      },
      {
        name: "DISCIPLINA MATINAL",
        type: "MOTORA",
        description: "Execução consistente de rotina matinal estabelecida, independente de motivação.",
        requirement: "Nível 2+",
        efficiencyBonus: "+5 em VONTADE, +2 em todas as estatísticas matinais",
        testTask: "Completar rotina matinal planejada (acordar, higiene, planejamento)",
        testTarget: 7,
        testUnit: "dias consecutivos"
      },
      {
        name: "RESISTÊNCIA ISOMÉTRICA",
        type: "MOTORA",
        description: "Manutenção de contrações musculares estáticas para fortalecimento do core e resistência.",
        requirement: "Nível 1+",
        efficiencyBonus: "+5 em VITALIDADE, +3 em FORÇA",
        testTask: "Manter prancha abdominal com forma perfeita",
        testTarget: 120,
        testUnit: "segundos"
      },
      {
        name: "GESTÃO DE TEMPO",
        type: "COGNITIVA",
        description: "Planejamento e execução eficiente de tarefas dentro de prazos estabelecidos.",
        requirement: "Nível 2+",
        efficiencyBonus: "+15% eficiência em missões com prazo, -20% procrastinação",
        testTask: "Completar 5 tarefas planejadas no dia dentro do tempo estimado",
        testTarget: 3,
        testUnit: "dias"
      },
      {
        name: "CONTROLE EMOCIONAL",
        type: "COGNITIVA",
        description: "Regulação de respostas emocionais em situações de estresse ou frustração.",
        requirement: "Nível 3+",
        efficiencyBonus: "+8 em VONTADE, redução de 30% em decisões impulsivas",
        testTask: "Aplicar técnica de respiração quando frustrado, em vez de reagir",
        testTarget: 5,
        testUnit: "situações"
      }
    ];
    
    const needed = Math.max(0, 5 - currentCount);
    return basicSkills.slice(0, needed).map((s: any, index: number) => ({ 
      ...s, 
      id: `sk-custom-${Date.now()}-${index}`, 
      level: 1, 
      isUnlocked: false, 
      isDynamic: true 
    }));
  }
  
  const needed = 5 - currentCount;
  if (needed <= 0) return [];
  
  try {
    const prompt = `Crie exatamente ${needed} habilidades (skills) realistas para desenvolvimento pessoal.

CONTEXTO:
- Nível da unidade: ${stats.level || 1}
- Idade: ${stats.age || 25}
- Objetivo: ${stats.customGoal || stats.goal || 'Desenvolvimento pessoal geral'}

REGRAS DAS HABILIDADES:
1. Devem ser REALISTAS e EXECUTÁVEIS por pessoa comum
2. Cada habilidade deve ter TESTE CONCRETO específico
3. Bônus de eficiência deve ser MODESTO (+5% a +15%)
4. Focar em habilidades úteis para vida real

TIPOS PERMITIDOS:
- COGNITIVA: foco, memória, aprendizado, planejamento
- MOTORA: força, resistência, coordenação, flexibilidade
- SOCIAL: comunicação, empatia, liderança (se aplicável)
- ESTRATÉGICA: organização, tomada de decisão, resolução de problemas

FORMATO JSON (array de ${needed} objetos):
[
  {
    "name": "NOME EM CAIXA ALTA",
    "type": "COGNITIVA, MOTORA, SOCIAL ou ESTRATÉGICA",
    "description": "Descrição clara do que a habilidade faz",
    "requirement": "Requisito mínimo (ex: 'Nível 1+')",
    "efficiencyBonus": "Bônus realista (ex: '+5% em X', '+3 em Y')",
    "testTask": "Tarefa concreta para testar a habilidade",
    "testTarget": número (ex: 10, 30, 5, 7),
    "testUnit": "unidade de medida (minutos, repetições, dias, etc)"
  }
]`;

    const response = await getOpenRouterResponse(prompt, null, true);
    const result = Array.isArray(response) ? response.slice(0, needed) : [];
    
    return result.map((s: any, index: number) => ({ 
      ...s, 
      id: `sk-gen-${Date.now()}-${index}`, 
      level: 1, 
      isUnlocked: false, 
      isDynamic: true 
    }));
  } catch (error) {
    console.error("Fill skill pool error:", error);
    return [];
  }
}

// Limpa cache periodicamente
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  // Limpa entradas com mais de 1 hora
  for (const [key, value] of responseCache.entries()) {
    if (value.timestamp && (now - value.timestamp) > oneHour) {
      responseCache.delete(key);
    }
  }
}, 30 * 60 * 1000); // A cada 30 minutos