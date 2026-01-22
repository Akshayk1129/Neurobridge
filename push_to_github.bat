@echo off
echo ===================================================
echo   NeuroBridge AI - GitHub Push Helper
echo ===================================================
echo.
echo This script will initialize a local git repo and push it to GitHub.
echo Make sure you have created an EMPTY repository on GitHub first!
echo.

:: Check if git is available
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not found in your system PATH.
    echo Please install Git from https://git-scm.com/ and try again.
    pause
    exit /b
)

echo [1/6] Initializing Git Repository...
call git init

echo [2/6] Adding all files...
call git add .

echo [3/6] Committing changes...
call git commit -m "Initial commit of NeuroBridge AI Prototype" --allow-empty

echo [4/6] Renaming branch to 'main'...
call git branch -M main

echo.
set REPO_URL=https://github.com/Akshayk1129/Neurobridge

echo.
echo [5/6] Adding remote origin...
call git remote remove origin 2>nul
call git remote add origin %REPO_URL%

echo [6/6] Pushing to GitHub...
call git push -u origin main

echo.
if %errorlevel% equ 0 (
    echo [SUCCESS] Project successfully pushed to GitHub!
) else (
    echo [ERROR] Push failed. Please check your URL and internet connection.
)
echo.
pause
