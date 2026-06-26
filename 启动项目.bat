@echo off
chcp 65001 >nul 2>&1
title 公司管理后台 - 启动中

echo ============================================
echo   公司管理后台 - 自动启动脚本
echo ============================================
echo.

:: 切换到项目目录（当前 bat 所在目录）
cd /d "%~dp0"
echo [信息] 项目目录: %cd%
echo.

:: ---- 第 1 步：清理 3015 端口残留 ----
echo [1/4] 清理 3015 端口残留进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3015" ^| findstr "LISTENING" 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
    echo       已终止残留进程 PID: %%a
)
echo       端口已就绪
echo.

:: ---- 第 2 步：检查 node_modules ----
echo [2/4] 检查依赖是否安装...
if not exist "node_modules" (
    echo       node_modules 不存在，正在执行 pnpm install ...
    call pnpm install
    if %errorlevel% neq 0 (
        echo [错误] pnpm install 失败，请检查网络或 Node 环境
        pause
        exit /b 1
    )
) else (
    echo       依赖已安装，跳过
)
echo.

:: ---- 第 3 步：启动开发服务器 ----
echo [3/4] 启动 Vite 开发服务器 (端口 3015)...
echo.
start "Vite Dev Server" cmd /k "title Vite Dev Server - 3015 && cd /d "%~dp0" && pnpm dev"

:: ---- 第 4 步：等待服务就绪后打开浏览器 ----
echo [4/4] 等待服务启动（约 3 秒）...
timeout /t 3 /nobreak >nul
start http://localhost:3015
echo.
echo ============================================
echo   浏览器已打开 http://localhost:3015
echo   关闭此窗口不影响开发服务器运行
echo ============================================
echo.
timeout /t 2 /nobreak >nul
