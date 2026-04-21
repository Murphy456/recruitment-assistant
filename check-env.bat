@echo off
chcp 65001 >nul
echo ========================================
echo   招聘助手 - 环境检查工具
echo ========================================
echo.

:: 检查 Node.js
echo [1/3] 检查 Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [×] Node.js 未安装
    echo.
    echo 请访问 https://nodejs.org/ 下载安装 LTS 版本
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [√] Node.js 已安装: %NODE_VERSION%

:: 检查 npm
echo.
echo [2/3] 检查 npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [×] npm 未安装
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [√] npm 已安装: %NPM_VERSION%

:: 检查 Chrome
echo.
echo [3/3] 检查 Chrome 浏览器...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    echo [√] Chrome 已安装
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    echo [√] Chrome 已安装
) else (
    echo [!] Chrome 未检测到，请确保已安装 Chrome 浏览器
)

echo.
echo ========================================
echo   环境检查完成！
echo ========================================
echo.
echo 接下来请运行 build.bat 构建扩展
echo.
pause
