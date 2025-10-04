@echo off
echo ========================================
echo       INSTALACION SISTEMA POS
echo ========================================
echo.

echo [1/5] Creando entorno virtual de Python...
python -m venv venv
if errorlevel 1 (
    echo ERROR: No se pudo crear el entorno virtual. Asegurate de tener Python instalado.
    pause
    exit /b 1
)

echo [2/5] Activando entorno virtual...
call venv\Scripts\activate

echo [3/5] Instalando dependencias de Python...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: No se pudieron instalar las dependencias de Python.
    pause
    exit /b 1
)

echo [4/5] Instalando dependencias de Node.js...
cd poss-app-front
npm install
if errorlevel 1 (
    echo ERROR: No se pudieron instalar las dependencias de Node.js.
    pause
    exit /b 1
)

cd ..

echo [5/5] Inicializando base de datos...
python init_database.py
if errorlevel 1 (
    echo ERROR: No se pudo inicializar la base de datos.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    INSTALACION COMPLETADA EXITOSAMENTE
echo ========================================
echo.
echo Para iniciar el sistema, ejecuta: start-system.bat
echo.
pause