@echo off
chcp 65001 > nul
echo ========================================
echo     POSS-APP - Sistema de Punto de Venta
echo ========================================
echo.

cd /d "%~dp0"

REM Verificar si existe el entorno virtual
if not exist "PossApp\Scripts\activate.bat" (
    echo ⚠️  ADVERTENCIA: No se encontró el entorno virtual
    echo.
    echo Por favor, ejecuta estos comandos primero:
    echo   1. python -m venv PossApp
    echo   2. PossApp\Scripts\activate.bat
    echo   3. pip install -r requirements.txt
    echo   4. init_database.bat
    echo.
    echo Presiona cualquier tecla para salir...
    pause > nul
    exit /b 1
)

REM Verificar si existe la base de datos
if not exist "instance\blog.db" (
    echo ⚠️  ADVERTENCIA: No se encontró la base de datos
    echo.
    echo Por favor, ejecuta primero: init_database.bat
    echo.
    echo Presiona cualquier tecla para salir...
    pause > nul
    exit /b 1
)

REM Verificar si existen las dependencias del frontend
if not exist "poss-app-front\node_modules" (
    echo ⚠️  ADVERTENCIA: No se encontraron las dependencias del frontend
    echo.
    echo Por favor, ejecuta primero:
    echo   cd poss-app-front
    echo   npm install
    echo.
    echo Presiona cualquier tecla para salir...
    pause > nul
    exit /b 1
)

echo ✅ Verificaciones completadas
echo.
echo [1/3] Iniciando Backend (Flask)...
start "POSS Backend" cmd /k "call PossApp\Scripts\activate.bat && python app.py"

echo [2/3] Esperando 5 segundos para que el backend inicie...
timeout /t 5 /nobreak > nul

echo [3/3] Iniciando Frontend (Next.js)...
start "POSS Frontend" cmd /k "cd poss-app-front && npm run dev"

echo.
echo ========================================
echo ✅ Sistema iniciado correctamente!
echo ========================================
echo.
echo 🌐 Frontend (Interfaz):  http://localhost:3000
echo 🔧 Backend (API):        http://localhost:5000
echo.
echo 📋 Usuario por defecto:
echo    Usuario: admin
echo    Contraseña: 123456
echo.
echo ⚠️  IMPORTANTE:
echo    - Mantén abiertas las ventanas de Backend y Frontend
echo    - Cambia la contraseña por defecto después del primer acceso
echo    - Puedes cerrar esta ventana, los servicios seguirán activos
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul