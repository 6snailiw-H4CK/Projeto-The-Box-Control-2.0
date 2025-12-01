const express = require('express');
const Transaction = require('../models/Transaction');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// ===== GET ALL TRANSACTIONS =====
router.get('/', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, categoria } = req.query;
    const query = { userId: req.userId };

    if (startDate || endDate) {
      query.data = {};
      if (startDate) query.data.$gte = new Date(startDate);
      if (endDate) query.data.$lte = new Date(endDate);
    }

    if (categoria) {
      query.categoria = categoria;
    }

    const transactions = await Transaction.find(query).sort({ data: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CREATE TRANSACTION =====
router.post('/', verifyToken, async (req, res) => {
  try {
    // Normalizar campos (suportar tanto em PT quanto EN)
    const tipo = req.body.tipo || req.body.type;
    const categoria = req.body.categoria || req.body.category;
    const descricao = req.body.descricao || req.body.description;
    const valor = req.body.valor || req.body.amount;
    const data = req.body.data || req.body.date;

    if (!tipo || !categoria || !descricao || !valor || !data) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (valor <= 0) {
      return res.status(400).json({ error: 'Valor deve ser maior que zero' });
    }

    const transaction = new Transaction({
      userId: req.userId,
      tipo,
      categoria,
      descricao,
      valor,
      data: new Date(data)
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== UPDATE TRANSACTION =====
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== DELETE TRANSACTION =====
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json({ message: 'Transação deletada', transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== GET SUMMARY =====
router.get('/summary/stats', verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });

    const income = transactions
      .filter(t => t.tipo === 'income')
      .reduce((sum, t) => sum + t.valor, 0);

    const expense = transactions
      .filter(t => t.tipo === 'expense')
      .reduce((sum, t) => sum + t.valor, 0);

    const byCategory = {};
    transactions
      .filter(t => t.tipo === 'expense')
      .forEach(t => {
        byCategory[t.categoria] = (byCategory[t.categoria] || 0) + t.valor;
      });

    res.json({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      byCategory,
      totalTransactions: transactions.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
