@echo off
title UtaStudy
cd /d "%~dp0"

if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

echo Starting UtaStudy...
call npm run dev -- --open

pause
