const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  tipo: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  categoria: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  valor: {
    type: Number,
    required: true,
    min: 0
  },
  data: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índice para buscar transações por usuário e data
transactionSchema.index({ userId: 1, data: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
