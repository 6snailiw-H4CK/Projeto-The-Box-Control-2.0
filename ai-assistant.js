/* =========================================
   IA COM DEEPSEEK (MODELO V3)
   ========================================= */

// ⚠️ COLE SUA CHAVE DEEPSEEK AQUI (Começa com sk-...)
const DEEPSEEK_API_KEY = 'sk-d988d72086714703b86a3e160224e29c'; 

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

// Configuração do microfone
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = false;
} else {
  console.warn("Navegador sem suporte a voz.");
  const btn = document.getElementById('aiMic');
  if(btn) btn.style.display = 'none';
}

function toggleVoiceAssistant() {
  if (!recognition) return alert("Use Chrome, Edge ou Samsung Internet.");
  
  const btn = document.getElementById('aiMic');
  
  if (btn.classList.contains('listening')) {
    recognition.stop();
    btn.classList.remove('listening');
    btn.innerHTML = "🎙️";
    return;
  }

  recognition.start();
  btn.classList.add('listening');
  btn.innerHTML = "👂";
  showToast("Ouvindo...");

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    btn.classList.remove('listening');
    btn.innerHTML = "⏳";
    
    console.log("🎤 Texto:", transcript);
    showToast(`Processando...`);
    
    await askDeepSeek(transcript);
    
    btn.innerHTML = "🎙️";
  };

  recognition.onerror = (e) => {
    btn.classList.remove('listening');
    btn.innerHTML = "🎙️";
    console.error("Erro mic:", e);
    showToast("Erro ao ouvir.");
  };
}

async function askDeepSeek(userText) {
  if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.includes('COLE_SUA')) {
    alert("ERRO: Configure a chave DeepSeek no arquivo ai-assistant.js");
    return;
  }

  // Prepara contexto
  const today = new Date().toISOString().split('T')[0];
  let catsList = "Geral, Outros";
  if (typeof state !== 'undefined' && state.categories) {
      catsList = state.categories.join(', ');
  }

  // Configuração da chamada API
  const url = 'https://api.deepseek.com/chat/completions';
  
  const systemPrompt = `
    Você é uma API JSON para um app financeiro.
    Data de hoje: ${today}.
    Categorias existentes: ${catsList}.
    
    Analise a frase do usuário e retorne um JSON.
    
    PADRÕES DE RESPOSTA (Use exatamente este formato):
    
    1. PARA DESPESAS:
    { "action": "add_tx", "tipo": "expense", "desc": "Descrição curta", "val": 0.00, "cat": "Categoria mais próxima", "data": "YYYY-MM-DD" }
    
    2. PARA RECEITAS:
    { "action": "add_tx", "tipo": "income", "desc": "Descrição curta", "val": 0.00, "cat": "Categoria mais próxima", "data": "YYYY-MM-DD" }
    
    3. PARA RECORRENTES (Contas fixas mensais):
    { "action": "add_rec", "desc": "Descrição", "val": 0.00, "dia": 1 }
  `;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", // Modelo V3
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userText }
        ],
        response_format: { type: "json_object" }, // Força resposta JSON
        temperature: 0.1 // Criatividade baixa para ser preciso
      })
    });

    if (!response.ok) {
       const errData = await response.json();
       throw new Error(`Erro DeepSeek: ${errData.error?.message || response.status}`);
    }

    const data = await response.json();
    const aiText = data.choices[0].message.content;

    console.log("🤖 Resposta DeepSeek:", aiText);
    
    // A DeepSeek com "json_object" já manda limpo, mas por segurança fazemos parse direto
    const cmd = JSON.parse(aiText);
    executeAIAction(cmd);

  } catch (error) {
    console.error("FALHA API:", error);
    showToast(`Erro: ${error.message}`);
  }
}

function executeAIAction(cmd) {
  if (typeof state === 'undefined') return;

  if (cmd.action === 'add_tx') {
    const newTx = {
      id: 'ai_' + Date.now(),
      tipo: cmd.tipo,
      categoria: cmd.cat || 'Outros',
      descricao: cmd.desc,
      valor: Number(cmd.val),
      data: cmd.data
    };
    state.tx.push(newTx);
    saveState();
    updateUI();
    showToast(`✅ Salvo: ${cmd.desc} (R$ ${cmd.val})`);
  } 
  else if (cmd.action === 'add_rec') {
    const newRec = {
      id: 'ai_rec_' + Date.now(),
      desc: cmd.desc,
      valor: Number(cmd.val),
      dia: cmd.dia,
      history: {}
    };
    if(!state.recurring) state.recurring = [];
    state.recurring.push(newRec);
    saveState();
    if(document.getElementById('rec-page').style.display !== 'none') renderRecList();
    showToast(`🔄 Recorrente: ${cmd.desc}`);
  }
}