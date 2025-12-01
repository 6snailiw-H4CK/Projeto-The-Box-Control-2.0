# 🚀 INSTRUÇÕES DE SETUP E DEPLOYMENT

## 📋 PRÉ-REQUISITOS

- Node.js 18+ (baixar em https://nodejs.org/)
- Git (baixar em https://git-scm.com/)
- Conta no MongoDB Atlas (grátis em https://www.mongodb.com/cloud/atlas)
- Conta no Railway (https://railway.app)
- Conta no Vercel (https://vercel.com)

---

## 🔧 SETUP LOCAL (Desenvolvimento)

### 1️⃣ BACKEND

```bash
# Entrar na pasta do backend
cd backend

# Instalar dependências
npm install

# Criar arquivo .env baseado em .env.example
cp .env.example .env

# Preencher o .env com suas credenciais:
# - MongoDB URI
# - DeepSeek API Key
# - JWT Secret
# etc...

# Iniciar servidor (desenvolvimento com auto-reload)
npm run dev

# Servidor rodará em: http://localhost:3000
```

### 2️⃣ FRONTEND

```bash
# Na pasta raiz do projeto

# Opção 1: Use Live Server (VS Code Extension)
# Instale: "Live Server" by Ritwick Dey

# Opção 2: Usar Python (se tiver)
python -m http.server 8000

# Acesse: http://localhost:8000
```

### 3️⃣ EDITAR HTML DO FRONTEND

**Abra `index.html` e mude a linha do script:**

```html
<!-- ANTES (frontend antigo) -->
<script src="app.js"></script>

<!-- DEPOIS (novo com API) -->
<script src="app-api.js"></script>
```

**E também para o AI:**

```html
<!-- ANTES -->
<script src="ai-assistant.js"></script>

<!-- DEPOIS -->
<script src="ai-assistant-api.js"></script>
```

---

## 🗄️ SETUP DO MONGODB ATLAS (Banco Grátis)

1. Ir em: https://www.mongodb.com/cloud/atlas
2. Criar conta grátis
3. Criar um "Cluster" (M0 - Grátis)
4. Ir em "Database Access" → Criar usuário com senha
5. Ir em "Network Access" → Adicionar IP `0.0.0.0/0` (permite de qualquer lugar)
6. Clicar em "Connect" → Escolher "Drivers" → Copiar string de conexão

Exemplo de string:
```
mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/boxmotors?retryWrites=true&w=majority
```

Colar em `.env`:
```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/boxmotors?retryWrites=true&w=majority
```

---

## 🚀 DEPLOYMENT NO RAILWAY (Backend + Banco Grátis)

### 1️⃣ Criar repositório Git

```bash
cd backend
git init
git add .
git commit -m "Primeiro commit"
```

### 2️⃣ Fazer Push no GitHub

```bash
# Criar repo no GitHub (https://github.com/new)
git remote add origin https://github.com/seu-usuario/seu-repo.git
git branch -M main
git push -u origin main
```

### 3️⃣ Deploy no Railway

1. Ir em: https://railway.app
2. Conectar com GitHub
3. Clicar "New Project" → "Deploy from GitHub repo"
4. Selecionar seu repositório
5. Railway detectará como Node.js automaticamente
6. Clicar em "Deploy"
7. Ir em "Variables" e adicionar suas chaves de `.env`

Railway fornece:
- 🆓 PostgreSQL (5GB grátis) OU
- 🆓 MongoDB (incluso via plugin)
- 🆓 Node.js runtime
- 💳 $5/mês crédito grátis

---

## 🌐 DEPLOYMENT DO FRONTEND NO VERCEL

### 1️⃣ Fazer Push no GitHub

```bash
# Na raiz do projeto (não backend!)
git init
git add .
git commit -m "Primeiro commit - The Box"
git remote add origin https://github.com/seu-usuario/the-box-frontend.git
git push -u origin main
```

### 2️⃣ Deploy no Vercel

1. Ir em: https://vercel.com
2. Clicar "New Project"
3. Conectar GitHub
4. Selecionar seu repositório
5. **IMPORTANTE**: Em "Environment Variables", adicionar:

```env
REACT_APP_API_URL=https://seu-backend-railroad.up.railway.app/api
```

6. Clicar "Deploy"

Vercel fornece:
- 🆓 Hosting ilimitado
- 🆓 CDN global
- 🆓 HTTPS automático
- 🆓 Deploy automático ao fazer push

---

## 📱 TESTAR TUDO

### Endpoints disponíveis (via curl ou Postman)

```bash
# ===== AUTENTICAÇÃO =====

# Registrar novo usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@gmail.com","password":"123456"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@gmail.com","password":"123456"}'

# ===== TRANSAÇÕES =====

# Adicionar transação
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo":"expense",
    "categoria":"Combustível",
    "descricao":"Gasolina",
    "valor":50,
    "data":"2025-11-30"
  }'

# Listar transações
curl -X GET http://localhost:3000/api/transactions \
  -H "Authorization: Bearer TOKEN_AQUI"

# ===== CATEGORIAS =====

# Listar categorias
curl -X GET http://localhost:3000/api/categories \
  -H "Authorization: Bearer TOKEN_AQUI"

# ===== RECORRENTES =====

# Listar recorrentes
curl -X GET http://localhost:3000/api/recurring \
  -H "Authorization: Bearer TOKEN_AQUI"
```

---

## 🐛 TROUBLESHOOTING

### Backend não conecta no MongoDB
- ✅ Verificar se a senha do MongoDB tem caracteres especiais (encode com %)
- ✅ Verificar se IP está adicionado em "Network Access"
- ✅ Verificar se a string MONGO_URI está correta no `.env`

### Frontend não conecta no Backend
- ✅ Verificar se URL da API está correta em `app-api.js`
- ✅ Verificar se CORS está habilitado no backend
- ✅ Verificar console do navegador (F12) para erros

### Erro 401 (Não autorizado)
- ✅ Token JWT expirou - fazer login novamente
- ✅ Token não está sendo enviado no header
- ✅ JWT_SECRET não é o mesmo entre servidores

---

## 📚 ESTRUTURA DO PROJETO

```
Projeto-The-Box-Control-2.0/
├── backend/                    # API Node.js/Express
│   ├── src/
│   │   ├── models/            # Schemas MongoDB
│   │   ├── routes/            # Endpoints da API
│   │   ├── middleware/        # Auth, validação
│   │   └── server.js          # Servidor principal
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/                   # React/HTML/CSS/JS
│   ├── index.html
│   ├── app-api.js            # Nova versão com API
│   ├── ai-assistant-api.js   # IA com backend
│   ├── styles.css
│   └── README.md
│
└── ANALISE_E_PLANO_MIGRACAO.md
```

---

## 🔐 SEGURANÇA CHECKLIST

- ✅ API Keys em `.env` (nunca no código)
- ✅ Senhas com bcrypt (10 salts)
- ✅ JWT para autenticação
- ✅ CORS restritivo
- ✅ Rate limiting (100 req/15min)
- ✅ Validação de entrada (Joi)
- ✅ HTTPS em produção (Vercel + Railway)
- ✅ Dados de usuário no MongoDB (não localStorage)

---

## 🎯 PRÓXIMAS FASES

**Fase 2**: Google Sheets Integration
**Fase 3**: WebPush Notifications
**Fase 4**: Mobile App (React Native)
**Fase 5**: Dashboard Analytics

---

**Dúvidas? Abra uma issue no GitHub! 🚀**
