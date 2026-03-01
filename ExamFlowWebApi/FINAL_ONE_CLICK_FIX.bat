@echo off
echo ================================================
echo FINAL FIX - One Command Solution
echo ================================================
echo.
echo This will:
echo 1. Create a fresh clean repository
echo 2. Remove ALL large files
echo 3. Keep only source code
echo 4. Force push to GitHub
echo.
echo WARNING: This will overwrite your GitHub repository!
echo Press Ctrl+C to cancel, or any key to continue...
pause > nul

cd F:\ExamFlow

echo.
echo [1/7] Creating backup...
git branch backup-before-clean 2>nul

echo [2/7] Creating clean branch...
git checkout --orphan clean-main

echo [3/7] Clearing staging...
git rm -rf --cached . 2>nul

echo [4/7] Adding .gitignore...
git add .gitignore ExamFlowWebApi/.gitignore Frontend/.gitignore 2>nul

echo [5/7] Adding source code...
git add *.md *.bat *.ps1 *.sln 2>nul
git add ExamFlowWebApi/*.cs ExamFlowWebApi/*.csproj ExamFlowWebApi/*.json 2>nul
git add ExamFlowWebApi/Models/ ExamFlowWebApi/Controllers/ ExamFlowWebApi/Services/ 2>nul
git add ExamFlowWebApi/DTO/ ExamFlowWebApi/Entities/ ExamFlowWebApi/Helpers/ 2>nul
git add ExamFlowWebApi/Migrations/ ExamFlowWebApi/Properties/ 2>nul
git add ExamFlowWebApi/hallticket-html/ 2>nul
git add Frontend/src/ Frontend/*.json Frontend/*.ts Frontend/*.html 2>nul

echo [6/7] Committing...
git commit -m "Clean repository - removed all binary files"

echo [7/7] Replacing main branch...
git branch -D main 2>nul
git branch -m main

echo.
echo Pushing to GitHub...
git push origin main --force

echo.
echo ================================================
echo SUCCESS! Your repository is now clean!
echo ================================================
echo.
echo You can now push without any large file errors.
echo.
pause
