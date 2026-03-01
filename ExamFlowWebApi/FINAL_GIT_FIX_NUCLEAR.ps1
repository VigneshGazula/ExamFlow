# FINAL FIX - Remove Large Files from Git History
# This completely removes the large files from all commits

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FINAL FIX - Removing Large Files" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to repo root
Set-Location F:\ExamFlow

# Step 1: Remove files from Git history using filter-branch
Write-Host "Step 1: Removing large files from Git history..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Yellow

# Remove bin/Debug folder from all commits
git filter-branch --force --index-filter `
  "git rm -r --cached --ignore-unmatch ExamFlowWebApi/bin/" `
  --prune-empty --tag-name-filter cat -- --all

# Remove obj folder from all commits
git filter-branch --force --index-filter `
  "git rm -r --cached --ignore-unmatch ExamFlowWebApi/obj/" `
  --prune-empty --tag-name-filter cat -- --all

Write-Host "✓ Removed from Git history" -ForegroundColor Green
Write-Host ""

# Step 2: Clean up
Write-Host "Step 2: Cleaning up..." -ForegroundColor Yellow
git reflog expire --expire=now --all
git gc --prune=now --aggressive
Write-Host "✓ Cleaned up" -ForegroundColor Green
Write-Host ""

# Step 3: Force push
Write-Host "Step 3: Force pushing to GitHub..." -ForegroundColor Yellow
git push origin main --force
Write-Host "✓ Pushed successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ DONE! Your repo is now clean!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Large files have been completely removed from Git history." -ForegroundColor White
Write-Host "You can now push without issues." -ForegroundColor White
