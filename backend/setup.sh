#!/bin/bash
# Script para setup local rápido

echo "🚀 Setup THE BOX CONTROL Backend"
echo "================================"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Baixe em: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Ir para pasta backend
cd backend

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Criar .env
if [ ! -f .env ]; then
    echo "📝 Criando .env..."
    cp .env.example .env
    echo "⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais"
    echo "   - MongoDB URI"
    echo "   - DeepSeek API Key"
    echo "   - JWT Secret"
fi

echo ""
echo "✅ Setup concluído!"
echo ""
echo "📝 Para iniciar o servidor:"
echo "   npm run dev"
echo ""
echo "📖 Para mais informações, veja: ../SETUP_E_DEPLOYMENT.md"
