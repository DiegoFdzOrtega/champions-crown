@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================
echo   Champions Crown - reorganizar las carpetas del proyecto
echo ============================================================
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo Esta carpeta no es un repositorio de Git. No se ha movido nada.
  pause
  exit /b 1
)
REM Se puede ejecutar las veces que haga falta: solo mueve lo que aun no se ha movido.
if not exist assets mkdir assets

echo.
echo [1/5] Imagenes y sonido a assets\ ...
call :mv avatares assets\avatares
call :mv entrenadores assets\entrenadores
call :mv entrenadores_mini assets\entrenadores_mini
call :mv fondos assets\fondos
call :mv iconos assets\iconos
call :mv lideres assets\lideres
call :mv musica assets\musica
call :mv objetos assets\objetos
call :mv pokemon assets\pokemon
call :mv pokemon_mega assets\pokemon_mega
call :mv rangos assets\rangos
call :mv region assets\region
call :mv "Sprites entrenadores" assets\sprites_entrenadores

echo [2/5] Iconos sueltos a assets\iconos\app\ ...
if not exist assets\iconos\app mkdir assets\iconos\app
call :mv icono.png assets\iconos\app\icono.png
call :mv icono-180.png assets\iconos\app\icono-180.png
call :mv icono-192.png assets\iconos\app\icono-192.png
call :mv icono-512.png assets\iconos\app\icono-512.png
call :mv icono.svg assets\iconos\app\icono.svg

echo [3/5] Archivos de base de datos a tools\sql\ ...
if not exist tools\sql mkdir tools\sql
call :mv torre_reyes.sql tools\sql\torre_reyes.sql

echo [4/5] Material que no es del juego a material\ ...
if not exist material mkdir material
call :mv "Marcos de perfil" material\marcos_perfil
call :mv trailer material\trailer
for /d %%D in ("Pok*Masters sprites") do call :mv "%%D" material\pokemon_masters

echo [5/5] Copias de seguridad a _backups\ ...
if not exist _backups mkdir _backups
for /d %%D in (_backup_*) do call :mv "%%D" "_backups\%%~nxD"
git rm -r --cached --quiet --ignore-unmatch _backups >nul 2>&1

echo.
if exist fondos (
  echo.
  echo  OJO: aun quedan carpetas sin mover. Cierra VS Code, el navegador con el juego y las ventanas del Explorador abiertas dentro de esas carpetas, y vuelve a ejecutarlo.
)
echo Hecho. Abre el juego y comprueba que todo se ve bien antes de subirlo.
echo Si algo falla, puedes deshacerlo todo con:  git reset --hard  y  git clean -fd assets material tools/sql
echo (ojo: git clean borra lo que Git no conoce dentro de esas carpetas; pregunta antes de usarlo)
pause
exit /b 0

:mv
if not exist %1 goto :eof
git mv %1 %2 >nul 2>&1
if exist %1 move %1 %2 >nul
if exist %1 echo    No se pudo mover %1
goto :eof
