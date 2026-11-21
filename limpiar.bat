@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"
set "RAIZ=%CD%\"
set N=0
if exist limpiar_log.txt del limpiar_log.txt
echo.
echo  LIMPIEZA DE CHAMPIONS CROWN
echo  No se borra nada: los archivos se MUEVEN.
echo    - copias y sobras  -^> carpeta _papelera
echo    - originales de Gemini y de los estadios -^> carpeta material\originales
echo  Ninguna de las dos se sube a GitHub (estan en .gitignore).
echo.

rem ---- 1) Copias PNG de las imagenes de ataques que ya tienen su version WebP (el juego usa la WebP) ----
for /R "assets\fx" %%F in (*.png) do if exist "%%~dpnF.webp" call :mover "%%F" _papelera
for /R "assets\objetos\ataques" %%F in (*.png) do if exist "%%~dpnF.webp" call :mover "%%F" _papelera
for /R "assets\objetos\cargas" %%F in (*.png) do if exist "%%~dpnF.webp" call :mover "%%F" _papelera

rem ---- 2) Imagenes de ataques viejas que ya no usa ningun codigo ----
for %%F in ("assets\objetos\ataques\da_*.*" "assets\objetos\ataques\brecha_*.*" "assets\objetos\ataques\pantalla_luz.*" "assets\objetos\ataques\e\vt2_marca.png" "assets\objetos\cargas\carga_*.*") do if exist "%%~F" call :mover "%%~fF" _papelera
rem franjas de la liga que se cambiaron por los balcones
for %%F in ("assets\menu\nuevo\l_*.webp") do call :mover "%%~fF" _papelera

rem ---- 3) Codigo que no se carga en index.html ----
for %%F in ("js\game.js" "js\fxhd5.js") do if exist "%%~F" call :mover "%%~fF" _papelera

rem ---- 4) Originales grandes (el juego usa sus versiones WebP recortadas) ----
for %%F in (balcones cont_1 cont_2 cont_3 cont_4 cont_5 fondo_castillo kit ligas marcos ref_historia ref_liga regiones titulo) do if exist "assets\menu\nuevo\%%F.png" call :mover "%RAIZ%assets\menu\nuevo\%%F.png" material\originales
for %%F in ("assets\fondos\Designer.png" "assets\fondos\clasificatoria.png" "assets\fondos\Gemini_Generated_Image_kgnorwkgnorwkgno_upscayl_4x_digital-art-4x.png") do if exist "%%~F" call :mover "%%~fF" material\originales
for /R "assets\fondos\estadios" %%F in (*.png) do call :mover "%%F" material\originales

echo.
echo  Listo: !N! archivos movidos.
echo  Ahora abre el juego, juega un combate y mira Historia y Liga.
echo  Si todo va bien, ya puedes borrar la carpeta _papelera.
echo.
> limpiar_log.txt echo !N! archivos movidos
exit /b

:mover
set "f=%~1"
set "rel=!f:%RAIZ%=!"
for %%D in ("%~2\!rel!") do if not exist "%%~dpD" mkdir "%%~dpD"
move /Y "%~1" "%~2\!rel!" >nul && set /a N+=1
exit /b
