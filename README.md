
# ⚔️ Sistema Solo Leveling HUD

Este é um sistema de RPG imersivo baseado no anime Solo Leveling, construído para dispositivos móveis com integração de IA (Gemini API).

## 🚀 Como Hospedar (Deploy)

Siga estes passos para colocar seu sistema online e compartilhar com o mundo:

### 1. Preparação
Certifique-se de ter todos os arquivos do projeto em uma pasta local.

### 2. Criar um Repositório no GitHub
1. Vá para [github.com](https://github.com) e crie um novo repositório (ex: `solo-leveling-system`).
2. Faça o upload dos arquivos ou use o Git para fazer o push do seu código.

### 3. Hospedagem na Vercel (Recomendado)
A Vercel é a plataforma mais simples para hospedar apps React/Vite.
1. Acesse [vercel.com](https://vercel.com) e conecte sua conta do GitHub.
2. Clique em **"Add New"** > **"Project"**.
3. Importe o repositório que você criou.
4. **IMPORTANTE (Configurações)**:
   - Vá na seção **Environment Variables**.
   - Adicione uma variável chamada `API_KEY`.
   - O valor deve ser a sua chave da API do Google Gemini (obtenha em [aistudio.google.com](https://aistudio.google.com)).
5. Clique em **Deploy**.

### 4. Compartilhamento
Assim que o deploy terminar, a Vercel fornecerá um link (ex: `https://seu-projeto.vercel.app`).
- Use o botão **Share** dentro do próprio app para copiar seu status e o link para amigos.

## 🛠️ Funcionalidades Principais
- **Missões Diárias Adaptativas**: Escalam conforme seu nível.
- **Poder de Combate (CP)**: Calculado com base em todos os seus atributos.
- **Treinamento de Atributos**: Desafios físicos reais para subir STR, INT, etc.
- **O Arquiteto (IA)**: Mensagens autoritárias e missões secretas geradas por IA.
- **Loja e Inventário**: Gerenciamento de itens e ouro.

---
*Aviso: O Sistema exige disciplina absoluta. Falhar em missões diárias pode resultar em punições virtuais.*
