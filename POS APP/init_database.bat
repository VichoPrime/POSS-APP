@echo off
echo ========================================
echo   Sistema POS - Inicializacion de BD
echo ========================================
echo.

cd /d "%~dp0"

echo Activando entorno virtual...
call "PossApp\Scripts\activate.bat"

echo.
echo Ejecutando inicializacion de base de datos...
python init_database.py

echo.
echo Presione cualquier tecla para salir...
pause > nul