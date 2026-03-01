@echo off
echo ========================================
echo ExamFlow - Quick Start
echo ========================================
echo.
echo Starting backend and frontend...
echo.

REM Start Backend
echo Starting Backend...
start "ExamFlow Backend" powershell -NoExit -Command "cd F:\ExamFlow\ExamFlowWebApi; dotnet run --launch-profile http"
timeout /t 5 /nobreak > nul

REM Start Frontend
echo Starting Frontend...
start "ExamFlow Frontend" powershell -NoExit -Command "cd F:\ExamFlow\Frontend; npm start"

echo.
echo ========================================
echo Both services are starting!
echo ========================================
echo.
echo Backend: http://localhost:5275
echo Frontend: http://localhost:4200
echo.
echo IMPORTANT: After frontend loads, press F12 and run:
echo   localStorage.clear(); location.reload();
echo.
echo Then login again to get a fresh 24-hour token!
echo.
pause
