@echo off
title Smart Mechanic Finder - Services
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File start-all.ps1
pause
