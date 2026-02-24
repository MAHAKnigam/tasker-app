@echo off
REM Docker Build & Run Script for Tasker Application (Windows)

setlocal enabledelayedexpansion
cls

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║       TASKER - Docker Build ^& Run Manager          ║
echo ╚════════════════════════════════════════════════════╝
echo.

:menu
echo Select an option:
echo   1) Start all services (build + run^)
echo   2) Start services (no rebuild^)
echo   3) Stop all services
echo   4) View logs (all services^)
echo   5) View backend logs
echo   6) View frontend logs
echo   7) Rebuild services
echo   8) Clean up (remove containers, volumes^)
echo   9) System prune (clean all Docker resources^)
echo   0) Exit
echo.
set /p choice="Enter your choice [0-9]: "

if "%choice%"=="1" goto start_build
if "%choice%"=="2" goto start_no_build
if "%choice%"=="3" goto stop
if "%choice%"=="4" goto logs_all
if "%choice%"=="5" goto logs_backend
if "%choice%"=="6" goto logs_frontend
if "%choice%"=="7" goto rebuild
if "%choice%"=="8" goto cleanup
if "%choice%"=="9" goto prune
if "%choice%"=="0" goto exit

echo Invalid choice. Try again.
pause
cls
goto menu

:start_build
echo.
echo Starting all services with rebuild...
docker-compose up --build
goto menu

:start_no_build
echo.
echo Starting all services...
docker-compose up -d
echo Services started in background.
echo Access frontend: http://localhost:3000
echo Access backend: http://localhost:5000
echo.
pause
cls
goto menu

:stop
echo.
echo Stopping all services...
docker-compose down
echo Services stopped.
echo.
pause
cls
goto menu

:logs_all
echo.
echo Viewing logs (press Ctrl+C to exit)...
docker-compose logs -f
cls
goto menu

:logs_backend
echo.
echo Viewing backend logs (press Ctrl+C to exit)...
docker-compose logs -f backend
cls
goto menu

:logs_frontend
echo.
echo Viewing frontend logs (press Ctrl+C to exit)...
docker-compose logs -f frontend
cls
goto menu

:rebuild
echo.
echo Rebuilding services...
docker-compose build
echo Services rebuilt.
echo.
pause
cls
goto menu

:cleanup
echo.
echo Removing containers and volumes...
docker-compose down -v
echo Cleanup complete.
echo.
pause
cls
goto menu

:prune
echo.
echo WARNING: This will remove dangling images, containers, and volumes.
set /p confirm="Are you sure? (y/N): "
if /i "%confirm%"=="y" (
    echo Pruning Docker system...
    docker system prune -a --volumes
    echo Prune complete.
) else (
    echo Cancelled.
)
echo.
pause
cls
goto menu

:exit
echo.
echo Goodbye!
exit /b 0
