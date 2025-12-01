/* =========================================
   IA COM DEEPSEEK (MODELO V3)
   ========================================= */

// Agora a chave está protegida no backend!
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
  if (btn) btn.style.display = 'none';
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
  // Chamada para backend (a API key está segura lá)
  const result = await apiCall('/ai/ask', 'POST', { userText });

  if (result && result.success) {
    console.log("🤖 Ação executada:", result.action);
    showToast(`✅ ${result.action === 'add_tx' ? 'Transação' : 'Recorrente'} adicionada!`);
    await updateUI();
  } else {
    console.error("FALHA:", result?.error);
    showToast(`Erro: ${result?.error || 'Desconhecido'}`);
  }
}
