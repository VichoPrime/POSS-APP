@echo off
echo ========================================
echo     Sistema POS - Inicio Completo
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Iniciando Backend (Flask)...
start "POS Backend" cmd /k "PossApp\Scripts\activate.bat && python app.py"

echo [2/3] Esperando 3 segundos...
timeout /t 3 /nobreak > nul

echo [3/3] Iniciando Frontend (Next.js)...
start "POS Frontend" cmd /k "cd poss-app-front && npm run dev"

echo.
echo ✅ Sistema iniciado!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo.
echo Usuario: admin
echo Contraseña: 123456
echo.
echo Presione cualquier tecla para salir...
pause > nul