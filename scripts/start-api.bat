@echo off
title Ice Cream Shop API
rem Roda a partir da raiz do projeto: o banco (db/sql.sqlite) e resolvido
rem relativo ao diretorio atual.
cd /d "%~dp0.."
if not exist "dist\main.js" (
  echo dist\main.js nao encontrado. Rode "npm run build" antes.
  pause
  exit /b 1
)
:loop
node dist\main.js
echo API encerrou (codigo %errorlevel%). Reiniciando em 5 segundos...
timeout /t 5 /nobreak >nul
goto loop
