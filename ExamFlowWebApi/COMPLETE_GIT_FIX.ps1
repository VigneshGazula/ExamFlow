# COMPLETE GIT FIX - Remove Large Files

# Step 1: Go to root directory
cd F:\ExamFlow

# Step 2: Reset everything
Write-Host "Resetting Git staging area..." -ForegroundColor Yellow
git reset --mixed HEAD

# Step 3: Clean Git cache completely
Write-Host "Cleaning Git cache..." -ForegroundColor Yellow
git rm -r --cached . --ignore-unmatch

# Step 4: Remove all bin and obj folders from Git tracking
Write-Host "Removing bin/obj folders from Git..." -ForegroundColor Yellow
git rm -r --cached ExamFlowWebApi/bin/ --ignore-unmatch
git rm -r --cached ExamFlowWebApi/obj/ --ignore-unmatch
git rm -r --cached Frontend/node_modules/ --ignore-unmatch

# Step 5: Add updated .gitignore first
Write-Host "Adding .gitignore..." -ForegroundColor Green
git add .gitignore

# Step 6: Add only source code files (not binaries)
Write-Host "Adding source code files..." -ForegroundColor Green
git add *.md
git add *.bat
git add *.ps1
git add ExamFlowWebApi/*.cs
git add ExamFlowWebApi/*.csproj
git add ExamFlowWebApi/*.sln
git add ExamFlowWebApi/Models/
git add ExamFlowWebApi/Controllers/
git add ExamFlowWebApi/Services/
git add ExamFlowWebApi/DTO/
git add ExamFlowWebApi/Entities/
git add ExamFlowWebApi/Helpers/
git add ExamFlowWebApi/Migrations/
git add ExamFlowWebApi/hallticket-html/*.html
git add ExamFlowWebApi/hallticket-html/*.css
git add ExamFlowWebApi/hallticket-html/*.png
git add ExamFlowWebApi/hallticket-html/*.jpg
git add ExamFlowWebApi/Properties/
git add ExamFlowWebApi/appsettings*.json

# Step 7: Check status
Write-Host "`nChecking Git status..." -ForegroundColor Cyan
git status

# Step 8: Commit
Write-Host "`nCommitting changes..." -ForegroundColor Green
git commit -m "Fixed Hall Ticket generation - removed browser files from Git"

# Step 9: Force push to fix remote
Write-Host "`nPushing to GitHub..." -ForegroundColor Green
git push origin main --force

Write-Host "`n✅ DONE! Check above for any errors." -ForegroundColor Green
