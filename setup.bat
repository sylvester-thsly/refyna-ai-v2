@echo off
echo ========================================
echo Aura AI - Gemini API Setup
echo ========================================
echo.

REM Check if .env already exists
if exist .env (
    echo .env file already exists!
    echo.
    set /p overwrite="Do you want to overwrite it? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo Setup cancelled.
        pause
        exit /b
    )
)

REM Copy .env.example to .env
echo Copying .env.example to .env...
copy .env.example .env >nul
echo.

echo ========================================
echo Next Steps:
echo ========================================
echo 1. Get your Gemini API key from:
echo    https://aistudio.google.com/app/apikey
echo.
echo 2. Open the .env file in this directory
echo.
echo 3. Replace 'your-api-key-here' with your actual API key
echo.
echo 4. Save the file and run: npm run dev
echo ========================================
echo.

set /p open="Would you like to open the .env file now? (y/n): "
if /i "%open%"=="y" (
    notepad .env
)

echo.
echo Setup complete! Don't forget to add your API key to .env
pause
