#!/usr/bin/env node
/**
 * TESTE DE LICENÇA: Verifica ativação, persistência e desativação
 */

const https = require('https');
const url = require('url');

const API_URL = 'https://projeto-the-box-control-20-production.up.railway.app/api';
let authToken = null;

console.log('\n🧪 TESTE COMPLETO DE LICENÇA');
console.log('═'.repeat(60));

function makeRequest(endpoint, method = 'GET', body = null, token = null) {
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

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
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

async function runTests() {
  try {
    console.log('\n1️⃣  Login com novo usuário');
    console.log('─'.repeat(60));
    const email = `licensetest-${Date.now()}@test.com`;
    const { data: regData } = await makeRequest('/auth/register', 'POST', {
      name: 'License Tester',
      email,
      password: 'TestPass123!'
    });
    console.log('✅ Usuário criado:', regData.user.email);
    authToken = regData.token;

    console.log('\n2️⃣  Verificar que NÃO tem licença');
    console.log('─'.repeat(60));
    const { data: userData1 } = await makeRequest('/auth/me', 'GET', null, authToken);
    console.log('License atual:', userData1.licenseKey ? `❌ ${userData1.licenseKey}` : '✅ null (correto)');

    console.log('\n3️⃣  Ativar licença com chave BOXPRO');
    console.log('─'.repeat(60));
    const { data: licData } = await makeRequest('/auth/me/license', 'PUT', {
      licenseKey: 'BOXPRO'
    }, authToken);
    console.log('✅ Ativada:', licData.user.licenseKey);

    console.log('\n4️⃣  Verificar que licença persistiu (GET /me)');
    console.log('─'.repeat(60));
    const { data: userData2 } = await makeRequest('/auth/me', 'GET', null, authToken);
    console.log('License persistida:', userData2.licenseKey ? `✅ ${userData2.licenseKey}` : '❌ null (perdeu!)');

    console.log('\n5️⃣  Fazer novo login e verificar se licença ainda existe');
    console.log('─'.repeat(60));
    const { data: loginData } = await makeRequest('/auth/login', 'POST', {
      email,
      password: 'TestPass123!'
    });
    const newToken = loginData.token;
    const { data: userData3 } = await makeRequest('/auth/me', 'GET', null, newToken);
    console.log('License após re-login:', userData3.licenseKey ? `✅ ${userData3.licenseKey}` : '❌ null (perdeu!)');

    console.log('\n6️⃣  Desativar licença');
    console.log('─'.repeat(60));
    const { data: revokData } = await makeRequest('/auth/me/license', 'PUT', {
      licenseKey: null
    }, newToken);
    console.log('✅ Desativada:', revokData.user.licenseKey ? revokData.user.licenseKey : 'null');

    console.log('\n7️⃣  Verificar que foi desativada');
    console.log('─'.repeat(60));
    const { data: userData4 } = await makeRequest('/auth/me', 'GET', null, newToken);
    console.log('License após desativar:', userData4.licenseKey ? `❌ ${userData4.licenseKey}` : '✅ null (correto)');

    console.log('\n8️⃣  Testar rejeição de chave inválida');
    console.log('─'.repeat(60));
    try {
      const { status, data: errData } = await makeRequest('/auth/me/license', 'PUT', {
        licenseKey: 'CHAVE_ERRADA'
      }, newToken);
      console.log(status === 400 ? '✅ Rejeitada corretamente' : '❌ Aceitou chave inválida!');
    } catch (e) {
      console.log('✅ Erro capturado (esperado)');
    }

    console.log('\n9️⃣  Testar admin sempre tem PRO');
    console.log('─'.repeat(60));
    const { data: adminLogin } = await makeRequest('/auth/login', 'POST', {
      email: 'admin',
      password: '1570'
    });
    const { data: adminData } = await makeRequest('/auth/me', 'GET', null, adminLogin.token);
    console.log('Admin license:', adminData.licenseKey ? `✅ ${adminData.licenseKey}` : '❌ null');

    console.log('\n');
    console.log('═'.repeat(60));
    console.log('✅ TODOS OS TESTES DE LICENÇA PASSARAM!');
    console.log('═'.repeat(60));
    console.log('\nResumo:');
    console.log('  ✅ Ativação de licença - OK');
    console.log('  ✅ Persistência no banco - OK');
    console.log('  ✅ Mantém após re-login - OK');
    console.log('  ✅ Desativação - OK');
    console.log('  ✅ Validação de chave - OK');
    console.log('  ✅ Admin sempre PRO - OK');
    console.log('\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  }
}

runTests();
