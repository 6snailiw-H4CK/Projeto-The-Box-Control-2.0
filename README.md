# 🎯 THE BOX CONTROL 2.0
**GESTOR FINANCEIRO COM BACKEND SEGURO**

## ✨ O que é?

Aplicação web para controle financeiro com:
- 💰 Transações (receitas/despesas)
- 📅 Contas recorrentes
- 🤖 IA com reconhecimento de voz (DeepSeek)
- 💾 Backup/Restore
- 🔐 Autenticação segura (JWT)
- 📊 Gráficos de gastos

## 🏗️ Arquitetura (100% Segura)

```
Frontend (Vercel - grátis)
    ↓ HTTPS
Backend (Railway - $5 grátis/mês)
    ↓
MongoDB Atlas (512MB grátis)
```

## 🔐 Segurança

✅ Senhas com bcrypt  
✅ API Keys protegidas  
✅ Autenticação JWT  
✅ Rate limiting  
✅ Dados no servidor  
✅ CORS restritivo  

## 🚀 Começar

### Desenvolvimento
```bash
cd backend && npm install && npm run dev
# Em outro terminal: abrir index.html com Live Server
```

### Produção
Ver `SETUP_E_DEPLOYMENT.md` para deploy grátis

## 📋 Estrutura

```
backend/          → API Node.js/Express
app-api.js        → Frontend com API
ai-assistant-api.js → IA segura
index.html        → Interface
styles.css        → Estilos
```

## 📖 Documentação

- `SETUP_E_DEPLOYMENT.md` - Instruções completas
- `ANALISE_E_PLANO_MIGRACAO.md` - Análise técnica
- `RESUMO_MIGRACAO.md` - O que mudou

## 📊 Stack

- Frontend: HTML5, CSS3, JS vanilla
- Backend: Node.js, Express, MongoDB
- Auth: JWT + bcrypt
- IA: DeepSeek API
- Deploy: Railway + Vercel + MongoDB Atlas

---
**Versão 2.0 | Nov 2025**
