# 🤖 Como Configurar DeepSeek IA

## ⚡ Passo a Passo (5 minutos)

### 1️⃣ Criar Conta no DeepSeek
- Acesse: https://platform.deepseek.com
- Clique em "Sign Up"
- Use email ou conta existente
- Confirme o email

### 2️⃣ Obter Chave de API
1. Depois de logado, vá para: https://platform.deepseek.com/api_keys
2. Clique em "Create new API key"
3. Dê um nome (ex: "BoxControl")
4. Copie a chave (começa com `sk-`)
5. **IMPORTANTE**: Salve em local seguro!

### 3️⃣ Configurar no Railway

**Opção A: Via Dashboard Web (mais fácil)**
1. Acesse: https://railway.app
2. Abra seu projeto "Projeto-The-Box-Control-2.0"
3. Vá em **Variables**
4. Clique em **Add Variable**
5. Preencha:
   - Name: `DEEPSEEK_API_KEY`
   - Value: (cole sua chave aqui)
6. Clique em **Save**
7. Railway automaticamente faz redeploy

**Opção B: Via CLI**
```bash
railway variables set DEEPSEEK_API_KEY=sk-sua-chave-aqui
railway up
```

### 4️⃣ Testar se Funcionou

Na sua aplicação em produção:
1. Clique em "🎤 Mic/IA" (botão PRO)
2. Fale: "Adicione 50 reais de gasolina"
3. Se funcionar, ele criará a transação automaticamente
4. Se não funcionar, veja os erros abaixo

---

## 🧪 Testar via API

```bash
# Linux/Mac
curl -X POST https://projeto-the-box-control-20-production.up.railway.app/api/ai/ask \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userText":"Adicione 100 reais de combustível"}'

# PowerShell (Windows)
$token = "YOUR_TOKEN_HERE"
$body = '{"userText":"Adicione 100 reais de combustível"}'
Invoke-WebRequest -Uri "https://projeto-the-box-control-20-production.up.railway.app/api/ai/ask" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
  -Body $body
```

---

## ❌ Erros Comuns

### ❌ "DeepSeek não configurado"
- Significa que `DEEPSEEK_API_KEY` não está definido ou ainda é `sk-xxx`
- **Solução**: Siga os passos acima para adicionar a chave no Railway

### ❌ "Invalid API Key"
- A chave está errada ou expirou
- **Solução**: Gere uma nova chave em https://platform.deepseek.com/api_keys

### ❌ "Insufficient credits"
- Sua conta DeepSeek não tem créditos
- **Solução**: Adicione créditos na conta DeepSeek (https://platform.deepseek.com/billing)

### ❌ "Rate limit exceeded"
- Muitas requisições em pouco tempo
- **Solução**: Aguarde alguns segundos antes de tentar novamente

---

## 💡 Como a IA Funciona

1. Você fala: "Adicione R$50 de gasolina"
2. A IA (DeepSeek) entende e cria um JSON:
   ```json
   {
     "action": "add_tx",
     "tipo": "expense",
     "desc": "Gasolina",
     "val": 50,
     "cat": "Combustível",
     "data": "2025-12-01"
   }
   ```
3. O backend processa e cria a transação
4. Você vê a transação na lista!

---

## 🔒 Segurança

- A chave DeepSeek **NUNCA** é exposta ao frontend
- Só existe no backend (Railway)
- O frontend apenas envia o texto e recebe a resposta processada
- Ninguém consegue roubar sua chave pelo browser

---

## 📊 Custo

DeepSeek é muito barato:
- ~$0.0007 por 1000 tokens
- 1 transação = ~10 tokens
- 1000 transações = ~$0.007 (menos de 1 centavo!)

---

## ✅ Pronto!

Depois de adicionar a chave no Railway:
1. Aguarde 1-2 minutos pelo redeploy
2. Recarregue o app (Ctrl+F5)
3. Clique no botão 🎤 
4. Fale um comando
5. A IA deve processar e criar a transação!

Se tiver dúvidas, verifique:
- Railway logs: https://railway.app (seu projeto → Logs)
- Browser console: F12 → Console
- Resposta da API para ver mensagens de erro
