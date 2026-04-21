@echo off
chcp 65001 >nul
echo ========================================
echo   招聘助手 - 构建打包工具
echo ========================================
echo.

:: 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [×] 请先安装 Node.js
    echo     运行 check-env.bat 检查环境
    pause
    exit /b 1
)

:: 安装依赖
echo [1/3] 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo [×] 依赖安装失败
    pause
    exit /b 1
)
echo [√] 依赖安装完成

:: 构建
echo.
echo [2/3] 构建扩展...
call npm run build
if %errorlevel% neq 0 (
    echo [×] 构建失败
    pause
    exit /b 1
)
echo [√] 构建完成

:: 打包
echo.
echo [3/3] 打包扩展...
set OUTPUT_DIR=release
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%
set TIMESTAMP=%TIMESTAMP: =0%

:: 创建输出目录
if not exist %OUTPUT_DIR% mkdir %OUTPUT_DIR%

:: 使用 PowerShell 压缩
powershell -Command "Compress-Archive -Path 'dist\*' -DestinationPath '%OUTPUT_DIR%\recruitment-assistant-extension.zip' -Force"
if %errorlevel% neq 0 (
    echo [×] 打包失败
    pause
    exit /b 1
)

echo [√] 打包完成

echo.
echo ========================================
echo   构建打包成功！
echo ========================================
echo.
echo 输出文件: %OUTPUT_DIR%\recruitment-assistant-extension.zip
echo.
echo 安装步骤:
echo 1. 解压 recruitment-assistant-extension.zip
echo 2. 打开 Chrome，访问 chrome://extensions/
echo 3. 开启"开发者模式"
echo 4. 点击"加载已解压的扩展程序"
echo 5. 选择解压后的文件夹
echo.
pause
