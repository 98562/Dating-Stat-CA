@echo off
setlocal

cd /d "%~dp0.."

if exist ".devserver.log" del /q ".devserver.log"
if exist ".devserver.err" del /q ".devserver.err"

set "PATH=C:\Program Files\nodejs;%PATH%"

echo [%date% %time%] Starting Next.js dev server...>>".devserver.log"
call "C:\Program Files\nodejs\npm.cmd" run dev 1>>".devserver.log" 2>>".devserver.err"

endlocal
