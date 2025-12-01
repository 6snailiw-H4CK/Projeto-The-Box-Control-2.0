// Script de teste: Simula o que o Vercel faria ao chamar o backend
// Este script testa CORS, registro, login e operações de transações

const API_URL = 'https://projeto-the-box-control-20-production.up.railway.app/api';
const testEmail = `testuser-${Date.now()}@test.com`;
const testPassword = 'TestPassword123!';

console.log('🧪 Iniciando testes de integração frontend-backend...\n');

// Helper function para fazer requisições
async function apiCall(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const token = localStorage.getItem('token');
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    return { status: response.status, data };
  } catch (error) {
    console.error(`❌ Erro na chamada ${endpoint}:`, error.message);
    throw error;
  }
}

// Teste 1: Register
async function testRegister() {
  console.log('1️⃣  Teste: Register (Criar novo usuário)');
  try {
    const { status, data } = await apiCall('/auth/register', 'POST', {
      name: 'Test User',
      email: testEmail,
      password: testPassword,
    });
    if (status === 200) {
      localStorage.setItem('token', data.token);
      console.log('   ✅ Register SUCCESS');
      console.log(`   Token: ${data.token.substring(0, 50)}...\n`);
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

// Teste 2: Login
async function testLogin() {
  console.log('2️⃣  Teste: Login (Autenticar usuário)');
  localStorage.removeItem('token');
  try {
    const { status, data } = await apiCall('/auth/login', 'POST', {
      email: testEmail,
      password: testPassword,
    });
    if (status === 200) {
      localStorage.setItem('token', data.token);
      console.log('   ✅ Login SUCCESS');
      console.log(`   Token: ${data.token.substring(0, 50)}...\n`);
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

// Teste 3: Get User Info
async function testGetUser() {
  console.log('3️⃣  Teste: Get User (Obter dados do usuário)');
  try {
    const { status, data } = await apiCall('/auth/me', 'GET');
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

// Teste 4: Create Transaction
async function testCreateTransaction() {
  console.log('4️⃣  Teste: Create Transaction (Criar transação)');
  try {
    const { status, data } = await apiCall('/transactions', 'POST', {
      type: 'income',
      category: 'Salário',
      amount: 5000,
      description: 'Salário do mês',
      date: new Date().toISOString(),
    });
    if (status === 201 || status === 200) {
      console.log('   ✅ Create Transaction SUCCESS');
      console.log(`   Transaction ID: ${data._id || data.id}\n`);
      return data._id || data.id;
    } else {
      console.log(`   ❌ Create Transaction FAILED: ${data.error}\n`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Create Transaction ERROR: ${error.message}\n`);
    return null;
  }
}

// Teste 5: Get Transactions
async function testGetTransactions() {
  console.log('5️⃣  Teste: Get Transactions (Listar transações)');
  try {
    const { status, data } = await apiCall('/transactions', 'GET');
    if (status === 200) {
      console.log('   ✅ Get Transactions SUCCESS');
      console.log(`   Total: ${data.length || data.transactions?.length || 0} transações\n`);
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
  console.log('6️⃣  Teste: Get Categories (Listar categorias)');
  try {
    const { status, data } = await apiCall('/categories', 'GET');
    if (status === 200) {
      console.log('   ✅ Get Categories SUCCESS');
      console.log(`   Total: ${data.length || 0} categorias\n`);
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
    results.push(await testLogin());
    results.push(await testGetUser());
    results.push(await testCreateTransaction());
    results.push(await testGetTransactions());
    results.push(await testGetCategories());

    console.log('═══════════════════════════════════════');
    console.log('📊 RESULTADO DOS TESTES');
    console.log('═══════════════════════════════════════');
    const passed = results.filter(r => r).length;
    const total = results.length;
    console.log(`✅ Passou: ${passed}/${total}`);
    console.log(`Status: ${passed === total ? '🎉 TODOS OS TESTES PASSARAM!' : '⚠️  Alguns testes falharam'}`);
    console.log('═══════════════════════════════════════\n');
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Run tests
runAllTests();
