const express = require('express');
const Transaction = require('../models/Transaction');
const Recurring = require('../models/Recurring');
const Category = require('../models/Category');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// ===== DOWNLOAD BACKUP (JSON) =====
router.get('/download/json', verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });
    const recurring = await Recurring.find({ userId: req.userId });
    const categories = await Category.find({ userId: req.userId });

    const backup = {
      timestamp: new Date(),
      tx: transactions,
      recurring: recurring,
      categories: categories.map(c => c.name),
      licenseKey: null
    };

    res.json(backup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== UPLOAD BACKUP (JSON) =====
router.post('/restore/json', verifyToken, async (req, res) => {
  try {
    const { tx, recurring, categories } = req.body;

    if (!Array.isArray(tx)) {
      return res.status(400).json({ error: 'Arquivo de backup inválido' });
    }

    // Limpar dados antigos
    await Transaction.deleteMany({ userId: req.userId });
    await Recurring.deleteMany({ userId: req.userId });
    await Category.deleteMany({ userId: req.userId });

    // Restaurar transações
    const txToRestore = tx.map(t => ({
      ...t,
      userId: req.userId
    }));
    await Transaction.insertMany(txToRestore);

    // Restaurar recorrentes
    if (recurring && recurring.length > 0) {
      const recToRestore = recurring.map(r => ({
        ...r,
        userId: req.userId
      }));
      await Recurring.insertMany(recToRestore);
    }

    // Restaurar categorias
    if (categories && categories.length > 0) {
      const catToRestore = categories.map(name => ({
        userId: req.userId,
        name
      }));
      await Category.insertMany(catToRestore);
    }

    res.json({ message: 'Backup restaurado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== EXPORT CSV =====
router.get('/download/csv', verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });

    let csv = "ID;Tipo;Categoria;Descrição;Valor;Data\n";
    transactions.forEach(t => {
      csv += `${t._id};${t.tipo};${t.categoria};"${t.descricao}";${String(t.valor).replace('.', ',')};${t.data.toISOString().split('T')[0]}\n`;
    });

    res.setHeader('Content-Type', 'text/csv;charset=utf-8;');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
