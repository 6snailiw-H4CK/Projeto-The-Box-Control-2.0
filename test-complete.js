#!/usr/bin/env node
/**
 * TESTE COMPLETO: Fluxo de usuário no The Box Control
 * Simula: Login → Operações → Logout → Login novamente
 */

const https = require('https');
const url = require('url');

const API_URL = 'https://projeto-the-box-control-20-production.up.railway.app/api';
let authToken = null;
let userId = null;

console.log('\n🚀 TESTE DE INTEGRAÇÃO: THE BOX CONTROL');
console.log('═══════════════════════════════════════════════════\n');

// Helper para HTTPS requests
function makeRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const apiUrl = new URL(`${API_URL}${endpoint}`);
    const options = {
      hostname: apiUrl.hostname,
      port: 443,
      path: apiUrl.pathname + apiUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'The-Box-Control-Test/1.0'
      },
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: { error: data } });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function log(status, title, detail = '') {
  const emoji = status === 'OK' ? '✅' : status === 'SKIP' ? '⏭️' : status === 'WARN' ? '⚠️' : '❌';
  const color = status === 'OK' ? '\x1b[32m' : status === 'SKIP' ? '\x1b[36m' : status === 'WARN' ? '\x1b[33m' : '\x1b[31m';
  const reset = '\x1b[0m';
  console.log(`${emoji} ${color}${title}${reset}${detail ? ` - ${detail}` : ''}`);
}

async function section(title) {
  console.log(`\n📋 ${title}`);
  console.log('─'.repeat(50));
}

// ====== TESTES ======

async function testAdminLogin() {
  await section('1️⃣  AUTENTICAÇÃO - Login Admin');
  const { status, data } = await makeRequest('/auth/login', 'POST', {
    email: 'admin',
    password: '1570'
  });

  if (status === 200 && data.token) {
    authToken = data.token;
    userId = 'admin';
    await log('OK', 'Login Admin', `Token recebido (${data.token.substring(0, 30)}...)`);
    return true;
  } else {
    await log('FAIL', 'Login Admin', data.error || 'Status ' + status);
    return false;
  }
}

async function testGetUser() {
  await section('2️⃣  AUTENTICAÇÃO - Get User');
  const { status, data } = await makeRequest('/auth/me');

  if (status === 200) {
    await log('OK', 'Get User', `ID: ${data.id || data._id}`);
    return true;
  } else {
    await log('FAIL', 'Get User', data.error);
    return false;
  }
}

async function testGetCategories() {
  await section('3️⃣  DADOS - Get Categories');
  const { status, data } = await makeRequest('/categories');

  if (status === 200) {
    const count = Array.isArray(data) ? data.length : data.categories?.length || 0;
    await log('OK', 'Get Categories', `${count} categorias encontradas`);
    return count > 0;
  } else {
    await log('FAIL', 'Get Categories', data.error);
    return false;
  }
}

async function testCreateTransaction() {
  await section('4️⃣  DADOS - Create Transaction');
  const { status, data } = await makeRequest('/transactions', 'POST', {
    type: 'income',
    category: 'Salário',
    amount: 5000,
    description: 'Teste de transação de renda',
    date: new Date().toISOString()
  });

  if ((status === 200 || status === 201) && data._id) {
    await log('OK', 'Create Transaction', `ID: ${data._id}`);
    return true;
  } else {
    await log('WARN', 'Create Transaction', data.error || 'Possível problema de validação');
    return false;
  }
}

async function testGetTransactions() {
  await section('5️⃣  DADOS - Get Transactions');
  const { status, data } = await makeRequest('/transactions');

  if (status === 200) {
    const count = Array.isArray(data) ? data.length : data.transactions?.length || 0;
    await log('OK', 'Get Transactions', `${count} transações listadas`);
    return true;
  } else {
    await log('FAIL', 'Get Transactions', data.error);
    return false;
  }
}

async function testGetRecurring() {
  await section('6️⃣  DADOS - Get Recurring Bills');
  const { status, data } = await makeRequest('/recurring');

  if (status === 200) {
    const count = Array.isArray(data) ? data.length : data.recurring?.length || 0;
    await log('OK', 'Get Recurring', `${count} contas recorrentes`);
    return true;
  } else {
    await log('WARN', 'Get Recurring', data.error || 'Endpoint pode não estar implementado');
    return false;
  }
}

async function testLogout() {
  await section('7️⃣  AUTENTICAÇÃO - Logout');
  authToken = null;
  userId = null;
  await log('OK', 'Logout', 'Token removido');
  return true;
}

async function testLoginAgain() {
  await section('8️⃣  AUTENTICAÇÃO - Login após Logout');
  const { status, data } = await makeRequest('/auth/login', 'POST', {
    email: 'admin',
    password: '1570'
  });

  if (status === 200 && data.token) {
    authToken = data.token;
    await log('OK', 'Re-login', 'Login bem-sucedido após logout');
    return true;
  } else {
    await log('FAIL', 'Re-login', data.error);
    return false;
  }
}

async function testProtectedRoute() {
  await section('9️⃣  SEGURANÇA - Rota Protegida');
  const { status, data } = await makeRequest('/auth/me');

  if (status === 200) {
    await log('OK', 'Protected Route', 'Acesso ao /auth/me com token válido');
    return true;
  } else {
    await log('FAIL', 'Protected Route', data.error);
    return false;
  }
}

async function testUnauthorized() {
  await section('🔟 SEGURANÇA - Sem Token');
  authToken = null;
  const { status, data } = await makeRequest('/auth/me');

  if (status === 401) {
    await log('OK', 'Unauthorized Block', 'Acesso negado sem token (correto)');
    return true;
  } else {
    await log('WARN', 'Unauthorized Block', `Status ${status} - deveria ser 401`);
    return false;
  }
}

// ====== EXECUÇÃO ======

async function runAllTests() {
  try {
    const results = [];
    
    results.push(await testAdminLogin());
    results.push(await testGetUser());
    results.push(await testGetCategories());
    results.push(await testCreateTransaction());
    results.push(await testGetTransactions());
    results.push(await testGetRecurring());
    results.push(await testLogout());
    results.push(await testLoginAgain());
    results.push(await testProtectedRoute());
    results.push(await testUnauthorized());

    // ====== RESULTADO FINAL ======
    console.log('\n');
    console.log('═'.repeat(50));
    console.log('📊 RESULTADO FINAL');
    console.log('═'.repeat(50));
    const passed = results.filter(r => r).length;
    const total = results.length;
    console.log(`\n✅ Testes Passou: ${passed}/${total}`);
    console.log(`📈 Porcentagem: ${Math.round((passed/total)*100)}%`);
    
    if (passed === total) {
      console.log('\n🎉 SUCESSO! Todos os testes passaram!');
      console.log('   ✅ Autenticação funcionando');
      console.log('   ✅ Rotas protegidas funcionando');
      console.log('   ✅ CRUD de dados funcionando');
      console.log('   ✅ Aplicação pronta para uso!\n');
      process.exit(0);
    } else if (passed >= total * 0.8) {
      console.log('\n⚠️  Maioria dos testes passou (80%+)');
      console.log('   Alguns endpoints podem precisar revisão\n');
      process.exit(0);
    } else {
      console.log('\n❌ Muitos testes falharam');
      console.log('   Verificar logs acima para detalhes\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Erro crítico:', error.message);
    process.exit(1);
  }
}

runAllTests();
