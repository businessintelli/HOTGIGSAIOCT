@echo off
REM HotGigs.ai Local Development Setup Script for Windows

echo ========================================================
echo      HotGigs.ai Local Development Setup Script
echo ========================================================
echo.

REM Check Python
echo Checking prerequisites...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed
    echo Please install Python 3.8 or higher from https://www.python.org/
    pause
    exit /b 1
)
echo [OK] Python is installed

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js 16 or higher from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js is installed

REM Check PostgreSQL
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] PostgreSQL is not installed
    echo Please install PostgreSQL from https://www.postgresql.org/download/windows/
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
) else (
    echo [OK] PostgreSQL is installed
)

REM Check Redis
redis-server --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Redis is not installed
    echo Please install Redis from https://github.com/microsoftarchive/redis/releases
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
) else (
    echo [OK] Redis is installed
)

echo.
echo Setting up backend...
cd backend\hotgigs-api

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install Python dependencies
echo Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    (
        echo # Database Configuration
        echo DATABASE_URL=postgresql://hotgigs:hotgigs_password@localhost:5432/hotgigs_db
        echo.
        echo # JWT Configuration
        echo SECRET_KEY=your-secret-key-change-in-production-min-32-chars-long-for-security
        echo ALGORITHM=HS256
        echo ACCESS_TOKEN_EXPIRE_MINUTES=30
        echo.
        echo # CORS Configuration
        echo CORS_ORIGINS=http://localhost:3000,http://localhost:5173
        echo.
        echo # OpenAI API Key (Add your key here^)
        echo OPENAI_API_KEY=
        echo.
        echo # Redis Configuration
        echo REDIS_URL=redis://localhost:6379/0
        echo CELERY_BROKER_URL=redis://localhost:6379/1
        echo CELERY_RESULT_BACKEND=redis://localhost:6379/2
        echo.
        echo # File Upload Configuration
        echo MAX_UPLOAD_SIZE=10485760
        echo UPLOAD_DIR=./uploads
        echo.
        echo # Application Settings
        echo PYTHONUNBUFFERED=1
        echo PYTHONPATH=./src
    ) > .env
    echo [OK] Created .env file
    echo [WARNING] Please add your OPENAI_API_KEY to backend\hotgigs-api\.env
)

REM Create uploads directory
if not exist "uploads" mkdir uploads

REM Setup database
echo.
echo Setting up database...
set /p CREATE_DB="Would you like to create the database now? (y/n): "
if /i "%CREATE_DB%"=="y" (
    echo Creating database...
    psql -U postgres -c "CREATE USER hotgigs WITH PASSWORD 'hotgigs_password';" 2>nul
    psql -U postgres -c "CREATE DATABASE hotgigs_db OWNER hotgigs;" 2>nul
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE hotgigs_db TO hotgigs;" 2>nul
    
    echo Running database migrations...
    python migrations\run_all_migrations.py
    
    echo [OK] Database setup complete
)

cd ..\..

REM Setup frontend
echo.
echo Setting up frontend...
cd frontend\hotgigs-frontend

REM Install Node dependencies
echo Installing Node.js dependencies...
call npm install

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating frontend .env file...
    (
        echo VITE_API_URL=http://localhost:8000
        echo VITE_WS_URL=ws://localhost:8000/ws
    ) > .env
    echo [OK] Created frontend .env file
)

cd ..\..

REM Create start scripts
echo.
echo Creating start scripts...

REM Backend start script
(
    echo @echo off
    echo cd backend\hotgigs-api
    echo call venv\Scripts\activate.bat
    echo uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
    echo pause
) > start-backend.bat

REM Frontend start script
(
    echo @echo off
    echo cd frontend\hotgigs-frontend
    echo npm run dev
    echo pause
) > start-frontend.bat

REM Celery start script
(
    echo @echo off
    echo cd backend\hotgigs-api
    echo call venv\Scripts\activate.bat
    echo celery -A src.core.celery_app worker --loglevel=info --concurrency=4
    echo pause
) > start-celery.bat

REM Start all script
(
    echo @echo off
    echo echo Starting HotGigs.ai services...
    echo echo.
    echo start "Backend API" cmd /k start-backend.bat
    echo timeout /t 3 /nobreak ^>nul
    echo start "Frontend" cmd /k start-frontend.bat
    echo timeout /t 2 /nobreak ^>nul
    echo start "Celery Worker" cmd /k start-celery.bat
    echo echo.
    echo echo All services started!
    echo echo Frontend: http://localhost:3000
    echo echo Backend API: http://localhost:8000
    echo echo API Docs: http://localhost:8000/docs
    echo pause
) > start-all.bat

echo.
echo ========================================================
echo              Setup Complete!
echo ========================================================
echo.
echo To start the application:
echo.
echo   Option 1 - Start all services at once:
echo     start-all.bat
echo.
echo   Option 2 - Start services individually:
echo     start-backend.bat
echo     start-frontend.bat
echo     start-celery.bat
echo.
echo Access the application:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo.
echo Important:
echo   * Add your OPENAI_API_KEY to backend\hotgigs-api\.env
echo   * Make sure PostgreSQL and Redis are running
echo   * Check README.md for more information
echo.
pause

