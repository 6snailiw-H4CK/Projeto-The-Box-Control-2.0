const express = require('express');
const Category = require('../models/Category');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

const DEFAULT_CATS = ['Combustível', 'Peças', 'Serviços', 'Marketing', 'Outros'];

// Helper para converter admin user
function getUserId(userIdFromToken) {
  return userIdFromToken === 'admin' ? 'admin-user-id' : userIdFromToken;
}

// ===== GET ALL CATEGORIES =====
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req.userId);
    let categories = await Category.find({ userId });
    
    if (categories.length === 0) {
      // Criar categorias padrão
      const defaultCategories = DEFAULT_CATS.map(name => ({
        userId,
        name
      }));
      categories = await Category.insertMany(defaultCategories);
    }

    res.json(categories.map(c => c.name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CREATE CATEGORY =====
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req.userId);
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
    }

    const existing = await Category.findOne({ userId, name });
    if (existing) {
      return res.status(409).json({ error: 'Categoria já existe' });
    }

    const category = new Category({ userId, name });
    await category.save();

    res.status(201).json({ message: 'Categoria criada', name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== DELETE CATEGORY =====
router.delete('/:name', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req.userId);
    const category = await Category.findOneAndDelete({
      userId,
      name: req.params.name
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json({ message: 'Categoria deletada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
