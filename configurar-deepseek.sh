#!/bin/bash

# ============================================
# Script para adicionar DeepSeek no Railway
# ============================================

DEEPSEEK_KEY="sk-d988d72086714703b86a3e160224e29c"

echo "🚀 ADICIONANDO DeepSeek NO RAILWAY"
echo "===================================="
echo ""

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI não encontrado"
    echo "📦 Instale com: npm install -g @railway/cli"
    exit 1
fi

echo "✅ Railway CLI detectado"
echo ""
echo "📝 Configurando..."
echo "   Variável: DEEPSEEK_API_KEY"
echo "   Valor: ${DEEPSEEK_KEY:0:20}..."
echo ""

# Adicionar a variável
railway variables set "DEEPSEEK_API_KEY=${DEEPSEEK_KEY}"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCESSO!"
    echo ""
    echo "📊 O que fazer agora:"
    echo "   1. Railway está fazendo redeploy (1-2 minutos)"
    echo "   2. Aguarde os logs mostrarem ✅ DeepSeek Key"
    echo "   3. Recarregue o app no navegador (Ctrl+F5)"
    echo "   4. Clique no 🎤 e fale um comando"
    echo "   5. Pronto! IA funcionando! 🎉"
else
    echo ""
    echo "⚠️ Algo deu errado"
    echo "📖 Adicione manualmente:"
    echo "   1. railway.app → Projeto"
    echo "   2. Variables → Add Variable"
    echo "   3. DEEPSEEK_API_KEY = ${DEEPSEEK_KEY}"
fi
