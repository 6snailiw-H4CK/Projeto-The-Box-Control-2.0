const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// ===== SET DEFAULT ENVIRONMENT VARIABLES =====
// Se não encontrar no .env (Railway não tem .env), usar padrões
if (!process.env.ADMIN_EMAIL) process.env.ADMIN_EMAIL = 'admin';
if (!process.env.ADMIN_PASSWORD) process.env.ADMIN_PASSWORD = '1570';
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'K8c7sN9uR4pQ2tZ1bYfH6mLxE3vA0qW';
if (!process.env.JWT_EXPIRE) process.env.JWT_EXPIRE = '7d';
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
if (!process.env.FRONTEND_URL) process.env.FRONTEND_URL = 'https://the-box-control-2-0.vercel.app';

console.log('🔧 Environment Config:');
console.log(`   ADMIN_EMAIL: ${process.env.ADMIN_EMAIL}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL}`);
console.log(`   MongoDB: ${process.env.MONGODB_URI ? '✅ Configurado' : '❌ Faltando'}`);
console.log(`   DeepSeek Key: ${process.env.DEEPSEEK_API_KEY ? '✅ Configurado' : '❌ Faltando'}`);
if (process.env.DEEPSEEK_API_KEY) {
  const key = process.env.DEEPSEEK_API_KEY;
  console.log(`     → Chave inicia com: ${key.substring(0, 10)}...`);
  console.log(`     → Comprimento: ${key.length} caracteres`);
}

const app = express();

// ===== TRUST PROXY =====
// Necessário para Railway/Vercel pegar corretamente o IP real do usuário
// Importante para rate limiting e logging
app.set('trust proxy', 1);

// ===== MIDDLEWARES =====
app.use(express.json({ limit: '10mb' }));

// Permitir múltiplas origens (dev e produção)
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5500',
  'http://localhost:5173',
  'https://the-box-control-2-0.vercel.app',
  'https://projeto-the-box-control-20-production.up.railway.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS warning - origin not in whitelist:', origin);
      callback(null, true); // Permitir mesmo assim para debug
    }
  },
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  keyGenerator: (req, res) => {
    // Em produção, pegar IP do X-Forwarded-For (Railway)
    return req.ip || req.connection.remoteAddress;
  },
  skip: (req, res) => {
    // Não aplicar rate limit a health checks
    return req.path === '/api/health';
  }
});
app.use('/api/', limiter);

// ===== DATABASE CONNECTION =====
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Erro MongoDB:', err.message));

// ===== ROTAS =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/recurring', require('./routes/recurring'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/backup', require('./routes/backup'));
app.use('/api/ai', require('./routes/ai'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message,
    status: err.status || 500
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
