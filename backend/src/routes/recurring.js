const express = require('express');
const Recurring = require('../models/Recurring');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Helper para converter admin user
function getUserId(userIdFromToken) {
  return userIdFromToken === 'admin' ? 'admin-user-id' : userIdFromToken;
}

// ===== GET ALL RECURRING =====
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req.userId);
    const recurring = await Recurring.find({ userId, active: true });
    res.json(recurring);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CREATE RECURRING =====
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req.userId);
    const { desc, valor, dia } = req.body;

    if (!desc || !valor || !dia) {
      return res.status(400).json({ error: 'Descrição, valor e dia são obrigatórios' });
    }

    const recurring = new Recurring({
      userId,
      desc,
      valor,
      dia,
      history: {}
    });

    await recurring.save();
    res.status(201).json(recurring);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== UPDATE RECURRING =====
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req.userId);
    const recurring = await Recurring.findOneAndUpdate(
      { _id: req.params.id, userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!recurring) {
      return res.status(404).json({ error: 'Recorrente não encontrado' });
    }

    res.json(recurring);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== DELETE RECURRING =====
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const recurring = await Recurring.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!recurring) {
      return res.status(404).json({ error: 'Recorrente não encontrado' });
    }

    res.json({ message: 'Recorrente deletado', recurring });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== UPDATE STATUS (Pago/Pendente) =====
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { monthKey, status } = req.body;

    const recurring = await Recurring.findById(req.params.id);
    if (!recurring || recurring.userId.toString() !== req.userId) {
      return res.status(404).json({ error: 'Recorrente não encontrado' });
    }

    if (!recurring.history) recurring.history = {};
    recurring.history[monthKey] = status;
    await recurring.save();

    res.json(recurring);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
