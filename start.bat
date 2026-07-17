@echo off
chcp 65001 >nul
echo ========================================
echo   白帆AI智能体 - 启动中...
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] 检查 Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js 20+
    echo 下载地址: https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js 已安装
node --version

echo.
echo [2/2] 启动服务...
echo.
echo 服务地址: http://localhost:3001
echo 按 Ctrl+C 停止服务
echo ========================================
echo.

node src/api/server.js
