#!/usr/bin/env node
const https = require('https');
const url = require('url');

const API_URL = 'https://projeto-the-box-control-20-production.up.railway.app/api';
const testEmail = `testuser-${Date.now()}@test.com`;
const testPassword = 'TestPassword123!';
let authToken = null;

console.log('🧪 Iniciando testes de integração frontend-backend...\n');

// Helper function para fazer requisições HTTPS
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
      },
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: { error: data } });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Teste 1: Register
async function testRegister() {
  console.log('1️⃣  Teste: Register (Criar novo usuário)');
  try {
    const { status, data } = await makeRequest('/auth/register', 'POST', {
      name: 'Test User',
      email: testEmail,
      password: testPassword,
    });
    if (status === 200) {
      authToken = data.token;
      console.log('   ✅ Register SUCCESS');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Token: ${data.token.substring(0, 40)}...\n`);
      return true;
    } else {
      console.log(`   ❌ Register FAILED: ${data.error}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Register ERROR: ${error.message}\n`);
    return false;
  }
}

// Teste 2: Get User Info
async function testGetUser() {
  console.log('2️⃣  Teste: Get User (Obter dados do usuário autenticado)');
  try {
    const { status, data } = await makeRequest('/auth/me', 'GET');
    if (status === 200) {
      console.log('   ✅ Get User SUCCESS');
      console.log(`   ID: ${data._id}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   Name: ${data.name}\n`);
      return true;
    } else {
      console.log(`   ❌ Get User FAILED: ${data.error}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Get User ERROR: ${error.message}\n`);
    return false;
  }
}

// Teste 3: Login (novo token)
async function testLogin() {
  console.log('3️⃣  Teste: Login (Autenticar com novas credenciais)');
  try {
    const { status, data } = await makeRequest('/auth/login', 'POST', {
      email: testEmail,
      password: testPassword,
    });
    if (status === 200) {
      authToken = data.token;
      console.log('   ✅ Login SUCCESS');
      console.log(`   Token: ${data.token.substring(0, 40)}...\n`);
      return true;
    } else {
      console.log(`   ❌ Login FAILED: ${data.error}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Login ERROR: ${error.message}\n`);
    return false;
  }
}

// Teste 4: Create Transaction
async function testCreateTransaction() {
  console.log('4️⃣  Teste: Create Transaction (Criar uma transação de renda)');
  try {
    const { status, data } = await makeRequest('/transactions', 'POST', {
      type: 'income',
      category: 'Salário',
      amount: 5000,
      description: 'Salário do mês',
      date: new Date().toISOString(),
    });
    if (status === 201 || status === 200) {
      console.log('   ✅ Create Transaction SUCCESS');
      console.log(`   Transaction ID: ${data._id || data.id}`);
      console.log(`   Amount: R$ ${data.amount}\n`);
      return true;
    } else {
      console.log(`   ❌ Create Transaction FAILED: ${data.error}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Create Transaction ERROR: ${error.message}\n`);
    return false;
  }
}

// Teste 5: Get Transactions
async function testGetTransactions() {
  console.log('5️⃣  Teste: Get Transactions (Listar todas as transações)');
  try {
    const { status, data } = await makeRequest('/transactions', 'GET');
    if (status === 200) {
      const count = Array.isArray(data) ? data.length : data.transactions?.length || 0;
      console.log('   ✅ Get Transactions SUCCESS');
      console.log(`   Total: ${count} transações\n`);
      return true;
    } else {
      console.log(`   ❌ Get Transactions FAILED: ${data.error}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Get Transactions ERROR: ${error.message}\n`);
    return false;
  }
}

// Teste 6: Get Categories
async function testGetCategories() {
  console.log('6️⃣  Teste: Get Categories (Listar categorias disponíveis)');
  try {
    const { status, data } = await makeRequest('/categories', 'GET');
    if (status === 200) {
      const count = Array.isArray(data) ? data.length : data.categories?.length || 0;
      console.log('   ✅ Get Categories SUCCESS');
      console.log(`   Total: ${count} categorias\n`);
      return true;
    } else {
      console.log(`   ❌ Get Categories FAILED: ${data.error}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Get Categories ERROR: ${error.message}\n`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  try {
    const results = [];
    results.push(await testRegister());
    results.push(await testGetUser());
    results.push(await testLogin());
    results.push(await testCreateTransaction());
    results.push(await testGetTransactions());
    results.push(await testGetCategories());

    console.log('═══════════════════════════════════════');
    console.log('📊 RESULTADO FINAL DOS TESTES');
    console.log('═══════════════════════════════════════');
    const passed = results.filter(r => r).length;
    const total = results.length;
    console.log(`✅ Passou: ${passed}/${total}`);
    if (passed === total) {
      console.log('🎉 TODOS OS TESTES PASSARAM! A aplicação está pronta para usar!');
    } else {
      console.log(`⚠️  ${total - passed} testes falharam`);
    }
    console.log('═══════════════════════════════════════\n');
    process.exit(passed === total ? 0 : 1);
  } catch (error) {
    console.error('❌ Erro geral:', error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
