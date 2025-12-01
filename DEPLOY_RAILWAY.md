# Deploy no Railway - Guia Passo a Passo

## 1. Criar conta no Railway (se não tiver)
- Acesse: https://railway.app
- Clique em "Sign Up" e faça login com GitHub (recomendado)
- Autorize Railway a acessar seus repositórios GitHub

## 2. Criar novo projeto no Railway

### Opção A: Pelo dashboard do Railway (mais fácil)
1. Acesse https://railway.app/dashboard
2. Clique em **"+ New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Procure e selecione: **`Projeto-The-Box-Control-2.0`**
5. Railway detectará automaticamente que é um Node.js backend (via `package.json` na pasta `backend/`)
6. Clique em **"Deploy"**

### Opção B: Pelo Railway CLI (se preferir terminal)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## 3. Configurar variáveis de ambiente no Railway

Após o deploy iniciar, vá para:
1. **Project Settings** → **Variables**
2. Adicione as seguintes variáveis (copie exatamente):

| Variável | Valor |
|----------|-------|
| `PORT` | `3001` |
| `MONGODB_URI` | `mongodb+srv://boxmotors:4qTv5jBdPUdiIVhm@cluster0.drgw0hf.mongodb.net/?appName=Cluster0` |
| `JWT_SECRET` | `sua-chave-jwt-segura-bem-longa-e-aleatoria-aqui` |
| `DEEPSEEK_API_KEY` | `sk-xxxxx` (sua chave real do DeepSeek) |
| `FRONTEND_URL` | `http://localhost:3000` (será atualizado após deploy Vercel) |

⚠️ **IMPORTANTE**: 
- `JWT_SECRET` deve ser uma string aleatória longa e segura. Você pode gerar uma em: https://generate-random.org/ ou usar:
  ```
  openssl rand -base64 32
  ```
- `DEEPSEEK_API_KEY`: obtenha em https://platform.deepseek.com/api_keys

## 4. Definir root do projeto no Railway

Por padrão, Railway procura `package.json` na raiz. Como o nosso está em `backend/`:

1. Vá para **Project Settings** → **Deploy**
2. Defina **Root Directory** como: `backend`
3. Defina **Start Command** como: `npm start` (ou `npm run dev` se for testing)

## 5. Aguardar o deploy

- Railway iniciará o build automaticamente
- Veja os logs em **Deployments** → **View Logs**
- Se tudo correr bem, você verá: `listening on port 3001` ou similar

## 6. Obter a URL do Railway

1. Vá para a aba **Deployment**
2. Procure por **"Railway URL"** ou **"Custom Domain"**
3. Copie a URL (ex: `https://projeto-box-control-prod.up.railway.app`)
4. Salve para o próximo passo (deploy frontend)

## 7. Testar endpoint do backend

No Postman ou navegador, teste:
```
GET https://SUA_RAILWAY_URL/api/health
```

Deve retornar:
```json
{
  "status": "OK",
  "timestamp": "2025-11-30T..."
}
```

## 8. Troubleshooting

### ❌ Erro: "Cannot find module 'express'"
- Verifique se `backend/package.json` existe e contém todas as dependências
- Rode `npm install` localmente e faça commit de `package-lock.json`

### ❌ Erro: "EADDRINUSE: address already in use :::3001"
- Railway fornece a porta automaticamente via variável `PORT`
- Edite `backend/src/server.js` e garanta que usa:
  ```javascript
  const port = process.env.PORT || 3001;
  ```

### ❌ Erro: "Cannot connect to MongoDB"
- Verifique se `MONGODB_URI` no Railway está correto
- Teste localmente: `mongo <SEU_URI>`
- Confirme que IP está allowlisted em MongoDB Atlas (deve estar `0.0.0.0/0`)

### ❌ Build falha
- Verifique logs em Railway: **Deployments** → **View Logs**
- Procure erros de sintaxe em `backend/src/**/*.js`
- Garanta Node.js 18+ no `backend/package.json`: `"engines": { "node": ">=18.0.0" }`

## Próximo passo
Após confirmar que Railway está rodando, vamos:
1. Atualizar `frontend/app-api.js` com a URL do Railway
2. Fazer deploy do frontend no Vercel
3. Testar integração completa
