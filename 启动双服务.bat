@echo off
chcp 65001 >nul 2>&1
title 凯格管理系统 - 启动中

echo ============================================
echo   凯格管理系统 - 双服务启动脚本
echo ============================================
echo.

cd /d "%~dp0"

:: 启动 API 服务
echo [1/2] 启动 API 服务 (端口 3016)...
start "API Server" cmd /k "title API Server - 3016 && cd /d "%~dp0server" && node server.js"

:: 等待 API 就绪
echo       等待 API 服务就绪...
timeout /t 3 /nobreak >nul

:: 启动前端开发服务器
echo [2/2] 启动前端开发服务器 (端口 3015)...
start "Vite Dev Server" cmd /k "title Vite Dev Server - 3015 && cd /d "%~dp0" && pnpm dev"

echo.
echo ============================================
echo   服务已启动！
echo   前端: http://localhost:3015
echo   API:  http://localhost:3016/api/customers
echo ============================================
echo.
timeout /t 2 /nobreak >nul
