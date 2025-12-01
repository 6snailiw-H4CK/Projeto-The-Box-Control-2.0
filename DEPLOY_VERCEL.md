# Deploy Frontend no Vercel - Guia Passo a Passo

## 1. Preparar frontend para o Vercel

### ✅ Arquivo: `app-api.js`
Deve conter a variável `API_BASE_URL` que aponta para o backend:

```javascript
// No topo do app-api.js
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001'
  : 'https://SEU_RAILWAY_URL.up.railway.app'; // Substitua pela URL do Railway
```

### ✅ Arquivo: `index.html`
Garanta que está carregando `app-api.js` (não `app.js`):

```html
<script src="app-api.js"></script>
```

### ✅ Criar `vercel.json` (opcional, mas recomendado)
Na **raiz do repositório** (onde está `app-api.js`), crie:

```json
{
  "buildCommand": "echo 'Frontend estático - sem build'",
  "outputDirectory": ".",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 2. Criar conta no Vercel (se não tiver)
- Acesse: https://vercel.com
- Clique em **"Sign Up"** e escolha login com GitHub (recomendado)
- Autorize Vercel a acessar seus repositórios

## 3. Deploy do frontend no Vercel

### Opção A: Pelo dashboard do Vercel (mais fácil)
1. Acesse https://vercel.com/dashboard
2. Clique em **"Add New Project"**
3. Selecione **"Import Git Repository"**
4. Procure **`Projeto-The-Box-Control-2.0`** e clique em **"Import"**
5. Configure as variáveis de ambiente (veja abaixo)
6. Clique em **"Deploy"**

### Opção B: Pelo Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

## 4. Configurar variáveis de ambiente no Vercel

Durante o deploy ou em **Project Settings → Environment Variables**, adicione:

| Variável | Valor |
|----------|-------|
| `REACT_APP_API_URL` | `https://SEU_RAILWAY_URL.up.railway.app` |

Substitua `SEU_RAILWAY_URL` pela URL que você copiou do Railway.

## 5. Aguardar o deploy

- Vercel fará o deploy automaticamente
- Veja o progresso em **Deployments**
- Quando terminar, você verá a URL do seu site (ex: `https://projeto-box-control.vercel.app`)

## 6. Testar o frontend

1. Acesse a URL do Vercel que foi gerada
2. Teste o login:
   - **DEMO**: licenseKey = `DEMO` (sem mic de IA)
   - **PRO**: licenseKey = `BOXPRO` (com mic de IA)
3. Tente criar uma transação (deve sincronizar com MongoDB via backend)
4. Tente usar o mic de IA (se PRO)

## 7. Atualizar `app-api.js` com a URL do Railway

Após confirmar que Railway está rodando:

1. Abra `app-api.js`
2. Procure por `API_BASE_URL`
3. Atualize com a URL do Railway:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001'
  : 'https://seu-projeto-railway.up.railway.app';
```
4. Salve e faça commit:
```bash
git add app-api.js
git commit -m "Atualizar API_BASE_URL para Railway em produção"
git push origin main
```
5. Vercel fará redeploy automaticamente

## 8. Testar fluxo completo

1. **Login**
   - Email: `test@example.com`
   - Senha: `12345`
   - License: `BOXPRO`

2. **Verificar conexão com backend**
   - Abra DevTools (F12) → Console
   - Procure por erros de CORS ou conexão recusada

3. **Testar funcionalidades**
   - Adicionar transação
   - Usar IA (mock ou real se DeepSeek key estiver configurada)
   - Download de backup

## 9. Configurar domínio customizado (opcional)

No Vercel:
1. Vá para **Project Settings → Domains**
2. Adicione seu domínio customizado (ex: `app.seudominio.com`)
3. Siga as instruções para adicionar registros DNS

## 10. Troubleshooting

### ❌ Erro: "Cannot reach backend"
- Verifique se Railway está rodando
- Abra DevTools → Network, procure requests falhando
- Confirme URL do Railway em `app-api.js`
- Verifique CORS em `backend/src/server.js` (deve incluir `FRONTEND_URL`)

### ❌ Erro: "CORS error"
- No `backend/src/server.js`, atualize:
```javascript
const CORS_OPTIONS = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://seu-projeto-vercel.vercel.app',
    'https://SEU_RAILWAY_URL.up.railway.app'
  ],
  credentials: true
};

app.use(cors(CORS_OPTIONS));
```
- Faça commit e redeploy no Railway

### ❌ Erro: "401 Unauthorized"
- Verifique se JWT_TOKEN está sendo armazenado corretamente
- Abra DevTools → Application → LocalStorage
- Procure por `token` ou `jwt`
- Se vazio, fazer login novamente

### ❌ Página em branco / erro no console
- Abra DevTools → Console
- Verifique se `app-api.js` está carregando
- Procure erros de sintaxe JavaScript
- Se Vercel falhar, rode localmente: `python -m http.server 8000`

## Próximos passos

1. ✅ Backend rodando no Railway
2. ✅ Frontend rodando no Vercel
3. ✅ Ambos comunicando via HTTPS
4. ⏭️ Testar fluxo completo de produção
5. ⏭️ (Opcional) Configurar CI/CD pipeline no GitHub Actions
6. ⏭️ (Opcional) Configurar backups automáticos do MongoDB
