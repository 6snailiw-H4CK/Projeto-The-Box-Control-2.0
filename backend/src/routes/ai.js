const express = require('express');
const axios = require('axios');
const Transaction = require('../models/Transaction');
const Recurring = require('../models/Recurring');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// ===== ASK DEEPSEEK AI =====
router.post('/ask', verifyToken, async (req, res) => {
  try {
    const { userText } = req.body;

    if (!userText) {
      return res.status(400).json({ error: 'Texto não fornecido' });
    }

    // Verificar se DeepSeek está configurado
    const hasDeepSeekKey = process.env.DEEPSEEK_API_KEY && 
                          process.env.DEEPSEEK_API_KEY.startsWith('sk-') &&
                          process.env.DEEPSEEK_API_KEY.length > 10;

    if (!hasDeepSeekKey) {
      // Modo fallback: retornar erro com mensagem útil
      return res.status(503).json({ 
        error: 'DeepSeek IA não configurado',
        message: 'Configure DEEPSEEK_API_KEY no Railway para ativar a IA',
        hint: 'Obtenha uma chave em https://platform.deepseek.com/api_keys'
      });
    }

    // Obter categorias do usuário
    const transactions = await Transaction.find({ userId: req.userId });
    const categories = [...new Set(transactions.map(t => t.categoria))];
    const catsList = categories.length > 0 ? categories.join(', ') : 'Geral, Outros';

    const today = new Date().toISOString().split('T')[0];

    const systemPrompt = `
      Você é uma API JSON para um app financeiro.
      Data de hoje: ${today}.
      Categorias existentes: ${catsList}.
      
      Analise a frase do usuário e retorne um JSON válido.
      
      PADRÕES DE RESPOSTA (Use exatamente este formato):
      
      1. PARA DESPESAS:
      { "action": "add_tx", "tipo": "expense", "desc": "Descrição curta", "val": 0.00, "cat": "Categoria mais próxima", "data": "YYYY-MM-DD" }
      
      2. PARA RECEITAS:
      { "action": "add_tx", "tipo": "income", "desc": "Descrição curta", "val": 0.00, "cat": "Categoria mais próxima", "data": "YYYY-MM-DD" }
      
      3. PARA RECORRENTES (Contas fixas mensais):
      { "action": "add_rec", "desc": "Descrição", "val": 0.00, "dia": 1 }
    `;

    const response = await axios.post('https://api.deepseek.com/chat/completions', {
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userText }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiText = response.data.choices[0].message.content;
    const cmd = JSON.parse(aiText);

    // Executar ação da IA
    if (cmd.action === 'add_tx') {
      const transaction = new Transaction({
        userId: req.userId,
        tipo: cmd.tipo,
        categoria: cmd.cat || 'Outros',
        descricao: cmd.desc,
        valor: Number(cmd.val),
        data: new Date(cmd.data)
      });
      await transaction.save();
      return res.json({ success: true, action: 'add_tx', data: transaction });
    }

    if (cmd.action === 'add_rec') {
      const recurring = new Recurring({
        userId: req.userId,
        desc: cmd.desc,
        valor: Number(cmd.val),
        dia: cmd.dia,
        history: {}
      });
      await recurring.save();
      return res.json({ success: true, action: 'add_rec', data: recurring });
    }

    res.json({ success: false, message: 'Ação não reconhecida' });
  } catch (err) {
    console.error('AI Error:', err.message);
    res.status(500).json({ error: err.message || 'Erro ao processar IA' });
  }
});

module.exports = router;
