@echo off
REM Script para setup local rápido (Windows)

echo 🚀 Setup THE BOX CONTROL Backend
echo ================================

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js não está instalado. Baixe em: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% encontrado

REM Ir para pasta backend
cd backend

REM Instalar dependências
echo 📦 Instalando dependências...
call npm install

REM Criar .env
if not exist .env (
    echo 📝 Criando .env...
    copy .env.example .env
    echo ⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais
    echo    - MongoDB URI
    echo    - DeepSeek API Key
    echo    - JWT Secret
)

echo.
echo ✅ Setup concluído!
echo.
echo 📝 Para iniciar o servidor:
echo    npm run dev
echo.
echo 📖 Para mais informações, veja: ../SETUP_E_DEPLOYMENT.md
pause
