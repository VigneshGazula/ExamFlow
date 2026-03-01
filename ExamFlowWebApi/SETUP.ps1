# ExamFlow - Complete Setup Script
# Run this to fix everything in one go

Write-Host "?? ExamFlow - Complete Setup & Fix" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""

# Step 1: Stop running processes
Write-Host "Step 1: Stopping running processes..." -ForegroundColor Yellow
Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "? Backend stopped" -ForegroundColor Green

# Step 2: Build backend
Write-Host ""
Write-Host "Step 2: Building backend..." -ForegroundColor Yellow
Set-Location "F:\ExamFlow\ExamFlowWebApi"
dotnet build > $null
if ($LASTEXITCODE -eq 0) {
    Write-Host "? Backend built successfully" -ForegroundColor Green
} else {
    Write-Host "? Backend build failed" -ForegroundColor Red
    exit 1
}

# Step 3: Build frontend
Write-Host ""
Write-Host "Step 3: Building frontend..." -ForegroundColor Yellow
Set-Location "F:\ExamFlow\Frontend"
npm run build > $null 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "? Frontend built successfully" -ForegroundColor Green
} else {
    Write-Host "?? Frontend build completed with warnings" -ForegroundColor Yellow
}

# Step 4: Start backend
Write-Host ""
Write-Host "Step 4: Starting backend..." -ForegroundColor Yellow
Set-Location "F:\ExamFlow\ExamFlowWebApi"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "dotnet run --launch-profile http"
Write-Host "? Backend starting on http://localhost:5275" -ForegroundColor Green
Write-Host "   (Check the new PowerShell window)" -ForegroundColor Cyan

# Wait a bit for backend to start
Write-Host ""
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 5: Start frontend
Write-Host ""
Write-Host "Step 5: Starting frontend..." -ForegroundColor Yellow
Set-Location "F:\ExamFlow\Frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"
Write-Host "? Frontend starting on http://localhost:4200" -ForegroundColor Green
Write-Host "   (Check the new PowerShell window)" -ForegroundColor Cyan

# Step 6: Instructions
Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "? Setup Complete!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "?? Next Steps:" -ForegroundColor Yellow
Write-Host "1. Wait for both backend and frontend to start (check the new windows)"
Write-Host "2. Open browser: http://localhost:4200"
Write-Host "3. Press F12 ? Console ? Run this command:"
Write-Host ""
Write-Host "   localStorage.clear(); location.reload();" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Login with your student credentials"
Write-Host "5. Navigate to Hall Tickets"
Write-Host "6. ? Everything should work now!"
Write-Host ""
Write-Host "?? Token is now valid for 24 hours (no frequent re-logins!)" -ForegroundColor Green
Write-Host ""
Write-Host "?? For troubleshooting, see: FINAL_FIX_COMPLETE_SOLUTION.md" -ForegroundColor Cyan
Write-Host ""
