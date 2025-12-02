/* ==================================================
  CONFIGURAÇÃO DA API
  ================================================== */
const API_BASE_URL = (typeof process !== 'undefined' && process && process.env && process.env.REACT_APP_API_URL)
  ? process.env.REACT_APP_API_URL
  : 'https://projeto-the-box-control-20-production.up.railway.app/api';

// read auth token from localStorage (fallback safe)
let authToken = null;
try { authToken = localStorage.getItem('authToken'); } catch (e) { authToken = null; }

/* ==================================================
   MODAL PERSONALIZADO & UTILITÁRIOS
   ================================================== */
function showConfirm(message, onConfirm) {
  document.getElementById('modal-msg').textContent = message;
  document.getElementById('custom-modal').style.display = 'flex';
  const btn = document.getElementById('modal-confirm-btn');
  const newBtn = btn.cloneNode(true);
  newBtn.textContent = "Confirmar";
  btn.parentNode.replaceChild(newBtn, btn);
  newBtn.addEventListener('click', () => {
    closeModal();
    if (onConfirm) onConfirm();
  });
}

function showAlert(message) {
  document.getElementById('modal-msg').textContent = message;
  document.getElementById('custom-modal').style.display = 'flex';
  const btn = document.getElementById('modal-confirm-btn');
  const newBtn = btn.cloneNode(true);
  newBtn.textContent = "OK";
  btn.parentNode.replaceChild(newBtn, btn);
  newBtn.addEventListener('click', () => closeModal());
}

function closeModal() { document.getElementById('custom-modal').style.display = 'none'; }

function showToast(msg) {
  const x = document.getElementById("toast");
  x.textContent = msg; x.className = "show";
  setTimeout(() => x.className = x.className.replace("show", ""), 3000);
}

/* ==================================================
   API HELPER
   ================================================== */
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (response.status === 401) {
      doLogout();
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error('API Error:', err);
    showToast('Erro ao conectar com servidor');
    return null;
  }
}

/* ==================================================
   GESTÃO DE DADOS
   ================================================== */
let currentUser = null;
let state = { tx: [], categories: [], recurring: [], licenseKey: null };

function loadState() {
  // Estado agora vem do servidor via API
  updateUI();
}

function saveState() {
  // Dados salvos no servidor automaticamente
}

/* ==================================================
   AUTENTICAÇÃO
   ================================================== */
function toggleAuth(view) {
  document.getElementById('login-view').style.display = view === 'login' ? 'block' : 'none';
  document.getElementById('register-view').style.display = view === 'register' ? 'block' : 'none';
}

async function doLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value.trim();

  if (!u || !p) {
    showAlert('Preencha email e senha');
    return;
  }

  showToast('Autenticando...');

  const result = await apiCall('/auth/login', 'POST', {
    email: u,
    password: p
  });

  if (result && result.token) {
    authToken = result.token;
    localStorage.setItem('authToken', authToken);
    setUser(result.user);
  } else {
    document.getElementById('loginError').style.display = 'block';
  }
}

function setUser(user) {
  currentUser = user;
  state.licenseKey = user.licenseKey || null;
  document.getElementById('auth-container').style.display = 'none';
  document.getElementById('app-content').style.display = 'block';
  document.getElementById('currentUserDisplay').textContent = `Logado: ${user.name || user.email}`;
  checkLicense();
  initApp();
}

function doLogout() {
  localStorage.removeItem('authToken');
  authToken = null;
  currentUser = null;
  location.reload();
}

async function doRegister() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const pass = document.getElementById('regPass').value.trim();
  const btn = document.getElementById('btnReg');

  if (!email || !pass || !name) {
    showAlert('Preencha todos os campos.');
    return;
  }

  btn.disabled = true;
  btn.textContent = "Salvando...";

  const result = await apiCall('/auth/register', 'POST', {
    name,
    email,
    phone,
    password: pass
  });

  btn.disabled = false;
  btn.textContent = "Cadastrar";

  if (result && result.token) {
    authToken = result.token;
    localStorage.setItem('authToken', authToken);
    setUser(result.user);
    showAlert('Conta criada com sucesso!');
  } else {
    showAlert('Erro ao criar conta: ' + (result?.error || 'Desconhecido'));
  }
}

function resetSystemUsers() {
  showConfirm('⚠️ DELETAR TODOS OS USUÁRIOS E DADOS?\n\nEsta ação é IRREVERSÍVEL!', async () => {
    showToast('Deletando todos os usuários...');
    
    // Fazer requisição especial com header de admin
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-all-users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.JWT_SECRET || 'K8c7sN9uR4pQ2tZ1bYfH6mLxE3vA0qW'
        }
      });

      const result = await response.json();

      if (response.ok) {
        showAlert(`✅ Sucesso!\n\n${result.deletedCount} usuário(s) deletado(s).\n\nRecarregando...`);
        setTimeout(() => location.reload(), 2000);
      } else {
        showAlert('❌ Erro ao deletar usuários: ' + result.error);
      }
    } catch (err) {
      console.error('Erro:', err);
      showAlert('❌ Erro ao conectar com servidor');
    }
  });
}

/* ==================================================
   CORE APP
   ================================================== */
const DEFAULT_CATS = ['Combustível', 'Peças', 'Serviços', 'Marketing', 'Outros'];

async function initApp() {
  document.getElementById('data').value = new Date().toISOString().slice(0, 10);
  await ensureDefaults();
  applyTheme();
  checkLicense();
  await updateUI();
}

async function ensureDefaults() {
  try {
    const catResult = await apiCall('/categories');
    if (catResult && Array.isArray(catResult)) {
      state.categories = catResult;
    } else {
      state.categories = DEFAULT_CATS;
    }
  } catch (err) {
    state.categories = DEFAULT_CATS;
  }

  const opts = state.categories.map(c => `<option value="${c}">${c}</option>`).join('');
  document.getElementById('categoria').innerHTML = opts;
  document.getElementById('filtroCategoria').innerHTML = '<option value="">Todas</option>' + opts;
}

async function updateUI() {
  await renderTxList();
  await renderChart();
  await updateTotals();
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }
function fmt(n) { return 'R$ ' + Number(n).toFixed(2).replace('.', ','); }

// CRUD Transações
document.getElementById('addTx').addEventListener('click', () => { if (!canAdd()) return; saveTx(); });
document.getElementById('updateTx').addEventListener('click', () => { saveTx(document.getElementById('editingId').value); });

async function saveTx(id = null) {
  const tipo = document.getElementById('tipo').value;
  const cat = document.getElementById('categoria').value;
  const desc = document.getElementById('descricao').value.trim();
  const val = Number(document.getElementById('valor').value);
  const dt = document.getElementById('data').value;

  if (!val || val <= 0) return showAlert('Valor inválido');

  // Validação: garantir que a categoria está selecionada
  if (!cat) {
    showAlert('Selecione uma categoria antes de salvar.');
    return;
  }

  const txObj = { tipo, categoria: cat, descricao: desc, valor: val, data: dt };

  // Log para ajudar debug de problema de categoria sendo sempre a primeira
  try { console.debug('Salvar transação:', txObj); } catch (e) {}

  showToast('Salvando...');

  let result;
  if (id) {
    result = await apiCall(`/transactions/${id}`, 'PUT', txObj);
  } else {
    result = await apiCall('/transactions', 'POST', txObj);
  }

  if (result) {
    cancelEdit();
    await updateUI();
    showToast('✅ Salvo!');
  }
}

async function editTx(id) {
  // Buscar transação específica
  const allTx = state.tx;
  const t = allTx.find(x => x._id === id);

  if (!t) return;

  document.getElementById('tipo').value = t.tipo;
  document.getElementById('categoria').value = t.categoria;
  document.getElementById('descricao').value = t.descricao;
  document.getElementById('valor').value = t.valor;
  document.getElementById('data').value = t.data.split('T')[0];
  document.getElementById('editingId').value = id;
  document.getElementById('addTx').style.display = 'none';
  document.getElementById('updateTx').style.display = 'inline-block';
  document.getElementById('cancelEdit').style.display = 'inline-block';
}

async function deleteTx(id) {
  showConfirm('Apagar esta transação?', async () => {
    const result = await apiCall(`/transactions/${id}`, 'DELETE');
    if (result) {
      if (document.getElementById('editingId').value === id) cancelEdit();
      await updateUI();
      showToast('✅ Deletado!');
    }
  });
}

function cancelEdit() {
  document.getElementById('descricao').value = '';
  document.getElementById('valor').value = '';
  document.getElementById('editingId').value = '';
  document.getElementById('addTx').style.display = 'inline-block';
  document.getElementById('updateTx').style.display = 'none';
  document.getElementById('cancelEdit').style.display = 'none';
}

async function renderTxList() {
  const el = document.getElementById('tx-list');
  el.innerHTML = '';

  const fCat = document.getElementById('filtroCategoria').value;
  const fDat = document.getElementById('filtroData').value;

  const result = await apiCall('/transactions');
  if (!result) return;

  state.tx = result;

  let list = result.filter(t => {
    if (fCat && t.categoria !== fCat) return false;
    if (fDat && t.data.split('T')[0] !== fDat) return false;
    return true;
  }).sort((a, b) => b.data.localeCompare(a.data));

  if (list.length === 0) {
    el.innerHTML = '<div class="small" style="text-align:center;padding:10px">Nenhuma transação</div>';
    return;
  }

  list.forEach(t => {
    const dataFormatada = t.data.split('T')[0];
    el.innerHTML += `
      <div class="tx">
        <div class="meta"><div><div style="font-weight:600">${t.descricao}</div><div class="small">${t.categoria} - ${dataFormatada}</div></div></div>
        <div style="text-align:right">
          <div class="amount ${t.tipo}">${t.tipo === 'income' ? '+' : '-'} ${fmt(t.valor)}</div>
          <div style="margin-top:4px"><button class="ghost" style="font-size:10px;padding:4px" onclick="editTx('${t._id}')">Edit</button><button class="ghost" style="font-size:10px;padding:4px" onclick="deleteTx('${t._id}')">Del</button></div>
        </div>
      </div>`;
  });
}

async function updateTotals() {
  const result = await apiCall('/transactions/summary/stats');
  if (!result) return;

  document.getElementById('saldo').textContent = fmt(result.balance);
  document.getElementById('receitas').textContent = fmt(result.totalIncome);
  document.getElementById('despesas').textContent = fmt(result.totalExpense);
}

document.getElementById('aplicarFiltro').addEventListener('click', () => renderTxList());
document.getElementById('limparFiltro').addEventListener('click', async () => {
  document.getElementById('filtroCategoria').value = '';
  document.getElementById('filtroData').value = '';
  await renderTxList();
});

async function renderChart() {
  const cv = document.getElementById('chart');
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);

  const result = await apiCall('/transactions/summary/stats');
  if (!result) return;

  const sums = result.byCategory;
  const data = Object.entries(sums).sort((a, b) => b[1] - a[1]);

  if (!data.length) {
    ctx.fillStyle = '#555';
    ctx.fillText('Sem dados', 10, 20);
    return;
  }

  let y = 10;
  const max = data[0][1] || 1;
  data.forEach(([k, v], i) => {
    const w = (v / max) * (cv.width - 120);
    ctx.fillStyle = `hsl(${i * 50}, 70%, 50%)`;
    ctx.fillRect(100, y, w, 20);
    ctx.fillStyle = '#fff';
    ctx.fillText(k, 10, y + 14);
    ctx.fillText(fmt(v), 100 + w + 5, y + 14);
    y += 30;
  });
}

/* ==================================================
   BACKUP/RESTORE
   ================================================== */
function toggleBackupMenu() {
  if (!isPro()) {
    showAlert("Função exclusiva da versão PRO.");
    return;
  }
  const menu = document.getElementById('backupMenu');
  menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

document.getElementById('exportJson').addEventListener('click', async () => {
  if (!isPro()) return showAlert("Backup é função PRO.");
  const result = await apiCall('/backup/download/json');
  if (result) {
    downloadFile(JSON.stringify(result), 'json', 'application/json');
    showToast('✅ Backup baixado');
  }
});

document.getElementById('exportCsv').addEventListener('click', async () => {
  if (!isPro()) return showAlert("Exportar é função PRO.");
  const csv = await apiCall('/backup/download/csv');
  if (csv) {
    downloadFile(csv, 'csv', 'text/csv;charset=utf-8;');
    showToast('✅ CSV exportado');
  }
});

function downloadFile(content, ext, type) {
  const blob = new Blob([content], { type: type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `backup_${new Date().toISOString().slice(0, 10)}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function processRestore(input) {
  if (!isPro()) return input.value = '', showAlert("Restauração é função PRO.");
  const file = input.files[0];
  if (!file) return;
  if (!file.name.endsWith('.json')) {
    showAlert("ERRO: Selecione o arquivo .json");
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = async function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data.tx)) {
        showConfirm("Isso irá SUBSTITUIR seus dados. Continuar?", async () => {
          const result = await apiCall('/backup/restore/json', 'POST', data);
          if (result) {
            showAlert("Restaurado!");
            await updateUI();
          }
        });
      } else showAlert("Arquivo inválido.");
    } catch (err) {
      showAlert("Erro ao ler arquivo.");
    }
  };
  reader.readAsText(file);
}

/* ==================================================
   RECORRENTES
   ================================================== */
let recFocusDate = new Date();

function getMonthKey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
function formatMonth(d) { const opts = { year: 'numeric', month: 'long' }; return d.toLocaleDateString('pt-BR', opts); }

function setRecMonth(dateObj) {
  recFocusDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
  document.getElementById('recMonthLabel').textContent = formatMonth(recFocusDate);
  renderRecList();
}

function prevRecMonth() { const d = new Date(recFocusDate); d.setMonth(d.getMonth() - 1); setRecMonth(d); }
function nextRecMonth() { const d = new Date(recFocusDate); d.setMonth(d.getMonth() + 1); setRecMonth(d); }
function openRecurring() { document.querySelector('main').style.display = 'none'; document.getElementById('rec-page').style.display = 'block'; setRecMonth(recFocusDate || new Date()); }
function closePages() { document.getElementById('cat-page').style.display = 'none'; document.getElementById('rec-page').style.display = 'none'; document.querySelector('main').style.display = 'grid'; ensureDefaults(); }

async function saveRecurring() {
  const id = document.getElementById('recEditId').value;
  const desc = document.getElementById('recDesc').value.trim();
  const val = Number(document.getElementById('recValor').value);
  const dia = document.getElementById('recDia').value;

  if (!desc || !val) return showAlert('Preencha os dados.');

  const data = { desc, valor: val, dia };

  showToast('Salvando...');

  let result;
  if (id) {
    result = await apiCall(`/recurring/${id}`, 'PUT', data);
  } else {
    result = await apiCall('/recurring', 'POST', data);
  }

  if (result) {
    saveState();
    resetRecForm();
    renderRecList();
    showToast("✅ Salvo!");
  }
}

async function editRec(id) {
  const r = state.recurring.find(x => x._id === id);
  if (!r) return;

  document.getElementById('recDesc').value = r.desc;
  document.getElementById('recValor').value = r.valor;
  document.getElementById('recDia').value = r.dia;
  document.getElementById('recEditId').value = id;
  document.getElementById('recFormTitle').textContent = "Editando";
  document.getElementById('btnSaveRec').textContent = "Atualizar";
  document.getElementById('btnCancelRec').style.display = "inline-block";
}

async function deleteRec(id) {
  showConfirm('Apagar regra?', async () => {
    const result = await apiCall(`/recurring/${id}`, 'DELETE');
    if (result) {
      renderRecList();
      resetRecForm();
      showToast('✅ Deletado!');
    }
  });
}

async function markRecPaid(id) {
  const r = state.recurring.find(x => x._id === id);
  if (!r) return;

  const key = getMonthKey(recFocusDate);
  const currentStatus = (r.history && r.history[key]) ? r.history[key] : 'pendente';
  const newStatus = currentStatus === 'pago' ? 'pendente' : 'pago';

  // Log para debug
  try { console.log(`🔄 markRecPaid: ID=${id}, key=${key}, currentStatus=${currentStatus}, newStatus=${newStatus}`); } catch (e) {}

  const result = await apiCall(`/recurring/${id}/status`, 'PATCH', {
    monthKey: key,
    status: newStatus
  });

  if (result) {
    // Atualizar o estado local ANTES de re-renderizar para evitar race condition
    // Isto garante que a UI muda imediatamente
    if (!r.history) r.history = {};
    r.history[key] = newStatus;
    
    // Log do resultado
    try { console.log(`✅ markRecPaid sucesso. Novo status=${r.history[key]}`); } catch (e) {}
    
    // Re-renderizar a lista com estado já atualizado
    renderRecList();
  } else {
    console.error('❌ markRecPaid falhou');
  }
}

function resetRecForm() {
  document.getElementById('recDesc').value = '';
  document.getElementById('recValor').value = '';
  document.getElementById('recDia').value = '';
  document.getElementById('recEditId').value = '';
  document.getElementById('recFormTitle').textContent = "Nova Recorrente";
  document.getElementById('btnSaveRec').textContent = "Salvar";
  document.getElementById('btnCancelRec').style.display = "none";
}

async function renderRecList() {
  const el = document.getElementById('rec-list');
  el.innerHTML = '';

  const result = await apiCall('/recurring');
  if (!result) return;

  state.recurring = result;

  let total = 0, paid = 0, pending = 0;
  const key = getMonthKey(recFocusDate);

  if (state.recurring && state.recurring.length > 0) {
    state.recurring.forEach(r => {
      const status = (r.history && r.history[key]) ? r.history[key] : 'pendente';
      total += r.valor;
      if (status === 'pago') paid += r.valor;
      else pending += r.valor;

      el.innerHTML += `<div class="rec-item"><div class="meta"><div><div style="font-weight:600">${r.desc}</div><div class="small">Dia ${r.dia || '-'} <span class="tag ${status}">${status}</span></div></div><div style="display:flex;gap:6px"><button class="ghost" style="font-size:12px;padding:6px" onclick="markRecPaid('${r._id}')">👍</button><button class="ghost" style="font-size:10px;padding:4px" onclick="editRec('${r._id}')">✏️</button><button class="ghost" style="font-size:10px;padding:4px" onclick="deleteRec('${r._id}')">🗑️</button></div></div><div style="text-align:right"><div class="amount expense">${fmt(r.valor)}</div></div></div>`;
    });
  } else {
    el.innerHTML = '<div class="small" style="text-align:center;padding:10px">Vazio.</div>';
  }

  document.getElementById('recTotal').textContent = fmt(total);
  document.getElementById('recPaid').textContent = fmt(paid);
  document.getElementById('recPending').textContent = fmt(pending);
}

/* ==================================================
   CATEGORIAS
   ================================================== */
async function openCategories() {
  document.querySelector('main').style.display = 'none';
  document.getElementById('cat-page').style.display = 'block';
  renderCatList();
}

async function addCat() {
  const n = document.getElementById('newCatName').value.trim();
  if (!n) return;

  const result = await apiCall('/categories', 'POST', { name: n });
  if (result) {
    document.getElementById('newCatName').value = '';
    await ensureDefaults();
    renderCatList();
    showToast('✅ Categoria adicionada');
  }
}

async function renderCatList() {
  const el = document.getElementById('cat-list');
  el.innerHTML = '';
  state.categories.forEach((c, i) => {
    el.innerHTML += `<div class="tx"><span>${c}</span><button class="ghost" onclick="delCat('${c}')">X</button></div>`;
  });
}

async function delCat(name) {
  showConfirm('Apagar categoria?', async () => {
    const result = await apiCall(`/categories/${name}`, 'DELETE');
    if (result) {
      await ensureDefaults();
      renderCatList();
      showToast('✅ Deletado!');
    }
  });
}

/* ==================================================
   LICENÇA
   ================================================== */
const DEMO_LIMIT = 10;
function isPro() { return state.licenseKey === 'BOXPRO'; }

function checkLicense() {
  const backupBtn = document.getElementById('backupBtn');
  const aiMicBtn = document.getElementById('aiMic');
  if (isPro()) {
    document.getElementById('demoBadge').style.display = 'none';
    document.getElementById('licenseKey').style.display = 'none';
    document.getElementById('buyBtn').style.display = 'none';
    document.getElementById('commercialArea').style.display = 'none';
    document.getElementById('proMenu').style.display = 'inline-flex';
    document.getElementById('resetAll').disabled = false;
    if (backupBtn) backupBtn.style.display = 'inline-block';
    if (aiMicBtn) aiMicBtn.style.display = 'inline-block';
  } else {
    document.getElementById('demoBadge').style.display = 'inline-block';
    document.getElementById('licenseKey').style.display = 'inline-block';
    document.getElementById('buyBtn').style.display = 'inline-block';
    document.getElementById('commercialArea').style.display = 'flex';
    document.getElementById('proMenu').style.display = 'none';
    document.getElementById('resetAll').disabled = true;
    if (backupBtn) backupBtn.style.display = 'none';
    if (aiMicBtn) aiMicBtn.style.display = 'none';
  }
}

function canAdd() {
  if (isPro()) return true;
  if (state.tx.length >= DEMO_LIMIT) {
    showConfirm('Limite DEMO atingido. Comprar versão PRO?', () => openLink());
    return false;
  }
  return true;
}

async function activateLicense() {
  const k = document.getElementById('licenseKey').value;
  if (k === 'BOXPRO') {
    // Enviar para backend
    const result = await apiCall('/auth/me/license', 'PUT', { licenseKey: k });
    if (result && result.user) {
      state.licenseKey = k;
      currentUser = result.user;
      checkLicense();
      showAlert('✅ Licença ativada com sucesso!');
      document.getElementById('licenseKey').value = '';
    } else {
      showAlert('❌ Erro ao ativar licença');
    }
  } else {
    showAlert('❌ Chave inválida');
  }
}

async function revokeLicense() {
  showConfirm("Desativar licença?", async () => {
    const result = await apiCall('/auth/me/license', 'PUT', { licenseKey: null });
    if (result) {
      state.licenseKey = null;
      currentUser.licenseKey = null;
      checkLicense();
      showAlert('✅ Licença desativada');
    } else {
      showAlert('❌ Erro ao desativar');
    }
  });
}

function openLink() { window.open('https://linktr.ee/BoxMotors'); }

document.getElementById('resetAll').addEventListener('click', () => {
  if (!isPro()) return showAlert('Função PRO.');
  showConfirm('TEM CERTEZA? Apagará TUDO permanentemente.', async () => {
    showToast('Deletando dados...');
    const result = await apiCall('/backup/delete-all', 'DELETE');
    if (result) {
      showAlert('✅ Todos os dados foram apagados!');
      await updateUI();
    } else {
      showAlert('❌ Erro ao apagar dados');
    }
  });
});

function applyTheme() {
  const t = localStorage.getItem('boxmotors_theme');
  if (t === 'light') document.body.setAttribute('data-theme', 'light');
  else document.body.removeAttribute('data-theme');
}

function toggleTheme() {
  const c = localStorage.getItem('boxmotors_theme');
  const n = c === 'light' ? 'dark' : 'light';
  localStorage.setItem('boxmotors_theme', n);
  applyTheme();
}

// Auto-login se tiver token
(function() {
  if (authToken) {
    apiCall('/auth/me').then(user => {
      if (user) setUser(user);
    });
  }
})();
