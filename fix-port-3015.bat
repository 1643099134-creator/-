@echo off
chcp 65001 >nul 2>&1
title 清理 3015 端口

echo ============================================
echo   一键清理 3015 端口残留进程
echo ============================================
echo.

:: 查找占用 3015 端口的进程
echo [1/2] 正在查找占用 3015 端口的进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3015" ^| findstr "LISTENING"') do (
    echo       找到进程 PID: %%a
    echo       正在终止...
    taskkill /F /PID %%a >nul 2>&1
    echo       已终止 PID: %%a
)

:: 再次确认
echo.
echo [2/2] 验证清理结果...
netstat -ano | findstr ":3015" >nul 2>&1
if %errorlevel%==0 (
    echo [警告] 仍有进程占用 3015 端口，请手动处理
) else (
    echo [完成] 3015 端口已完全释放！
)

echo.
echo 按任意键退出...
pause >nul
