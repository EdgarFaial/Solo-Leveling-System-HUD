
# ⚔️ Sistema Solo Leveling HUD (Mobile-First)

Este é um ecossistema de RPG de vida real projetado para transformar hábitos em poder. Inspirado na obra *Solo Leveling*, o sistema utiliza a **Gemini 3 Pro API** (O Arquiteto) para monitorar sua evolução e ajustar seu treinamento com precisão cirúrgica.

---

## 🌌 1. O Conceito Central
O Sistema não é um jogo de fantasia; é uma **interface de produtividade e disciplina**. Ele trata o seu corpo e mente como o hardware, e a aplicação como o software de otimização.

---

## 📈 2. Atributos e Poder de Combate (CP)
Seu status é definido por seis atributos fundamentais, cada um impactando seu **Poder de Combate (CP)**:

| Atributo | Foco | Impacto no CP |
| :--- | :--- | :--- |
| **STR (Força)** | Exercício físico e explosão. | +20 por ponto |
| **AGI (Agilidade)** | Velocidade de execução e reflexos. | +15 por ponto |
| **VIT (Vitalidade)** | Resistência, sono e saúde física. | +12 por ponto |
| **INT (Inteligência)** | Aprendizado, leitura e foco profundo. | +25 por ponto |
| **SEN (Percepção)** | Consciência situacional e intuição. | +10 por ponto |
| **WILL (Vontade)** | Resiliência mental e disciplina severa. | +30 por ponto |

**Fórmula do Combat Power:**
`CP = (STR*20) + (AGI*15) + (VIT*12) + (INT*25) + (SEN*10) + (WILL*30) + (LVL*150)`

---

## 📜 3. Sistema de Missões Adaptativas (A Alma do Projeto)
As missões são divididas em duas camadas lógicas mediadas pela IA:

### A. Missões Diárias (Fixas em Essência, Adaptativas em Volume)
Todo dia, o sistema exige o cumprimento de 5 pilares. A IA não muda a *categoria*, mas ajusta o *alvo* com base no seu nível e histórico:
1.  **Físico:** (Ex: De 20 flexões no Nível 1 para 100 no Nível 50).
2.  **Energia/Recuperação:** Hidratação e qualidade do sono.
3.  **Foco Mental:** Minutos de trabalho sem distrações (Deep Work).
4.  **Autocontrole:** Práticas de silêncio ou jejum de dopamina.
5.  **Manutenção do Sistema:** Revisão e planejamento do dia seguinte.

### B. Missões Normais e de Campanha
Geradas dinamicamente pela IA para tirar você da zona de conforto.
- **Exemplo:** "O Portão da Procrastinação" - Terminar um projeto técnico em 48h.
- **Recompensas:** Itens de Rank alto, Gold massivo e Títulos.

### C. Missões Secretas
Desbloqueadas por "padrões de comportamento ocultos". Se você treinar mais do que o solicitado, o Arquiteto pode abrir uma Missão Secreta com recompensas únicas.

---

## 🏛️ 4. O Arquiteto (IA Gemini)
A IA assume o papel do **Arquiteto do Sistema**. Suas funções são:
- **Monitoramento:** Analisa se você está estagnado ou evoluindo rápido demais.
- **Ajuste de Parâmetros:** Se você falha muito, ele endurece as penalidades. Se você vence fácil, ele escala os alvos.
- **Comunicação:** Mensagens curtas, frias e autoritárias. Ele não é seu amigo; ele é o seu catalisador.

---

## 💀 5. Protocolo de Penalidade
Falhar em uma Missão Diária ativa o **Estado de Penalidade**:
- **Visual:** O HUD ganha tons avermelhados de erro.
- **Status:** Redução temporária de XP ganha (-50% no dia seguinte).
- **Compensação:** Uma missão física obrigatória é gerada para "limpar" a falha.

---

## 🏆 6. Progressão de Rank
Seu Rank define a dificuldade e o prestígio dos itens na loja:
- **Rank E:** O início (Nível 1-14).
- **Rank D a B:** O meio do caminho (Nível 15-59).
- **Rank A:** A elite (Nível 60-94).
- **Rank S:** O topo da cadeia (Nível 95+).

---

## 🎒 7. Inventário e Economia
- **Gold:** Ganho ao completar missões. Usado para comprar itens que dão buffs reais (ex: Poção de Mana = Café/Estimulante, Bandagem = Equipamento de treino).
- **Armazém Dimensional:** Espaços limitados baseados em INT para guardar seus itens e conquistas.

---

## 🛡️ 8. Habilidades (Skills)
As habilidades não são "mágicas", mas **capacidades cognitivas e físicas treinadas**:
- **Ativas:** Requerem gasto de MP (Energia Mental/Foco).
- **Passivas:** Bônus permanentes (ex: "Resiliência do Monarca" - Reduz o cansaço após 4h de estudo).

---

## 🚀 Como instalar e hospedar
1. Clone o projeto.
2. Configure sua `API_KEY` do Gemini no ambiente (Vercel/Netlify).
3. Execute `npm install` e `npm start`.
4. **Hospedagem:** Recomendamos Vercel para suporte nativo a variáveis de ambiente e velocidade mobile.

---
*"O Sistema escolheu você. Não porque você era forte, mas porque você era o único que não parava de tentar."*
