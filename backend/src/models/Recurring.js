const mongoose = require('mongoose');

const recurringSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  desc: {
    type: String,
    required: true
  },
  valor: {
    type: Number,
    required: true,
    min: 0
  },
  dia: {
    type: Number,
    required: true,
    min: 1,
    max: 31
  },
  history: {
    type: Map,
    of: String, // 'pago' ou 'pendente'
    default: {}
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recurring', recurringSchema);
