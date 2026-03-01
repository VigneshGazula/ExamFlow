@echo off
echo ========================================
echo Fixing Git Push - Removing Large Files
echo ========================================
echo.

echo Step 1: Unstaging all files...
git reset HEAD .
echo.

echo Step 2: Removing cached bin/Debug files...
git rm -r --cached ExamFlowWebApi/bin/Debug/net10.0/chrome-win64/ 2>nul
git rm -r --cached ExamFlowWebApi/bin/Debug/net10.0/ChromeHeadlessShell/ 2>nul
git rm --cached ExamFlowWebApi/bin/Debug/net10.0/Select.Html2 2>nul
echo.

echo Step 3: Adding .gitignore...
git add .gitignore
echo.

echo Step 4: Adding only source code files...
git add *.cs
git add *.csproj
git add *.sln
git add hallticket-html/
git add *.md
git add Models/
git add Controllers/
git add Services/
git add DTO/
git add Entities/
git add Helpers/
git add Migrations/
echo.

echo Step 5: Committing changes...
git commit -m "Fixed Hallticket generation - excluding browser files"
echo.

echo Step 6: Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo Done! If errors persist, run:
echo   git lfs install
echo   git lfs track "*.dll"
echo ========================================
pause
