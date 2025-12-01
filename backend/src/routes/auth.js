const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// ===== REGISTER =====
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Usuário já existe' });
    }

    const user = new User({ name, email, phone, password });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: user.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== LOGIN =====
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Admin hardcoded (opcional)
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { id: 'admin', email: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
      return res.json({
        message: 'Admin login bem-sucedido',
        token,
        user: { id: 'admin', email: 'admin', name: 'Master' }
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login bem-sucedido',
      token,
      user: user.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== GET USER (verificar token) =====
router.get('/me', verifyToken, async (req, res) => {
  try {
    if (req.userId === 'admin') {
      return res.json({ 
        id: 'admin', 
        email: 'admin', 
        name: 'Master',
        licenseKey: 'BOXPRO'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== UPDATE USER =====
router.put('/me', verifyToken, async (req, res) => {
  try {
    const { name, phone, theme } = req.body;

    if (req.userId === 'admin') {
      return res.status(403).json({ error: 'Admin não pode ser editado' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, theme, updatedAt: Date.now() },
      { new: true }
    );

    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== UPDATE LICENSE =====
router.put('/me/license', verifyToken, async (req, res) => {
  try {
    const { licenseKey } = req.body;

    // Admin usa licença padrão
    if (req.userId === 'admin') {
      return res.json({ 
        message: 'Admin sempre tem licença PRO',
        licenseKey: 'BOXPRO',
        user: { id: 'admin', email: 'admin', name: 'Master', licenseKey: 'BOXPRO' }
      });
    }

    // Aceitar null (para desativar) ou BOXPRO
    if (licenseKey && licenseKey !== 'BOXPRO') {
      return res.status(400).json({ error: 'Chave inválida' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { licenseKey: licenseKey || null, updatedAt: Date.now() },
      { new: true }
    );

    res.json({
      message: licenseKey ? 'Licença ativada com sucesso' : 'Licença desativada',
      user: user.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== RESET ALL USERS (Development/Admin) =====
router.delete('/reset-all-users', async (req, res) => {
  try {
    // Validação simples - em produção, adicionar autenticação mais robusta
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.JWT_SECRET) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const result = await User.deleteMany({});
    res.json({ 
      message: 'Todos os usuários foram deletados',
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
