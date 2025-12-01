# 🚀 PRÓXIMAS ETAPAS - Deploy Production

## Status atual ✅
- [x] Backend rodando localmente em `http://localhost:3001`
- [x] MongoDB conectado e testado
- [x] Frontend refatorado para usar API backend
- [x] Código enviado para GitHub
- [x] Guias de deploy criados

---

## Passo 1️⃣: Deploy Backend no Railway

**Tempo estimado: 10-15 minutos**

### 1.1 Acessar Railway
- Abra https://railway.app/dashboard
- Faça login com GitHub

### 1.2 Criar novo projeto
1. Clique **"+ New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha: **`Projeto-The-Box-Control-2.0`**
4. Deixe Railway detectar (ele acha `backend/package.json`)
5. Clique **"Deploy"**

### 1.3 Configurar variáveis de ambiente
No painel do Railway:
1. Vá para **Variables**
2. Adicione estas variáveis:

```
PORT=3001
MONGODB_URI=mongodb+srv://boxmotors:4qTv5jBdPUdiIVhm@cluster0.drgw0hf.mongodb.net/?appName=Cluster0
JWT_SECRET=gerar-uma-chave-aleatoria-longa-aqui
DEEPSEEK_API_KEY=sk-sua-chave-aqui
FRONTEND_URL=http://localhost:3000
```

⚠️ **JWT_SECRET**: gere uma string aleatória segura (ex: `openssl rand -base64 32`)

### 1.4 Configurar Deploy
1. Vá para **Deploy Settings** (ou similar)
2. Set **Root Directory** = `backend`
3. Set **Start Command** = `npm start`

### 1.5 Aguardar build
- Logs aparecerão em **Deployments** → **View Logs**
- Procure por: "listening on port 3001" ou "Server started"

### 1.6 Copiar URL do Railway
- Na aba **Deployment**, procure por URL (ex: `https://projeto-box-railway.up.railway.app`)
- **Salve esta URL para o próximo passo**

### 1.7 Testar backend
```
GET https://SEU_RAILWAY_URL/api/health
```
Deve retornar: `{ "status":"OK", "timestamp":"..." }`

---

## Passo 2️⃣: Deploy Frontend no Vercel

**Tempo estimado: 5-10 minutos**

### 2.1 Preparar frontend
O `app-api.js` já está configurado para usar a URL do backend:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```

### 2.2 Atualizar app-api.js com URL do Railway
1. Abra `app-api.js`
2. Encontre a linha: `const API_BASE_URL = ...`
3. Mude para:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api'
  : 'https://SEU_RAILWAY_URL/api';
```
4. Salve e faça commit:
```bash
git add app-api.js
git commit -m "Atualizar API_BASE_URL com URL do Railway"
git push origin main
```

### 2.3 Acessar Vercel
- Abra https://vercel.com/dashboard
- Faça login com GitHub

### 2.4 Criar novo projeto
1. Clique **"Add New Project"**
2. Selecione **"Import Git Repository"**
3. Procure **`Projeto-The-Box-Control-2.0`**
4. Clique **"Import"**

### 2.5 Configurar variáveis (opcional)
Se Vercel pedir variáveis:
```
REACT_APP_API_URL=https://SEU_RAILWAY_URL
```

### 2.6 Deploy
- Clique **"Deploy"**
- Aguarde conclusão (2-5 minutos)

### 2.7 Copiar URL do Vercel
- Você receberá uma URL como: `https://projeto-box-control.vercel.app`
- **Salve esta URL**

### 2.8 Atualizar backend CORS
1. Abra `backend/src/server.js`
2. Encontre `CORS_OPTIONS`
3. Adicione URL do Vercel:
```javascript
const CORS_OPTIONS = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://seu-projeto-vercel.vercel.app',
    'https://seu-railway-url.up.railway.app'
  ],
  credentials: true
};
```
4. Commit e push:
```bash
git add backend/src/server.js
git commit -m "Adicionar URLs Vercel e Railway ao CORS"
git push origin main
```
5. Railway fará redeploy automaticamente

---

## Passo 3️⃣: Testar integração completa

**Tempo estimado: 5 minutos**

### 3.1 Acessar frontend
1. Abra: `https://seu-projeto-vercel.vercel.app`
2. Você deve ver o login

### 3.2 Fazer login
- Email: `test@example.com`
- Senha: `12345`
- License: `BOXPRO` (para ter acesso à IA)

### 3.3 Testar funcionalidades
1. **Adicionar transação**
   - Clique em "Nova Transação"
   - Preencha dados
   - Clique "Salvar"
   - Deve salvar no MongoDB

2. **Usar IA** (se BOXPRO)
   - Clique no ícone 🎙️
   - Fale algo (ex: "Recebi 500 reais")
   - IA deve processar (se DeepSeek key estiver configurada)

3. **DevTools check**
   - Pressione F12
   - Aba **Network**: procure requests para `/api/`
   - Aba **Console**: não deve haver erros vermelhos
   - Aba **Application** → **LocalStorage**: procure por `token` ou `jwt`

---

## Passo 4️⃣: Configurar DeepSeek API (opcional, para IA)

Se quiser testar a IA:
1. Abra https://platform.deepseek.com
2. Copie sua chave API
3. No Railway, vá para **Variables**
4. Atualize: `DEEPSEEK_API_KEY=sk-sua-chave`
5. Salve (railway fará redeploy)

---

## Checklist final

- [ ] Backend rodando no Railway
- [ ] URL do Railway copiada e testada (`/api/health` responde)
- [ ] Frontend enviado para Vercel
- [ ] URL do Vercel funcionando
- [ ] CORS configurado em ambos (localhost, Vercel, Railway)
- [ ] Login funciona
- [ ] Transações salvam no MongoDB
- [ ] IA funciona (se DEEPSEEK_API_KEY configurada)
- [ ] Sem erros no console do navegador
- [ ] Token JWT armazenado corretamente

---

## Troubleshooting rápido

| Erro | Solução |
|------|---------|
| "Cannot reach backend" | Verifique URL em `app-api.js` e se Railway está rodando |
| "CORS error" | Adicione URL do Vercel ao `CORS_OPTIONS` em `server.js` |
| "401 Unauthorized" | Fazer login novamente; verifique `JWT_SECRET` |
| "Cannot connect MongoDB" | Verifique `MONGODB_URI` no Railway; IP allowlisting |
| "Blank page / JS error" | Abra DevTools F12 → Console; procure erros de sintaxe |

---

## Próximas otimizações (depois)

1. Configurar domínio customizado (Railway + Vercel)
2. Adicionar CI/CD com GitHub Actions
3. Backups automáticos do MongoDB
4. Rate limiting mais agressivo
5. Monitoramento e logging (Sentry, LogRocket)

---

**Você chegou ao ponto de produção! 🎉**

Siga os passos acima e me conte quando:
- ✅ Railway está rodando
- ✅ Vercel está online
- ✅ Login funciona
- ✅ Transações sincronizam com DB

Vou ajudar com qualquer erro!
