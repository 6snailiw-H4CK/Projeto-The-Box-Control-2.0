#!/usr/bin/env python3
"""
Script para adicionar a chave DeepSeek no Railway
Usa a Railway API para configurar a variável de ambiente
"""

import subprocess
import sys
import os

# Sua chave DeepSeek
DEEPSEEK_API_KEY = "sk-d988d72086714703b86a3e160224e29c"

# Nome do projeto no Railway
RAILWAY_PROJECT = "Projeto-The-Box-Control-2.0"

print("=" * 70)
print("🚀 CONFIGURANDO DeepSeek NO RAILWAY")
print("=" * 70)

# Verificar se Railway CLI está instalado
try:
    result = subprocess.run(['railway', '--version'], capture_output=True, text=True)
    print(f"✅ Railway CLI instalado: {result.stdout.strip()}")
except FileNotFoundError:
    print("❌ Railway CLI não encontrado!")
    print("📦 Instale com: npm install -g @railway/cli")
    sys.exit(1)

print("\n📝 Configurando variável DEEPSEEK_API_KEY...")
print(f"   Projeto: {RAILWAY_PROJECT}")
print(f"   Chave: {DEEPSEEK_API_KEY[:15]}...{'*' * (len(DEEPSEEK_API_KEY) - 20)}")

# Executar comando railway
try:
    # Tentar via railway link (se estiver com o projeto linkado)
    result = subprocess.run(
        ['railway', 'variables', 'set', f'DEEPSEEK_API_KEY={DEEPSEEK_API_KEY}'],
        capture_output=True,
        text=True,
        timeout=30
    )
    
    if result.returncode == 0:
        print("\n✅ SUCESSO! Variável configurada no Railway")
        print("\n📊 Próximos passos:")
        print("   1. Railway está fazendo redeploy automático (1-2 minutos)")
        print("   2. Recarregue o app: https://the-box-control-2-0.vercel.app")
        print("   3. Clique no botão 🎤 e fale um comando")
        print("   4. A IA deve processar e criar a transação automaticamente")
    else:
        print(f"\n⚠️ Aviso: {result.stderr}")
        print("\nTentando alternativa via Railway Dashboard...")
        print("   1. Acesse: https://railway.app")
        print("   2. Abra projeto 'Projeto-The-Box-Control-2.0'")
        print("   3. Vá em 'Variables'")
        print("   4. Clique 'Add Variable'")
        print("   5. Name: DEEPSEEK_API_KEY")
        print(f"   6. Value: {DEEPSEEK_API_KEY}")
        print("   7. Clique 'Save'")

except subprocess.TimeoutExpired:
    print("\n⚠️ Timeout! Railway demorou muito para responder")
    print("   Tente adicionar manualmente via Dashboard")
except Exception as e:
    print(f"\n❌ Erro: {e}")
    print("\nADICIONE MANUALMENTE:")
    print("   1. https://railway.app → Projeto")
    print("   2. Variables → Add Variable")
    print(f"   3. DEEPSEEK_API_KEY = {DEEPSEEK_API_KEY}")

print("\n" + "=" * 70)
