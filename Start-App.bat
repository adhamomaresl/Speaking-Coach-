@echo off
title Vocalis AI Speaking Coach Server
echo Starting Vocalis AI Speaking Coach on http://localhost:8080 ...
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
