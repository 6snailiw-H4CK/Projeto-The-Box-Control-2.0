# 🧪 GUIA DETALHADO DE TESTES - CATEGORIAS & RECORRENTES

## ⚠️ ANTES DE COMEÇAR
1. **Faça um redeploy do backend no Railway**
   - Acesse: https://railway.app
   - Navegue até o projeto `Projeto-The-Box-Control-2.0`
   - Clique em "Deployments" e depois em "Redeploy" (botão com ícone de seta circular)
   - Aguarde até ver a mensagem "✅ Deployment successful" ou similar
   - Lembre-se: As alterações no `/api/ai/ask` só funcionam após redeploy

2. **Limpe o cache do navegador**
   - Pressione `Ctrl + Shift + Delete`
   - Selecione "All time" (ou "Tudo")
   - Marque: ✓ Cookies, ✓ Cache, ✓ LocalStorage
   - Clique em "Clear data"

3. **Reabra o app**
   - Feche a aba do app (https://the-box-control-2-0.vercel.app)
   - Reabra em uma aba nova

---

## 📋 TESTE 1: VALIDAÇÃO DE CATEGORIA (MANUAL)

### Objetivo
Confirmar que o frontend está enviando a categoria correta ao backend.

### Passo 1: Abrir DevTools
- Abra o app no navegador
- Pressione `F12` (ou `Ctrl + Shift + I`)
- Vá para a aba **"Console"**

### Passo 2: Adicionar uma transação manualmente
1. Na seção principal do app, preencha:
   - **Tipo**: Despesa (ou Receita, tanto faz)
   - **Categoria**: Escolha **Serviços** (ou qualquer uma diferente de "Combustível")
   - **Descrição**: "Teste manual - Serviço X"
   - **Valor**: 100.00
   - **Data**: Hoje

2. Clique em **"Adicionar"** (botão verde)

### Passo 3: Verificar o Console
- Procure por uma linha que começa com: **`Salvar transação:`**
- Você verá algo assim:
  ```
  Salvar transação: {
    tipo: "expense",
    categoria: "Serviços",
    descricao: "Teste manual - Serviço X",
    valor: 100,
    data: "2025-12-02"
  }
  ```

### Passo 4: Verificar na aba Network
1. Vá para a aba **"Network"** (no DevTools)
2. Procure pela requisição **POST** para `/api/transactions`
3. Clique nela e abra a aba **"Response"**
4. Você verá a transação salva. **Confirme que a categoria está correta** (deve ser "Serviços", não "Combustível")

### ✅ Resultado esperado
- Console mostra: `categoria: "Serviços"`
- Network Response mostra: `"categoria": "Serviços"`
- A transação aparece na lista com a categoria correta

---

## 🤖 TESTE 2: CATEGORIA COM IA (DeepSeek)

### Objetivo
Confirmar que a IA (DeepSeek) classifica corretamente a transação e o backend mapeia a categoria para uma existente.

### Passo 1: Preparar o Console e Network
1. Abra DevTools (`F12`)
2. Vá para **Console** e **Network** (deixe as duas abas visíveis ou alternar)
3. Limpe os logs do console: clique no ícone de lixeira
4. Limpe o Network: clique no ícone de lixeira

### Passo 2: Usar a IA para adicionar uma transação
1. Localize o botão **🎤 (microfone)** no app (no rodapé ou menu PRO)
2. Se usar **microfone**, fale em português:
   - **"Gastei cinquenta reais em combustível do carro"**
   - Ou: **"Paguei trezentos em serviço de mecânico"**
   - Ou: **"Comprei peças para o motor por duzentos reais"**

3. Se **digitar texto** (se o microfone não funcionar):
   - Localize o campo de entrada de texto (se houver)
   - Digite: `"Gastei 75 reais em combustível do carro"`

### Passo 3: Monitorar o Network
Assim que enviar (falar ou digitar):
1. Na aba **Network**, procure por uma requisição **POST** para `/api/ai/ask`
2. Clique nela
3. Abra a aba **Response** e copie o JSON inteiro

### Passo 4: Verificar a resposta da IA
A resposta deve ter este formato:
```json
{
  "success": true,
  "action": "add_tx",
  "data": {
    "_id": "...",
    "userId": "...",
    "tipo": "expense",
    "categoria": "Combustível",
    "descricao": "...",
    "valor": 50,
    "data": "2025-12-02T00:00:00.000Z"
  },
  "usedCategory": "Combustível"
}
```

**Importante**: O campo **`"usedCategory"`** mostra qual categoria o backend usou. Deve ser uma categoria **existente** no sistema (ex.: "Combustível", "Serviços", "Peças", etc.), **NÃO** algo como "Combustível (IA gerado)" ou uma string aleatória.

### Passo 5: Confirmar na lista de transações
1. Feche o DevTools (ou minimize)
2. Atualize a página (`F5`)
3. A transação **deve aparecer na lista principal** com:
   - Categoria correta (ex.: "Combustível", não "Combustível, Peças, Serviços" ou "Outros")
   - Valor correto
   - Descrição correta

### ✅ Resultado esperado
- Console: nenhum erro
- Network POST `/api/ai/ask`: resposta com `usedCategory: "Combustível"` (ou outra categoria real)
- Lista de transações: mostra a transação com a categoria correta (não a primeira da lista)

### ❌ Se der erro
Se receber um erro como:
```json
{
  "error": "DeepSeek IA não configurado",
  "message": "Configure DEEPSEEK_API_KEY no Railway para ativar a IA"
}
```

Significa que o redeploy ainda não foi feito ou não sincronizou. Aguarde 2-3 minutos e tente novamente.

---

## 🔄 TESTE 3: RECORRENTES - MARCAR COMO PAGO

### Objetivo
Confirmar que ao clicar no botão "👍" de uma despesa recorrente, o status muda para "pago" imediatamente na tela (sem precisar recarregar).

### Passo 1: Criar uma despesa recorrente
1. Clique em **"Recorrentes"** (menu principal)
2. Preencha:
   - **Descrição**: "Teste Recorrente"
   - **Valor**: 150.00
   - **Dia**: 15 (ou qualquer número)
3. Clique em **"Salvar"**
4. Você verá a recorrente listada com status **"pendente"** (em vermelho)

### Passo 2: Abrir Console
- Pressione `F12` e vá para **Console**

### Passo 3: Clicar no botão "👍"
1. Localize a recorrente que acabou de criar
2. Procure pelo botão **"👍"** (polegar para cima)
3. Clique nele

### Passo 4: Monitorar o Console
- Procure por logs de requisição (se houver)
- O status da recorrente **deve mudar imediatamente** na tela de:
  - **"pendente"** (vermelho) → **"pago"** (verde)

### Passo 5: Clicar novamente para reverter
1. Clique no botão **"👍"** novamente
2. O status **deve voltar para "pendente"**

### ✅ Resultado esperado
- Ao clicar "👍": status muda **imediatamente** (não fica "carregando")
- Ao clicar novamente: status volta ao anterior
- Sem necessidade de recarregar a página

### ❌ Se der problema
Se o status não mudar:
1. Abra Network (`F12` → Network)
2. Clique no "👍" novamente
3. Procure por uma requisição **PATCH** para `/api/recurring/[id]/status`
4. Verifique se a resposta é um erro ou sucesso
5. Me copie a resposta JSON

---

## 📊 TESTE 4: VERIFICAÇÃO FINAL

### Checklist de sucesso
- [ ] Console mostra logs de transação com categoria correta
- [ ] Network POST `/api/transactions` tem categoria correta no response
- [ ] IA retorna `usedCategory` com uma categoria real (não aleatória)
- [ ] Transações criadas por IA aparecem com categoria correta (não a primeira)
- [ ] Recorrentes mudam status sem recarregar a página
- [ ] Botão "👍" em recorrentes funciona (toggle pendente ↔ pago)

---

## 🐛 SE ALGUM TESTE FALHAR

Para cada falha, **copie e envie**:

### Para falha de CATEGORIA:
```
1. Print do Console mostrando a linha "Salvar transação: {...}"
2. Print da aba Network mostrando o Response JSON
3. Print da lista de transações mostrando a categoria errada
4. Qual categoria foi escolhida vs. qual apareceu?
```

### Para falha de IA (DeepSeek):
```
1. O texto/frase que você falou ou digitou
2. Print do Network mostrando a Response JSON completa da requisição `/api/ai/ask`
3. Se houver erro, copie a mensagem de erro
```

### Para falha de RECORRENTES:
```
1. Print do Console mostrando logs (se houver)
2. Print do Network mostrando a requisição PATCH `/api/recurring/[id]/status` e resposta
3. Descrição: "O status mudou ou ficou preso em 'pendente'?"
```

---

## 💡 DICAS
- Se o app parecer estar com cache antigo, faça um **Hard Refresh**: `Ctrl + Shift + R` (não só `F5`)
- Se o DeepSeek disser "não configurado", o redeploy no Railway talvez ainda esteja processando — aguarde 3-5 minutos
- Se receber erro "Cannot GET /", significa o Railway ainda não sincronizou — aguarde e tente novamente

---

## 📞 PRÓXIMO PASSO
Depois de executar os testes acima:
1. **Cole aqui os prints ou logs que pedir**
2. **Descreva brevemente** o que funcionou e o que não funcionou
3. **Eu vou analisar** e fazer ajustes finos (se necessário)

Boa sorte! 🚀
