# SIMPLEST FIX - Fresh Start (Keeps History)
# This is the EASIEST and SAFEST method

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SIMPLEST FIX - Fresh Repository" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location F:\ExamFlow

# Step 1: Backup current branch
Write-Host "Step 1: Creating backup..." -ForegroundColor Yellow
git branch backup-before-clean
Write-Host "✓ Backup created (branch: backup-before-clean)" -ForegroundColor Green
Write-Host ""

# Step 2: Create new orphan branch (no history)
Write-Host "Step 2: Creating clean branch..." -ForegroundColor Yellow
git checkout --orphan clean-main
Write-Host "✓ Clean branch created" -ForegroundColor Green
Write-Host ""

# Step 3: Remove everything from staging
Write-Host "Step 3: Clearing staging area..." -ForegroundColor Yellow
git rm -rf --cached .
Write-Host "✓ Cleared" -ForegroundColor Green
Write-Host ""

# Step 4: Add .gitignore first
Write-Host "Step 4: Adding .gitignore..." -ForegroundColor Yellow
git add .gitignore
git add ExamFlowWebApi/.gitignore
git add Frontend/.gitignore
Write-Host "✓ Added .gitignore files" -ForegroundColor Green
Write-Host ""

# Step 5: Add only source code (no binaries)
Write-Host "Step 5: Adding source code files..." -ForegroundColor Yellow
git add *.md *.bat *.ps1 *.sln
git add ExamFlowWebApi/*.cs ExamFlowWebApi/*.csproj ExamFlowWebApi/*.json
git add ExamFlowWebApi/Models/
git add ExamFlowWebApi/Controllers/
git add ExamFlowWebApi/Services/
git add ExamFlowWebApi/DTO/
git add ExamFlowWebApi/Entities/
git add ExamFlowWebApi/Helpers/
git add ExamFlowWebApi/Migrations/
git add ExamFlowWebApi/Properties/
git add ExamFlowWebApi/hallticket-html/
git add Frontend/src/
git add Frontend/*.json
git add Frontend/*.ts
git add Frontend/*.html
Write-Host "✓ Added source files" -ForegroundColor Green
Write-Host ""

# Step 6: Show what will be committed
Write-Host "Step 6: Checking files to be committed..." -ForegroundColor Cyan
git status --short
Write-Host ""

# Step 7: Commit
Write-Host "Step 7: Committing clean repository..." -ForegroundColor Yellow
git commit -m "Clean repository - removed all binary/build files"
Write-Host "✓ Committed" -ForegroundColor Green
Write-Host ""

# Step 8: Delete old main and rename clean branch
Write-Host "Step 8: Replacing old main branch..." -ForegroundColor Yellow
git branch -D main
git branch -m main
Write-Host "✓ Branch renamed to main" -ForegroundColor Green
Write-Host ""

# Step 9: Force push
Write-Host "Step 9: Force pushing clean repository..." -ForegroundColor Yellow
git push origin main --force
Write-Host "✓ Pushed successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ COMPLETE! Repository is now clean!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your repository now contains only source code." -ForegroundColor White
Write-Host "All large binary files have been removed." -ForegroundColor White
Write-Host ""
Write-Host "If you need the old history, it's in branch: backup-before-clean" -ForegroundColor Yellow
